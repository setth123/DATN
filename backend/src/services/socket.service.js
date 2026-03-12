import {Server} from 'socket.io';
import {verifyToken} from '../utils/jwt.js';
import Conversation from '../models/Conversation.model.js';
import {sendMessage} from './message.service.js';
import { handleAIMessage } from './message.service.js';

const onlineUsers=new Map();
export const initSocket=(server)=>{
    const io=new Server(server,{
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
        
        onlineUsers.set(socket.user.id,socket.id);
        //user's conversations
        try{
            const conversations=await Conversation.find({members:socket.user.id})
            conversations.forEach((conv)=>{
                socket.join(conv._id.toString());
            })
        }catch(err){
            console.error("Failed to join conversation rooms: ",err);
        }
        //send message event
        socket.on("send_message",async(data)=>{
            const {conversationId,text}=data;
            if(!conversationId||!text)return;

            try{
                const newMessage=await sendMessage(socket.user.id,conversationId,text);
                io.to(conversationId).emit("new_message",newMessage);
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
            conversationId, // conversationId đã có trong data object
            userId: socket.user.id,
            text,
            systemInstruction,
            });

            socket.emit("ai_message", {
            conversationId: result.conversationId,
            reply: result.reply,
            });
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
    return io;
}