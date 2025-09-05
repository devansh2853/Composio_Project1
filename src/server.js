import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';
import composio from './utils/composio.js';
import { getAuthConfigIdForProvider } from './config/authConfigs.js';
import { AuthScheme } from '@composio/core';
import { handleMailTrigger } from './MailToNotionLog.js';
import {createNotionDatabase, searchNotionPage} from './utils/NotionUtil.js';
import { connect } from "http2";


const app = express();
app.use(express.json());

// Serve static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'web')));
// Auth: signup
app.post('/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'username and password required' });
        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)');
        stmt.run(userId, username, passwordHash, Date.now());
        const user_settings_init = db.prepare('INSERT INTO user_settings (user_id, created_at) VALUES (?, ?)');
        user_settings_init.run(userId, Date.now());
        return res.json({ user_id: userId });
    } catch (err) {
        if (String(err.message).includes('UNIQUE')) return res.status(409).json({ error: 'username taken' });
        return res.status(500).json({ error: 'signup failed' });
    }
});

// Auth: login
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'username and password required' });
        const row = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
        if (!row) return res.status(401).json({ error: 'invalid credentials' });
        const ok = await bcrypt.compare(password, row.password_hash);
        if (!ok) return res.status(401).json({ error: 'invalid credentials' });
        return res.json({ user_id: row.id, username: row.username });
    } catch (err) {
        return res.status(500).json({ error: 'login failed' });
    }
});

// Get user profile
app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    const row = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
    if (!row) return res.status(404).json({ error: 'user not found' });
    return res.json(row);
});

// Get connection statuses for all providers
app.get('/users/:userId/connections/status', (req, res) => {
    const { userId } = req.params;
    const rows = db.prepare('SELECT provider, connection_id FROM user_connections WHERE user_id = ?').all(userId);
    const status = { gmail: false, notion: false, gemini: false, trigger: false, db_status: false };
    const trigger = db.prepare('SELECT triggerId from user_settings WHERE user_id = ?').get(userId);
    const db_status = db.prepare('SELECT notion_database_id from user_settings WHERE user_id = ?').get(userId);
    if (db_status.notion_database_id != null) status.db_status = true;
    if (trigger.triggerId != null) status.trigger = true;
    for (const r of rows) {
        if (r.provider in status) status[r.provider] = !!r.connection_id;
    }
    return res.json(status);
});

// Store Notion database id per user
app.post('/users/:userId/notion-db', async (req, res) => {
    const { userId } = req.params;
    const { page_id } = req.body;
    if (!page_id) return res.status(400).json({ error: 'page_id required' });
    const connection = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(userId, 'notion');
    if (!connection) return res.status(400).json({ error: 'Notion connection pending' });
    const handleNotionDB = await createNotionDatabase(userId, connection.connection_id, page_id);
    if (!handleNotionDB.successful) res.status(400).json({ error: 'Page not found. Please reconnect and give access to the correct page' });
    const up = db.prepare('INSERT INTO user_settings (user_id, notion_database_id, created_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET notion_database_id = excluded.notion_database_id');
    up.run(userId, handleNotionDB.db_id, Date.now());
    return res.json({ ok: true, url: handleNotionDB.url});
});

// Initiate a Composio connection for a provider using an authConfigId
app.post('/users/:userId/connections/initiate', async (req, res) => {
    const { userId } = req.params;
    const { provider, api_key } = req.body;
    if (!provider) return res.status(400).json({ error: 'provider required' });
    try {
        const authConfigId = getAuthConfigIdForProvider(provider);
        if (!authConfigId) return res.status(400).json({ error: 'unknown provider' });
        
        let cr;
        if (provider === 'gemini' && api_key) {
            // For Gemini, use API key authentication (immediate connection)
            cr = await composio.connectedAccounts.initiate(
                userId,
                authConfigId,
                {
                    config: AuthScheme.APIKey({
                        api_key: api_key
                    })
                }
            );
            
            // Gemini connections are immediate, so finalize right away
            const connected = await composio.connectedAccounts.get(cr.id);
            const existing = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(userId, provider);
            if (existing && existing.connection_id && existing.connection_id !== connected.id) {
                try { await composio.connectedAccounts.delete(existing.connection_id); } catch (e) { /* ignore cleanup errors */ }
            }
            db.prepare('INSERT INTO user_connections (user_id, provider, connection_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, provider) DO UPDATE SET connection_id = excluded.connection_id').run(userId, provider, connected.id, Date.now());
            
            return res.json({ 
                connection_request_id: cr.id, 
                redirect_url: null, // No redirect needed for API key auth
                immediate: true,
                connection_id: connected.id
            });
        } else {
            // For other providers, use OAuth flow
            const connections = db.prepare('SELECT connection_id, provider FROM user_connections WHERE user_id = ?').all(userId);
            for (const connection of connections) {
                if (connection.provider === provider) {
                    await composio.connectedAccounts.delete(connection.connection_id);
                    db.prepare('DELETE FROM user_connections WHERE user_id = ? AND provider = ?').run(userId, provider);
                    const trigger = db.prepare('SELECT triggerId from user_settings where user_id = ?').get(userId);
                    if (trigger.triggerId != null) {
                        if (provider !== 'gmail') await composio.triggers.delete(trigger.triggerId);
                        db.prepare('UPDATE user_settings SET triggerId = NULL where user_id = ?').run(userId);

                    }
                    if (provider === 'notion') {
                        db.prepare('UPDATE user_settings SET notion_database_id = NULL where user_id = ?').run(userId);
                    }
                }
            }
            cr = await composio.connectedAccounts.initiate(userId, authConfigId);
            db.prepare('INSERT INTO pending_connections (user_id, provider, connection_request_id, created_at) VALUES (?, ?, ?, ?)').run(userId, provider, cr.id, Date.now());
            return res.json({ connection_request_id: cr.id, redirect_url: cr.redirectUrl });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'failed to initiate connection' });
    }
});

