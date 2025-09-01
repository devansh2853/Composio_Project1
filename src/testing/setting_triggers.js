import composio from './utils/composio.js';
const user_id = "college_id";
const trigger = await composio.triggers.create(
    user_id,
    "GMAIL_NEW_GMAIL_MESSAGE",
    {
        connectedAccountId: "ca_lYNmL4u_B-Wp",
        triggerConfig: {
            labelIds: "INBOX",
            user_id: user_id,
            interval: 1
        },
        webhookConfig: {
            endpoint: "https://e682cf865f42.ngrok-free.app/gmail-webhook"
    }
    },
);
console.log(`Trigger successfully created. Trigger ID: ${trigger.triggerId}`);