import React from 'react';
import { Button } from './Button';
import { TextArea } from './TextArea';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onFileUpload?: (file: File) => void;
    isLoading?: boolean;
    placeholder?: string;
    supportedFileTypes?: string[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSubmit,
    onFileUpload,
    isLoading = false,
    placeholder = 'Type your message...',
    supportedFileTypes = []
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSubmit();
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileUpload) {
            await onFileUpload(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="chat-input-container">
            <form 
                className="chat-input-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (value.trim() && !isLoading) {
                        onSubmit();
                    }
                }}
            >
                <TextArea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="chat-input"
                />
                <Button 
                    type="submit" 
                    disabled={!value.trim() || isLoading}
                    title="Send message"
                >
                    📤
                </Button>
                {onFileUpload && (
                    <label className="file-upload-label">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={supportedFileTypes.join(',')}
                            disabled={isLoading}
                            style={{ display: 'none' }}
                        />
                        📎
                    </label>
                )}
            </form>
        </div>
    );
};
