import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useApp } from './context';
import { Notice } from 'obsidian';

interface AISettings {
  apiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  contextWindowSize: number;
  enableChatHistory: boolean;
  fileUploadLimit: number;
  supportedFileTypes: string[];
}

const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  modelName: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
  contextWindowSize: 4096,
  enableChatHistory: true,
  fileUploadLimit: 10,
  supportedFileTypes: ['.txt', '.md', '.pdf', '.csv']
};

const SettingsBox: React.FC = () => {
  const app = useApp();
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await app.loadData('ai-chat-settings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      new Notice('Error loading settings');
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await app.saveData('ai-chat-settings', settings);
      new Notice('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      new Notice('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AISettings>(
    key: K,
    value: AISettings[K]
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
            onChange={e => updateSetting('apiKey', e.target.value)}
            placeholder="Enter your API key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelName">Model Name</Label>
          <Input
            id="modelName"
            value={settings.modelName}
            onChange={e => updateSetting('modelName', e.target.value)}
            placeholder="gpt-4"
          />
        </div>

        {/* Model Parameters */}
        <div className="space-y-2">
          <Label>Temperature: {settings.temperature}</Label>
          <Slider
            value={[settings.temperature]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => updateSetting('temperature', value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={settings.maxTokens}
            onChange={e => updateSetting('maxTokens', Number(e.target.value))}
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
            onChange={e => updateSetting('contextWindowSize', Number(e.target.value))}
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
            onCheckedChange={checked => updateSetting('enableChatHistory', checked)}
          />
        </div>

        {/* File Upload Settings */}
        <div className="space-y-2">
          <Label htmlFor="fileUploadLimit">File Upload Limit (MB)</Label>
          <Input
            id="fileUploadLimit"
            type="number"
            value={settings.fileUploadLimit}
            onChange={e => updateSetting('fileUploadLimit', Number(e.target.value))}
            min={1}
            max={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportedFileTypes">Supported File Types</Label>
          <Input
            id="supportedFileTypes"
            value={settings.supportedFileTypes.join(', ')}
            onChange={e => updateSetting('supportedFileTypes', 
              e.target.value.split(',').map(t => t.trim())
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
