import { TFile } from 'obsidian';
import Fuse from 'fuse.js';
import { AIChatPlugin } from '../types';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export class SearchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

interface SearchResult {
  file: TFile;
  content: string;
  score: number;
  excerpt?: string;
}

interface SearchOptions {
  fuzzyThreshold?: number;
  maxResults?: number;
  includeExcerpts?: boolean;
  semanticSearch?: boolean;
}

export class SearchService {
  private model: any | null = null;

  constructor(private plugin: AIChatPlugin) {}

  async initialize(): Promise<void> {
    if (this.plugin.settings.useSemanticSearch) {
      try {
        await tf.ready();
        this.model = await use.load();
      } catch (error) {
        console.error('Failed to load Universal Sentence Encoder:', error);
        this.model = null;
      }
    }
  }

  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      fuzzyThreshold = 0.3,
      maxResults = 10,
      includeExcerpts = true,
      semanticSearch = false
    } = options;

    try {
      let results: SearchResult[];

      if (semanticSearch && this.model) {
        results = await this.semanticSearch(query, maxResults);
      } else {
        results = await this.fuzzySearch(query, fuzzyThreshold, maxResults);
      }

      if (includeExcerpts) {
        results = await this.addExcerpts(results, query);
      }

      return results;
    } catch (error) {
      throw new SearchError(
        'Search failed',
        'SEARCH_ERROR',
        error
      );
    }
  }

  private async fuzzySearch(
    query: string,
    threshold: number,
    limit: number
  ): Promise<SearchResult[]> {
    const files = this.plugin.app.vault.getMarkdownFiles();
    
    const fuseOptions = {
      keys: ['basename', 'content'],
      threshold,
      includeScore: true,
      limit
    };

    const fuse = new Fuse(files, fuseOptions);
    const searchResults = fuse.search(query);

    return searchResults.map(result => ({
      file: result.item,
      content: result.item.basename,
      score: result.score || 0
    }));
  }

  private async semanticSearch(
    query: string,
    limit: number
  ): Promise<SearchResult[]> {
    const files = this.plugin.app.vault.getMarkdownFiles();
    const fileContents = await Promise.all(files.map(async (file) => ({
      file,
      content: await this.plugin.app.vault.read(file)
    })));

    const queryEmbedding = await this.model.embed([query]);
    const fileEmbeddings = await this.model.embed(fileContents.map(f => f.content));

    const scores = tf.tidy(() => {
      const queryTensor = tf.tensor(queryEmbedding);
      const fileTensor = tf.tensor(fileEmbeddings);
      return tf.dot(queryTensor, fileTensor.transpose()).dataSync();
    });

    const sortedIndices = Array.from(scores)
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.index);

    return sortedIndices.map(index => ({
      file: fileContents[index].file,
      content: fileContents[index].content,
      score: scores[index]
    }));
  }

  private async addExcerpts(results: SearchResult[], query: string): Promise<SearchResult[]> {
    return Promise.all(results.map(async (result) => {
      const content = await this.plugin.app.vault.read(result.file);
      const fuse = new Fuse([{ content }], { keys: ['content'], threshold: 0.3, includeMatches: true });
      const searchResult = fuse.search(query)[0];
      if (searchResult && searchResult.matches) {
        const match = searchResult.matches[0];
        const start = Math.max(0, match.indices[0][0] - 50);
        const end = Math.min(content.length, match.indices[0][1] + 50);
        result.excerpt = content.slice(start, end);
      }
      return result;
    }));
  }
}

