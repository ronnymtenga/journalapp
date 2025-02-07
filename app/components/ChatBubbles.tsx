import ReadOnlyEditor from "./ReadOnlyEditor";

type Message = {
    timestamp: string;
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
  
  const ChatBubbles = ({ messages, loading, messagesEndRef }: ChatBubblesProps) => {

    // Function to export a single bot message (defined later in the parent or passed as a prop)
    const exportToNotion = async (msg: any) => {
      try {
        const response = await fetch('../api/notion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg }),
        });
        console.log(response);
        const result = await response.json();
        if (result.success) {
          alert('Exported to Notion!');
        } else {
          alert('Export failed: ' + result.error);
        }
      } catch (error) {
        console.error('Error exporting to Notion:', error);
        alert('Export error');
      }
    };

    return (
      <div className="flex-1 min-h-0 w-full">
        <div className="h-full overflow-y-auto scrollbar-thin transition-colors duration-300">
          <div className="w-[clamp(270px,90vw,800px)]
                          mx-auto 
                          pr-[clamp(4px,5vw,56px)]  pl-[clamp(4px,5vw,64px)] flex flex-col items-center">
            <div className="flex flex-col space-y-4 py-4 w-full">

              {/*messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-md p-[clamp(0.5rem,1.5vw,1rem)] text-base 
                                 max-w-[clamp(180px,40vw,28rem)] ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-800/50 ml-auto mr-0'
                      : 'bg-zinc-800/70 border border-zinc-600/50 mr-auto ml-0'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))*/}

              {/*messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl p-[clamp(0.5rem,1.5vw,1rem)] text-base 
                                 ${msg.sender === 'user' 
                                    ? 'bg-zinc-800/50 ml-auto mr-0 max-w-[clamp(180px,40vw,28rem)]'
                                    : 'bg-zinc-800/70 border border-zinc-600/50 mr-0 ml-0'}`}>
                    {msg.text}
                  </div>
                </div>
              ))*/}

              {/*messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' ? (
                    <ReadOnlyEditor markdown={msg.text} />
                  ) : (
                    <div className="rounded-2xl p-[clamp(0.5rem,1.5vw,1rem)] text-base 
                                    bg-zinc-800/50 ml-auto mr-0 max-w-[clamp(180px,40vw,28rem)]">
                      {msg.text}
                    </div>
                  )}
                </div>
              ))*/}
              
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' ? (
                    <>
                      {/* Bot messages */}
                      <ReadOnlyEditor
                        markdown={msg.text}
                        className="w-full bg-transparent text-zinc-100 p-1.5 rounded-2xl 
                                   outline-none resize-none transition-colors bg-zinc-800/70
                                   border border-zinc-600/50 mr-auto ml-0" // Bot bubble styling
                      />
                      <div className="mt-1 text-left ml-3 -mt-0.5">
                        <button
                          onClick={() => exportToNotion(msg)}
                          className="text-sm text-blue-300 hover:text-blue-500"
                        >
                          Export to Notion
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* User messages */}
                      <ReadOnlyEditor
                        markdown={msg.text}
                        className="p-[clamp(0.5rem,1.5vw,1rem)] bg-zinc-800/50 ml-auto mr-0
                                   text-base rounded-2xl max-w-[clamp(180px,40vw,28rem)]" // User bubble styling
                      />
                    </>
                  )}
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