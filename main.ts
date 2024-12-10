import { Plugin, WorkspaceLeaf, ItemView, TFile, Notice } from 'obsidian';
import { AIChatView, VIEW_TYPE_CHAT } from './src/components/AIChatView';
import { AIChatSettingsTab, DEFAULT_SETTINGS } from './src/settings/settings';
import type {
    AIChatSettings,
    Conversation,
    ChatMessage,
    FileProcessingResult
} from './src/types/types';
import { FileProcessingService } from './src/utils/fileProcessing';
import { SummarizationService } from './src/utils/summarization';
import { SearchService } from './src/utils/search';
import { AIService } from './src/utils/aiInteraction';

export default class AIChatPlugin extends Plugin {
    settings: AIChatSettings;
    conversations: { [key: string]: Conversation } = {};
    currentConversationId: string = '';
    
    // Services
    fileProcessingService: FileProcessingService;
    summarizationService: SummarizationService;
    searchService: SearchService;
    aiService: AIService;

    async onload() {
        await this.loadSettings();

        // Initialize services
        this.fileProcessingService = new FileProcessingService(this);
        this.summarizationService = new SummarizationService(this);
        this.searchService = new SearchService(this);
        this.aiService = new AIService(this);

        this.registerView(
            VIEW_TYPE_CHAT,
            (leaf: WorkspaceLeaf) => new AIChatView(leaf, this)
        );

        this.addRibbonIcon('message-square', 'AI Chat', () => {
            this.activateView();
        });

        this.addSettingTab(new AIChatSettingsTab(this.app, this));

        // Register the file menu event with proper typing
        this.registerEvent(
            // @ts-ignore - Obsidian's type definitions are incomplete
            this.app.workspace.on('file-menu', (menu, file: TFile) => {
                menu.addItem((item) => {
                    item
                        .setTitle('Summarize with AI')
                        .setIcon('bot')
                        .onClick(async () => {
                            await this.summarizeFile(file);
                        });
                });
            })
        );
    }

    async activateView() {
        const { workspace } = this.app;
        
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_CHAT)[0];
        
        if (!leaf) {
            const newLeaf = workspace.getRightLeaf(false);
            if (newLeaf) {
                await newLeaf.setViewState({
                    type: VIEW_TYPE_CHAT,
                    active: true,
                });
                leaf = newLeaf;
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    createConversation(title?: string): Conversation {
        const conversation: Conversation = {
            id: Date.now().toString(),
            title: title || 'New Conversation',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.conversations[conversation.id] = conversation;
        if (!this.currentConversationId) {
            this.currentConversationId = conversation.id;
        }
        return conversation;
    }

    getCurrentConversation(): Conversation {
        return this.conversations[this.currentConversationId];
    }

    async addMessage(message: ChatMessage): Promise<void> {
        const conversation = this.getCurrentConversation();
        if (conversation) {
            conversation.messages.push(message);
            conversation.updatedAt = new Date();
        }
    }

    async deleteMessage(messageId: string): Promise<void> {
        const conversation = this.getCurrentConversation();
        if (!conversation) return;

        conversation.messages = conversation.messages.filter((msg: ChatMessage) => msg.id !== messageId);
        conversation.updatedAt = new Date();

        if (this.settings.saveChatHistory) {
            await this.saveChatHistory();
        }
    }

    async handleFileUpload(file: File): Promise<FileProcessingResult> {
        return this.fileProcessingService.processFile(file);
    }

    async saveFileToVault(filename: string, content: string): Promise<string> {
        const path = `uploads/${filename}`;
        await this.app.vault.adapter.write(path, content);
        return path;
    }

    async getAIResponse(message: string): Promise<string> {
        return this.aiService.getResponse(message);
    }

    async summarizeFile(file: TFile) {
        const content = await this.app.vault.read(file);
        const summary = await this.summarizationService.summarize(content);
        
        const conversation = this.createConversation(`Summary of ${file.name}`);
        await this.addMessage({
            id: Date.now().toString(),
            role: 'system',
            content: `Summarizing file: ${file.name}`,
            timestamp: new Date(),
        });
        await this.addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: summary,
            timestamp: new Date(),
        });

        await this.activateView();
    }

    async exportChatHistory() {
        const conversation = this.getCurrentConversation();
        if (!conversation.messages.length) {
            this.showNotice('No messages to export');
            return;
        }

        const fileName = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
        const content = conversation.messages.map((msg: ChatMessage) => {
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

    async saveChatHistory() {
        // Implement the logic to save chat history
        // This is a placeholder implementation
        console.log('Chat history saved');
    }

    showNotice(message: string) {
        new Notice(message);
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);
    }

    private registerEventHandlers() {
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
