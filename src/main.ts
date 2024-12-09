import { Plugin, App, ItemView, WorkspaceLeaf, TFile, normalizePath } from 'obsidian';
import axios from 'axios';
import { AIChatSettingsTab, AIChatSettings, DEFAULT_SETTINGS } from './settings';
import { AIChatView } from './ui';

const AZURE_OPENAI_ENDPOINT = 'https://openai-hp.openai.azure.com/openai/deployments/o1-preview/chat/completions?api-version=2024-08-01-preview';
const SYSTEM_PROMPT = 'You are an AI assistant designed to help users understand and analyze their notes in Obsidian. Answer the user\'s questions based on the provided notes from their vault. Be concise and informative.';

export default class AIChatPlugin extends Plugin {
	settings: AIChatSettings;

	async onload() {
		console.log('Loading AI Chat Plugin');
		await this.loadSettings();

		this.addSettingTab(new AIChatSettingsTab(this.app, this));

		this.registerView(
			'AI_CHAT_VIEW',
			(leaf: WorkspaceLeaf) => new AIChatView(leaf, this)
		);

		this.addRibbonIcon('message-square', 'AI Chat', () => {
			this.activateView();
		});
	}

	async onunload() {
		console.log('Unloading AI Chat Plugin');
		this.app.workspace.detachLeavesOfType('AI_CHAT_VIEW');
	}

	async loadSettings() {
		const loadedSettings = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	sanitizeInput(input: string): string {
		const div = document.createElement('div');
		div.textContent = input;
		return div.innerHTML;
	}

	async handleUserQuery(query: string) {
		query = this.sanitizeInput(query);
		try {
			const notes = await this.retrieveRelevantNotes(query);
			let context = notes.join('\n');

			if (!context || context.trim() === '') {
				context = 'No relevant notes found.';
			}

			const response = await this.queryOpenAI(context, query);
			return response;
		} catch (error) {
			console.error('Error handling user query:', error);
			return 'An error occurred while processing your request. Please try again.';
		}
	}

	async retrieveRelevantNotes(query: string): Promise<string[]> {
		const files = this.app.vault.getMarkdownFiles();
		const searchResults: { file: TFile, content: string, score: number }[] = [];

		const currentFile = this.app.workspace.getActiveFile();
		if (currentFile) {
			const currentContent = await this.app.vault.read(currentFile);
			searchResults.push({ file: currentFile, content: currentContent, score: 1.0 });
		}

		for (const file of files) {
			if (file === currentFile) continue;

			const content = await this.app.vault.read(file);
			const titleScore = file.basename.includes(query) ? 0.5 : 0;
			const tagScore = this.getTagScore(file, query);
			const contentScore = content.includes(query) ? 0.3 : 0;
			const keywordFrequency = (content.match(new RegExp(query, 'gi')) || []).length;
			const totalScore = titleScore + tagScore + contentScore + (keywordFrequency * 0.1);

			if (totalScore > 0) {
				searchResults.push({ file, content, score: totalScore });
			}
		}

		searchResults.sort((a, b) => b.score - a.score);

		return searchResults.map(result => result.content);
	}

	getTagScore(file: TFile, query: string): number {
		const tags = this.app.metadataCache.getFileCache(file)?.tags || [];
		return tags.some(tag => tag.tag.includes(query)) ? 0.2 : 0;
	}

	async queryOpenAI(context: string, query: string): Promise<string> {
		const apiKey = this.settings.apiKey.trim();
		if (!apiKey) {
			return 'Error: API Key is not set. Please enter your API Key in the plugin settings.';
		}
		const modelName = this.settings.modelName || 'gpt-4';
		const temperature = this.settings.temperature;
		const maxTokens = this.settings.maxTokens;
		const topP = this.settings.topP;

		if (!context || context.trim() === '') {
			context = 'No relevant notes found.';
		}

		const combinedSystemPrompt = `${SYSTEM_PROMPT}\n\nUser's Notes:\n${context}`;

		try {
			const response = await axios.post(
				AZURE_OPENAI_ENDPOINT,
				{
					model: modelName,
					messages: [
						{ role: 'system', content: combinedSystemPrompt },
						{ role: 'user', content: query }
					],
					temperature: temperature,
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

			return response.data.choices[0].message.content;
		} catch (error) {
			console.error('Error querying OpenAI:', error);

			if (axios.isAxiosError(error)) {
				const errorMessage = error.response?.data?.error?.message || error.message;
				return `Error querying OpenAI API: ${errorMessage}`;
			}

			return 'An unexpected error occurred while processing your request. Please try again.';
		}
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType('AI_CHAT_VIEW');

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: 'AI_CHAT_VIEW',
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType('AI_CHAT_VIEW')[0]
		);
	}

	// Methods to save, load, and search chat histories
	async saveChatHistory(chatHistory: string[]) {
		const filePath = normalizePath('chat-history.md');
		let file = this.app.vault.getAbstractFileByPath(filePath);
		if (file instanceof TFile) {
			await this.app.vault.modify(file, chatHistory.join('\n'));
		} else {
			file = await this.app.vault.create(filePath, chatHistory.join('\n'));
		}
		return file;
	}

	async loadChatHistory(): Promise<string[]> {
		const filePath = normalizePath('chat-history.md');
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (file instanceof TFile) {
			const content = await this.app.vault.read(file);
			return content.split('\n');
		}
		return [];
	}

	async searchChatHistory(query: string): Promise<string[]> {
		const chatHistory = await this.loadChatHistory();
		return chatHistory.filter(message => message.includes(query));
	}

	// Methods to delete individual messages or clear the entire chat history
	async deleteMessageFromHistory(message: string) {
		if (!message || message.trim().length === 0) {
			return;
		}
		try {
			let chatHistory = await this.loadChatHistory();
			chatHistory = chatHistory.filter(msg => msg !== message);
			await this.saveChatHistory(chatHistory);
		} catch (error) {
			console.error('Failed to delete message from history:', error);
			throw new Error('Failed to delete message from history');
		}
	}

	async clearChatHistory() {
		try {
			const filePath = normalizePath('chat-history.md');
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file instanceof TFile) {
				// Create backup before clearing
				const backup = await this.app.vault.read(file);
				const backupPath = normalizePath('chat-history.backup.md');
				await this.app.vault.create(backupPath, backup);
				await this.app.vault.modify(file, '');
			}
		} catch (error) {
			console.error('Failed to clear chat history:', error);
			throw new Error('Failed to clear chat history');
		}
	}

	// Method to preprocess text data from notes before sending it to the AI model
	preprocessTextData(text: string): string {
		// Implement any necessary preprocessing steps here
		// For example, removing special characters, normalizing whitespace, etc.
		return text.replace(/[\r\n]+/g, ' ').trim();
	}
}
