import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";
import { randomUUID } from "crypto";
import { runGemini } from "./gemini.service.js";
import { createConversation, getConversation,updateConversation } from "../infrastructure/redis/conversationRepository.js";

export const getMessages=async(conversationId,limit,before)=>{
    if(!conversationId)throw new Error("Conversation ID is required");
    const query={conversationId};
    if(before)query.createAt={$lt:new Date(before)};

    const messages=await Message.find(query)
        .sort({createdAt:-1})
        .limit(limit||50);
    return messages;
}

export const sendMessage=async(userId,conversationId,text)=>{
    if(!text||!conversationId)throw new Error("Invalid payload");

    const newMessage=await Message.create({
        conversationId,
        senderId:userId,
        text
    });
    await Conversation.findByIdAndUpdate(conversationId,{
        lastMessage:{
            text,
            senderId:userId,
            createdAt:newMessage.createdAt
        }
    });
    return newMessage;
}

export const handleAIMessage=async({ userId, conversationId, text, systemInstruction, onChunk })=>{
    let convoId = conversationId;
    let conversation;

    if (!convoId) {
        convoId = randomUUID();
        conversation = {
        systemInstruction:
            systemInstruction ||
            `Bạn là AI tuyển dụng.

            QUY TẮC:
            - KHÔNG trả lời trực tiếp nếu có thể gọi function
            - PHẢI gọi function khi cần dữ liệu từ hệ thống
            - CHỈ sử dụng các function được cung cấp

            HÀNH VI:
            - Nếu user muốn tìm job → searchJobs
            - Nếu user muốn được gợi ý job phù hợp → recommendJobsForCandidate
            - Nếu user muốn tìm ứng viên cho job → recommendCandidatesForJob
            - Nếu user hỏi cần cải thiện gì để apply job → analyzeCandidateGapForJob
            `,
        messages: [],
        };
        await createConversation(convoId, conversation);
    } else {
        conversation = await getConversation(convoId);
        if (!conversation) {
            throw new Error("AI conversation expired");
        }
    }

    
    //summarize old context if needed
    await maybeSummarize(conversation);
    
    // Thêm tin nhắn người dùng hiện tại vào lịch sử cuộc trò chuyện
    conversation.messages.push({
        role: "user",
        content: text,
    });
    
    // get AI response
    let assistantReply = "";
    // Truyền toàn bộ lịch sử cuộc trò chuyện, callback onChunk, userId và systemInstruction tới runGemini
    const reply = await runGemini(conversation.messages, onChunk, userId, conversation.systemInstruction);
    assistantReply = reply; // runGemini giờ đây trả về toàn bộ phản hồi
    
    // add AI response to conversation
    conversation.messages.push({
        role: "assistant",
        content: assistantReply,
    });

    if (conversation.messages.length > MAX_MESSAGES) {
        conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
    }

    // update redis
    await updateConversation(convoId, conversation);

    return{
        conversationId: convoId,
        reply,
    }
}

//next thing to do: connect agent to db