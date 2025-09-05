# 📌 Project Setup Guide

This project integrates **Gmail, Notion, and Gemini** with Composio to automate workflows using triggers and connections.

## 🚀 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (latest LTS version recommended)
- **npm** (comes with Node.js)
- **ngrok account** (for tunneling)
- **Composio account** (to create API key and auth configs)
- **Notion account** (with edit access to a page)
- **Gemini API key**

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

- Create a `.env` file in the project root.
- On composio platform create auth configs of Gmail, Notion and Gemini.
- Replace the placeholders with your credentials:

```env
COMPOSIO_API_KEY=your_composio_api_key
AUTHCFG_GMAIL=your_gmail_auth_config_id
AUTHCFG_NOTION=your_notion_auth_config_id
AUTHCFG_GEMINI=your_gemini_auth_config_id
```

---

## 🗂️ Notion Setup

1. Create a new page in Notion.
2. Copy the **page ID** → this is the last **32-character value** in the Notion URL.  
   Example:

   ```
   https://www.notion.so/WorkspaceName/PageName-1234567890abcdef1234567890abcdef
                                                  ↑ your page_id
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

---

## 🌐 Ngrok Setup

1. [Sign up for ngrok](https://ngrok.com/).
2. Install ngrok globally:
   ```bash
   npm install -g ngrok
   ```
3. Authenticate ngrok with your token:
   ```bash
   ngrok config add-authtoken <your-ngrok-token>
   ```

---

## ▶️ Run the Server

```bash
npm run start
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 User Flow

1. **Create an account** (username & password).
2. **Connect integrations**:
   - Gmail → via OAuth
   - Notion → via OAuth (**grant access to the Notion page created earlier**)
   - Gemini → enter your Gemini API key (only the connection is stored, not the key itself)
3. Provide your **Notion page_id**.
4. After all connections are active, **create a trigger**.
5. Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
6. Copy the generated **ngrok URL**, add /gmail-webhook at the end and paste it into **Composio → Settings → Events and Triggers → Trigger Webhook URL**.
   The url would look like this:
   https://xyzabc.ngrok-free.app/gmail-webhook

---

## ✅ You’re All Set!

Your integration pipeline is now active. Composio will send Gmail events to your webhook, which updates your Notion database using Gemini.

---
