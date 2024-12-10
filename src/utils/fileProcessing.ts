interface FileProcessorOptions {
    maxSizeInMB: number;
    supportedTypes: string[];
}

export class FileProcessor {
    private options: FileProcessorOptions;

    constructor(options: FileProcessorOptions) {
        this.options = options;
    }

    async processFile(file: File): Promise<string> {
        // Validate file
        this.validateFile(file);

        // Process based on file type
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'txt':
            case 'md':
                return await this.processTextFile(file);
            case 'pdf':
                return await this.processPDFFile(file);
            case 'doc':
            case 'docx':
                return await this.processWordFile(file);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    private validateFile(file: File) {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
        if (!this.options.supportedTypes.includes(extension)) {
            throw new Error(`Unsupported file type: ${extension}`);
        }

        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > this.options.maxSizeInMB) {
            throw new Error(`File size exceeds limit of ${this.options.maxSizeInMB}MB`);
        }
    }

    private async processTextFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    private async processPDFFile(file: File): Promise<string> {
        // For now, return a placeholder message
        // In a full implementation, you would use a PDF parsing library
        return `[PDF Content from ${file.name}]`;
    }

    private async processWordFile(file: File): Promise<string> {
        // For now, return a placeholder message
        // In a full implementation, you would use a Word document parsing library
        return `[Word Document Content from ${file.name}]`;
    }

    static async extractMetadata(file: File) {
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified)
        };
    }

    static async getFileExtension(filename: string): Promise<string> {
        return `.${filename.split('.').pop()?.toLowerCase()}`;
    }

    static async isTextFile(file: File): Promise<boolean> {
        const textTypes = ['.txt', '.md', '.js', '.ts', '.json', '.css', '.html'];
        const ext = await FileProcessor.getFileExtension(file.name);
        return textTypes.includes(ext);
    }
}
