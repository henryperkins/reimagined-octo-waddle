import { ItemView, WorkspaceLeaf } from 'obsidian';
import AIChatPlugin from './main';

export const VIEW_TYPE_AI_CHAT = 'AI_CHAT_VIEW';

export class AIChatView extends ItemView {
	plugin: AIChatPlugin;
	chatHistory: string[] = [];

	constructor(leaf: WorkspaceLeaf, plugin: AIChatPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_AI_CHAT;
	}

	getDisplayText(): string {
		return 'AI Chat';
	}

	async onOpen() {
		this.render();
	}

	async onClose() {
		// Nothing to clean up
	}

	async render() {
		const container = this.containerEl.children[1];
		container.empty();

		const chatBox = container.createEl('div', { cls: 'chat-box' });
		const inputBox = container.createEl('textarea', { cls: 'chat-input' });
		const sendButton = container.createEl('button', { text: 'Send', cls: 'chat-send-button' });

		const settingsBox = container.createEl('div', { cls: 'settings-box' });

		const temperatureLabel = settingsBox.createEl('label', { text: 'Temperature: ' });
		const temperatureInput = settingsBox.createEl('input', { type: 'number', min: '0', max: '1', step: '0.01', value: this.plugin.settings.temperature.toString() });
		temperatureInput.addEventListener('change', async () => {
			this.plugin.settings.temperature = parseFloat(temperatureInput.value);
			await this.plugin.saveSettings();
		});

		const maxTokensLabel = settingsBox.createEl('label', { text: 'Max Tokens: ' });
		const maxTokensInput = settingsBox.createEl('input', { type: 'number', min: '1', value: this.plugin.settings.maxTokens.toString() });
		maxTokensInput.addEventListener('change', async () => {
			this.plugin.settings.maxTokens = parseInt(maxTokensInput.value);
			await this.plugin.saveSettings();
		});

		const topPLabel = settingsBox.createEl('label', { text: 'Top-P: ' });
		const topPInput = settingsBox.createEl('input', { type: 'number', min: '0', max: '1', step: '0.01', value: this.plugin.settings.topP.toString() });
		topPInput.addEventListener('change', async () => {
			this.plugin.settings.topP = parseFloat(topPInput.value);
			await this.plugin.saveSettings();
		});

		const saveButton = container.createEl('button', { text: 'Save Chat History', cls: 'chat-save-button' });
		const loadButton = container.createEl('button', { text: 'Load Chat History', cls: 'chat-load-button' });
		const searchInput = container.createEl('input', { type: 'text', placeholder: 'Search Chat History', cls: 'chat-search-input' });
		const searchButton = container.createEl('button', { text: 'Search', cls: 'chat-search-button' });
		const clearButton = container.createEl('button', { text: 'Clear Chat History', cls: 'chat-clear-button' });

		saveButton.addEventListener('click', async () => {
			if (this.plugin.settings.enableChatHistory) {
				await this.plugin.saveChatHistory(this.chatHistory);
			}
		});

		loadButton.addEventListener('click', async () => {
			if (this.plugin.settings.enableChatHistory) {
				this.chatHistory = await this.plugin.loadChatHistory();
				this.updateChatHistory(chatBox);
			}
		});

		searchButton.addEventListener('click', async () => {
			if (this.plugin.settings.enableChatHistory) {
				const query = searchInput.value;
				if (query.trim() === '') return;

				const searchResults = await this.plugin.searchChatHistory(query);
				this.displaySearchResults(chatBox, searchResults);
			}
		});

		clearButton.addEventListener('click', async () => {
			if (this.plugin.settings.enableChatHistory) {
				await this.plugin.clearChatHistory();
				this.chatHistory = [];
				this.updateChatHistory(chatBox);
			}
		});
		sendButton.addEventListener('click', async () => {
			const query = inputBox.value;
			if (query.trim() === '') return;

			const response = await this.plugin.handleUserQuery(query);
			this.displayResponse(chatBox, response);
			this.chatHistory.push(`User: ${query}`);
			this.chatHistory.push(`AI: ${response}`);
			this.updateChatHistory(chatBox);
			inputBox.value = '';
		});

		this.updateChatHistory(chatBox);
	}

	displayResponse(chatBox: HTMLElement, response: string) {
		const responseEl = chatBox.createEl('div', { cls: 'chat-response' });
		responseEl.setText(response);
	}

	updateChatHistory(chatBox: HTMLElement) {
		chatBox.empty();
		this.chatHistory.forEach(message => {
			const messageEl = chatBox.createEl('div', { cls: 'chat-message' });
			messageEl.setText(message);

			const deleteButton = messageEl.createEl('button', { text: 'Delete', cls: 'chat-delete-button' });
			deleteButton.addEventListener('click', async () => {
				await this.plugin.deleteMessageFromHistory(message);
				this.chatHistory = this.chatHistory.filter(msg => msg !== message);
				this.updateChatHistory(chatBox);
			});
		});
	}

	displaySearchResults(chatBox: HTMLElement, searchResults: string[]) {
		chatBox.empty();
		searchResults.forEach(result => {
			const resultEl = chatBox.createEl('div', { cls: 'chat-search-result' });
			resultEl.setText(result);
		});
	}
}
