import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function normalizeEnvValue(value: string) {
    const trimmedValue = value.trim();
    const isQuoted =
        (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
        (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"));

    return isQuoted ? trimmedValue.slice(1, -1).trim() : trimmedValue;
}

function loadLocalEnv() {
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) {
        return;
    }

    const envContent = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim().replace(/^export\s+/, '');
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            return;
        }

        const [rawKey, ...valueParts] = trimmedLine.split('=');
        const key = rawKey.trim().replace(/^\uFEFF/, '');
        if (!key || process.env[key]) {
            return;
        }

        process.env[key] = normalizeEnvValue(valueParts.join('='));
    });
}

loadLocalEnv();

export const DEEPSEEK_ASSISTANT_NAME = 'Deepseek';

export const deepseekConfig = {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
};

export function getDeepseekConfigStatus() {
    const { apiKey, apiUrl, model } = deepseekConfig;

    return {
        hasApiKey: Boolean(apiKey),
        apiKeyPreview: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '',
        apiUrl,
        model,
    };
}
