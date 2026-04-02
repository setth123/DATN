import mongoose from "mongoose";
import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";
import { randomUUID } from "crypto";
import { getIo } from "./socket.service.js";
import { runGemini } from "./gemini.service.js";
import { createConversation, getConversation,updateConversation } from "../infrastructure/redis/conversationRepository.js";
import { createNotification } from "./notification.service.js";
import User from "../models/User.model.js";

export const getMessages=async(conversationId,limit,before)=>{
    if(!conversationId)throw new Error("Conversation ID is required");
    const query={conversationId};
    if(before)query.createAt={$lt:new Date(before)};

    const messages=await Message.find(query)
        .populate('sender', 'name')
        .sort({createdAt:-1})
        .limit(limit||50);

    return messages;
}

export const sendMessage=async(userId,conversationId,text)=>{
    const io = getIo(); // Get io instance
    if(!userId||!text||!conversationId)throw new Error("Invalid payload");
    const newMessage=await Message.create({
        _id: new mongoose.Types.ObjectId(),
        conversationId,
        sender:userId,
        text
    });
    const conversation = await Conversation.findByIdAndUpdate(conversationId,{
        lastMessage:{
            text,
            sender:userId,
            createdAt:newMessage.createdAt
        }
    });

    // Populate sender information before emitting
    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');
    // Emit the new message to all clients in the conversation room
    if (io) {
        io.to(conversationId).emit('new_message', populatedMessage);
    }

    // Create notification for the recipient
    const recipientId = conversation.members.find(p => p.toString() !== userId);
    if (recipientId) {
        const senderUser = await User.findById(userId); // Fetch sender user to get email
        const newNotification = await createNotification({
            to: recipientId,
            from: userId,
            fromModel: 'User',
            type: 'NEW_MESSAGE',
            displayName: senderUser.email.split('@')[0], // New field: sender's email part
            conversationId: conversationId, // New field: conversation ID
        });
        if(io){
            io.to(recipientId.toString()).emit('new_notification', newNotification);
        }
    }
    return populatedMessage;
}

export const sendFile=async(userId,conversationId,file)=>{
    const io = getIo(); // Get io instance
    if(!file||!conversationId)throw new Error("Invalid payload");

    const newMessage=await Message.create({
        _id: new mongoose.Types.ObjectId(),
        conversationId,
        sender:userId,
        text: file.originalname,
        isFile: true,
        filePath: file.path,
    });
    const conversation = await Conversation.findByIdAndUpdate(conversationId,{
        lastMessage:{
            text: file.originalname,
            sender:userId,
            createdAt:newMessage.createdAt
        }
    });

    // Populate sender information before emitting
    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');

    // Emit the new message to all clients in the conversation room
    if (io) {
        io.to(conversationId).emit('new_message', populatedMessage);
    }

    // Create notification for the recipient
    const recipientId = conversation.members.find(p => p.toString() !== userId);
    if (recipientId) {
        const senderUser = await User.findById(userId); // Fetch sender user to get email
        const newNotification = await createNotification({
            to: recipientId,
            from: userId,
            fromModel: 'User',
            type: 'NEW_MESSAGE',
            displayName: senderUser.email.split('@')[0], // New field: sender's email part
            conversationId: conversationId, // New field: conversation ID
        });
        if(io){
            io.to(recipientId.toString()).emit('new_notification', newNotification);
        }
    }

    return populatedMessage;
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