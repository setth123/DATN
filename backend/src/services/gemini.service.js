import { GoogleGenerativeAI } from "@google/generative-ai";
import { tools } from "../ai/tools.schema.js";
import { executeTool } from "./toolExecutor.service.js"; // Import the new tool executor

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runGemini = async (messages, onChunk, userId, systemInstruction) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: tools // Pass tools to the model
  });

  const chatHistory = [];

  // Thêm system instruction làm tin nhắn đầu tiên trong lịch sử chat
  if (systemInstruction) {
    chatHistory.push({ role: "user", parts: [{ text: `SYSTEM_INSTRUCTION: ${systemInstruction}` }] });
    chatHistory.push({ role: "model", parts: [{ text: "Tôi đã hiểu các quy tắc và hướng dẫn bạn đưa ra." }] });
  }

  // Thêm các tin nhắn cuộc trò chuyện trước đó vào lịch sử
  // Loại trừ tin nhắn người dùng mới nhất, vì nó sẽ được gửi qua sendMessageStream riêng
  messages.slice(0, -1).forEach(msg => {
    chatHistory.push({
      role: msg.role === "user" ? "user" : "model", // Gemini API mong đợi 'user' hoặc 'model'
      parts: [{ text: msg.content }]
    });
  });

  const chat = model.startChat({
    history: chatHistory
  });

  // Gửi tin nhắn người dùng mới nhất
  const latestUserMessageContent = messages[messages.length - 1].content;
  const result = await chat.sendMessageStream(latestUserMessageContent);

  let fullTextResponse = "";

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullTextResponse += chunkText;
      onChunk(chunkText); // Stream phản hồi văn bản
    }

    const functionCalls = chunk.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      for (const fnCall of functionCalls) {
        const { name, args } = fnCall;
        console.log(`Gemini đã gọi hàm: ${name} với các đối số:`, args);

        try {
          const functionOutput = await executeTool(name, args, userId); // Truyền userId tới executeTool
          // Sau khi thực thi tool, gửi phản hồi trở lại model
          const toolResponseResult = await chat.sendMessageStream({
            functionResponse: {
              name: name,
              response: functionOutput
            }
          });

          // Xử lý phản hồi từ Gemini sau khi thực thi tool
          for await (const toolChunk of toolResponseResult.stream) {
            const toolChunkText = toolChunk.text();
            if (toolChunkText) {
              fullTextResponse += toolChunkText;
              onChunk(toolChunkText);
            }
          }
        } catch (error) {
          console.error(`Lỗi khi thực thi tool ${name}:`, error);
          // Gửi lỗi trở lại Gemini nếu thực thi tool thất bại
          const errorResponseResult = await chat.sendMessageStream({
            functionResponse: {
              name: name,
              response: { error: error.message }
            }
          });
          for await (const errorChunk of errorResponseResult.stream) {
            const errorChunkText = errorChunk.text();
            if (errorChunkText) {
              fullTextResponse += errorChunkText;
              onChunk(errorChunkText);
            }
          }
        }
      }
    }
  }
  return fullTextResponse;
};
