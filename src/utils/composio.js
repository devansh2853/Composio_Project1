import { Composio, OpenAIProvider } from '@composio/core';
import dotenv from "dotenv"
dotenv.config();

// Initialize the SDK
const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY
});

export default composio;