// Finalize/poll and persist connection
app.post('/users/:userId/connections/finalize-latest', async (req, res) => {
    const { userId } = req.params;
    const { provider, timeout_ms } = req.body;
    if (!provider) return res.status(400).json({ error: 'provider required' });
    const pending = db.prepare('SELECT connection_request_id FROM pending_connections WHERE user_id = ? AND provider = ? ORDER BY created_at DESC LIMIT 1').get(userId, provider);
    try {
        if (!pending) return res.status(404).json({ error: 'no pending request found' });
        const timeout = Number(timeout_ms) || 300000;
        await composio.connectedAccounts.waitForConnection(pending.connection_request_id, timeout);
        const connected = await composio.connectedAccounts.get(pending.connection_request_id);
        const existing = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(userId, provider);
        if (existing && existing.connection_id && existing.connection_id !== connected.id) {
            try { await composio.connectedAccounts.delete(existing.connection_id); } catch (e) { /* ignore cleanup errors */ }
        }

        db.prepare('INSERT INTO user_connections (user_id, provider, connection_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, provider) DO UPDATE SET connection_id = excluded.connection_id').run(userId, provider, connected.id, Date.now());


        db.prepare('DELETE FROM pending_connections WHERE user_id = ? AND provider = ?').run(userId, provider);
        
        return res.json({ ok: true, connection_id: connected.id });
    } catch (err) {
        console.log(err.message);
        await composio.connectedAccounts.delete(pending.connection_request_id);
        return res.status(500).json({ error: 'failed to finalize connection' });
    }
});

// Create Gmail trigger for user
app.post('/users/:userId/triggers/gmail', async (req, res) => {
    const { userId } = req.params;
    try {
        // Get user's Gmail, notion and gemini connections
        const gmailConnection = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(userId, 'gmail');
        const notionConnection = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(userId, 'notion');
        const geminiConnection = db.prepare('SELECT connection_id FROM user_connections WHERE user_id = ? AND provider = ?').get(userId, 'gemini');
        const notionDBConnection = db.prepare('SELECT notion_database_id from user_settings WHERE user_id = ?').get(userId);
        if (!gmailConnection) return res.status(400).json({ error: 'Gmail connection not found. Please connect Gmail first.' });
        if (!notionConnection) return res.status(400).json({ error: 'Notion connection not found. Please connect Notion first.' });
        if (!geminiConnection) return res.status(400).json({ error: 'Gemini connection not found. Please connect Gemini using API key first.' });
        if (notionDBConnection.notion_database_id === null) return res.status(400).json({ error: 'Notion DB was not created. Please provide the page id first to create the trigger' });

        // Create trigger
        const trigger = await composio.triggers.create(
            userId,
            "GMAIL_NEW_GMAIL_MESSAGE",
            {
                connectedAccountId: gmailConnection.connection_id,
                triggerConfig: {
                    labelIds: "INBOX",
                    user_id: userId,
                    interval: 1
                }
            }
        );
        
        const existingTrigger = db.prepare('SELECT triggerId from user_settings WHERE user_id = ?').get(userId);
        if (existingTrigger.triggerId != null) {
            await composio.triggers.delete(existingTrigger.triggerId);
        }
        db.prepare('INSERT INTO user_settings (user_id, triggerId, created_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET triggerId = excluded.triggerId').run(userId, trigger.triggerId, Date.now());
        
        return res.json({ 
            success: true, 
            trigger_id: trigger.triggerId,
            message: 'Gmail trigger created successfully'
        });
    } catch (err) {
        return res.status(500).json({ error: 'failed to create Gmail trigger: ' + err.message });
    }
});

// This is the webhook endpoint that will receive Gmail trigger events
app.post("/gmail-webhook", async (req, res) => {
    try {
        const user_id = req.body.data?.user_id || req.body.data?.extras?.user_id || "";
        const users = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
        if (!users) return { successful: true, message: "Ignored: no valid user_id in payload" };
        console.log("Gmail trigger received");
        const handleTrigger = await handleMailTrigger(req.body.data);
        if (!handleTrigger.successful) {
            console.log(handleTrigger.error);
            res.status(500).send("Error handling mail trigger");
        }
        else {
            console.log(handleTrigger.message);
            console.log("Trigger successfully handled");
            res.status(200).send(handleTrigger.message);
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error handling mail trigger");
    }
    
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
