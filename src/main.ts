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
		const loadedSettings = Object.assign({}, await this.loadData());
		this.settings = {
			...loadedSettings,
			apiKey: this.decryptAPIKey(loadedSettings.apiKey)
		};
	}

	async saveSettings() {
		const settingsToSave = {
			...this.settings,
			apiKey: this.encryptAPIKey(this.settings.apiKey)
		};
		await this.saveData(settingsToSave);
	}

	encryptAPIKey(apiKey: string): string {
		// Use Obsidian's built-in encryption method
		return btoa(apiKey); // Placeholder for actual encryption method
	}

	decryptAPIKey(encryptedKey: string): string {
		// Use Obsidian's built-in decryption method
		return atob(encryptedKey); // Placeholder for actual decryption method
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
		const searchResults: string[] = [];

		for (const file of files) {
			const content = await this.app.vault.read(file);
			if (content.includes(query)) {
				searchResults.push(content);
			}
		}

		return searchResults;
	}

	async queryOpenAI(context: string, query: string): Promise<string> {
		const apiKey = this.decryptAPIKey(this.settings.apiKey);
		const modelName = this.settings.modelName || 'gpt-4o';

		const response = await axios.post(
			AZURE_OPENAI_ENDPOINT,
			{
				model: modelName,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{ role: 'user', content: query },
					{ role: 'assistant', content: context }
				]
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
}
