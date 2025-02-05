type Message = {
    timestamp: any;
    sender: 'user' | 'bot';
    text: string;
    id: string;
  };
  
  interface ChatBubblesProps {
    messages: Message[];
    loading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    isSidebarOpen: boolean;
  }
  
  const ChatBubbles = ({ messages, loading, messagesEndRef, isSidebarOpen }: ChatBubblesProps) => {
    return (
      <div className="flex-1 min-h-0 w-full">
        <div className="h-full overflow-y-auto scrollbar-thin transition-colors duration-300">
          <div className="w-[clamp(300px,min(80vw,800px),800px)] mx-auto 
                         pr-[clamp(4px,5vw,56px)] flex flex-col items-center">
            <div className="flex flex-col space-y-4 py-16 w-full">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-md p-[clamp(0.5rem,1.5vw,1rem)] text-base 
                                 max-w-[clamp(180px,40vw,28rem)] ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-600/90 ml-auto mr-0'
                      : 'bg-zinc-800/70 border border-zinc-600/50 mr-auto ml-0'
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
    );
  };
  
  export default ChatBubbles;