import { Notice, TFile, normalizePath } from 'obsidian';
import { AIChatPlugin } from '../types';

export class FileProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

interface FileProcessor {
  canProcess(file: File): boolean;
  process(file: File): Promise<string>;
}

class TextFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
  }

  async process(file: File): Promise<string> {
    return await file.text();
  }
}

class PDFFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  async process(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      
      return text;
    } catch (error) {
      throw new FileProcessingError(
        'Failed to process PDF file',
        'PDF_PROCESSING_ERROR',
        error
      );
    }
  }
}

class ImageFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.type.startsWith('image/') || 
           file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
  }

  async process(file: File): Promise<string> {
    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );
      return result.data.text;
    } catch (error) {
      throw new FileProcessingError(
        'Failed to process image file',
        'IMAGE_PROCESSING_ERROR',
        error
      );
    }
  }
}

class CodeFileProcessor implements FileProcessor {
  canProcess(file: File): boolean {
    return file.name.match(/\.(js|ts|py|java|cpp|c|rb|go|rs|php)$/i) !== null;
  }

  async process(file: File): Promise<string> {
    const content = await file.text();
    const comments = content.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm) || [];
    return comments.join('\n');
  }
}

export class FileProcessingService {
  private processors: FileProcessor[] = [];

  constructor() {
    this.registerDefaultProcessors();
  }

  private registerDefaultProcessors() {
    this.processors.push(
      new TextFileProcessor(),
      new PDFFileProcessor(),
      new ImageFileProcessor(),
      new CodeFileProcessor()
    );
  }

  registerProcessor(processor: FileProcessor) {
    this.processors.push(processor);
  }

  async processFile(file: File): Promise<string> {
    const processor = this.processors.find(p => p.canProcess(file));
    if (!processor) {
      throw new FileProcessingError(
        `Unsupported file type: ${file.type}`,
        'UNSUPPORTED_FILE_TYPE'
      );
    }
    return await processor.process(file);
  }
}

export async function handleFileUpload(
  plugin: AIChatPlugin,
  file: File
): Promise<string> {
  try {
    // Validate file
    if (!plugin.settings.supportedFileTypes.includes(`.${file.name.split('.').pop()}`)) {
      throw new FileProcessingError(
        'Unsupported file type',
        'UNSUPPORTED_FILE_TYPE'
      );
    }

    if (file.size > plugin.settings.fileUploadLimit * 1024 * 1024) {
      throw new FileProcessingError(
        'File size exceeds limit',
        'FILE_SIZE_LIMIT'
      );
    }

    // Save file to vault
    const filePath = await saveFileToVault(plugin, file);
    
    // Process file content
    const service = new FileProcessingService();
    const content = await service.processFile(file);

    // Add to context if needed
    if (content.trim()) {
      await addToContext(plugin, content);
    }

    return `File ${file.name} uploaded and processed successfully.`;
  } catch (error) {
    if (error instanceof FileProcessingError) {
      new Notice(error.message);
      return `Error: ${error.message}`;
    }
    console.error('Error handling file upload:', error);
    new Notice('An unexpected error occurred while processing the file');
    return 'An error occurred while processing your file. Please try again.';
  }
}

async function saveFileToVault(
  plugin: AIChatPlugin,
  file: File
): Promise<string> {
  const filePath = normalizePath(`uploads/${file.name}`);
  const content = await file.text();

  const existingFile = plugin.app.vault.getAbstractFileByPath(filePath);
  if (existingFile instanceof TFile) {
    await plugin.app.vault.modify(existingFile, content);
  } else {
    await plugin.app.vault.create(filePath, content);
  }

  return filePath;
}

async function addToContext(
  plugin: AIChatPlugin,
  content: string
): Promise<void> {
  const summary = plugin.settings.contextIntegrationMethod === 'summary' 
    ? await plugin.summarizeText(content)
    : content;

  if (!plugin.chatHistory[plugin.currentConversation]) {
    plugin.chatHistory[plugin.currentConversation] = [];
  }

  plugin.chatHistory[plugin.currentConversation].push(`Context: ${summary}`);
  plugin.limitChatHistorySize();
}
