import React, { createContext, useContext } from 'react';
import { ItemView, WorkspaceLeaf, App } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';

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

interface ChatViewProps {
  plugin: any; // Replace with your plugin type
}

// Main Chat Component
const ChatView: React.FC<ChatViewProps> = ({ plugin }) => {
  const app = useObsidian();
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto p-4">
        {/* Chat messages will go here */}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 rounded border"
            placeholder="Type your message..."
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// View class that integrates with Obsidian
export const VIEW_TYPE_CHAT = 'ai-chat-view';

export class AIChatView extends ItemView {
  root: Root | null = null;
  plugin: any; // Replace with your plugin type

  constructor(leaf: WorkspaceLeaf, plugin: any) {
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
    const container = this.containerEl.children[1];
    this.root = createRoot(container);
    this.root.render(
      <ObsidianContext.Provider value={this.app}>
        <ChatView plugin={this.plugin} />
      </ObsidianContext.Provider>
    );
    this.applyTheme();
  }

  async onClose(): Promise<void> {
    this.root?.unmount();
  }

  applyTheme(): void {
    // Apply the current theme to the view
    const isDark = document.body.classList.contains('theme-dark');
    this.containerEl.classList.toggle('theme-dark', isDark);
    this.containerEl.classList.toggle('theme-light', !isDark);
  }
}
