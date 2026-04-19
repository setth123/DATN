import { GoogleGenerativeAI } from "@google/generative-ai";

const config = {
  model: "models/gemini-3.1-flash-live-preview",
  generationConfig: {
    responseModalities: ["audio"], // Quan trọng: Yêu cầu trả về audio trực tiếp
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoide" } } // Chọn giọng nói
    }
  }
};

// Model cho việc phân tích sau phỏng vấn (dựa trên văn bản).
const analysisModel = genAI.getGenerativeModel({
  model: "gemma-4-31b-it", // Theo yêu cầu của người dùng
});

// Lưu trữ các phiên phỏng vấn đang hoạt động trong bộ nhớ. Trong kịch bản thực tế, bạn có thể sử dụng Redis.
const interviewSessions = new Map();

/**
 * Bắt đầu một phiên phỏng vấn mới.
 * Hàm này được thiết kế cho một thiết lập streaming (ví dụ: WebSockets).
 * @param {string} sessionId - A unique ID for this session.
 * @param {string} cvContext - The extracted text from the user's CV.
 * @param {string} jdContext - The extracted text from the job description.
 * @returns {Promise<object>} - The initial message from the AI.
 */
export const startInterview = async (sessionId, cvContext, jdContext) => {
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
  
  let initialResponse = "";
  for await (const chunk of result.stream) {
    initialResponse += chunk.text();
  }

  // Ghi lại lượt đi đầu tiên của AI (dưới dạng văn bản) vào bản ghi.
  session.transcript.push({ role: 'model', parts: [{ text: initialResponse }] });

  // Trả về tin nhắn văn bản đầu tiên để chuyển thành giọng nói.
  return { initialMessage: initialResponse };
};

/**
 * Chuyển đổi âm thanh của người dùng thành văn bản, nhận phản hồi văn bản từ AI và trả về.
 * @param {string} sessionId - The ID of the active session.
 * @param {string} userAudioBase64 - Phản hồi âm thanh hoàn chỉnh của người dùng cho một lượt, được mã hóa base64.
 * @param {string} mimeType - Mime type của âm thanh (ví dụ: 'audio/webm').
 * @returns {Promise<string>} - Phản hồi văn bản của AI để chuyển thành giọng nói.
 */
export const processUserAudioTurn = async (sessionId, userAudioBase64, mimeType) => {
  const session = interviewSessions.get(sessionId);
  if (!session) {
    throw new Error("Interview session not found or has expired.");
  }

  // 1. Chuyển đổi âm thanh của người dùng thành văn bản và thêm vào bản ghi.
  // Trong một ứng dụng sản xuất, một dịch vụ Speech-to-Text chuyên dụng, nhanh hơn sẽ tốt hơn.
  // Ở đây chúng ta sử dụng Gemini cho đơn giản.
  const transcribedUserText = await transcribeAudio(userAudioBase64, mimeType);
  session.transcript.push({ role: 'user', parts: [{ text: transcribedUserText }] });

  // 2. Gửi văn bản đã chuyển đổi đến phiên chat để nhận câu hỏi tiếp theo từ AI.
  const result = await session.chat.sendMessageStream(transcribedUserText);

  let aiResponseText = "";
  for await (const chunk of result.stream) {
    aiResponseText += chunk.text();
  }

  // 3. Ghi lại phản hồi của AI vào bản ghi.
  session.transcript.push({ role: 'model', parts: [{ text: aiResponseText }] });

  return aiResponseText;
};

/**
 * Hàm trợ giúp để chuyển đổi âm thanh thành văn bản bằng Gemini.
 * @param {string} audioBase64
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
const transcribeAudio = async (audioBase64, mimeType) => {
    const audioPart = { inlineData: { data: audioBase64, mimeType } };
    const prompt = "Transcribe the following audio to text in Vietnamese. Only return the transcribed text.";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent([prompt, audioPart]);
    return result.response.text();
};

/**
 * Kết thúc cuộc phỏng vấn một cách lịch sự, nhận một tin nhắn cuối cùng và kích hoạt phân tích.
 * @param {string} sessionId - The ID of the session to end.
 * @returns {Promise<object>} - The final analysis result.
 */
export const endInterviewAndAnalyze = async (sessionId) => {
  const session = interviewSessions.get(sessionId);
  if (!session) throw new Error("Interview session not found.");

  // Nhận một tin nhắn kết luận cuối cùng từ AI.
  const finalPrompt = "Buổi phỏng vấn đã kết thúc. Hãy đưa ra một câu kết luận lịch sự và chào tạm biệt ứng viên để kết thúc buổi phỏng vấn này.";
  const result = await session.chat.sendMessage(finalPrompt);
  const finalMessage = result.response.text();
  
  // Phân tích được thực hiện trên bản ghi văn bản.
  const analysisResult = await analyzeInterviewTranscript(session.transcript);

  // Dọn dẹp phiên.
  interviewSessions.delete(sessionId);

  return { finalMessage, analysis: analysisResult };
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