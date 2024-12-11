import { App, Plugin } from 'obsidian';

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface AIChatSettings {
  apiKey: string;
  modelName: string;
  modelParameters: ModelParameters;
  chatFontSize: string;
  chatColorScheme: string;
  chatLayout: string;
  enableChatHistory: boolean;
  defaultPrompt: string;
  contextWindowSize: number;
  saveChatHistory: boolean;
  loadChatHistory: boolean;
  searchChatHistory: boolean;
  deleteMessageFromHistory: boolean;
  clearChatHistory: boolean;
  exportChatHistory: boolean;
  fileUploadLimit: number;
  supportedFileTypes: string[];
  contextIntegrationMethod: 'full' | 'summary';
  maxContextSize: number;
  useSemanticSearch: boolean;
  theme: 'light' | 'dark';
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokenCount?: number;
    sourceFile?: string;
  };
}

export interface FileProcessingResult {
  success?: boolean;
  message: string;
  filePath?: string;
}

export interface SearchOptions {
  maxResults: number;
  semanticSearch: boolean;
}

export interface SummarizeOptions {
  maxLength: number;
}

export interface AIChatPluginInterface extends Plugin {
  settings: AIChatSettings;
  saveSettings(settings: AIChatSettings): Promise<void>;
  summarizeText(text: string, options: SummarizeOptions): Promise<string>;
  summarizeNotes(notes: string[]): Promise<string[]>;
  retrieveRelevantNotes(query: string): Promise<SearchResult[]>;
  getCurrentConversation(): Conversation | null;
  clearConversation(): Promise<void>;
  exportChatHistory(): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  getAIResponse(message: string): Promise<string>;
  addMessage(message: ChatMessage): Promise<void>;
  handleFileUpload(file: File): Promise<FileProcessingResult>;
}

export interface SearchResult {
  path: string;
  score: number;
  content: string;
}

export interface SettingsBoxProps {
  plugin: AIChatPluginInterface;
  onSettingsChange: (settings: AIChatSettings) => Promise<void>;
}
