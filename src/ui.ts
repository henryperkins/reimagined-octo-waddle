import { ItemView, WorkspaceLeaf, ButtonComponent, TextComponent, TextAreaComponent, Setting, debounce } from 'obsidian';
import AIChatPlugin from './main';

export const VIEW_TYPE_AI_CHAT = 'AI_CHAT_VIEW';

export class AIChatView extends ItemView {
	plugin: AIChatPlugin;
	chatHistory: string[] = [];
	maxHistorySize: number = 100;

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
		// Clean up any event listeners if necessary
	}

	async render() {
		const container = this.containerEl.children[1];
		container.empty();

		const header = container.createEl('h1', { text: 'AI Chat Interface' });

		const chatBox = container.createEl('div', { cls: 'chat-box' });
		chatBox.style.overflowY = 'scroll';
		chatBox.style.maxHeight = '400px';

		const inputSetting = new Setting(container);
		const inputBox = new TextAreaComponent(inputSetting.controlEl);
		inputBox.setPlaceholder('Type your message here...');
		inputBox.inputEl.style.width = '100%';

		const sendButton = new ButtonComponent(inputSetting.controlEl);
		sendButton.setButtonText('Send');

		// Apply debouncing to prevent rapid API calls
		sendButton.onClick(debounce(async () => {
			const query = inputBox.getValue();
			if (query.trim() === '') return;

			this.displayLoadingIndicator(container, true);
			const response = await this.plugin.handleUserQuery(query);
			this.displayLoadingIndicator(container, false);

			this.chatHistory.push(`User: ${query} [${new Date().toLocaleTimeString()}]`);
			this.chatHistory.push(`AI: ${response} [${new Date().toLocaleTimeString()}]`);
			this.limitChatHistorySize();

			this.updateChatHistory(chatBox);
			inputBox.setValue('');
		}, 500));

		inputBox.inputEl.addEventListener('keydown', async (event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				sendButton.click();
			}
		});

		this.createSettingsBox(container);

		this.updateChatHistory(chatBox);
	}

	createSettingsBox(container: HTMLElement) {
		const settingsBox = container.createEl('div', { cls: 'settings-box' });

		// Temperature Setting
		new Setting(settingsBox)
			.setName('Temperature')
			.addSlider(slider => {
				slider.setLimits(0, 1, 0.01)
					.setValue(this.plugin.settings.temperature)
					.onChange(async (value) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveSettings();
					});
			});

		// Max Tokens Setting
		new Setting(settingsBox)
			.setName('Max Tokens')
			.addText(text => {
				text.setPlaceholder('Max Tokens')
					.setValue(this.plugin.settings.maxTokens.toString())
					.onChange(async (value) => {
						this.plugin.settings.maxTokens = parseInt(value);
						await this.plugin.saveSettings();
					});
			});

		// Top-P Setting
		new Setting(settingsBox)
			.setName('Top-P')
			.addSlider(slider => {
				slider.setLimits(0, 1, 0.01)
					.setValue(this.plugin.settings.topP)
					.onChange(async (value) => {
						this.plugin.settings.topP = value;
						await this.plugin.saveSettings();
					});
			});

		// Buttons for Chat History Management
		const buttonSetting = new Setting(settingsBox);
		buttonSetting.infoEl.remove();

		// Save Chat History Button
		new ButtonComponent(buttonSetting.controlEl)
			.setButtonText('Save Chat History')
			.onClick(async () => {
				if (this.plugin.settings.enableChatHistory) {
					await this.plugin.saveChatHistory(this.chatHistory);
				}
				if (this.plugin.settings.exportChatHistory) {
					await this.exportChatHistory();
				}
			});

		// Load Chat History Button
		new ButtonComponent(buttonSetting.controlEl)
			.setButtonText('Load Chat History')
			.onClick(async () => {
				if (this.plugin.settings.enableChatHistory) {
					this.chatHistory = await this.plugin.loadChatHistory();
					this.updateChatHistory(this.containerEl.querySelector('.chat-box'));
				}
			});

		// Clear Chat History Button
		new ButtonComponent(buttonSetting.controlEl)
			.setButtonText('Clear Chat History')
			.onClick(async () => {
				if (this.plugin.settings.enableChatHistory) {
					await this.plugin.clearChatHistory();
					this.chatHistory = [];
					this.updateChatHistory(this.containerEl.querySelector('.chat-box'));
				}
				if (this.plugin.settings.exportChatHistory) {
					await this.exportChatHistory();
				}
			});
	}

	displayLoadingIndicator(container: HTMLElement, show: boolean) {
		let loadingIndicator = container.querySelector('.loading-indicator') as HTMLElement;
		if (!loadingIndicator) {
			loadingIndicator = container.createEl('div', { text: 'Loading...', cls: 'loading-indicator' });
		}
		loadingIndicator.style.display = show ? 'block' : 'none';
	}

	limitChatHistorySize() {
		if (this.chatHistory.length > this.maxHistorySize) {
			this.chatHistory = this.chatHistory.slice(this.chatHistory.length - this.maxHistorySize);
		}
	}

	updateChatHistory(chatBox: HTMLElement) {
		chatBox.empty();
		this.chatHistory.forEach(message => {
			this.renderMessage(chatBox, message);
		});
	}

	renderMessage(chatBox: HTMLElement, message: string) {
		const messageEl = chatBox.createEl('div', { cls: 'chat-message' });
		messageEl.setText(message);

		const deleteButton = new ButtonComponent(messageEl);
		deleteButton.setButtonText('Delete').onClick(async () => {
			await this.plugin.deleteMessageFromHistory(message);
			this.chatHistory = this.chatHistory.filter(msg => msg !== message);
			this.updateChatHistory(chatBox);
		});

		const editButton = new ButtonComponent(messageEl);
		editButton.setButtonText('Edit').onClick(() => {
			const newMessage = prompt('Edit your message:', message);
			if (newMessage !== null) {
				this.chatHistory = this.chatHistory.map(msg => msg === message ? newMessage : msg);
				this.updateChatHistory(chatBox);
			}
		});

		if (message.startsWith('User:')) {
			messageEl.style.color = 'blue';
		} else if (message.startsWith('AI:')) {
			messageEl.style.color = 'green';
		}
	}

	async exportChatHistory() {
		const baseFileName = 'chat-history-export.md';
		let fileName = baseFileName;
		let counter = 1;

		while (this.plugin.app.vault.getAbstractFileByPath(fileName)) {
			fileName = `chat-history-export-${counter}.md`;
			counter++;
		}

		const filePath = normalizePath(fileName);
		await this.plugin.app.vault.create(filePath, this.chatHistory.join('\n'));
	}
}
