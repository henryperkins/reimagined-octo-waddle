import React from 'react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';

interface ChatHeaderProps {
    title: string;
    onSearch?: () => void;
    onSettings?: () => void;
    onClear?: () => void;
    onExport?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title,
    onSearch,
    onSettings,
    onClear,
    onExport
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="chat-header">
                    <h3>{title}</h3>
                    <div className="chat-actions">
                        {onSearch && (
                            <Button
                                variant="ghost"
                                onClick={onSearch}
                                title="Search conversations"
                            >
                                🔍
                            </Button>
                        )}
                        {onExport && (
                            <Button
                                variant="ghost"
                                onClick={onExport}
                                title="Export conversation"
                            >
                                📥
                            </Button>
                        )}
                        {onClear && (
                            <Button
                                variant="ghost"
                                onClick={onClear}
                                title="Clear conversation"
                            >
                                🗑️
                            </Button>
                        )}
                        {onSettings && (
                            <Button
                                variant="ghost"
                                onClick={onSettings}
                                title="Settings"
                            >
                                ⚙️
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};
