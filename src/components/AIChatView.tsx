import React, { createContext, useContext } from 'react';
import { ItemView, WorkspaceLeaf, App } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import type AIChatPlugin from '../../main';
import { ChatView } from './ChatView';
import { SearchView } from './SearchView';
import { ConversationList } from './ConversationList';

// Create App Context
const ObsidianContext = createContext<App | undefined>(undefined);

// Custom hook for accessing Obsidian App
export const useObsidian = () => {
  const context = useContext(ObsidianContext);
  if (context === undefined) {
    throw new Error('useObsidian must be used within an ObsidianProvider');
  }
  return context;
};

interface MainViewProps {
  plugin: AIChatPlugin;
}

// Main View Component
const MainView: React.FC<MainViewProps> = ({ plugin }) => {
  const [showSearch, setShowSearch] = React.useState(false);
  const app = useObsidian();
  
  return (
    <div className="app">
      <div className="flex h-full">
        <ConversationList
          conversations={plugin.conversations}
          currentId={plugin.currentConversationId}
          onSelect={(id) => {
            plugin.currentConversationId = id;
          }}
          onDelete={async (id) => {
            delete plugin.conversations[id];
            if (plugin.currentConversationId === id) {
              const conversationIds = Object.keys(plugin.conversations);
              plugin.currentConversationId = conversationIds[0] || '';
            }
          }}
          onNew={() => {
            plugin.createConversation();
          }}
          onRename={(id, newTitle) => {
            if (plugin.conversations[id]) {
              plugin.conversations[id].title = newTitle;
            }
          }}
        />
        
        <div className="flex-grow">
          <ChatView
            plugin={plugin}
            onSearchOpen={() => setShowSearch(true)}
          />
        </div>
      </div>

      {showSearch && (
        <SearchView
          plugin={plugin}
          onResultClick={(result) => {
            // Handle search result click
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

// View class that integrates with Obsidian
export const VIEW_TYPE_CHAT = 'ai-chat-view';

export class AIChatView extends ItemView {
  root: Root | null = null;
  plugin: AIChatPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: AIChatPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CHAT;
  }

  getDisplayText(): string {
    return 'AI Chat';
  }

  async onOpen(): Promise<void> {
    this.root = createRoot(this.containerEl.children[1]);
    this.root.render(
      <ObsidianContext.Provider value={this.app}>
        <MainView plugin={this.plugin} />
      </ObsidianContext.Provider>
    );
  }

  async onClose(): Promise<void> {
    this.root?.unmount();
  }
}

export default AIChatView;
