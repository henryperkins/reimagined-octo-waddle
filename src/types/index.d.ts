import 'obsidian';
import { AIChatSettings } from './settings';

declare module 'obsidian' {
  interface App {
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        [key: string]: any;
      };
    };
  }

  interface Vault {
    config: {
      spellcheck?: boolean;
      theme?: string;
    };
  }

  interface Workspace {
    activeLeaf: WorkspaceLeaf | null;
    floatingSplit: WorkspaceSplit | null;
  }
}

declare global {
  interface Window {
    app: App;
    pdfjsLib: any;
    fs: {
      readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string>;
      exists(path: string): Promise<boolean>;
      readdir(path: string): Promise<string[]>;
      mkdir(path: string): Promise<void>;
      stat(path: string): Promise<{ mtime: number; size: number }>;
    };
  }
}

// Plugin Types
export interface PluginState {
  isLoaded: boolean;
  isEnabled: boolean;
  settings: AIChatSettings;
}

// Service Types
export interface SearchOptions {
  fuzzyThreshold?: number;
  maxResults?: number;
  includeExcerpts?: boolean;
  semanticSearch?: boolean;
}

export interface ProcessingOptions {
  maxSize?: number;
  allowedTypes?: string[];
  preserveOriginal?: boolean;
}

export interface SummarizationOptions {
  maxLength?: number;
  preserveKeyPoints?: boolean;
  format?: 'bullet' | 'paragraph';
  language?: string;
}

// Event Types
export interface ChatEvent {
  type: 'message' | 'file' | 'system';
  payload: any;
  timestamp: Date;
}

// Error Types
export interface PluginError extends Error {
  code: string;
  details?: any;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Component Props Types
export interface ViewProps {
  plugin: any;
  leaf: WorkspaceLeaf;
}

export interface CommonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type UpdateFn<T> = (prev: T) => T;

// Additional Module Declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

// External Library Types
declare module 'pdfjs-dist' {
  export function getDocument(data: ArrayBuffer): Promise<PDFDocumentProxy>;
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }
  export interface TextContent {
    items: Array<{ str: string }>;
  }
}