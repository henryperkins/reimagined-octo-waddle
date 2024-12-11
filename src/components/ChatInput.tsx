import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onFileSelect?: (file: File) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  onFileSelect,
  isLoading = false,
  placeholder = 'Type a message...'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-gray-200 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] max-h-[200px]"
          rows={1}
        />
        {onFileSelect && (
          <>
            <label htmlFor="file-input" className="sr-only">Upload file</label>
            <input
              type="file"
              id="file-input"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload file"
              title="Upload file"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 bottom-2"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="h-12 px-4"
      >
        <Send className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
      </Button>
    </form>
  );
};

export default ChatInput;
