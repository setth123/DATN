import {Server} from 'socket.io';
import {verifyToken} from '../utils/jwt.js';
import Conversation from '../models/Conversation.model.js';
import {sendMessage} from './message.service.js';
import { handleAIMessage } from './message.service.js';

const onlineUsers=new Map();
let io;
export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
export const initSocket=(server)=>{
    io=new Server(server,{
        cors:{
            origin:"*",
            credentials:true
        }
    });
    

    //authentication middleware
    io.use(async(socket,next)=>{
        const token=socket.handshake.auth.token;
        if(!token){
            return next(new Error("Authentication error: Token not provided"));
        }
        try{
            const decoded=verifyToken(token);
            socket.user=decoded;
            next();
        }
        catch(err){
            return next(new Error("Authentication error: Invalid token"));
        }
    })
    io.on('connection',async(socket)=>{
        console.log('New client connected:',socket.id);
        
        onlineUsers.set(socket.user.userId,socket.id);
        socket.join(socket.user.userId); // Đảm bảo ID là chuỗi khi tham gia phòng
        //user's conversations
        try{
            const conversations=await Conversation.find({members:socket.user.id})
            conversations.forEach((conv)=>{
                socket.join(conv._id.toString());
            })
        }catch(err){
            console.error("Failed to join conversation rooms: ",err);
        }
        //join conversation room
        socket.on('join_conversation',(conversationId)=>{
            socket.join(conversationId);
        })
        
         //leave conversation room
         socket.on('leave_conversation',(conversationId)=>{
            socket.leave(conversationId);
        })
        
        //send message event
        socket.on("send_message",async(data)=>{
            const {userId,conversationId,text}=data;
            if(!conversationId||!text)return;
            try{
                // Pass io to the service function, and let the service handle emission
                await sendMessage(userId,conversationId,text); // io is retrieved internally by messageService
                // The service function now emits 'new_message', so no need to emit here

            }catch(err){
                console.error("Error sending message: ",err);
                socket.emit("error","Failed to send message");
            }
        })
        
        //AI message event
        socket.on("send_ai_message", async (data) => {
        const { conversationId, text, systemInstruction } = data;
        if (!text) return;

        try {
            const result = await handleAIMessage({
            conversationId,
            userId: socket.user.id,
            text,
            systemInstruction,
            onChunk: (chunk) => { // Pass the onChunk callback for streaming
                socket.emit("ai_chunk", { conversationId, chunk });
            }
            });

            // The AI message is now emitted via 'new_message' from message.service.js
        } catch (err) {
            console.error("AI chat error:", err);
            socket.emit("ai_error", "AI failed to respond");
        }
        });

        //disconnect
        socket.on('disconnect',()=>{
            console.log('Client disconnected:',socket.id);
            onlineUsers.delete(socket.user.id);
        });

    });
}