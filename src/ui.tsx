import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { ChatView } from './components/ChatView';
import { SearchView } from './components/SearchView';
import { ConversationList } from './components/ConversationList';
import React, { useState } from 'react';
import type AIChatPlugin from '../main';
import type { SearchResult } from './types';

export const VIEW_TYPE_AI_CHAT = 'ai-chat-view';

interface ViewProps {
    plugin: AIChatPlugin;
}

const View: React.FC<ViewProps> = ({ plugin }) => {
    const [showSearch, setShowSearch] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    const forceUpdate = () => {
        setUpdateKey(key => key + 1);
    };

    const handleSearchResult = (result: SearchResult) => {
        if (result.type === 'message' && result.source.id) {
            // Handle message result
            const conversation = plugin.conversations[result.source.id];
            if (conversation) {
                plugin.currentConversationId = conversation.id;
                forceUpdate();
            }
        } else if (result.type === 'file' && result.source.path) {
            // Handle file result
            plugin.app.workspace.openLinkText(result.source.path, '');
        }
        setShowSearch(false);
    };

    const handleNewConversation = () => {
        try {
            plugin.createConversation();
            forceUpdate();
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleDeleteConversation = async (id: string) => {
        try {
            // Don't delete the last conversation
            if (Object.keys(plugin.conversations).length <= 1) {
                return;
            }

            // Create a new conversation first if deleting the current one
            if (id === plugin.currentConversationId) {
                plugin.createConversation();
            }

            // Delete the conversation
            delete plugin.conversations[id];
            
            // Save changes if history is enabled
            if (plugin.settings.saveChatHistory) {
                await plugin.saveData({
                    ...plugin.settings,
                    conversations: plugin.conversations
                });
            }

            forceUpdate();
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const handleSelectConversation = (id: string) => {
        try {
            if (plugin.conversations[id]) {
                plugin.currentConversationId = id;
                forceUpdate();
            }
        } catch (error) {
            console.error('Error switching conversation:', error);
        }
    };

    const handleRenameConversation = async (id: string, newTitle: string) => {
        try {
            const conversation = plugin.conversations[id];
            if (conversation) {
                conversation.title = newTitle;
                conversation.updatedAt = new Date();
                
                if (plugin.settings.saveChatHistory) {
                    await plugin.saveData({
                        ...plugin.settings,
                        conversations: plugin.conversations
                    });
                }
                forceUpdate();
            }
        } catch (error) {
            console.error('Error renaming conversation:', error);
        }
    };

    return (
        <div className="ai-chat-view" key={updateKey}>
            <ConversationList
                conversations={plugin.conversations}
                currentId={plugin.currentConversationId}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onNew={handleNewConversation}
                onRename={handleRenameConversation}
            />
            {showSearch ? (
                <SearchView
                    plugin={plugin}
                    onResultClick={handleSearchResult}
                    onClose={() => setShowSearch(false)}
                />
            ) : (
                <ChatView
                    plugin={plugin}
                    onSearchOpen={() => setShowSearch(true)}
                />
            )}
        </div>
    );
};

export class AIChatView extends ItemView {
    root: Root | null = null;
    plugin: AIChatPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: AIChatPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_AI_CHAT;
    }

    getDisplayText(): string {
        return 'AI Chat';
    }

    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        this.root = createRoot(container);
        this.root.render(
            React.createElement(View, { plugin: this.plugin })
        );
    }

    async onClose(): Promise<void> {
        this.root?.unmount();
    }
}
