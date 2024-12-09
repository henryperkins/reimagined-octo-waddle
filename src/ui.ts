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

		const chatHistory = container.createEl('div', { cls: 'chat-history' });
		const controls = container.createEl('div', { cls: 'chat-controls' });

		controls.appendChild(inputBox);
		controls.appendChild(sendButton);
		container.appendChild(chatHistory);
		container.appendChild(controls);

		sendButton.addEventListener('click', async () => {
			const query = inputBox.value;
			if (query.trim() === '') return;

			const response = await this.plugin.handleUserQuery(query);
			this.displayResponse(chatHistory, response);
			inputBox.value = '';
		});
	}

	displayResponse(chatHistory: HTMLElement, response: string) {
		const responseEl = chatHistory.createEl('div', { cls: 'chat-response' });
		responseEl.setText(response);
	}
}
