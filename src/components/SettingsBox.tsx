import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Notice } from 'obsidian';
import type { SettingsBoxProps, AIChatSettings } from '../types';

const DEFAULT_SETTINGS: AIChatSettings = {
  apiKey: '',
  modelName: 'gpt-4',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1
  },
  chatFontSize: '14px',
  chatColorScheme: 'light',
  chatLayout: 'default',
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
  supportedFileTypes: ['.txt', '.md', '.pdf', '.csv'],
  contextIntegrationMethod: 'full',
  maxContextSize: 4096,
  useSemanticSearch: true,
  theme: 'light'
};

const SettingsBox: React.FC<SettingsBoxProps> = ({ plugin, onSettingsChange }) => {
  const [settings, setSettings] = useState<AIChatSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await onSettingsChange(settings);
      new Notice('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      new Notice('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AIChatSettings>(
    key: K,
    value: AIChatSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Chat Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Configuration */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={settings.apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('apiKey', e.target.value)}
            placeholder="Enter your API key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelName">Model Name</Label>
          <Input
            id="modelName"
            value={settings.modelName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('modelName', e.target.value)}
            placeholder="gpt-4"
          />
        </div>

        {/* Model Parameters */}
        <div className="space-y-2">
          <Label>Temperature: {settings.modelParameters.temperature}</Label>
          <Slider
            value={[settings.modelParameters.temperature]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]: number[]) => updateSetting('modelParameters', {
              ...settings.modelParameters,
              temperature: value
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={settings.modelParameters.maxTokens}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('modelParameters', {
              ...settings.modelParameters,
              maxTokens: Number(e.target.value)
            })}
            min={1}
            max={8192}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contextWindowSize">Context Window Size</Label>
          <Input
            id="contextWindowSize"
            type="number"
            value={settings.contextWindowSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('contextWindowSize', Number(e.target.value))}
            min={1}
            max={8192}
          />
        </div>

        {/* Features */}
        <div className="flex items-center justify-between">
          <Label htmlFor="enableChatHistory">Enable Chat History</Label>
          <Switch
            id="enableChatHistory"
            checked={settings.enableChatHistory}
            onCheckedChange={(checked: boolean) => updateSetting('enableChatHistory', checked)}
          />
        </div>

        {/* File Upload Settings */}
        <div className="space-y-2">
          <Label htmlFor="fileUploadLimit">File Upload Limit (MB)</Label>
          <Input
            id="fileUploadLimit"
            type="number"
            value={settings.fileUploadLimit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('fileUploadLimit', Number(e.target.value))}
            min={1}
            max={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportedFileTypes">Supported File Types</Label>
          <Input
            id="supportedFileTypes"
            value={settings.supportedFileTypes.join(', ')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting('supportedFileTypes',
              e.target.value.split(',').map((t: string) => t.trim())
            )}
            placeholder=".txt, .md, .pdf"
          />
        </div>

        {/* Save Button */}
        <Button
          className="w-full"
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsBox;
