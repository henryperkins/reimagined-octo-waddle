import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
    message: ChatMessageType;
    onDelete?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onDelete }) => {
    const isUser = message.role === 'user';
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            // Could add a toast notification here
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    return (
        <Card className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
            <CardContent>
                <div className="message-header">
                    <span className="message-role">{message.role}</span>
                    <span className="message-time">
                        {message.timestamp.toLocaleTimeString()}
                    </span>
                    <div className="message-actions">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            title="Copy message"
                            className="message-action-button"
                        >
                            📋
                        </Button>
                        {isUser && onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                title="Delete message"
                                className="message-action-button delete"
                            >
                                🗑️
                            </Button>
                        )}
                    </div>
                </div>
                <div className="message-content">
                    {message.content}
                </div>
                {message.metadata?.sourceFile && (
                    <div className="message-metadata">
                        Source: {message.metadata.sourceFile}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
