import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const DATA_FILE_PATH = path.join(__dirname, 'data', 'contactReceived.json');
const CONTACTS_OBJECT_PATH = 'data/contactReceived.json';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Replit App Storage Client (optional import)
let replitStorageClient = null;
let replitStorageAvailable = false;

async function initStorage() {
  const dataDir = path.join(__dirname, 'data');
  try {
    const { Client } = await import('@replit/object-storage');
    const client = new Client();
    const existsResult = await client.exists(CONTACTS_OBJECT_PATH);

    if (!existsResult.ok) {
      throw new Error(String(existsResult.error));
    }

    if (existsResult.value) {
      const downloadResult = await client.downloadAsText(CONTACTS_OBJECT_PATH);
      if (!downloadResult.ok) {
        throw new Error(String(downloadResult.error));
      }

      const storedContacts = JSON.parse(downloadResult.value || '[]');
      if (!Array.isArray(storedContacts)) {
        throw new Error('Stored contact data must be a JSON array.');
      }

      let localContacts = [];
      if (fs.existsSync(DATA_FILE_PATH)) {
        try {
          localContacts = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8') || '[]');
          if (!Array.isArray(localContacts)) localContacts = [];
        } catch (err) {
          console.warn('[Storage] Ignoring unreadable local cache; App Storage remains authoritative:', err.message);
          localContacts = [];
        }
      }

      // Preserve legacy local records when App Storage already has an object;
      // for matching IDs, the App Storage version remains authoritative.
      const contactsById = new Map(localContacts.map((contact) => [contact.id, contact]));
      for (const contact of storedContacts) {
        contactsById.set(contact.id, contact);
      }
      const contacts = [...contactsById.values()];
      if (contacts.length !== storedContacts.length) {
        const mergeResult = await client.uploadFromText(
          CONTACTS_OBJECT_PATH,
          JSON.stringify(contacts, null, 2),
        );
        if (!mergeResult.ok) {
          throw new Error(`Could not preserve existing local records in App Storage: ${mergeResult.error}`);
        }
      }

      await fs.promises.mkdir(dataDir, { recursive: true });
      await fs.promises.writeFile(DATA_FILE_PATH, JSON.stringify(contacts, null, 2), 'utf8');
    } else {
      await fs.promises.mkdir(dataDir, { recursive: true });
      const localData = fs.existsSync(DATA_FILE_PATH)
        ? fs.readFileSync(DATA_FILE_PATH, 'utf8')
        : '[]';
      const contacts = JSON.parse(localData || '[]');
      if (!Array.isArray(contacts)) {
        throw new Error('Local contact data must be a JSON array.');
      }

      const uploadResult = await client.uploadFromText(
        CONTACTS_OBJECT_PATH,
        JSON.stringify(contacts, null, 2),
      );
      if (!uploadResult.ok) {
        throw new Error(String(uploadResult.error));
      }
    }

    replitStorageClient = client;
    replitStorageAvailable = true;
    console.log('[Storage] Replit App Storage connected successfully.');
  } catch (err) {
    if (!IS_DEVELOPMENT) {
      throw new Error(`Replit App Storage is required outside development: ${err.message}`);
    }

    await fs.promises.mkdir(dataDir, { recursive: true });
    if (!fs.existsSync(DATA_FILE_PATH)) {
      await fs.promises.writeFile(DATA_FILE_PATH, '[]', 'utf8');
    }

    console.warn(
      `[Storage] DEVELOPMENT ONLY: using local data/contactReceived.json because App Storage is unavailable (${err.message}).`,
    );
    replitStorageAvailable = false;
  }
}

