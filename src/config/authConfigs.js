import dotenv from 'dotenv';
dotenv.config();

// Composio authConfig IDs (shared across all users)
// Read from environment with sensible defaults.
export const AUTH_CONFIGS = {
    gmail: process.env.AUTHCFG_GMAIL,
    notion: process.env.AUTHCFG_NOTION,
    gemini: process.env.AUTHCFG_GEMINI,
};

export function getAuthConfigIdForProvider(provider) {
    return AUTH_CONFIGS[provider];
}


