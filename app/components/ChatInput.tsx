import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
  apiType: string;
  setApiType: (type: 'huggingface' | 'deepseek' | 'openai') => void;
  isSidebarOpen: boolean;
}

const ChatInput = ({ input, setInput, handleSendMessage, apiType, setApiType, isSidebarOpen }: ChatInputProps) => {
  return (
    <div className="w-full overflow-x-hidden">
      <div className={`w-[clamp(300px,90vw,900px)]
                       mx-auto 
                       pl-[clamp(4px,5vw,64px)] pr-[clamp(4px,5vw,64px)] flex flex-col items-center`}>
        <div className="bg-zinc-800/50 rounded-3xl shadow-lg ring-1 ring-white/5 w-full">
          <div className="px-3 py-2">
            <TextareaAutosize
              minRows={1}
              maxRows={5}
              className="w-full bg-transparent text-zinc-100 p-1.5 rounded-lg outline-none resize-none 
                         placeholder-zinc-500 
                         transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="mt-4 flex justify-between items-center">
              <select
                value={apiType}
                onChange={(e) => setApiType(e.target.value as 'huggingface' | 'deepseek' | 'openai')}
                className="bg-zinc-800 text-white text-sm py-0.5 px-2 rounded-lg"
              >
                <option value="huggingface">Hugging Face</option>
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
              </select>
              <button
                onClick={handleSendMessage}
                className="p-3 rounded-full -mt-3 bg-zinc-700 hover:bg-zinc-500 text-zinc-100
                         transition-colors ring-1 ring-white/10"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-5 h-5"
                >
                  <path d="M12 4.5L4.5 12l1.5 1.5L11 8v11h2V8l5 5.5 1.5-1.5L12 4.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;