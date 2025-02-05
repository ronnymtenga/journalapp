"use client";

import { useEffect, useRef } from 'react';
import ChatMessages from './ChatBubbles';

type Message = {
  timestamp: any;
  sender: 'user' | 'bot';
  text: string;
  id: string,
};

interface ChatProps {
  input: string;
  handleSendMessage: () => void;
  loading: boolean;
  messages: Message[];
  isSidebarOpen: boolean;
}

const Chat = ({ loading, messages, isSidebarOpen }: ChatProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;

  // Add scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatMessages 
        messages={messages}
        loading={loading}
        messagesEndRef={messagesEndRef}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
};

export default Chat;