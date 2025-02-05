"use client";

import TextareaAutosize from 'react-textarea-autosize';
import { useState, useEffect, useRef } from 'react';
import { firestore } from '../firebase'; // Adjust the path as needed
import { writeBatch, doc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore'; // Firestore services
import ChatInput from './ChatInput';

type Message = {
  timestamp: any;
  sender: 'user' | 'bot';
  text: string;
  id: string,
};

const Chat = () => {
  const [chat, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiType, setApiType] = useState<'huggingface' | 'deepseek' | 'openai'>('huggingface'); // Option to switch APIs
  const [loading, setLoading] = useState(false); // Loading state

  // Add ref for the message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Use useEffect to scroll when chat updates
  useEffect(() => {
    scrollToBottom();
  }, [chat]); // Scroll whenever chat messages change

  useEffect(() => {
    // Effect #1: Firestore real-time listener for chat
    const q = query(collection(firestore, 'chat'), orderBy('timestamp', 'asc'), orderBy('senderorder', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }as Message));
    setMessages(fetchedMessages);
    });
  
    return () => unsubscribe(); // Cleanup function to unsubscribe from the snapshot listener when the component unmounts
  }, []); // Only runs once on mount 

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        timestamp: serverTimestamp(),
        text: input,
        sender: 'user',
        id: new Date().toISOString(),
      };
      // Update UI with the user message
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      setInput(''); // Clear the input field after sending a message

      // Create a batch instance
      const batch = writeBatch(firestore);

      // Prepare a new document reference for the user message
      const userDocRef = doc(collection(firestore, 'chat'));
      // Add the user message to the batch
      batch.set(userDocRef, {
        timestamp: serverTimestamp(),
        sender: 'user',
        text: input,
        senderorder: 0
     });

      // Set loading UI to true when awaiting bot response
      setLoading(true);
      

      try {
        // Send user message to the backend API
        const response = await fetch('/api/inference', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userMessage: input, apiType }),
        });

        console.log("Reached here");

        const data = await response.json();

        console.log("Reached here");

        const botMessage: Message = {
          timestamp: serverTimestamp(),
          sender: 'bot',
          text: data.message,
          id: new Date().toISOString()
        };

        // Prepare a new document reference for the bot message
        const botDocRef = doc(collection(firestore, 'chat'));
        // Add the bot message to the batch
        batch.set(botDocRef, {
          timestamp: serverTimestamp(),
          sender: 'bot',
          text: data.message,
          senderorder: 1
        });

        // Commit the batch to Firestore
        await batch.commit();
          
        console.log("And got upto here");
        // Update UI with the bot message
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage: Message = {
          timestamp: serverTimestamp(),
          sender: 'bot',
          text: 'Sorry, there was an error with the bot.',
          id: new Date().toISOString()
        };
        // Update UI with the error message
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setLoading(false);
      }

      //setInput(''); // Clear the input field after sending a message
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* API Selector */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <select
            value={apiType}
            onChange={(e) => setApiType(e.target.value as 'huggingface' | 'deepseek' | 'openai')}
            className="bg-zinc-800 text-white text-sm py-1 px-2 rounded-lg"
          >
            <option value="huggingface">Hugging Face</option>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
      </div>

      {/* Chat Messages - Now with natural bottom */}
      <div className="flex-1 min-h-0 w-full">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-transparent 
                       hover:scrollbar-thumb-zinc-700 active:scrollbar-thumb-zinc-700
                       scrollbar-track-transparent transition-colors duration-300">
          <div className="px-4">
            <div className="flex flex-col space-y-2 py-4">
              {chat.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-lg p-3 text-white ${
                    msg.sender === 'user' 
                      ? 'bg-gray-700' // Lighter shade for user messages
                      : 'bg-transparent border border-gray-700' // Transparent with border for bot messages
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-center p-4 text-gray-500">
                  <span>Bot is typing...</span>
                </div>
              )}
              {/* Add invisible div as scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Input - Now without margin wrapper */}
      <ChatInput 
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Chat;