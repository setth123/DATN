import {Server} from 'socket.io';
import {verifyToken} from '../utils/jwt.js';
import Conversation from '../models/Conversation.model.js';
import {sendMessage,handleAIMessage} from './message.service.js';

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
            origin: "http://localhost:5173",
            methods:["GET","POST"],
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
            const {conversationId,text,isAI}=data;
            const userId = socket.user.userId; // Luôn sử dụng userId từ token đã xác thực để tăng cường bảo mật.
            if(!conversationId||!text)return;
            try{
                // Pass io to the service function, and let the service handle emission
                if(!isAI)
                await sendMessage(userId,conversationId,text); // io is retrieved internally by messageService
                // The service function now emits 'new_message', so no need to emit here
                else handleAIMessage({userId, conversationId, text, onChunk:(chunk)=>{
                    socket.emit("ai_chunk",{conversationId,chunk});
                }});

            }catch(err){
                console.error("Error sending message: ",err);
                socket.emit("error","Failed to send message");
            }
        })
        

        //disconnect
        socket.on('disconnect',()=>{
            console.log('Client disconnected:',socket.id);
            onlineUsers.delete(socket.user.userId);
        });

    });
}