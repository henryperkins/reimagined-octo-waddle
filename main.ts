import { Plugin, Notice, addIcon, TFile, WorkspaceLeaf, App, PluginSettingTab } from 'obsidian';
import { ChatView } from './src/components/ChatView';
import SettingsBox from './src/components/SettingsBox';
import {
  AIChatSettings,
  Conversation,
  ChatMessage,
  FileProcessingResult,
  AIChatPluginInterface
} from './src/types';
import { ObsidianChatView } from './src/views/ObsidianChatView';
import { FileProcessingService } from './src/utils/fileProcessing';
import { SummarizationService } from './src/utils/summarization';
import { SearchService } from './src/utils/search';
import { handleUserQuery } from './src/utils/aiInteraction';
import React from 'react';
import ReactDOM from 'react-dom/client';

const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
const VIEW_TYPE_AI_CHAT = 'ai-chat-view';

const DEFAULT_SETTINGS: AIChatSettings = {
  apiKey: '',
  modelName: 'gpt-4',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1
  },
  chatFontSize: '14px',
  chatColorScheme: 'light',
  chatLayout: 'default',
  enableChatHistory: true,
  defaultPrompt: '',
  contextWindowSize: 4096,
  saveChatHistory: true,
  loadChatHistory: true,
  searchChatHistory: true,
  deleteMessageFromHistory: true,
  clearChatHistory: true,
  exportChatHistory: true,
  fileUploadLimit: 10,
  supportedFileTypes: ['.txt', '.md', '.pdf', '.csv'],
  contextIntegrationMethod: 'full',
  maxContextSize: 4096,
  useSemanticSearch: true,
  theme: 'light'
};

export class AIChatSettingsTab extends PluginSettingTab {
  plugin: AIChatPlugin;

  constructor(app: App, plugin: AIChatPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const settingsBox = React.createElement(SettingsBox, {
      plugin: this.plugin,
      onSettingsChange: async (settings) => {
        this.plugin.settings = settings;
        await this.plugin.saveSettings();
      }
    });
    const root = ReactDOM.createRoot(containerEl);
    root.render(settingsBox);
  }
}

export default class AIChatPlugin extends Plugin implements AIChatPluginInterface {
  settings: AIChatSettings = DEFAULT_SETTINGS;
  conversations: { [key: string]: Conversation } = {};
  currentConversationId: string = '';
  statusBarItem!: HTMLElement;
  tokenCount: number = 0;

