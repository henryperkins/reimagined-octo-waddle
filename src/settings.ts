import { App, PluginSettingTab, Setting } from 'obsidian';

export interface AIChatSettings {
	apiKey: string;
	modelName: string;
	temperature: number;
	maxTokens: number;
	topP: number;
}

export const DEFAULT_SETTINGS: AIChatSettings = {
	apiKey: '',
	modelName: 'gpt-4o',
	temperature: 0.7,
	maxTokens: 100,
	topP: 0.9
}

export class AIChatSettingsTab extends PluginSettingTab {
	plugin: any;

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
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
			.setDesc('Enter the model name (default: gpt-4o)')
			.addText(text => text
				.setPlaceholder('Enter the model name')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
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
	}
}
