import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { ChatView } from '../components/ChatView';
import type { AIChatPluginInterface } from '../types';

export const VIEW_TYPE_AI_CHAT = 'ai-chat-view';

export class AIChatView extends ItemView {
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
    container.createEl('div', { cls: 'ai-chat-view' });

    this.root = createRoot(container.children[0]);
    this.root.render(
      ChatView({
        plugin: this.plugin,
        onSearchOpen: () => {
          // Handle search open
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

  applyTheme(): void {
    // Apply theme changes if needed
    this.containerEl.toggleClass('theme-dark', this.plugin.settings.theme === 'dark');
    this.containerEl.toggleClass('theme-light', this.plugin.settings.theme === 'light');
  }
}