import { App, PluginSettingTab, Setting } from 'obsidian';

export interface AIChatSettings {
	apiKey: string;
	modelName: string;
}

export const DEFAULT_SETTINGS: AIChatSettings = {
	apiKey: '',
	modelName: 'gpt-4o'
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
	}
}
