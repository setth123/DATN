export const getOrCreateConversation = async (req,res) => {
    try{
        const userId=req.user.id;
        const targetUserId=req.body.targetUserId;
        
        const conversation=await controllerService.getOrCreateConversation(userId,targetUserId);
        res.status(200).json({data:conversation});
    }
    catch(err){
        res.status(400).json({ message: err.message });
    }
}