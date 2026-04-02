import * as messageService from "../services/message.service.js";

export const getMessages=async(req,res)=>{
    try{
        const userId=req.user.id;
        const {conversationId,limit=20,before}=req.query;
        
        const messages=await messageService.getMessages(conversationId,limit,before);
        res.status(200).json({data:messages});
    }
    catch(err){
        res.status(400).json({ message: err.message });
    }
}
export const sendMessage=async(req,res)=>{ // No io parameter
    try{
        const userId=req.user.userId;
        const {conversationId,text}=req.body;
        const message=await messageService.sendMessage(userId,conversationId,text); // No io passed
        res.status(201).json({data:message});
    }
    catch(err){
        res.status(400).json({ message: err.message });
    }
}

export const sendFile=async(req,res)=>{ // No io parameter
    try{
        const userId=req.user.userId;
        const {conversationId}=req.body;
        const file=req.file;

        const message=await messageService.sendFile(userId,conversationId,file); // No io passed
        res.status(201).json({data:message});
    }
    catch(err){
        res.status(400).json({ message: err.message });
    }
}