import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration for the interview model (audio response)
const interviewModelConfig = {
  model: "models/gemini-3.1-flash-live-preview",
  generationConfig: {
    responseMimeType: "audio/mpeg", // Specify desired audio format
    responseModalities: ["AUDIO"], // Quan trọng: Yêu cầu trả về audio trực tiếp
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoide" } } // Chọn giọng nói
    }
  }
};

// Model cho việc phỏng vấn (dựa trên audio).
const interviewModel = genAI.getGenerativeModel(interviewModelConfig);

// Model cho việc phân tích sau phỏng vấn (dựa trên văn bản).
const analysisModel = genAI.getGenerativeModel({
  model: "gemma-4-31b-it", // Theo yêu cầu của người dùng
  generationConfig: { responseMimeType: "application/json" }
});

// Lưu trữ các phiên phỏng vấn đang hoạt động trong bộ nhớ. Trong kịch bản thực tế, bạn có thể sử dụng Redis.
const interviewSessions = new Map();

/**
 * Starts a new interview session.
 * @param {string} sessionId - Unique ID for the interview session.
 * @param {string} cvContext - Context from the candidate's CV.
 * @param {string} jdContext - Context from the job description.
 * @param {function(string, string): void} onAudioChunk - Callback to stream audio chunks back to the client.
 * @returns {Promise<void>}
 */
export const startInterview = async (sessionId, cvContext, jdContext, onAudioChunk) => {
  const systemInstruction = `
    Role: Bạn là một nhà tuyển dụng cấp cao, thân thiện và chuyên nghiệp, đang thực hiện một cuộc phỏng vấn bằng âm thanh.
    Context: Bạn đang phỏng vấn một ứng viên dựa trên thông tin sau:
    - Nội dung CV của ứng viên: "${cvContext}"
    - Nội dung mô tả công việc (JD): "${jdContext}"
    
    Rules:
    - Giao tiếp HOÀN TOÀN bằng âm thanh. Phản hồi của bạn sẽ được chuyển thành giọng nói, vì vậy hãy tạo ra văn bản tự nhiên để nói.
    - Chỉ hỏi từng câu một. Chờ ứng viên trả lời xong rồi mới hỏi câu tiếp theo.
    - Đánh giá câu trả lời của ứng viên một cách ngầm dựa trên phương pháp STAR (Situation, Task, Action, Result) khi có thể.
    - Nếu ứng viên trả lời lan man, hãy khéo léo ngắt lời và hướng họ trở lại câu hỏi.
    - Buổi phỏng vấn chỉ kéo dài khoảng 15 phút, vì vậy hãy tập trung vào những câu hỏi trọng tâm, tránh lan man.
    - Bắt đầu bằng cách chào hỏi ứng viên một cách thân thiện và hỏi một vài câu hỏi cơ bản để làm quen.
  `;

  const chat = interviewModel.startChat({
    history: [],
    systemInstruction: systemInstruction,
  });

  // Lưu trữ phiên chat và một bản ghi (transcript) rỗng. Bản ghi sẽ chỉ chứa văn bản.
  const session = { chat, transcript: [] };
  interviewSessions.set(sessionId, session);

  // Bắt đầu cuộc trò chuyện với một lời nhắc để gợi ra phản hồi âm thanh.
  const result = await chat.sendMessageStream("Hãy bắt đầu buổi phỏng vấn. Gửi lời chào đầu tiên của bạn đến ứng viên.");
  
  let accumulatedTextForTranscript = "";
  for await (const chunk of result.stream) {
    if (chunk.audio) {
      onAudioChunk(chunk.audio.audioChunk, chunk.audio.mimeType);
    }
    if (chunk.text) { // Also capture text for transcript
      accumulatedTextForTranscript += chunk.text();
    }
  }

  // Ghi lại lượt đi đầu tiên của AI (dưới dạng văn bản) vào bản ghi.
  session.transcript.push({ role: 'model', parts: [{ text: accumulatedTextForTranscript }] });
};

/**
 * Processes the user's text input, gets an audio response from the AI, and streams it back.
 * @param {string} sessionId - The ID of the active session.
 * @param {string} userText - The transcribed text from the user's speech.
 * @param {function(string, string): void} onAudioChunk - Callback to stream audio chunks back to the client.
 * @returns {Promise<void>}
 */
