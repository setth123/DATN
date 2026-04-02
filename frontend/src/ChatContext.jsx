import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [chatTarget, setChatTarget] = useState(null); // { id: '...', type: 'candidate' | 'company' }

  const openChat = (targetId,targetName ,targetType) => {
    setChatTarget({ targetId,targetName, targetType });
    setShowChatWidget(true);
  };

  const closeChat = () => {
    setShowChatWidget(false);
    setChatTarget(null);
  };

  return (
    <ChatContext.Provider value={{ showChatWidget, chatTarget, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

