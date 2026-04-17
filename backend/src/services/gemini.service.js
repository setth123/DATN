
import { GoogleGenerativeAI } from "@google/generative-ai";
import { tools } from "../ai/tools.schema.js";
import { executeTool } from "./toolExecutor.service.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runGemini = async (messages, onChunk, userId, systemInstruction) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemma-4-31b-it",
      systemInstruction: systemInstruction,
      tools: tools
    });

    // CHỈNH SỬA 1: Lọc sạch lịch sử chat, loại bỏ các tin nhắn rỗng hoàn toàn
    const chatHistory = messages
      .filter(msg => msg.content && msg.content.trim() !== "")
      .map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

    const chat = model.startChat({ history: chatHistory });

    const latestMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(latestMessage);

    // CHỈNH SỬA 2: handleStream bây giờ sẽ TRẢ VỀ văn bản cuối cùng thu thập được
    const finalAiResponse = await handleStream(result, chat, onChunk, userId);

    // CHỈNH SỬA 3: Sau khi gọi xong hết Tool, hãy lưu finalAiResponse vào Database/State của bạn
    // Ví dụ: await saveMessageToDB(userId, "model", finalAiResponse);
    return finalAiResponse;

  } catch (error) {
    handleError(error, onChunk);
  }
};

async function handleStream(result, chat, onChunk, userId) {
  let accumulatedText = ""; 
  let functionCalls = null;
  let isAnswerStarted = false;

  for await (const chunk of result.stream) {
    const calls = chunk.functionCalls();
    if (calls && calls.length > 0) {
      functionCalls = calls;
      continue; 
    }

    try {
      let text = chunk.text();
      if (text) {
        if (!isAnswerStarted) {
          const index = text.indexOf("[ANSWER]");
          if (index !== -1) {
            isAnswerStarted = true;
            // Lấy phần text sau tag "[ANSWER]"
            const remainingText = text.substring(index + "[ANSWER]".length); 
            if (remainingText.trim() !== "") { // Chỉ gửi nếu có nội dung thực sự sau tag
              accumulatedText += remainingText;
              onChunk(remainingText);
            }
          }
        } else {
          // Khi đã tìm thấy "[ANSWER]", gửi tất cả các chunk text tiếp theo.
          accumulatedText += text;
          onChunk(text);
        }
      }
    } catch (e) {
      // Chunk không chứa text
    }
  }

  if (functionCalls) {
    const toolResponses = [];
    for (const fnCall of functionCalls) {
      const output = await executeTool(fnCall.name, fnCall.args, userId);
      toolResponses.push({
        functionResponse: { name: fnCall.name, response: output }
      });
    }

    const nextResult = await chat.sendMessageStream(toolResponses);
    
    // Lưu ý: Với đệ quy, ta cần truyền trạng thái hoặc để lượt gọi mới tự xác định lại
    const nextText = await handleStream(nextResult, chat, onChunk, userId);
    accumulatedText += nextText;
  }

  return accumulatedText;
}
/**
 * Hàm xử lý lỗi tập trung
 */
function handleError(error, onChunk) {
  console.error("Gemini API Error:", error);
  let userFriendlyMsg = "Đã có lỗi xảy ra khi kết nối với AI.";

  if (error.message?.includes("503") || /unavailable/i.test(error.message)) {
    userFriendlyMsg = "Dịch vụ AI đang quá tải (503). Bạn vui lòng thử lại sau giây lát nhé.";
  } else if (error.message?.includes("429")) {
    userFriendlyMsg = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút.";
  }

  onChunk(userFriendlyMsg);
}
