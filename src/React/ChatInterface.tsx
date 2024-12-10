import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { Modal, ConfirmModal } from '../components/Modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Upload, Settings, Trash, Download } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { FileUpload } from './FileUpload';
import { SettingsBox } from './SettingsBox';
import { AIChatPlugin } from '../types';

interface ChatInterfaceProps {
  plugin: AIChatPlugin;
  onSendMessage: (message: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  plugin,
  onSendMessage,
  onFileUpload
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = plugin.getCurrentConversation();

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearChat = async () => {
    await plugin.clearConversation();
  };

  const handleExportChat = async () => {
    await plugin.exportChatHistory();
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">AI Chat</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            icon={<Settings className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportChat}
            icon={<Download className="w-4 h-4" />}
          />
          <ConfirmModal
            trigger={
              <Button
                variant="ghost"
                size="icon"
                icon={<Trash className="w-4 h-4" />}
              />
            }
            title="Clear Chat"
            description="Are you sure you want to clear the chat history? This action cannot be undone."
            onConfirm={handleClearChat}
            isDestructive
          />
        </div>
      </div>

      <ScrollArea 
        ref={scrollRef}
        className="flex-grow p-4"
      >
        {conversation?.messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onDelete={async () => {
              await plugin.deleteMessage(msg.id);
            }}
          />
        ))}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse">Processing...</div>
          </div>
        )}
      </ScrollArea>

      <CardContent className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            autoResize
            maxHeight={200}
            disabled={isLoading}
            className="flex-grow"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
            <FileUpload onFileSelect={onFileUpload} />
          </div>
        </form>
      </CardContent>

      <Modal
        isOpen={showSettings}
        onOpenChange={setShowSettings}
        title="Settings"
      >
        <SettingsBox
          plugin={plugin}
          onSettingsChange={async (settings) => {
            await plugin.saveSettings(settings);
            setShowSettings(false);
          }}
        />
      </Modal>
    </Card>
  );
};

export default ChatInterface;
