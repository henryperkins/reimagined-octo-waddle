import { Plugin, TFile, WorkspaceLeaf, ItemView, StatusBarItem } from 'obsidian';

// Plugin Settings
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
  context?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// File Processing Types
export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  path: string;
  tags?: string[];
}

export interface FileProcessingResult {
  content: string;
  metadata: FileMetadata;
  summary?: string;
}

// Search Types
export interface SearchResult {
  file: TFile;
  content: string;
  score: number;
  excerpt?: string;
  context?: string;
}

export interface SearchOptions {
  fuzzyThreshold?: number;
  maxResults?: number;
  includeExcerpts?: boolean;
  semanticSearch?: boolean;
}

// View Types
export interface ViewState {
  type: string;
  active: boolean;
  state?: any;
}

// Plugin Interface
export interface AIChatPlugin extends Plugin {
  settings: AIChatSettings;
  conversations: { [key: string]: Conversation };
  currentConversationId: string;
  statusBarItem: StatusBarItem;
  tokenCount: number;

  // Settings Management
  loadSettings(): Promise<void>;
  saveSettings(): Promise<void>;
  
  // Chat Management
  createConversation(title?: string): Conversation;
  deleteConversation(id: string): Promise<void>;
  getCurrentConversation(): Conversation;
  addMessage(message: ChatMessage): Promise<void>;
  clearConversation(id?: string): Promise<void>;
  
  // File Management
  handleFileUpload(file: File): Promise<FileProcessingResult>;
  processFile(file: File): Promise<string>;
  saveFileToVault(file: File): Promise<string>;
  
  // Search and Context
  retrieveRelevantNotes(query: string): Promise<SearchResult[]>;
  summarizeText(text: string): Promise<string>;
  summarizeNotes(notes: string[]): Promise<string[]>;
  
  // UI Management
  updateStatusBar(): void;
  showNotice(message: string, timeout?: number): void;
  
  // View Management
  registerView(viewType: string, viewCreator: (leaf: WorkspaceLeaf) => ItemView): void;
  activateView(): Promise<void>;
}

// React Component Props
export interface ChatInterfaceProps {
  plugin: AIChatPlugin;
  onSendMessage: (message: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
}

export interface ChatMessageProps {
  message: ChatMessage;
  onDelete?: () => void;
  onEdit?: (newContent: string) => void;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  supportedTypes?: string[];
  maxSize?: number;
}

export interface SettingsBoxProps {
  plugin: AIChatPlugin;
  onSettingsChange: (settings: Partial<AIChatSettings>) => Promise<void>;
}

// Event Types
export interface UserEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Utility Types
export type ContextIntegrationMethod = 'full' | 'summary';
export type ThemeType = 'light' | 'dark';

export interface FileUploadResult {
  success: boolean;
  message: string;
  filePath?: string;
  error?: Error;
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  metadata?: {
    model: string;
    completionTokens: number;
    promptTokens: number;
  };
}
