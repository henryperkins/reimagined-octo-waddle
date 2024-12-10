import type AIChatPlugin from '../main';
import type { SearchResult, SearchOptions } from '../types';

export class SearchService {
    private plugin: AIChatPlugin;

    constructor(plugin: AIChatPlugin) {
        this.plugin = plugin;
    }

    async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
        const {
            caseSensitive = false,
            includeFiles = true,
            includeConversations = true,
            maxResults = 10
        } = options;

        const results: SearchResult[] = [];

        // Prepare search query
        const searchRegex = new RegExp(
            this.escapeRegExp(query),
            caseSensitive ? 'g' : 'gi'
        );

        // Search conversations
        if (includeConversations) {
            const conversationResults = this.searchConversations(searchRegex);
            results.push(...conversationResults);
        }

        // Search files
        if (includeFiles) {
            const fileResults = await this.searchFiles(searchRegex);
            results.push(...fileResults);
        }

        // Sort by score and limit results
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    private searchConversations(regex: RegExp): SearchResult[] {
        const results: SearchResult[] = [];

        Object.values(this.plugin.conversations).forEach(conversation => {
            conversation.messages.forEach(message => {
                const matches = [...message.content.matchAll(regex)];
                if (matches.length > 0) {
                    results.push({
                        type: 'message',
                        content: this.getMessageExcerpt(message.content, matches[0].index || 0),
                        score: this.calculateScore(matches, message.content),
                        source: {
                            id: conversation.id,
                            title: conversation.title,
                            timestamp: message.timestamp
                        }
                    });
                }
            });
        });

        return results;
    }

    private async searchFiles(regex: RegExp): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        const files = this.plugin.app.vault.getMarkdownFiles();

        for (const file of files) {
            try {
                const content = await this.plugin.app.vault.read(file);
                const matches = [...content.matchAll(regex)];
                
                if (matches.length > 0) {
                    results.push({
                        type: 'file',
                        content: this.getFileExcerpt(content, matches[0].index || 0),
                        score: this.calculateScore(matches, content),
                        source: {
                            path: file.path,
                            title: file.basename
                        }
                    });
                }
            } catch (error) {
                console.error(`Error searching file ${file.path}:`, error);
            }
        }

        return results;
    }

    private getMessageExcerpt(content: string, matchIndex: number, contextLength: number = 100): string {
        const start = Math.max(0, matchIndex - contextLength);
        const end = Math.min(content.length, matchIndex + contextLength);
        let excerpt = content.slice(start, end);
        
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';
        
        return excerpt;
    }

    private getFileExcerpt(content: string, matchIndex: number, contextLength: number = 100): string {
        return this.getMessageExcerpt(content, matchIndex, contextLength);
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private calculateScore(matches: RegExpMatchArray[], content: string): number {
        const baseScore = matches.length;
        const density = matches.length / content.length;
        return baseScore * (1 + density);
    }
}
