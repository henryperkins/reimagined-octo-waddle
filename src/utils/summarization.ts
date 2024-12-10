import { AIChatPlugin } from '../types';
import { queryOpenAI } from './aiInteraction';
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

  async summarizeText(
    text: string,
    options: SummarizationOptions = {}
  ): Promise<string> {
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
      const response = await queryOpenAI(this.plugin, '', prompt);
      return response.content;
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback to basic summarization
      return this.basicSummarize(text, maxLength);
    }
  }

  async summarizeNotes(
    notes: string[],
    options: SummarizationOptions = {}
  ): Promise<string[]> {
    try {
      const summaries = await Promise.all(
        notes.map(note => this.summarizeText(note, options))
      );
      return summaries.filter(Boolean);
    } catch (error) {
      console.error('Error summarizing notes:', error);
      throw new SummarizationError(
        'Failed to summarize notes',
        'SUMMARIZATION_ERROR',
        error
      );
    }
  }

  async summarizeContext(
    context: string[],
    options: SummarizationOptions = {}
  ): Promise<string> {
    if (!context.length) {
      return '';
    }

    try {
      const combinedContext = context.join('\n\n');
      return await this.summarizeText(combinedContext, {
        ...options,
        preserveKeyPoints: true
      });
    } catch (error) {
      console.error('Error summarizing context:', error);
      new Notice('Error summarizing context');
      return context.slice(0, 2).join('\n\n');
    }
  }

  private buildSummarizationPrompt(
    text: string,
    options: SummarizationOptions
  ): string {
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

export async function createSummaryNoteFromMessages(
  plugin: AIChatPlugin,
  messages: string[],
  title: string
): Promise<void> {
  try {
    const service = new SummarizationService(plugin);
    const summary = await service.summarizeContext(messages, {
      format: 'bullet',
      preserveKeyPoints: true
    });

    const noteContent = `# ${title}\n\n${summary}`;
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    
    await plugin.app.vault.create(fileName, noteContent);
    new Notice('Summary note created successfully');
  } catch (error) {
    console.error('Error creating summary note:', error);
    new Notice('Error creating summary note');
  }
}
