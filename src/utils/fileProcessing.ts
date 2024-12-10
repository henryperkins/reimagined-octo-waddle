import type AIChatPlugin from '../main';
import type { FileProcessingResult } from '../types';

export class FileProcessingService {
    private plugin: AIChatPlugin;

    constructor(plugin: AIChatPlugin) {
        this.plugin = plugin;
    }

    async processFile(file: File): Promise<FileProcessingResult> {
        try {
            // Validate file
            this.validateFile(file);

            // Process based on file type
            const content = await this.extractContent(file);

            // Save to vault
            const filePath = await this.plugin.saveFileToVault(file.name, content);

            return {
                success: true,
                message: 'File processed successfully',
                filePath
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    private validateFile(file: File) {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
        if (!this.plugin.settings.supportedFileTypes.includes(extension)) {
            throw new Error(`Unsupported file type: ${extension}`);
        }

        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > this.plugin.settings.maxFileSize) {
            throw new Error(`File size exceeds limit of ${this.plugin.settings.maxFileSize}MB`);
        }
    }

    private async extractContent(file: File): Promise<string> {
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'txt':
            case 'md':
                return await this.readTextFile(file);
            case 'pdf':
                return await this.readPDFFile(file);
            case 'doc':
            case 'docx':
                return await this.readWordFile(file);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    private async readTextFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    private async readPDFFile(file: File): Promise<string> {
        // For now, return a placeholder message
        // In a full implementation, you would use a PDF parsing library
        return `[PDF Content from ${file.name}]`;
    }

    private async readWordFile(file: File): Promise<string> {
        // For now, return a placeholder message
        // In a full implementation, you would use a Word document parsing library
        return `[Word Document Content from ${file.name}]`;
    }

    async getFileMetadata(file: File) {
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified)
        };
    }

    async getFileExtension(filename: string): Promise<string> {
        return `.${filename.split('.').pop()?.toLowerCase()}`;
    }

    async isTextFile(file: File): Promise<boolean> {
        const textTypes = ['.txt', '.md', '.js', '.ts', '.json', '.css', '.html'];
        const ext = await this.getFileExtension(file.name);
        return textTypes.includes(ext);
    }
}