export const processUserTextTurn = async (sessionId, userText, onAudioChunk) => {
  const session = interviewSessions.get(sessionId);
  if (!session) {
    throw new Error("Interview session not found or has expired.");
  }

  // 1. Ghi lại lượt đi của người dùng (dưới dạng văn bản) vào bản ghi.
  session.transcript.push({ role: 'user', parts: [{ text: userText }] });

  // 2. Gửi văn bản đến phiên chat để nhận câu hỏi tiếp theo từ AI.
  const result = await session.chat.sendMessageStream(userText);

  let accumulatedTextForTranscript = "";
  for await (const chunk of result.stream) {
    if (chunk.audio) {
      onAudioChunk(chunk.audio.audioChunk, chunk.audio.mimeType);
    }
    if (chunk.text) { // Also capture text for transcript
      accumulatedTextForTranscript += chunk.text();
    }
  }

  // 3. Ghi lại phản hồi của AI vào bản ghi.
  session.transcript.push({ role: 'model', parts: [{ text: accumulatedTextForTranscript }] });
};

/**
 * Kết thúc cuộc phỏng vấn một cách lịch sự, nhận một tin nhắn cuối cùng và kích hoạt phân tích.
 * @param {string} sessionId - The ID of the session to end.
 * @returns {Promise<object>} - The final analysis result.
 */
export const endInterviewAndAnalyze = async (sessionId, onAudioChunk) => {
  const session = interviewSessions.get(sessionId);
  if (!session) throw new Error("Interview session not found.");

  // Nhận một tin nhắn kết luận cuối cùng từ AI.
  const finalPrompt = "Buổi phỏng vấn đã kết thúc. Hãy đưa ra một câu kết luận lịch sự và chào tạm biệt ứng viên để kết thúc buổi phỏng vấn này.";
  const result = await session.chat.sendMessageStream(finalPrompt);
  
  let finalMessageText = "";
  for await (const chunk of result.stream) {
    if (chunk.audio) {
      onAudioChunk(chunk.audio.audioChunk, chunk.audio.mimeType);
    }
    if (chunk.text) {
      finalMessageText += chunk.text();
    }
  }
  
  // Phân tích được thực hiện trên bản ghi văn bản.
  const analysisResult = await analyzeInterviewTranscript(session.transcript);

  // Dọn dẹp phiên.
  interviewSessions.delete(sessionId);

  return { finalMessage: finalMessageText, analysis: analysisResult };
};

const analyzeInterviewTranscript = async (transcript) => {
  const analysisSystemInstruction = `Bạn là một Chuyên gia Đánh giá Tuyển dụng (HR Analyst) có 20 năm kinh nghiệm.
Nhiệm vụ: Phân tích bản ghi (transcript) của buổi phỏng vấn âm thanh để đưa ra đánh giá chi tiết về ứng viên.
Dữ liệu đầu vào: Một đoạn hội thoại giữa Người phỏng vấn (model) và Ứng viên (user).
Yêu cầu phân tích:
1. Kỹ năng chuyên môn: Đánh giá độ chính xác và chiều sâu của các câu trả lời kỹ thuật.
2. Kỹ năng mềm: Đánh giá khả năng diễn đạt, sự tự tin và tư duy giải quyết vấn đề.
3. Thái độ: Phân tích sự chuyên nghiệp và mức độ nhiệt huyết qua cách dùng từ.
Quy tắc phản hồi:
- Luôn phản hồi dưới định dạng JSON nguyên khối (không kèm văn bản thừa).
- Đánh giá khách quan, không thiên vị.
- Nếu dữ liệu hội thoại quá ngắn hoặc không đủ thông tin, hãy ghi chú vào phần "limitations".
Cấu trúc JSON yêu cầu:
{"summary": "Tóm tắt ngắn gọn buổi phỏng vấn (2-3 câu).","scores": {"technical": 0,"communication": 0,"problem_solving": 0},"strengths": ["Điểm mạnh 1"],"weaknesses": ["Điểm yếu 1"],"key_takeaways": ["Ý chính quan trọng rút ra"],"hiring_decision": "Tuyển dụng/Cân nhắc/Loại","feedback_for_candidate": "Lời khuyên chân thành để ứng viên cải thiện.","limitations": "Ghi chú nếu cuộc phỏng vấn quá ngắn hoặc thiếu thông tin để đánh giá."}`;

  const analysisPrompt = `Đây là bản ghi cuộc phỏng vấn:\n\n${JSON.stringify(transcript)}\n\nHãy phân tích và trả về kết quả dưới dạng JSON theo yêu cầu.`;

  const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it", systemInstruction: analysisSystemInstruction, generationConfig: { responseMimeType: "application/json" } }); // Theo yêu cầu

  try {
    const result = await model.generateContent(analysisPrompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error during interview analysis:", error);
    return { error: "Failed to analyze interview transcript." };
  }
};