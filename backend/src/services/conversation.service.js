import Conversation from "../models/Conversation.model.js";
import {getMyCandidateProfile} from "./candidate.service.js";
import { createConversation, getConversation,updateConversation } from "../infrastructure/redis/conversationRepository.js";
export const getOrCreateConversation=async(userId,targetUserId)=>{
    if(!targetUserId)throw new Error("Target user ID is required");
    if(userId===targetUserId)throw new Error("Cannot create conversation with oneself");
    const conversation=await Conversation.findOne({
        members:{$all:[userId,targetUserId]}
    })
    if(!conversation){
        const newConversation=await Conversation.create({
            members:[userId,targetUserId]
        })
        return newConversation;
    }
    return conversation;
}
export const getOrCreatAIConversation=async(userId,systemInstruction)=>{

    if (!userId) {
        throw new Error("User ID is required to get or create an AI conversation.");
    }

    const convoId = userId; // ID cuộc trò chuyện AI chính là ID của người dùng
    let conversation;
    const candidateInfo=await getMyCandidateProfile(userId);
    conversation = await getConversation(convoId);

    if (!conversation) {
        // Nếu cuộc trò chuyện chưa tồn tại, tạo mới.
        conversation = {
            systemInstruction:
                systemInstruction ||
                `
                Bạn là một trợ lý tuyển dụng AI chuyên nghiệp và thân thiện. Bạn có thể đưa ra những tư vấn
                ,lời khuyên hữu ích cho ứng viên và nhà tuyển dụng. Ứng viên và nhà tuyển dụng có thể gửi file đính kèm để bạn phân tích và đưa ra lời khuyên.
                 Hãy sử dụng id này khi cần gọi tool để lấy dữ liệu liên quan đến ứng viên.
                Bạn có thể gọi các function để lấy dữ liệu hoặc thực hiện hành động, nhưng bạn phải tuân theo các quy tắc sau:
        
                QUY TẮC:
                - Ứng viên hoặc nhà tuyển dụng có thể gửi file đính kèm. Nội dung file đính kém sẽ được tiền xử lý trước và gửi đến bạn như một phần của ngữ cảnh. Bạn có thể phân tích nội dung file để đưa ra lời khuyên hữu ích, trả lời câu hỏi của người dùng hoặc dựa trên nội dung file gọi các function phù hợp dựa trên các từ khóa trong file.
                - KHÔNG trả lời trực tiếp nếu có thể gọi function.
                - PHẢI gọi function khi cần dữ liệu từ hệ thống.
                - Với bất kỳ hành vi nào cần đến userId thì userId là ${userId}.
                - CHỈ sử dụng các function được cung cấp. Nếu người dùng hỏi ngoài phạm vi, hãy trả lời rằng bạn không thể giúp.
                - LUÔN trả lời bằng tiếng Việt.
    
                HÀNH VI:
                - Nếu người dùng muốn tìm việc -> gọi tool searchJobs.
                - Nếu người dùng muốn được gợi ý việc phù hợp -> gọi tool recommendJobsForCandidate với id của người dùng là ${userId}'.
                - Nếu nhà tuyển dụng muốn tìm ứng viên cho job ->Hãy yêu cầu nhà tuyển dụng gửi url của job, sau đó trich xuất jobId từ url, gọi tool recommendCandidatesForJob với userId là ${userId}.
                - Nếu người dùng hỏi cần cải thiện gì để ứng tuyển ->Hãy yêu cầu người dùng gửi url của job, sau đó trích xuất jobId từ url, gọi tool analyzeCandidateGapForJob với userId là ${userId}.
                - Thưc hiện các yêu cầu khác dựa trên câu hỏi hiện tại của người dùng và ngữ cảnh cuộc trò chuyện, nhưng luôn tuân theo các quy tắc đã nêu ở trên.
                `,
            messages: [{"role":"model","content":"Xin chào tôi là trợ lý tuyển dụng AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?"}],
            summary: null,
        };
        await createConversation(convoId, conversation);
    }
    return { convoId };
}