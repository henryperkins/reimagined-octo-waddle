import type AIChatPlugin from '../../main';
import { Notice } from 'obsidian';

export class SummarizationError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'SummarizationError';
    }
}

interface SummarizationOptions {
    maxLength?: number;
    preserveKeyPoints?: boolean;
    format?: 'bullet' | 'paragraph';
    language?: string;
}

export class SummarizationService {
    constructor(private plugin: AIChatPlugin) {}

    async summarize(text: string, options: SummarizationOptions = {}): Promise<string> {
        const {
            maxLength = 200,
            preserveKeyPoints = true,
            format = 'paragraph',
            language = 'en'
        } = options;

        if (!text.trim()) {
            return '';
        }

        try {
            // For short texts, use simple summarization
            if (text.length < maxLength) {
                return text;
            }

            // For longer texts, use AI summarization
            const prompt = this.buildSummarizationPrompt(text, options);
            return await this.plugin.getAIResponse(prompt);
        } catch (error) {
            console.error('Summarization error:', error);
            // Fallback to basic summarization
            return this.basicSummarize(text, maxLength);
        }
    }

    private buildSummarizationPrompt(text: string, options: SummarizationOptions): string {
        const {
            maxLength = 200,
            preserveKeyPoints = true,
            format = 'paragraph'
        } = options;

        let prompt = `Please provide a concise summary of the following text in ${format} format`;
        
        if (preserveKeyPoints) {
            prompt += ', preserving the key points and main ideas';
        }
        
        if (maxLength) {
            prompt += `, approximately ${maxLength} characters in length`;
        }

        prompt += `:\n\n${text}`;
        return prompt;
    }

    private basicSummarize(text: string, maxLength: number): string {
        // Split into sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        if (!sentences.length) {
            return text;
        }

        let summary = '';
        let currentLength = 0;

        // Take sentences until we reach maxLength
        for (const sentence of sentences) {
            if (currentLength + sentence.length > maxLength) {
                break;
            }
            summary += sentence;
            currentLength += sentence.length;
        }

        return summary.trim();
    }

    private extractKeyPoints(text: string): string[] {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const keyPoints = sentences.filter(sentence => {
            // Look for key point indicators
            const indicators = [
                'important',
                'key',
                'significant',
                'essential',
                'crucial',
                'primary',
                'major',
                'fundamental'
            ];
            
            return indicators.some(indicator => 
                sentence.toLowerCase().includes(indicator)
            );
        });

        return keyPoints;
    }
}