  // Services
  private fileProcessor: FileProcessingService = new FileProcessingService();
  private summarizer: SummarizationService;
  private searchService: SearchService;

  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.summarizer = new SummarizationService(this);
    this.searchService = new SearchService(this);
  }

  async getAIResponse(message: string): Promise<string> {
    return await handleUserQuery(this, message);
  }

  async deleteConversation(id: string) {
    if (this.conversations[id]) {
      delete this.conversations[id];
      if (id === this.currentConversationId) {
        this.currentConversationId = '';
      }
    }
  }

  async processFile(file: File): Promise<string> {
    return await this.fileProcessor.processFile(file);
  }

  async onload() {
    console.log('Loading AI Chat Plugin');

    // Load settings
    await this.loadSettings();

    // Initialize services
    await this.searchService.initialize();

    // Register chat icon
    addIcon('ai-chat', CHAT_ICON);

    // Register view
    this.registerView(
      VIEW_TYPE_AI_CHAT,
      (leaf) => {
        const view = new ChatView({
          plugin: this,
          onSearchOpen: () => {
            // Handle search open
            console.log('Search opened');
          }
        });
        return view;
      }
    );

    // Add ribbon icon
    this.addRibbonIcon('ai-chat', 'AI Chat', () => {
      this.activateView();
    });

    // Add settings tab
    this.addSettingTab(new AIChatSettingsTab(this.app, this));

    // Initialize status bar
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar();

    // Create default conversation
    this.createConversation('Default Chat');

    // Register commands
    this.addCommands();

    // Register event handlers
    this.registerEventHandlers();
  }

  async onunload() {
    console.log('Unloading AI Chat Plugin');
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_AI_CHAT);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  updateStatusBar() {
    this.statusBarItem.setText(`AI Tokens: ${this.tokenCount}`);
  }

  showNotice(message: string, timeout: number = 4000) {
    new Notice(message, timeout);
  }

  // View Management
  async activateView() {
    const workspace = this.app.workspace;

    // Check if view already exists
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_AI_CHAT)[0];

    if (!leaf) {
      // Create new leaf in right sidebar
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({
          type: VIEW_TYPE_AI_CHAT,
          active: true,
        });
        leaf = rightLeaf;
      }
    }

    // Reveal and focus leaf
    if (leaf) {
      workspace.revealLeaf(leaf);
      workspace.setActiveLeaf(leaf, { focus: true });
    }
  }

  // Conversation Management
  createConversation(title: string = 'New Chat'): Conversation {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations[id] = conversation;
    this.currentConversationId = id;
    return conversation;
  }

  getCurrentConversation(): Conversation {
    return this.conversations[this.currentConversationId];
  }

  async addMessage(message: ChatMessage) {
    const conversation = this.getCurrentConversation();
    if (!conversation) {
      throw new Error('No active conversation');
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    if (this.settings.saveChatHistory) {
      await this.saveChatHistory();
    }
  }

  async deleteMessage(messageId: string) {
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    conversation.messages = conversation.messages.filter(msg => msg.id !== messageId);
    conversation.updatedAt = new Date();

    if (this.settings.saveChatHistory) {
      await this.saveChatHistory();
    }
  }

  async clearConversation(id?: string) {
    const conversationId = id || this.currentConversationId;
    if (this.conversations[conversationId]) {
      this.conversations[conversationId].messages = [];
      this.conversations[conversationId].updatedAt = new Date();
    }

    if (this.settings.saveChatHistory) {
      await this.saveChatHistory();
    }
  }

  // Chat History Management
  async saveChatHistory() {
    const historyFile = `chat-history/${this.currentConversationId}.json`;
    const history = JSON.stringify(this.getCurrentConversation(), null, 2);

    try {
      await this.app.vault.adapter.write(historyFile, history);
    } catch (error) {
      console.error('Error saving chat history:', error);
      this.showNotice('Error saving chat history');
    }
  }

  async loadChatHistory() {
    const historyFolder = 'chat-history';
    try {
      const files = await this.app.vault.adapter.list(historyFolder);
      for (const file of files.files) {
        const content = await this.app.vault.adapter.read(file);
        const conversation = JSON.parse(content);
        // Convert string dates back to Date objects
        conversation.createdAt = new Date(conversation.createdAt);
        conversation.updatedAt = new Date(conversation.updatedAt);
        conversation.messages.forEach((msg: ChatMessage) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        this.conversations[conversation.id] = conversation;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.showNotice('Error loading chat history');
    }
  }

  async exportChatHistory() {
    const conversation = this.getCurrentConversation();
    if (!conversation.messages.length) {
      this.showNotice('No messages to export');
      return;
    }

    const fileName = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
    const content = conversation.messages.map(msg => {
      return `## ${msg.role} (${msg.timestamp.toLocaleString()})\n${msg.content}\n`;
    }).join('\n');

    try {
      await this.app.vault.create(fileName, content);
      this.showNotice('Chat history exported successfully');
    } catch (error) {
      console.error('Error exporting chat history:', error);
      this.showNotice('Error exporting chat history');
    }
  }

  // File Processing
  async handleFileUpload(file: File): Promise<FileProcessingResult> {
    try {
      // Validate file
      if (!this.settings.supportedFileTypes.includes(`.${file.name.split('.').pop()}`)) {
        return {
          message: 'Unsupported file type'
        };
      }

      if (file.size > this.settings.fileUploadLimit * 1024 * 1024) {
        return {
          message: 'File size exceeds limit'
        };
      }

      // Process file
      const content = await this.fileProcessor.processFile(file);
      const filePath = await this.saveFileToVault(file);

      return {
        message: 'File processed successfully',
        filePath
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        message: errorMessage
      };
    }
  }

  async saveFileToVault(file: File): Promise<string> {
    const filePath = `uploads/${file.name}`;
    const content = await file.text();

    try {
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      if (existingFile instanceof TFile) {
        await this.app.vault.modify(existingFile, content);
      } else {
        await this.app.vault.create(filePath, content);
      }
      return filePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file to vault');
    }
  }

  // Search and Context
  async retrieveRelevantNotes(query: string) {
    return await this.searchService.search(query, {
      maxResults: this.settings.maxContextSize,
      semanticSearch: this.settings.useSemanticSearch
    });
  }

  async summarizeText(text: string) {
    return await this.summarizer.summarizeText(text, {
      maxLength: this.settings.maxContextSize
    });
  }

  async summarizeNotes(notes: string[]) {
    return await this.summarizer.summarizeNotes(notes);
  }

  // Commands
  private addCommands() {
    // Open chat
    this.addCommand({
      id: 'open-ai-chat',
      name: 'Open AI Chat',
      callback: () => this.activateView()
    });

    // Create new conversation
    this.addCommand({
      id: 'new-conversation',
      name: 'Create New Conversation',
      callback: () => this.createConversation()
    });

    // Clear current conversation
    this.addCommand({
      id: 'clear-conversation',
      name: 'Clear Current Conversation',
      callback: () => this.clearConversation()
    });

    // Export chat history
    this.addCommand({
      id: 'export-chat-history',
      name: 'Export Chat History',
      callback: () => this.exportChatHistory()
    });
  }

  // Event Handlers
  private registerEventHandlers() {
    // Handle theme changes
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_CHAT);
        leaves.forEach(leaf => {
          if (leaf.view instanceof ChatView) {
            (leaf.view as any).applyTheme();
          }
        });
      })
    );

    // Auto-save chat history
    if (this.settings.saveChatHistory) {
      this.registerInterval(
        window.setInterval(() => {
          this.saveChatHistory();
        }, 5 * 60 * 1000) // Save every 5 minutes
      );
    }
  }
}
