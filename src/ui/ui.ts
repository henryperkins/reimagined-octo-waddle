import { ItemView, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { ChatInterface } from '../react/ChatInterface';
import { ChatMessage } from '../react/ChatMessage';
import { FileUpload } from '../react/FileUpload';
import { SettingsBox } from '../react/SettingsBox';
import { AIChatPlugin } from '../types';

export const VIEW_TYPE_AI_CHAT = 'AI_CHAT_VIEW';

export class AIChatView extends ItemView {
  private root: Root | null = null;
  private plugin: AIChatPlugin;

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
    const { containerEl } = this;
    const container = containerEl.children[1];
    container.empty();

    this.root = createRoot(container);
    
    // Initialize React app with Obsidian context
    this.root.render(
      React.createElement(React.StrictMode, {},
        React.createElement(ObsidianProvider, { value: this.app },
          React.createElement(ChatInterface, {
            plugin: this.plugin,
            onSendMessage: this.handleSendMessage.bind(this),
            onFileUpload: this.handleFileUpload.bind(this)
          })
        )
      )
    );
  }

  async onClose(): Promise<void> {
    // Cleanup React root
    this.root?.unmount();
  }

  private async handleSendMessage(query: string): Promise<void> {
    try {
      this.plugin.statusBarItem.setText('AI Processing...');
      
      // Get relevant notes for context
      const notes = await this.plugin.retrieveRelevantNotes(query);
      const summarizedNotes = await this.plugin.summarizeNotes(notes);
      const context = summarizedNotes.join('\n');

      // Get AI response
      const response = await this.plugin.queryOpenAI(context || 'No relevant context found.', query);

      // Add messages to history
      const currentConversation = this.plugin.getCurrentConversation();
      await this.plugin.addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: query,
        timestamp: new Date()
      });

      await this.plugin.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          tokenCount: response.tokensUsed,
          context: context
        }
      });

      // Update UI
      this.plugin.tokenCount = response.tokensUsed;
      this.plugin.updateStatusBar();

    } catch (error) {
      console.error('Error handling message:', error);
      this.plugin.showNotice('Error processing your message. Please try again.');
    }
  }

  private async handleFileUpload(file: File): Promise<void> {
    try {
      const result = await this.plugin.handleFileUpload(file);
      if (result.success) {
        this.plugin.showNotice('File uploaded successfully');
        
        // Add system message about file upload
        await this.plugin.addMessage({
          id: crypto.randomUUID(),
          role: 'system',
          content: `File uploaded: ${file.name}`,
          timestamp: new Date(),
          metadata: {
            sourceFile: result.filePath
          }
        });
      } else {
        this.plugin.showNotice(result.message || 'Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      this.plugin.showNotice('Error uploading file. Please try again.');
    }
  }

  private async exportChatHistory(): Promise<void> {
    try {
      const conversation = this.plugin.getCurrentConversation();
      if (!conversation.messages.length) {
        this.plugin.showNotice('No messages to export');
        return;
      }

      const fileName = `chat-history-${new Date().toISOString().slice(0, 10)}.md`;
      const content = conversation.messages.map(msg => {
        return `## ${msg.role} (${msg.timestamp.toLocaleString()})\n${msg.content}\n`;
      }).join('\n');

      await this.app.vault.create(fileName, content);
      this.plugin.showNotice('Chat history exported successfully');
    } catch (error) {
      console.error('Error exporting chat history:', error);
      this.plugin.showNotice('Error exporting chat history');
    }
  }
}

// React Context Provider for Obsidian App
const ObsidianContext = React.createContext<App | undefined>(undefined);

export const ObsidianProvider: React.FC<{
  value: App;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return React.createElement(ObsidianContext.Provider, { value }, children);
};

// Hook for accessing Obsidian App in React components
export const useObsidian = () => {
  const context = React.useContext(ObsidianContext);
  if (context === undefined) {
    throw new Error('useObsidian must be used within an ObsidianProvider');
  }
  return context;
};
