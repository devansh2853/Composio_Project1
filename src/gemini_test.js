import composio from './utils/composio.js';
import { AuthScheme } from '@composio/core';

import dotenv from 'dotenv';
dotenv.config();

const userId = "devansh_student";
const gemini_auth_config_id = "ac_HtU4oxSf4LYy";
async function authenticateToolkit(userId, authConfigId) {
  // TODO: Replace this with a method to retrieve the API key from the user.
  // In production, this should be securely retrieved from your database or user input.
  // For example: const userApiKey = await getUserApiKey(userId);
  const userApiKey = process.env.GEMINI_API_KEY; // Replace with actual API key
  
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId,
    {
      config: AuthScheme.APIKey({
        api_key: userApiKey
      })
    }
  );
  
  // API Key authentication is immediate - no redirect needed
  console.log(`Successfully connected Gemini for user ${userId}`);
  console.log(`Connection status: ${connectionRequest.status}`);
  
  return connectionRequest.id;
}
// Authenticate the toolkit
const connectionId = await authenticateToolkit(userId, gemini_auth_config_id);

// You can verify the connection using:
const connectedAccount = await composio.connectedAccounts.get(connectionId);
console.log("Connected account:", connectedAccount);