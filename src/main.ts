import { Plugin, Notice } from 'obsidian';
import { AIChatSettings, DEFAULT_SETTINGS, AIChatSettingsTab } from './settings/settings';
import { AIChatView, VIEW_TYPE_AI_CHAT } from './ui';
import type { ChatMessage, Conversation, FileProcessingResult } from './types';
import { queryAI } from './utils/aiInteraction';
import { FileProcessor } from './utils/fileProcessing';
import { SearchService } from './utils/search';

export default class AIChatPlugin extends Plugin {
    settings: AIChatSettings;
    conversations: { [key: string]: Conversation } = {};
    currentConversationId: string = '';
    fileProcessor: FileProcessor;
    searchService: SearchService;

    async onload() {
        await this.loadSettings();
        console.log('Loading AI Chat Plugin');

        // Initialize services
        this.fileProcessor = new FileProcessor({
            maxSizeInMB: this.settings.maxFileSize,
            supportedTypes: this.settings.supportedFileTypes
        });
        this.searchService = new SearchService(this.app, this.conversations);

        // Initialize default conversation
        this.createConversation('Default Chat');

        // Register view
        this.registerView(
            VIEW_TYPE_AI_CHAT,
            (leaf) => new AIChatView(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('message-square', 'AI Chat', () => {
            this.activateView();
        });

        // Add settings tab
        this.addSettingTab(new AIChatSettingsTab(this.app, this));

        // Load saved conversations if enabled
        if (this.settings.saveChatHistory) {
            await this.loadConversations();
        }

        // Add commands
        this.addCommand({
            id: 'open-ai-chat',
            name: 'Open AI Chat',
            callback: () => this.activateView()
        });

        this.addCommand({
            id: 'new-conversation',
            name: 'New Conversation',
            callback: () => this.createConversation()
        });
    }

    onunload() {
        console.log('Unloading AI Chat Plugin');
        if (this.settings.saveChatHistory) {
            this.saveConversations();
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;
        
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_AI_CHAT)[0];
        
        if (!leaf) {
            const newLeaf = workspace.getRightLeaf(false);
            if (newLeaf) {
                await newLeaf.setViewState({
                    type: VIEW_TYPE_AI_CHAT,
                    active: true,
                });
                workspace.revealLeaf(newLeaf);
            }
            return;
        }

        workspace.revealLeaf(leaf);
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
            await this.saveConversations();
        }
    }

    async deleteMessage(messageId: string) {
        const conversation = this.getCurrentConversation();
        if (!conversation) return;

        conversation.messages = conversation.messages.filter(msg => msg.id !== messageId);
        conversation.updatedAt = new Date();

        if (this.settings.saveChatHistory) {
            await this.saveConversations();
        }
    }

    // File Management
    async handleFileUpload(file: File): Promise<FileProcessingResult> {
        try {
            const content = await this.fileProcessor.processFile(file);
            const filePath = await this.saveFileToVault(file.name, content);
            
            return {
                success: true,
                message: 'File uploaded successfully',
                filePath
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error uploading file',
                error: error as Error
            };
        }
    }

    async saveFileToVault(filename: string, content: string): Promise<string> {
        const filePath = `uploads/${filename}`;
        await this.app.vault.adapter.write(filePath, content);
        return filePath;
    }

    // AI Interaction
    async getAIResponse(message: string): Promise<string> {
        if (!this.settings.apiKey) {
            new Notice('API key not configured. Please add your API key in settings.');
            throw new Error('API key not configured');
        }

        try {
            const response = await queryAI(
                this.settings.apiKey,
                message,
                {
                    model: this.settings.modelName,
                    temperature: this.settings.temperature,
                    maxTokens: this.settings.maxTokens
                }
            );
            return response;
        } catch (error) {
            console.error('Error getting AI response:', error);
            new Notice('Error getting AI response. Check console for details.');
            throw error;
        }
    }

    // Persistence
    private async saveConversations() {
        try {
            await this.saveData({
                ...this.settings,
                conversations: this.conversations
            });
        } catch (error) {
            console.error('Error saving conversations:', error);
            new Notice('Error saving conversations');
        }
    }

    private async loadConversations() {
        try {
            const data = await this.loadData();
            if (data.conversations) {
                this.conversations = data.conversations;
                // Convert string dates back to Date objects
                Object.values(this.conversations).forEach(conv => {
                    conv.createdAt = new Date(conv.createdAt);
                    conv.updatedAt = new Date(conv.updatedAt);
                    conv.messages.forEach(msg => {
                        msg.timestamp = new Date(msg.timestamp);
                    });
                });
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            new Notice('Error loading conversations');
        }
    }
}
