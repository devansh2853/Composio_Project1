import { Composio } from '@composio/core';
import { AnthropicProvider } from '@composio/anthropic';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
    provider: new AnthropicProvider({
    cacheTools: false, // default
  }),
});

const anthropic = new Anthropic();

// User ID must be a valid UUID format
const userId = "devansh_student"; // Replace with actual user UUID from your database

// Get tools for Gmail
const tools = await composio.tools.get(userId, {
  toolkits: ["GMAIL"],
});


console.log("[!] Tools:", tools);

// Create a message with the tools
// const msg = await anthropic.messages.create({
//   model: 'claude-3-5-sonnet-20240620',
//   messages: [
//     {
//       role: 'user',
//       content: 'What can you do with Gmail?', // Your task here!
//     },
//   ],
//   tools: tools,
//   max_tokens: 1000,
// });

// // Handle tool calls if any
// const result = await composio.provider.handleToolCalls(userId, msg);
// console.log("[!] Result:", result);
