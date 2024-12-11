import React from 'react';
import { Card } from 'components/ui/card';
import { ChatMessage as ChatMessageType } from 'types';
import { Button } from 'components/ui/button';
import { Copy, Edit, Trash2, ExternalLink } from 'lucide-react';
import { ConfirmModal } from 'components/Modal';

interface ChatMessageProps {
  message: ChatMessageType;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onEdit, onDelete }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleEdit = async () => {
    if (!onEdit) return;
    const newContent = prompt('Edit message:', message.content);
    if (newContent && newContent !== message.content) {
      await onEdit(newContent);
    }
  };

  const getMessageStyle = () => {
    switch (message.role) {
      case 'user':
        return 'bg-primary/10';
      case 'assistant':
        return 'bg-secondary/10';
      case 'system':
        return 'bg-muted/50 italic';
      default:
        return 'bg-background';
    }
  };

  return (
    <Card className={`mb-4 ${getMessageStyle()}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <div className="prose dark:prose-invert max-w-none">
              {message.content.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-1">{line}</p>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{message.role}</span>
              <span></span>
              <span>{new Date(message.timestamp).toLocaleString()}</span>
              {message.metadata?.tokenCount && (
                <>
                  <span></span>
                  <span>{message.metadata.tokenCount} tokens</span>
                </>
              )}
            </div>
            {message.metadata?.sourceFile && (
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>{message.metadata.sourceFile}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {message.role === 'user' && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <ConfirmModal
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
                title="Delete Message"
                description="Are you sure you want to delete this message? This action cannot be undone."
                onConfirm={onDelete}
                isDestructive
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
