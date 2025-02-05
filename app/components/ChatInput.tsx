import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: () => void;
}

const ChatInput = ({ input, setInput, handleSendMessage }: ChatInputProps) => {
  return (
    <div className="bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-800/50 rounded-lg shadow-lg ring-1 ring-white/5">
          <div className="px-3 py-2">
            <TextareaAutosize
              minRows={1}
              maxRows={5}
              className="w-full bg-zinc-800 text-zinc-100 p-1.5 rounded-lg focus:outline-none resize-none 
                         border border-zinc-700 placeholder-zinc-500 
                         focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
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
            <div className="mt-1.5 flex justify-end">
              <button
                onClick={handleSendMessage}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1 rounded-md 
                         transition-colors ring-1 ring-white/10"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;