// Read contacts helper
async function readContacts() {
  if (replitStorageAvailable && replitStorageClient) {
    const result = await replitStorageClient.downloadAsText(CONTACTS_OBJECT_PATH);
    if (!result.ok) {
      throw new Error(`Failed to read contact data from App Storage: ${result.error}`);
    }

    const contacts = JSON.parse(result.value || '[]');
    if (!Array.isArray(contacts)) {
      throw new Error('Stored contact data must be a JSON array.');
    }
    return contacts;
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

  if (replitStorageAvailable && replitStorageClient) {
    const result = await replitStorageClient.uploadFromText(CONTACTS_OBJECT_PATH, jsonString);
    if (!result.ok) {
      throw new Error(`Failed to save contact data to App Storage: ${result.error}`);
    }

    try {
      await fs.promises.writeFile(DATA_FILE_PATH, jsonString, 'utf8');
    } catch (err) {
      console.warn('[Storage] App Storage save succeeded, but local cache update failed:', err.message);
    }
    return;
  }

  if (!IS_DEVELOPMENT) {
    throw new Error('Contact data cannot be saved without Replit App Storage.');
  }

  try {
    await fs.promises.writeFile(DATA_FILE_PATH, jsonString, 'utf8');
  } catch (err) {
    console.error('[Storage] Error writing development-only local storage:', err);
    throw new Error('Failed to write contact data to local development storage');
  }
}

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Backwards-compatibility redirects (placed before express.static)
app.get(['/academics.html', '/academics', '/choice1.html'], (req, res) => res.redirect(301, '/hobbies.html'));
app.get(['/photography.html', '/photography', '/choice2.html'], (req, res) => res.redirect(301, '/travel.html'));

// Contact records are private server data, never public static files.
app.use('/data', (req, res) => res.sendStatus(404));

// Serve public site files without exposing the local data directory.
app.use(express.static(__dirname));

// Authentication Middleware for Admin routes
function createAdminToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const nonce = crypto.randomBytes(32).toString('hex');
  const payload = `${expiresAt}.${nonce}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function isValidAdminToken(token) {
  if (!SESSION_SECRET || !token) return false;
  const parts = token.split('.');
  if (
    parts.length !== 3
    || !/^\d+$/.test(parts[0])
    || !/^[a-f0-9]{64}$/i.test(parts[2])
    || Number(parts[0]) <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest();
  const supplied = Buffer.from(parts[2], 'hex');
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  if (!isValidAdminToken(token)) {
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
    if (
      !email
      || typeof email !== 'string'
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
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
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 16) {
    return res.status(503).json({
      error: 'Admin login is not configured. Set a strong ADMIN_PASSWORD in Replit Secrets.',
    });
  }
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    return res.status(503).json({
      error: 'Admin sessions are not configured. Set a strong SESSION_SECRET in Replit Secrets.',
    });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  // Generate secure session token
  const token = createAdminToken();

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
app.get('/choice1.html', (req, res) => res.redirect(301, '/hobbies.html'));
app.get('/choice2.html', (req, res) => res.redirect(301, '/travel.html'));
app.get('/academics.html', (req, res) => res.redirect(301, '/hobbies.html'));
app.get('/academics', (req, res) => res.redirect(301, '/hobbies.html'));
app.get('/photography.html', (req, res) => res.redirect(301, '/travel.html'));
app.get('/photography', (req, res) => res.redirect(301, '/travel.html'));

app.get('/hobbies', (req, res) => res.sendFile(path.join(__dirname, 'hobbies.html')));
app.get('/travel', (req, res) => res.sendFile(path.join(__dirname, 'travel.html')));
app.get('/media', (req, res) => res.sendFile(path.join(__dirname, 'media.html')));
app.get('/future', (req, res) => res.sendFile(path.join(__dirname, 'future.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Default page route fallbacks
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
initStorage()
  .then(() => {
    if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 16) {
      const message = 'ADMIN_PASSWORD is missing or too short; set a 16-character minimum Replit Secret.';
      if (!IS_DEVELOPMENT) {
        throw new Error(message);
      }
      console.warn(`[Security] DEVELOPMENT ONLY: ${message}`);
    }
    if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
      const message = 'SESSION_SECRET is missing or too short; set a 32-character minimum Replit Secret.';
      if (!IS_DEVELOPMENT) {
        throw new Error(message);
      }
      console.warn(`[Security] DEVELOPMENT ONLY: ${message}`);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`[Startup] ${err.message}`);
    process.exitCode = 1;
  });
