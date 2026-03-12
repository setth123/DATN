import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";

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