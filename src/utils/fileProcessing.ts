import { Notice, TFile, normalizePath } from 'obsidian';

declare global {
  interface Window {
    pdfjsLib: any;
    Tesseract: any;
  }
}

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
      if (!window.pdfjsLib) {
        throw new FileProcessingError(
          'PDF.js library not loaded',
          'PDF_LIB_NOT_LOADED'
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: { str: string }) => item.str).join(' ') + '\n';
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
      if (!window.Tesseract) {
        throw new FileProcessingError(
          'Tesseract library not loaded',
          'TESSERACT_NOT_LOADED'
        );
      }

      const result = await window.Tesseract.recognize(
        file,
        'eng',
        { logger: (m: unknown) => console.log(m) }
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
