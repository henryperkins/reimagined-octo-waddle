import { Plugin, TFile, WorkspaceLeaf, ItemView } from 'obsidian';

// Plugin Settings
export interface ModelParameters {
    temperature: number;
    maxTokens: number;
    topP: number;
}

export interface AIChatSettings {
    apiKey: string;
    modelName: string;
    temperature: number;
    maxTokens: number;
    supportedFileTypes: string[];
    maxFileSize: number;
    saveChatHistory: boolean;
}

// Chat Types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        tokenCount?: number;
        context?: string;
        sourceFile?: string;
    };
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

// File Processing Types
export interface FileProcessingResult {
    success: boolean;
    message: string;
    filePath?: string;
    error?: Error;
}

// Search Types
export interface SearchResult {
    type: 'message' | 'file';
    content: string;
    score: number;
    source: {
        id?: string;
        title?: string;
        path?: string;
        timestamp?: Date;
    };
}

export interface SearchOptions {
    caseSensitive?: boolean;
    includeFiles?: boolean;
    includeConversations?: boolean;
    maxResults?: number;
}

// Component Props
export interface ChatViewProps {
    plugin: AIChatPlugin;
    onSearchOpen: () => void;
}

export interface ChatMessageProps {
    message: ChatMessage;
    onDelete?: () => void;
}

export interface SearchViewProps {
    plugin: AIChatPlugin;
    onResultClick: (result: SearchResult) => void;
    onClose: () => void;
}

export interface ConversationListProps {
    conversations: { [key: string]: Conversation };
    currentId: string;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onNew: () => void;
    onRename: (id: string, newTitle: string) => void;
}

// Plugin Interface
export interface AIChatPlugin extends Plugin {
    settings: AIChatSettings;
    conversations: { [key: string]: Conversation };
    currentConversationId: string;
    fileProcessingService: FileProcessingService;
    summarizationService: SummarizationService;
    searchService: SearchService;
    aiService: AIService;

    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
    
    createConversation(title?: string): Conversation;
    getCurrentConversation(): Conversation;
    addMessage(message: ChatMessage): Promise<void>;
    deleteMessage(messageId: string): Promise<void>;
    
    handleFileUpload(file: File): Promise<FileProcessingResult>;
    saveFileToVault(filename: string, content: string): Promise<string>;
    
    getAIResponse(message: string): Promise<string>;
    activateView(): Promise<void>;
    summarizeFile(file: TFile): Promise<void>;
}

// Service Interfaces
export interface FileProcessingService {
    processFile(file: File): Promise<FileProcessingResult>;
}

export interface SummarizationService {
    summarize(text: string, options?: any): Promise<string>;
}

export interface SearchService {
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}

export interface AIService {
    getResponse(message: string): Promise<string>;
}
