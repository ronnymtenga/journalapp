'use client';
import { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import ChatInput from '../components/ChatInput';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { firestore } from '../firebase';

type Message = {
  timestamp: string;
  sender: 'user' | 'bot';
  text: string;
  id: string;
};

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // We'll need to lift these states up from Chat.tsx
  const [input, setInput] = useState('');
  const [apiType, setApiType] = useState('huggingface');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(firestore, 'chat'), orderBy('timestamp', 'asc'), orderBy('senderorder', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Add effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Lift handleSendMessage from Chat.tsx and pass as prop
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      setLoading(true);
      // Store user message
      await addDoc(collection(firestore, 'chat'), {
        text: input.trim(),
        sender: 'user',
        timestamp: serverTimestamp(),
        senderorder: 1,
      });

      // Make API call based on selected API type
      const response = await fetch('/api/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: input.trim() }],
          apiType: apiType 
        }),
      });

      const data = await response.json();

      setInput(''); // Clear input after sending
      
      // Store bot response
      await addDoc(collection(firestore, 'chat'), {
        text: data.message,
        sender: 'bot',
        timestamp: serverTimestamp(),
        senderorder: 2,
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray flex flex-col">
      
      {/* Header */}
      <header className="h-12 bg-zinc-900 sticky top-0 z-40">
        {/*<div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold">aiJournal</h1>
        </div>*/}
        {/* Toggle Button */
         !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-2 left-2 z-50 bg-zinc-900 p-2 rounded-lg hover:bg-zinc-800 transition-all duration-300"
          >
            ☰
          </button>
        )}
      </header>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40
                   ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-zinc-800 shadow-sm transition-transform duration-300 z-40
                      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="fixed top-2 left-2 z-50 bg-transparent rounded-lg p-2 hover:bg-zinc-700 transition-all duration-300"
          >
            ☰
          </button>
        )}
      </div>

      {/* Main Content with Header */}
      
        {/* Chat Messages Area */}
        <main className="flex-1 flex justify-center items-center">
          <div className="w-full h-[calc(100vh-160px)]"> 
            <Chat 
              input={input}
              handleSendMessage={handleSendMessage}
              loading={loading}
              messages={messages}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        </main>

        
        <div className="bg-zinc-900/80 sticky bottom-6 backdrop-blur-sm py-0">
          <ChatInput 
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              apiType={apiType}
              setApiType={setApiType}
              isSidebarOpen={isSidebarOpen}
            />
        </div>

        {/* Footer Section*/}
        <footer className="py-1 bg-zinc-900/80 text-white flex items-center justify-center fixed bottom-0 w-full z-20">
          <p className="leading-none text-sm">© 2025 Your Chat App. All rights reserved.</p>
        </footer>

      </div>

  );
};

export default Home;