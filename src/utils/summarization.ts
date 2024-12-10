import type { AIChatPluginInterface, SummarizeOptions } from '@/types';

export class SummarizationService {
  private plugin: AIChatPluginInterface;

  constructor(plugin: AIChatPluginInterface) {
    this.plugin = plugin;
  }

  async summarizeText(text: string, options: SummarizeOptions): Promise<string> {
    // Implement text summarization using the plugin's AI model
    const prompt = `Please summarize the following text in ${options.maxLength} words or less:\n\n${text}`;
    // This would typically call the AI service through the plugin
    return text.slice(0, options.maxLength); // Temporary implementation
  }

  async summarizeNotes(notes: string[]): Promise<string[]> {
    return await Promise.all(
      notes.map(note => this.summarizeText(note, {
        maxLength: this.plugin.settings.maxContextSize
      }))
    );
  }
}
