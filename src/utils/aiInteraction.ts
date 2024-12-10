import { Notice } from 'obsidian';
import axios, { AxiosError } from 'axios';
import { AIChatPlugin } from '../types';

const AZURE_OPENAI_ENDPOINT = 'https://openai-hp.openai.azure.com/openai/deployments/o1-preview/chat/completions?api-version=2024-08-01-preview';

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AIError';
  }
}

interface AIResponse {
  content: string;
  tokensUsed: number;
}

export async function queryOpenAI(
  plugin: AIChatPlugin,
  context: string,
  query: string
): Promise<AIResponse> {
  const apiKey = plugin.settings.apiKey.trim();
  if (!apiKey) {
    throw new AIError(
      'API Key is not set',
      'MISSING_API_KEY'
    );
  }

  const {
    modelName = 'gpt-4',
    temperature = 0.7,
    maxTokens = 2048,
    topP = 0.9
  } = plugin.settings.modelParameters;

  try {
    const response = await axios.post(
      AZURE_OPENAI_ENDPOINT,
      {
        model: modelName,
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: query }
        ],
        temperature,
        max_tokens: maxTokens,
        top_p: topP
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      tokensUsed: response.data.usage.total_tokens
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response?.status === 429) {
        throw new AIError(
          'Rate limit exceeded. Please try again later.',
          'RATE_LIMIT'
        );
      }
      throw new AIError(
        axiosError.response?.data?.error?.message || axiosError.message,
        'API_ERROR',
        axiosError.response?.data
      );
    }
    throw error;
  }
}

export async function handleUserQuery(
  plugin: AIChatPlugin,
  query: string
): Promise<string> {
  try {
    // Get relevant notes for context
    const notes = await plugin.retrieveRelevantNotes(query);
    const summarizedNotes = await summarizeNotes(plugin, notes);
    const context = summarizedNotes.join('\n');

    // Get AI response
    const response = await queryOpenAI(plugin, context || 'No relevant context found.', query);
    
    // Update token count
    plugin.tokenCount = response.tokensUsed;
    plugin.updateStatusBar();

    return response.content;
  } catch (error) {
    if (error instanceof AIError) {
      new Notice(error.message);
      return `Error: ${error.message}`;
    }
    
    console.error('Error handling query:', error);
    new Notice('An unexpected error occurred');
    return 'An error occurred while processing your request. Please try again.';
  }
}

export async function summarizeNotes(
  plugin: AIChatPlugin,
  notes: string[]
): Promise<string[]> {
  if (!notes.length) return [];

  try {
    const summaries = await Promise.all(
      notes.map(note => summarizeText(plugin, note))
    );
    return summaries.filter(Boolean);
  } catch (error) {
    console.error('Error summarizing notes:', error);
    return notes.slice(0, 3); // Fallback to first 3 notes if summarization fails
  }
}

export async function summarizeText(
  plugin: AIChatPlugin,
  text: string
): Promise<string> {
  if (!text.trim()) return '';

  try {
    const response = await queryOpenAI(
      plugin,
      'Please provide a concise summary of the following text:',
      text
    );
    return response.content;
  } catch (error) {
    console.error('Error summarizing text:', error);
    // Fallback to simple summarization
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    return sentences.slice(0, 2).join('. ') + '.';
  }
}

export async function generateCompletion(
  plugin: AIChatPlugin,
  prompt: string,
  options: Partial<{
    temperature: number;
    maxTokens: number;
    topP: number;
  }> = {}
): Promise<string> {
  try {
    const response = await queryOpenAI(plugin, '', prompt);
    return response.content;
  } catch (error) {
    console.error('Error generating completion:', error);
    throw error;
  }
}
