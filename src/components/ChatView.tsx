import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardHeader, CardContent } from './Card';
import type { AIChatPluginInterface as AIChatPlugin, ChatMessage as ChatMessageType } from '../types';

interface ChatViewProps {
    plugin: AIChatPlugin;
    onSearchOpen: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ plugin, onSearchOpen }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [plugin.getCurrentConversation()?.messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        try {
            const newMessage: ChatMessageType = {
                id: crypto.randomUUID(),
                role: 'user',
                content: message,
                timestamp: new Date()
            };

            await plugin.addMessage(newMessage);
            setMessage('');

            // Get AI response
            const response = await plugin.getAIResponse(message);
            await plugin.addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error sending message:', error);
            setError('An error occurred while processing your message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await plugin.handleFileUpload(file);
            if (result.success) {
                await plugin.addMessage({
                    id: crypto.randomUUID(),
                    role: 'system',
                    content: `File uploaded: ${file.name}`,
                    timestamp: new Date(),
                    metadata: {
                        sourceFile: result.filePath
                    }
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('An error occurred while uploading the file. Please try again.');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const conversation = plugin.getCurrentConversation();

    return (
        <Card className="ai-chat-container">
            <CardHeader>
                <div className="chat-header">
                    <h3>{conversation?.title || 'AI Chat'}</h3>
                    <div className="chat-actions">
                        <Button
                            variant="ghost"
                            onClick={onSearchOpen}
                            title="Search conversations"
                        >
                            🔍
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="chat-messages">
                {conversation?.messages.map((msg: ChatMessageType) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        onDelete={
                            msg.role === 'user'
                                ? () => plugin.deleteMessage(msg.id)
                                : undefined
                        }
                    />
                ))}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
                {isLoading && (
                    <div className="loading-message">
                        Processing...
                    </div>
                )}
            </CardContent>
            <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <Input
                        type="text"
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="chat-input"
                    />
                    <Button type="submit" disabled={!message.trim() || isLoading}>
                        Send
                    </Button>
                    <label className="file-upload-label">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept={plugin.settings.supportedFileTypes.join(',')}
                            disabled={isLoading}
                            className="hidden-file-input"
                        />
                        📎
                    </label>
                </form>
            </div>
        </Card>
    );
};
