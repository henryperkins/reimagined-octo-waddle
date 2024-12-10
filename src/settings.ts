import { App, PluginSettingTab, Setting } from 'obsidian';

export interface AIChatSettings {
	apiKey: string;
	modelName: string;
	temperature: number;
	maxTokens: number;
	topP: number;
	chatFontSize: string;
	chatColorScheme: string;
	chatLayout: string;
	enableChatHistory: boolean;
	defaultPrompt: string;
	contextWindowSize: number;
	saveChatHistory: boolean;
	loadChatHistory: boolean;
	searchChatHistory: boolean;
	deleteMessageFromHistory: boolean;
	clearChatHistory: boolean;
	exportChatHistory: boolean; // Added for exporting chat history
	customTheme: string; // Added for customizable themes
}

export const DEFAULT_SETTINGS: AIChatSettings = {
	apiKey: '',
	modelName: 'gpt-4',
	temperature: 0.7,
	maxTokens: 100,
	topP: 0.9,
	chatFontSize: '14px',
	chatColorScheme: 'light',
	chatLayout: 'vertical',
	enableChatHistory: true,
	defaultPrompt: '',
	contextWindowSize: 2048,
	saveChatHistory: true,
	loadChatHistory: true,
	searchChatHistory: true,
	deleteMessageFromHistory: true,
	clearChatHistory: true,
	exportChatHistory: true, // Added for exporting chat history
	customTheme: 'default' // Added for customizable themes
}

export class AIChatSettingsTab extends PluginSettingTab {
	plugin: any;

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
		hello();
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'AI Chat Plugin Settings' });

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Enter your Azure OpenAI API key')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model Name')
			.setDesc('Enter the model name (default: gpt-4)')
			.addText(text => text
				.setPlaceholder('Enter the model name')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					if (value.trim() === '') {
						text.setValue(this.plugin.settings.modelName);
						return;
					}
					this.plugin.settings.modelName = value;
					await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Set the temperature for the AI model (0 to 1)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.01)
				.setValue(this.plugin.settings.temperature)
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc('Set the maximum number of tokens for the AI response')
			.addText(text => text
				.setPlaceholder('Enter max tokens')
				.setValue(this.plugin.settings.maxTokens.toString())
				.onChange(async (value) => {
					const intValue = parseInt(value);
					if (Number.isNaN(intValue) || intValue <= 0 || intValue > 4000) {
						// Reset to default if invalid
						text.setValue(this.plugin.settings.maxTokens.toString());
						return;
					}
					this.plugin.settings.maxTokens = intValue;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Top-P')
			.setDesc('Set the top-p value for the AI model (0 to 1)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.01)
				.setValue(this.plugin.settings.topP)
				.onChange(async (value) => {
					this.plugin.settings.topP = value;
					await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Chat Font Size')
			.setDesc('Set the font size for the chat interface')
			.addText(text => text
				.setPlaceholder('Enter font size (e.g., 14px)')
				.setValue(this.plugin.settings.chatFontSize)
				.onChange(async (value) => {
					this.plugin.settings.chatFontSize = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Chat Color Scheme')
			.setDesc('Set the color scheme for the chat interface')
			.addDropdown(dropdown => dropdown
				.addOption('light', 'Light')
				.addOption('dark', 'Dark')
				.setValue(this.plugin.settings.chatColorScheme)
				.onChange(async (value) => {
					this.plugin.settings.chatColorScheme = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Chat Layout')
			.setDesc('Set the layout for the chat interface')
			.addDropdown(dropdown => dropdown
				.addOption('vertical', 'Vertical')
				.addOption('horizontal', 'Horizontal')
				.setValue(this.plugin.settings.chatLayout)
				.onChange(async (value) => {
					this.plugin.settings.chatLayout = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable Chat History')
			.setDesc('Enable or disable chat history')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableChatHistory)
				.onChange(async (value) => {
					this.plugin.settings.enableChatHistory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Prompt')
			.setDesc('Set the default prompt for the chat interface')
			.addText(text => text
				.setPlaceholder('Enter default prompt')
				.setValue(this.plugin.settings.defaultPrompt)
				.onChange(async (value) => {
					this.plugin.settings.defaultPrompt = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Context Window Size')
			.setDesc('Set the context window size for the AI model')
			.addText(text => text
				.setPlaceholder('Enter context window size')
				.setValue(this.plugin.settings.contextWindowSize.toString())
				.onChange(async (value) => {
					const intValue = parseInt(value);
					if (Number.isNaN(intValue) || intValue <= 0) {
						// Reset to default if invalid
						text.setValue(this.plugin.settings.contextWindowSize.toString());
						return;
					}
					this.plugin.settings.contextWindowSize = intValue;
					await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Save Chat History')
			.setDesc('Enable or disable saving chat history')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.saveChatHistory)
				.onChange(async (value) => {
					this.plugin.settings.saveChatHistory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Load Chat History')
			.setDesc('Enable or disable loading chat history')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.loadChatHistory)
				.onChange(async (value) => {
					this.plugin.settings.loadChatHistory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Search Chat History')
			.setDesc('Enable or disable searching chat history')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.searchChatHistory)
				.onChange(async (value) => {
					this.plugin.settings.searchChatHistory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Delete Message From History')
			.setDesc('Enable or disable deleting individual messages from chat history')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.deleteMessageFromHistory)
				.onChange(async (value) => {
					this.plugin.settings.deleteMessageFromHistory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Clear Chat History')
			.setDesc('Enable or disable clearing the entire chat history')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.clearChatHistory)
				.onChange(async (value) => {
					this.plugin.settings.clearChatHistory = value;
					await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Export Chat History')
			.setDesc('Enable or disable exporting chat history to a file')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.exportChatHistory)
				.onChange(async (value) => {
					this.plugin.settings.exportChatHistory = value;
					await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Custom Theme')
			.setDesc('Select a custom theme for the chat interface')
			.addDropdown(dropdown => dropdown
				.addOption('default', 'Default')
				.addOption('dark', 'Dark')
				.addOption('light', 'Light')
				.addOption('custom', 'Custom')
				.setValue(this.plugin.settings.customTheme)
				.onChange(async (value) => {
					this.plugin.settings.customTheme = value;
					await this.plugin.saveSettings();
				}));
	}
}
