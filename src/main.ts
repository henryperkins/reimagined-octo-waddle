import { Plugin, PluginSettingTab, Setting, App, ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import axios from 'axios';
import { AIChatSettingsTab, AIChatSettings } from './settings';
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
		this.settings = Object.assign({}, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async handleUserQuery(query: string) {
		try {
			const notes = await this.retrieveRelevantNotes(query);
			const context = notes.join('\n');
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
			const totalScore = titleScore + tagScore + contentScore;

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
		const apiKey = this.settings.apiKey;
		const modelName = this.settings.modelName || 'gpt-4o';
		const temperature = this.settings.temperature;
		const maxTokens = this.settings.maxTokens;
		const topP = this.settings.topP;

		const response = await axios.post(
			AZURE_OPENAI_ENDPOINT,
			{
				model: modelName,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{ role: 'user', content: query },
					{ role: 'assistant', content: context }
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
    const filePath = 'chat-history.md';
    let file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
        await this.app.vault.modify(file, chatHistory.join('\n'));
    } else {
        file = await this.app.vault.create(filePath, chatHistory.join('\n'));
    }
    return file;
}

	async loadChatHistory(): Promise<string[]> {
		const file = this.app.vault.getAbstractFileByPath('chat-history.md');
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
		let chatHistory = await this.loadChatHistory();
		chatHistory = chatHistory.filter(msg => msg !== message);
		await this.saveChatHistory(chatHistory);
	}

	async clearChatHistory() {
		await this.app.vault.modify(await this.app.vault.getAbstractFileByPath('chat-history.md') as TFile, '');
	}
}
