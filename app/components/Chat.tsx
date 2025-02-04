"use client";


import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app'; // Initialize Firebase
import { getFirestore, connectFirestoreEmulator, collection, addDoc } from 'firebase/firestore'; // Firestore services
import { writeBatch, doc } from 'firebase/firestore';


// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiType, setApiType] = useState<'huggingface' | 'deepseek' | 'openai'>('huggingface'); // Option to switch APIs
  const [loading, setLoading] = useState(false); // Loading state

  // running this effect only on the client-side to avoid `window is not defined` error
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      connectFirestoreEmulator(firestore, 'localhost', 8081); // Connect to Firestore emulator if on localhost
    }
  }, []); // Empty dependency array ensures this effect only runs once on component mount (client-side)

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: new Date().toISOString(),
        text: input,
        sender: 'user',
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Create a batch instance
      const batch = writeBatch(firestore);

      // Prepare a new document reference for the user message
      const userDocRef = doc(collection(firestore, 'messages'));
      // Add the user message to the batch
      batch.set(userDocRef, {
        text: input,
        sender: 'user',
        timestamp: new Date(),
     });

      // Set loading to true when awaiting bot response
      setLoading(true);
      

      try {
        // Send user message to the backend API
        const response = await fetch('/api/chat', { 
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
          id: new Date().toISOString(),
          text: data.message,
          sender: 'bot',
        };

        // Prepare a new document reference for the bot message
        const botDocRef = doc(collection(firestore, 'messages'));
        // Add the bot message to the batch
        batch.set(botDocRef, {
          text: data.message,
          sender: 'bot',
          timestamp: new Date(),
        });

        // Commit the batch to Firestore
        await batch.commit();
          
        console.log("And got upto here");

        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage: Message = {
          id: new Date().toISOString(),
          text: 'Sorry, there was an error with the bot.',
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setLoading(false);
      }

      setInput('');
    }
  };

  return (
    <div className="bg-dark-gray rounded-lg shadow-lg p-6">
      {/* API Selector */}
      <div className="mb-4">
        <select
          value={apiType}
          onChange={(e) => setApiType(e.target.value as 'huggingface' | 'deepseek' | 'openai')}
          className="bg-gray-800 text-white p-2 rounded-lg"
        >
          <option value="huggingface">Hugging Face</option>
          <option value="openai">OpenAI</option>
          <option value="deepseek">DeepSeek</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex flex-col space-y-4 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs rounded-lg p-4 text-white ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center p-4 text-gray-500">
            <span>Bot is typing...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-grow bg-gray-800 text-white p-2 rounded-lg focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 bg-blue-600 text-white p-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;