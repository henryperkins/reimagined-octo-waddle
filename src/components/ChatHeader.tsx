import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Trash2, 
  Download, 
  RotateCcw,
  Bot
} from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  onClearChat?: () => void;
  onExportChat?: () => void;
  onResetContext?: () => void;
  onOpenSettings?: () => void;
  messageCount?: number;
  tokenCount?: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = 'AI Chat',
  onClearChat,
  onExportChat,
  onResetContext,
  onOpenSettings,
  messageCount = 0,
  tokenCount = 0
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">
              {messageCount} messages  {tokenCount} tokens
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onResetContext && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetContext}
              title="Reset Context"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          {onExportChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportChat}
              title="Export Chat"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {onClearChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearChat}
              title="Clear Chat"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default ChatHeader;
