import { App, PluginSettingTab, Setting } from 'obsidian';
import type { AIChatPluginInterface, AIChatSettings } from '@/types';

export const DEFAULT_SETTINGS: AIChatSettings = {
  apiKey: '',
  modelName: 'gpt-4',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9
  },
  chatFontSize: '14px',
  chatColorScheme: 'light',
  chatLayout: 'vertical',
  enableChatHistory: true,
  defaultPrompt: '',
  contextWindowSize: 4096,
  saveChatHistory: true,
  loadChatHistory: true,
  searchChatHistory: true,
  deleteMessageFromHistory: true,
  clearChatHistory: true,
  exportChatHistory: true,
  fileUploadLimit: 10,
  supportedFileTypes: ['.txt', '.md', '.pdf', '.jpg', '.png', '.py', '.js'],
  contextIntegrationMethod: 'summary',
  maxContextSize: 4096,
  useSemanticSearch: false,
  theme: 'light'
};

export class AIChatSettingsTab extends PluginSettingTab {
  plugin: AIChatPluginInterface;

  constructor(app: App, plugin: AIChatPluginInterface) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'AI Chat Settings' });

    // API Settings
    this.addApiSettings(containerEl);

    // Model Settings
    this.addModelSettings(containerEl);

    // Chat Interface Settings
    this.addChatInterfaceSettings(containerEl);

    // History Settings
    this.addHistorySettings(containerEl);

    // File Upload Settings
    this.addFileUploadSettings(containerEl);

    // Context Settings
    this.addContextSettings(containerEl);
  }

  private addApiSettings(containerEl: HTMLElement) {
    containerEl.createEl('h3', { text: 'API Configuration' });

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Enter your Azure OpenAI API key')
      .addText(text => text
        .setPlaceholder('Enter API key')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Model Name')
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
  }

  private addModelSettings(containerEl: HTMLElement) {
    containerEl.createEl('h3', { text: 'Model Parameters' });

    new Setting(containerEl)
      .setName('Temperature')
      .setDesc('Controls randomness in responses (0-1)')
      .addSlider(slider => slider
        .setLimits(0, 1, 0.1)
        .setValue(this.plugin.settings.modelParameters.temperature)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.modelParameters.temperature = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Max Tokens')
      .setDesc('Maximum length of AI responses')
      .addText(text => text
        .setValue(String(this.plugin.settings.modelParameters.maxTokens))
        .onChange(async (value) => {
          const tokens = parseInt(value);
          if (!isNaN(tokens) && tokens > 0) {
            this.plugin.settings.modelParameters.maxTokens = tokens;
            await this.plugin.saveSettings();
          }
        })
      );

    new Setting(containerEl)
      .setName('Top-P')
      .setDesc('Controls diversity of responses (0-1)')
      .addSlider(slider => slider
        .setLimits(0, 1, 0.1)
        .setValue(this.plugin.settings.modelParameters.topP)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.modelParameters.topP = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private addChatInterfaceSettings(containerEl: HTMLElement) {
    containerEl.createEl('h3', { text: 'Chat Interface' });

    new Setting(containerEl)
      .setName('Font Size')
      .setDesc('Chat interface font size')
      .addDropdown(dropdown => dropdown
        .addOption('12px', 'Small')
        .addOption('14px', 'Medium')
        .addOption('16px', 'Large')
        .setValue(this.plugin.settings.chatFontSize)
        .onChange(async (value) => {
          this.plugin.settings.chatFontSize = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Color Scheme')
      .setDesc('Chat interface color scheme')
      .addDropdown(dropdown => dropdown
        .addOption('light', 'Light')
        .addOption('dark', 'Dark')
        .setValue(this.plugin.settings.chatColorScheme)
        .onChange(async (value) => {
          this.plugin.settings.chatColorScheme = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Layout')
      .setDesc('Chat interface layout')
      .addDropdown(dropdown => dropdown
        .addOption('vertical', 'Vertical')
        .addOption('horizontal', 'Horizontal')
        .setValue(this.plugin.settings.chatLayout)
        .onChange(async (value) => {
          this.plugin.settings.chatLayout = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private addHistorySettings(containerEl: HTMLElement) {
    containerEl.createEl('h3', { text: 'History Management' });

    new Setting(containerEl)
      .setName('Enable Chat History')
      .setDesc('Save chat history between sessions')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableChatHistory)
        .onChange(async (value) => {
          this.plugin.settings.enableChatHistory = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Auto-save History')
      .setDesc('Automatically save chat history')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.saveChatHistory)
        .onChange(async (value) => {
          this.plugin.settings.saveChatHistory = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Load History')
      .setDesc('Load chat history on startup')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.loadChatHistory)
        .onChange(async (value) => {
          this.plugin.settings.loadChatHistory = value;
          await this.plugin.saveSettings();
        })
      );
  }

  private addFileUploadSettings(containerEl: HTMLElement) {
    containerEl.createEl('h3', { text: 'File Upload' });

    new Setting(containerEl)
      .setName('File Upload Limit')
      .setDesc('Maximum file size in MB')
      .addText(text => text
        .setValue(String(this.plugin.settings.fileUploadLimit))
        .onChange(async (value) => {
          const limit = parseInt(value);
          if (!isNaN(limit) && limit > 0) {
            this.plugin.settings.fileUploadLimit = limit;
            await this.plugin.saveSettings();
          }
        })
      );

    new Setting(containerEl)
      .setName('Supported File Types')
      .setDesc('Comma-separated list of file extensions')
      .addText(text => text
        .setValue(this.plugin.settings.supportedFileTypes.join(', '))
        .onChange(async (value) => {
          this.plugin.settings.supportedFileTypes = value.split(',')
            .map(type => type.trim())
            .filter(type => type.startsWith('.'));
          await this.plugin.saveSettings();
        })
      );
  }

  private addContextSettings(containerEl: HTMLElement) {
    containerEl.createEl('h3', { text: 'Context and Search' });

    new Setting(containerEl)
      .setName('Context Integration')
      .setDesc('How to integrate file content into context')
      .addDropdown(dropdown => dropdown
        .addOption('full', 'Full Content')
        .addOption('summary', 'Summary')
        .setValue(this.plugin.settings.contextIntegrationMethod)
        .onChange(async (value: string) => {
          this.plugin.settings.contextIntegrationMethod = value as 'full' | 'summary';
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Max Context Size')
      .setDesc('Maximum number of tokens for context')
      .addText(text => text
        .setValue(String(this.plugin.settings.maxContextSize))
        .onChange(async (value) => {
          const size = parseInt(value);
          if (!isNaN(size) && size > 0) {
            this.plugin.settings.maxContextSize = size;
            await this.plugin.saveSettings();
          }
        })
      );

    new Setting(containerEl)
      .setName('Use Semantic Search')
      .setDesc('Enable semantic search for context retrieval')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useSemanticSearch)
        .onChange(async (value) => {
          this.plugin.settings.useSemanticSearch = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
