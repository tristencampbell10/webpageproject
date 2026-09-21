import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATA_FILE_PATH = path.join(__dirname, 'data', 'contactReceived.json');

// Memory storage for active admin auth tokens
const validTokens = new Set();

// Replit App Storage Client (optional import)
let replitStorageClient = null;
let replitStorageAvailable = false;

async function initStorage() {
  // Ensure data directory exists on disk
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Ensure contactReceived.json exists on disk
  if (!fs.existsSync(DATA_FILE_PATH)) {
    fs.writeFileSync(DATA_FILE_PATH, '[]', 'utf8');
  }

  // Attempt to initialize Replit App Storage
  try {
    const { Client } = await import('@replit/object-storage');
    replitStorageClient = new Client();
    // Test connection
    const test = await replitStorageClient.downloadAsText('data/contactReceived.json');
    if (test.ok && test.value) {
      // Sync from App Storage to disk
      fs.writeFileSync(DATA_FILE_PATH, test.value, 'utf8');
      replitStorageAvailable = true;
    } else {
      // Initialize in App Storage
      const current = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      await replitStorageClient.uploadFromText('data/contactReceived.json', current);
      replitStorageAvailable = true;
    }
    console.log('[Storage] Replit App Storage connected successfully.');
  } catch {
    console.log('[Storage] Operating with disk-backed storage at data/contactReceived.json.');
    replitStorageAvailable = false;
  }
}

// Read contacts helper
async function readContacts() {
  if (replitStorageAvailable && replitStorageClient) {
    try {
      const res = await replitStorageClient.downloadAsText('data/contactReceived.json');
      if (res.ok && res.value) {
        return JSON.parse(res.value);
      }
    } catch (err) {
      console.warn('[Storage] App Storage read warning, falling back to disk:', err.message);
    }
  }

  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[Storage] Error reading contact file:', err);
    throw new Error('Failed to read contact storage');
  }
}

// Write contacts helper
async function writeContacts(contacts) {
  const jsonString = JSON.stringify(contacts, null, 2);

  // Always keep disk file in sync
  try {
    fs.writeFileSync(DATA_FILE_PATH, jsonString, 'utf8');
  } catch (err) {
    console.error('[Storage] Error writing disk storage:', err);
    throw new Error('Failed to write to local storage');
  }

  // Also upload to Replit App Storage if available
  if (replitStorageAvailable && replitStorageClient) {
    try {
      await replitStorageClient.uploadFromText('data/contactReceived.json', jsonString);
    } catch (err) {
      console.warn('[Storage] App Storage upload warning:', err.message);
    }
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with relative paths
app.use(express.static(__dirname));

// Authentication Middleware for Admin routes
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  if (!validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  next();
}

// --- PUBLIC CONTACT SUBMISSION ENDPOINT ---
// POST /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;

    // Validation
    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return res.status(400).json({ error: 'First Name is required.' });
    }
    if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
      return res.status(400).json({ error: 'Last Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const validReasons = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        error: `Reason must be one of: ${validReasons.join(', ')}`,
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Read existing contacts
    const contacts = await readContacts();

    // Create new contact record
    const newRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      reason: reason,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      replied: false,
      repliedAt: null,
    };

    // Append and save
    contacts.push(newRecord);
    await writeContacts(contacts);

    // Return HTTP 201 with the saved record
    return res.status(201).json(newRecord);
  } catch (err) {
    console.error('[API] POST /api/contact error:', err);
    return res.status(500).json({ error: 'Internal Server Error: Failed to save submission.' });
  }
});

// --- ADMIN AUTHENTICATION ENDPOINT ---
// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  // Generate secure session token
  const token = 'tok_' + crypto.randomBytes(24).toString('hex');
  validTokens.add(token);

  return res.json({
    success: true,
    token: token,
    message: 'Authentication successful',
  });
});

// --- ADMIN MESSAGES LIST ENDPOINT ---
// GET /api/admin/messages
app.get('/api/admin/messages', requireAdminAuth, async (req, res) => {
  try {
    const contacts = await readContacts();
    // Return newest first
    const sorted = [...contacts].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return res.json(sorted);
  } catch (err) {
    console.error('[API] GET /api/admin/messages error:', err);
    return res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// --- ADMIN MARK AS REPLIED ENDPOINT ---
// PATCH /api/admin/messages/:id/replied
app.patch('/api/admin/messages/:id/replied', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const contacts = await readContacts();
    const index = contacts.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    contacts[index].replied = true;
    contacts[index].repliedAt = new Date().toISOString();

    await writeContacts(contacts);

    return res.json(contacts[index]);
  } catch (err) {
    console.error('[API] PATCH /api/admin/messages/:id/replied error:', err);
    return res.status(500).json({ error: 'Failed to update reply status' });
  }
});

// Friendly page routes & backwards-compatibility redirects
app.get('/choice1.html', (req, res) => res.redirect(301, '/academics.html'));
app.get('/choice2.html', (req, res) => res.redirect(301, '/photography.html'));

app.get('/media', (req, res) => res.sendFile(path.join(__dirname, 'media.html')));
app.get('/future', (req, res) => res.sendFile(path.join(__dirname, 'future.html')));
app.get('/academics', (req, res) => res.sendFile(path.join(__dirname, 'academics.html')));
app.get('/photography', (req, res) => res.sendFile(path.join(__dirname, 'photography.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Default page route fallbacks
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
initStorage().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
});
