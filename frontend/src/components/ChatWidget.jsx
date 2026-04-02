import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../ChatContext';
import closeIcon from '../assets/close.svg';
import sendIcon from '../assets/chat.svg';
import attachIcon from '../assets/upload.svg';
import conversationService from '../services/conversation.service';
import messageService from '../services/message.service';
import { getSocket } from '../services/socket.js';
import authService from '../services/auth.service';

const ChatWidget = () => {
    const { showChatWidget, chatTarget, closeChat } = useChat();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUser = authService.getCurrentUser();
    const socket = getSocket();
    useEffect(() => {
        if (showChatWidget && chatTarget?.targetId) {
            const initConversation = async () => {
                try {
                    const res = await conversationService.getOrCreateConversation(currentUser.user._id,chatTarget.targetId);
                    setConversationId(res.data.data._id);
                } catch (error) {
                    console.error("Failed to initialize conversation", error);
                }
            };
            initConversation();
        } else {
            setConversationId(null);
            setMessages([]);
        }
    }, [showChatWidget, chatTarget]);

    useEffect(() => {
        if (!conversationId) return;
        socket.emit('join_conversation', conversationId); // Join the conversation room when conversationId changes
        const getMessages = async () => {
            try {
                const res = await messageService.getMessages(conversationId);
                setMessages(res.data.data);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };

        getMessages();

        if (socket) {
            socket.on('new_message', (newMessage) => {
                if (newMessage.conversationId === conversationId) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });

            return () => {
                socket.emit('leave_conversation', conversationId); // Leave the conversation room when component unmounts or conversationId changes
                socket.off('new_message');
            };
        }
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !conversationId) return;

        try {
            //await messageService.sendMessage(conversationId, text);
            socket.emit("send_message", {userId: currentUser.user._id, conversationId, text }); // Emit send_message event to the server
            setText('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !conversationId) return;

        try {
            await messageService.sendFile(conversationId, file);
        } catch (error) {
            console.error("Failed to send file", error);
        }
    };

    if (!showChatWidget) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 flex flex-col">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-t-lg">
                <h3 className="text-lg font-bold text-green-500">{chatTarget.targetName}</h3>
                <button onClick={closeChat} className="p-1 rounded-full hover:bg-gray-600 transition-colors">
                    <img src={closeIcon} alt="Close" className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-grow p-3 overflow-y-auto" style={{ height: '300px' }}>
                {messages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.sender._id === currentUser.user._id ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`p-2 rounded-lg ${msg.sender._id === currentUser.user._id ? 'bg-green-600' : 'bg-gray-600'}`}>
                            {msg.isFile ? (
                                <a
                                    href={`http://localhost:4000/${msg.filePath.replace(/\\/g, '/')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 hover:underline"
                                >
                                    {msg.text}
                                </a>
                            ) : (
                                <p className="text-white">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-700 flex items-center bg-gray-800 rounded-b-lg w-full box-border">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="p-1.5 rounded-full hover:bg-gray-700 transition-all active:scale-90 flex-shrink-0"
                    title="Đính kèm tệp"
                >
                    <img src={attachIcon} alt="Attach File" className="h-6 w-6 opacity-70 hover:opacity-100" />
                </button>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-grow min-w-0 mx-2 p-2 rounded-lg bg-gray-700 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                />
                <button type="submit" className="p-2 rounded-full bg-green-600 hover:bg-green-500 shadow-md transition-all active:scale-90 flex-shrink-0 flex items-center justify-center" title="Gửi tin nhắn">
                    <img src={sendIcon} alt="Send" className="h-5 w-5 brightness-0 invert" />
                </button>
            </form>
        </div>
    );
};

export default ChatWidget;