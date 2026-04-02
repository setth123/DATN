import * as conversationService from '../services/conversation.service.js';

export const getOrCreateConversation = async (req,res) => {
    try{
        const userId=req.user.userId; // Sử dụng ID của người dùng đã xác thực
        const targetUserId=req.body.targetUserId;
        
        const conversation=await conversationService.getOrCreateConversation(userId,targetUserId);
        res.status(200).json({data:conversation});
    }
    catch(err){
        res.status(400).json({ message: err.message });
    }
}