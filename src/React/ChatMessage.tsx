import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '../components/Button';
import { Copy, Trash2, Edit, ExternalLink } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { ConfirmModal } from '../components/Modal';

interface ChatMessageProps {
  message: ChatMessageType;
  onDelete?: () => Promise<void>;
  onEdit?: (newContent: string) => Promise<void>;
}

const ChatMessage = memo(({ message, onDelete, onEdit }: ChatMessageProps) => {
  const { role, content, timestamp, metadata } = message;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Could use Obsidian's Notice here if we had access to the app
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleEdit = async () => {
    if (!onEdit) return;
    const newContent = prompt('Edit message:', content);
    if (newContent && newContent !== content) {
      await onEdit(newContent);
    }
  };

  const getMessageStyle = () => {
    switch (role) {
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
              {content.split('\n').map((line, i) => (
                <p key={i} className="mb-1">{line}</p>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{role}</span>
              <span></span>
              <span>{new Date(timestamp).toLocaleString()}</span>
              {metadata?.tokenCount && (
                <>
                  <span></span>
                  <span>{metadata.tokenCount} tokens</span>
                </>
              )}
            </div>
            {metadata?.sourceFile && (
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>{metadata.sourceFile}</span>
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
            {role === 'user' && onEdit && (
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
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
