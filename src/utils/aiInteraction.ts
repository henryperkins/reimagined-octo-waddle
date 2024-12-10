interface AIRequestOptions {
    model: string;
    temperature: number;
    maxTokens: number;
}

interface AIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    error?: {
        message: string;
    };
}

export async function queryAI(
    apiKey: string,
    message: string,
    options: AIRequestOptions
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: options.model,
            messages: [{ role: 'user', content: message }],
            temperature: options.temperature,
            max_tokens: options.maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.json() as AIResponse;
        throw new Error(`AI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json() as AIResponse;
    return data.choices[0]?.message?.content || 'No response generated';
}

export function estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
    const estimatedTokens = estimateTokens(text);
    if (estimatedTokens <= maxTokens) {
        return text;
    }

    // Truncate to approximately maxTokens
    const maxChars = maxTokens * 4;
    return text.slice(0, maxChars) + '...';
}

export function formatPrompt(
    message: string,
    context?: string,
    systemPrompt?: string
): string {
    const parts: string[] = [];

    if (systemPrompt) {
        parts.push(`System: ${systemPrompt}\n`);
    }

    if (context) {
        parts.push(`Context: ${context}\n`);
    }

    parts.push(`User: ${message}`);

    return parts.join('\n');
}
