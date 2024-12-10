import { App, PluginSettingTab, Setting } from 'obsidian';
import type AIChatPlugin from '../main';
import { AIChatSettings } from '../types';

export const DEFAULT_SETTINGS: AIChatSettings = {
    apiKey: '',
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    supportedFileTypes: ['.txt', '.md', '.pdf', '.doc', '.docx'],
    maxFileSize: 10, // MB
    saveChatHistory: true
};

export class AIChatSettingsTab extends PluginSettingTab {
    plugin: AIChatPlugin;

    constructor(app: App, plugin: AIChatPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'AI Chat Settings' });

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Enter your API key')
            .addText(text => text
                .setPlaceholder('Enter API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Model')
            .setDesc('Select the AI model to use')
            .addDropdown(dropdown => dropdown
                .addOption('gpt-4', 'GPT-4')
                .addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo')
                .setValue(this.plugin.settings.modelName)
                .onChange(async (value) => {
                    this.plugin.settings.modelName = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Temperature')
            .setDesc('Controls randomness in responses (0-1)')
            .addSlider(slider => slider
                .setLimits(0, 1, 0.1)
                .setValue(this.plugin.settings.temperature)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.temperature = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Max Tokens')
            .setDesc('Maximum length of AI responses')
            .addText(text => text
                .setValue(String(this.plugin.settings.maxTokens))
                .onChange(async (value) => {
                    const tokens = parseInt(value);
                    if (!isNaN(tokens) && tokens > 0) {
                        this.plugin.settings.maxTokens = tokens;
                        await this.plugin.saveSettings();
                    }
                })
            );

        new Setting(containerEl)
            .setName('Save Chat History')
            .setDesc('Save conversations between sessions')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.saveChatHistory)
                .onChange(async (value) => {
                    this.plugin.settings.saveChatHistory = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Max File Size')
            .setDesc('Maximum file size in MB for uploads')
            .addText(text => text
                .setValue(String(this.plugin.settings.maxFileSize))
                .onChange(async (value) => {
                    const size = parseInt(value);
                    if (!isNaN(size) && size > 0) {
                        this.plugin.settings.maxFileSize = size;
                        await this.plugin.saveSettings();
                    }
                })
            );

        new Setting(containerEl)
            .setName('Supported File Types')
            .setDesc('Comma-separated list of supported file extensions (e.g., .txt,.md,.pdf)')
            .addText(text => text
                .setValue(this.plugin.settings.supportedFileTypes.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.supportedFileTypes = value
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean);
                    await this.plugin.saveSettings();
                })
            );
    }
}
