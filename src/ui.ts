import { ItemView, WorkspaceLeaf } from 'obsidian';
import AIChatPlugin from './main';

export const VIEW_TYPE_AI_CHAT = 'AI_CHAT_VIEW';

export class AIChatView extends ItemView {
	plugin: AIChatPlugin;

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

		sendButton.addEventListener('click', async () => {
			const query = inputBox.value;
			if (query.trim() === '') return;

			const response = await this.plugin.handleUserQuery(query);
			this.displayResponse(chatBox, response);
			inputBox.value = '';
		});
	}

	displayResponse(chatBox: HTMLElement, response: string) {
		const responseEl = chatBox.createEl('div', { cls: 'chat-response' });
		responseEl.setText(response);
	}
}
