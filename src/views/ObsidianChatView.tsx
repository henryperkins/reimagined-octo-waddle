import { ItemView, WorkspaceLeaf } from 'obsidian';
import { ChatView } from './ChatView';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import type { AIChatPluginInterface } from '../types';

export const VIEW_TYPE_AI_CHAT = 'ai-chat-view';

export class ObsidianChatView extends ItemView {
  private root: Root | null = null;
  private plugin: AIChatPluginInterface;

  constructor(leaf: WorkspaceLeaf, plugin: AIChatPluginInterface) {
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
    container.createEl('div', { cls: 'ai-chat-view-container' });

    this.root = createRoot(container.children[0]);
    this.root.render(
      React.createElement(ChatView, {
        plugin: this.plugin,
        onSearchOpen: () => {
          // Handle search opening
          console.log('Search opened');
        }
      })
    );
  }

  async onClose(): Promise<void> {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
