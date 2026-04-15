import { GoogleGenerativeAI } from "@google/generative-ai";
import { tools } from "../ai/tools.schema.js";
import { executeTool } from "./toolExecutor.service.js"; // Import the new tool executor

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runGemini = async (messages, onChunk, userId, systemInstruction) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
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
            const toolResponseResult = await chat.sendMessageStream([{
              functionResponse: {
                name: name,
                response: functionOutput
              }
            }]);

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
            const errorResponseResult = await chat.sendMessageStream([{
              functionResponse: {
                name: name,
                response: { error: error.message }
              }
            }]);
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
  } catch (error) {
    // Bắt các lỗi từ API của Gemini, đặc biệt là lỗi 503 Service Unavailable
    if (error.message && (error.message.includes('503') || /service is currently unavailable/i.test(error.message))) {
      console.error("Gemini service is unavailable (503).", error);
      const errorMessage = "Xin lỗi, dịch vụ AI hiện đang tạm thời quá tải. Vui lòng thử lại sau ít phút.";
      onChunk(errorMessage);
      return errorMessage;
    } else {
      // Xử lý các lỗi khác
      console.error("An error occurred during the Gemini API call:", error);
      const errorMessage = "Đã có lỗi không mong muốn xảy ra khi giao tiếp với AI. Vui lòng thử lại.";
      onChunk(errorMessage);
      return errorMessage;
    }
  }
};
