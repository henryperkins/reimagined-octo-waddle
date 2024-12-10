import React, { useState } from 'react';
import type { Conversation } from '../types';
import { 
    Card, 
    CardHeader, 
    CardContent,
    Button,
    Input 
} from './';

interface ConversationListProps {
    conversations: { [key: string]: Conversation };
    currentId: string;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onNew: () => void;
    onRename: (id: string, newTitle: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    currentId,
    onSelect,
    onDelete,
    onNew,
    onRename
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const sortedConversations = Object.values(conversations).sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(conv.id);
        setEditTitle(conv.title);
    };

    const handleRenameSubmit = (id: string) => {
        if (editTitle.trim()) {
            onRename(id, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') {
            handleRenameSubmit(id);
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setEditTitle('');
        }
    };

    return (
        <Card className="conversation-list">
            <CardHeader>
                <div className="conversation-list-header">
                    <h3>Conversations</h3>
                    <Button
                        variant="ghost"
                        onClick={onNew}
                        title="New conversation"
                        className="new-conversation-button"
                    >
                        +
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="conversation-items">
                {sortedConversations.map((conv) => (
                    <Card
                        key={conv.id}
                        className={`conversation-item ${conv.id === currentId ? 'active' : ''}`}
                        onClick={() => onSelect(conv.id)}
                    >
                        <CardContent className="conversation-item-content">
                            {editingId === conv.id ? (
                                <Input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={() => handleRenameSubmit(conv.id)}
                                    onKeyDown={(e) => handleKeyPress(e, conv.id)}
                                    autoFocus
                                    className="rename-input"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div 
                                    className="conversation-title"
                                    onDoubleClick={(e) => handleStartRename(conv, e)}
                                >
                                    {conv.title}
                                </div>
                            )}
                            <div className="conversation-date">
                                {formatDate(conv.updatedAt)}
                            </div>
                            <div className="conversation-preview">
                                {conv.messages[conv.messages.length - 1]?.content.slice(0, 50) || 'No messages'}
                            </div>
                        </CardContent>
                        {conv.id !== currentId && (
                            <Button
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(conv.id);
                                }}
                                title="Delete conversation"
                                className="delete-conversation"
                            >
                                ×
                            </Button>
                        )}
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
};
