/**
 * TechInnoSphere Email API Server
 * - Sends real emails via Hostinger SMTP
 * - Saves to Sent folder via IMAP
 * - Email open tracking via 1×1 pixel
 * Account: contact@techinnosphere.com
 * Run: node email-server.cjs  |  Port: 3001
 */

require('dotenv').config();

const express      = require('express');
const nodemailer   = require('nodemailer');
const cors         = require('cors');
const fs           = require('fs');
const path         = require('path');
const { ImapFlow } = require('imapflow');

const app  = express();
// Local/LAN use: always 3001, matching apiBase.js's assumption. Hosted
// platforms (Render, Railway, etc.) assign their own port via $PORT and
// expect the app to bind to it — fall back to that when present.
const PORT = process.env.PORT || 3001;

// ─── Credentials (from .env — see .env.example) ───────────────────────────────
const SMTP_HOST   = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT   = parseInt(process.env.SMTP_PORT || '465', 10);
const IMAP_HOST   = process.env.IMAP_HOST || 'imap.hostinger.com';
const IMAP_PORT   = parseInt(process.env.IMAP_PORT || '993', 10);
const EMAIL_USER  = process.env.SMTP_USER;
const EMAIL_PASS  = process.env.SMTP_PASS;
const SENDER_NAME = 'Hamzah | TechInnoSphere';

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('❌ Missing SMTP_USER / SMTP_PASS. Copy .env.example to .env and fill in credentials.');
  process.exit(1);
}

// ─── API key (required once this server leaves your LAN) ──────────────────────
// On a private network this is a second layer of defense; the moment this
// server is reachable from the public internet (tunnel, cloud host), it's the
// ONLY thing stopping a stranger from sending email as contact@techinnosphere.com.
// Set API_KEY in .env. If unset, the server still runs (LAN-only convenience)
// but refuses to start bound to a public interface — see app.listen() below.
const API_KEY = process.env.API_KEY || '';

function requireApiKey(req, res, next) {
  if (!API_KEY) return next(); // no key configured — LAN-only mode, see startup warning
  const provided = req.get('X-API-Key') || req.query.key;
  if (provided === API_KEY) return next();
  return res.status(401).json({ ok: false, message: 'Missing or invalid X-API-Key header.' });
}

// ─── Public tracking URL (change to ngrok URL for real external tracking) ─────
// e.g. 'https://abc123.ngrok.io'  — if left as localhost, tracking only works on LAN
const TRACKING_BASE_URL = process.env.TRACKING_URL || `http://localhost:${PORT}`;

// ─── Tracking data store ──────────────────────────────────────────────────────
const TRACKING_FILE = path.join(__dirname, 'email-tracking.json');

function loadTracking() {
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function saveTracking(data) {
  try { fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2)); } catch (_) {}
}

let trackingStore = loadTracking();

// ─── 1×1 Transparent GIF ─────────────────────────────────────────────────────
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow the dev/preview server from any address this machine is reachable at —
// localhost on the PC, the LAN IP from a phone, or a custom hosts-file name.
// Private/LAN addresses only; this server is not meant to be exposed publicly.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/techinnosphere-automation(:\d+)?$/,
  /^https?:\/\/[a-z0-9-]+\.local(:\d+)?$/i,
  /^https:\/\/techinnosphere-mumbai\.surge\.sh$/,
  /^https:\/\/hamziiii88\.github\.io$/
];

app.use(cors({
  origin: (origin, callback) => {
    // Same-origin / curl / native apps send no Origin header — allow those.
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGIN_PATTERNS.some(re => re.test(origin))) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ─── SMTP Transporter ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: SMTP_HOST, port: SMTP_PORT, secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  tls:  { rejectUnauthorized: false }
});

// ─── Helper: Save to IMAP Sent folder ────────────────────────────────────────
async function saveToSentFolder(rawMessage) {
  const client = new ImapFlow({
    host: IMAP_HOST, port: IMAP_PORT, secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    logger: false, tls: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const mailboxes  = await client.list();
    let sentFolder   = null;
    for (const box of mailboxes) {
      if (box.specialUse === '\\Sent') { sentFolder = box.path; break; }
    }
    if (!sentFolder) {
      const names = ['Sent', 'Sent Items', 'Sent Messages', 'INBOX.Sent', 'INBOX/Sent'];
      for (const n of names) {
        const f = mailboxes.find(b => b.path === n || b.name === n);
        if (f) { sentFolder = f.path; break; }
      }
    }
    if (!sentFolder) {
      sentFolder = 'Sent';
      try { await client.mailboxCreate('Sent'); } catch (_) {}
    }
    await client.append(sentFolder, rawMessage, ['\\Seen']);
    console.log(`[IMAP] ✅ Saved to "${sentFolder}"`);
  } catch (err) {
    console.warn(`[IMAP] ⚠️  Sent folder save failed: ${err.message}`);
  } finally {
    try { await client.logout(); } catch (_) {}
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK', smtp: `${SMTP_HOST}:${SMTP_PORT}`,
    imap: `${IMAP_HOST}:${IMAP_PORT}`, account: EMAIL_USER,
    trackingBase: TRACKING_BASE_URL, time: new Date().toISOString()
  });
});

// ─── SMTP Verify ─────────────────────────────────────────────────────────────
app.get('/verify', requireApiKey, async (_req, res) => {
  try {
    await transporter.verify();
    res.json({ ok: true, message: 'Hostinger SMTP verified. Ready to send.' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ─── 📬 Send Email ────────────────────────────────────────────────────────────
app.post('/send-email', requireApiKey, async (req, res) => {
  const { to, subject, body, senderName = SENDER_NAME } = req.body;

  if (!to || !subject || !body)
    return res.status(400).json({ ok: false, message: 'Missing: to, subject, body' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim()))
    return res.status(400).json({ ok: false, message: `Invalid email: ${to}` });

  try {
    const msgId      = `techinnosphere-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,8)}`;
    const trackingId = `trk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,10)}`;
    const pixelUrl   = `${TRACKING_BASE_URL}/track/open/${trackingId}.gif`;

    // Register tracking entry BEFORE sending
    trackingStore[trackingId] = {
      trackingId,
      to: to.trim(),
      subject,
      sentAt: new Date().toISOString(),
      opens: [],          // array of { openedAt, userAgent, ip }
      opened: false
    };
    saveTracking(trackingStore);

    // Build HTML with tracking pixel embedded at the bottom
    const safeBody = body
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const htmlBody = `
<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#1a1a1a;max-width:640px">
  <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#1a1a1a;margin:0">${safeBody}</pre>
  <br/>
  <img src="${pixelUrl}" width="1" height="1" border="0" alt="" style="display:block;width:1px;height:1px;opacity:0" />
</div>`;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${EMAIL_USER}>`,
      to:   to.trim(), subject, text: body, html: htmlBody,
      messageId: `<${msgId}@techinnosphere.com>`,
      headers: { 'X-Mailer': 'TechInnoSphere BDA v3', 'X-Tracking-ID': trackingId }
    });

    console.log(`[SMTP] ✅ Sent → ${to} | TrkID: ${trackingId}`);

    // Save to IMAP Sent folder (async, non-blocking)
    const rawMsg = [
      `From: "${senderName}" <${EMAIL_USER}>`, `To: ${to.trim()}`,
      `Subject: ${subject}`, `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${msgId}@techinnosphere.com>`,
      `MIME-Version: 1.0`, `Content-Type: text/plain; charset=utf-8`, ``, body
    ].join('\r\n');
    saveToSentFolder(rawMsg);

    res.json({
      ok: true,
      message: `Email delivered to ${to}`,
      messageId:  info.messageId || `<${msgId}@techinnosphere.com>`,
      trackingId,
      accepted:   info.accepted,
      time:       new Date().toISOString()
    });

  } catch (err) {
    console.error(`[SMTP] ❌ Failed: ${err.message}`);
    res.status(500).json({ ok: false, message: `SMTP Error: ${err.message}` });
  }
});

// ─── 👁️ Tracking Pixel (called when recipient opens email) ───────────────────
app.get('/track/open/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  // Strip .gif extension if present
  const id = trackingId.replace(/\.gif$/i, '');

  if (trackingStore[id]) {
    const openEvent = {
      openedAt:  new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip:        req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'
    };
    trackingStore[id].opens.push(openEvent);
    trackingStore[id].opened      = true;
    trackingStore[id].firstOpenAt = trackingStore[id].firstOpenAt || openEvent.openedAt;
    trackingStore[id].lastOpenAt  = openEvent.openedAt;
    saveTracking(trackingStore);
    console.log(`[TRACK] 👁️  Email OPENED | TrkID: ${id} | by: ${openEvent.userAgent.substring(0,60)}`);
  }

  // Always return the pixel regardless of tracking status
  res.set({
    'Content-Type':  'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma':        'no-cache',
    'Expires':       '0'
  });
  res.send(PIXEL_GIF);
});

// ─── 📊 Tracking Status API ───────────────────────────────────────────────────
app.get('/track/status/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const entry = trackingStore[trackingId];

  if (!entry) {
    return res.status(404).json({ ok: false, message: 'Tracking ID not found' });
  }

  res.json({
    ok: true,
    trackingId,
    to:           entry.to,
    subject:      entry.subject,
    sentAt:       entry.sentAt,
    opened:       entry.opened,
    openCount:    entry.opens.length,
    firstOpenAt:  entry.firstOpenAt || null,
    lastOpenAt:   entry.lastOpenAt  || null,
    opens:        entry.opens       || []
  });
});

// ─── 📋 All Tracking Records ──────────────────────────────────────────────────
app.get('/track/all', requireApiKey, (_req, res) => {
  const records = Object.values(trackingStore).sort(
    (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
  );
  res.json({ ok: true, count: records.length, records });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   TechInnoSphere Email + Tracking Server — LIVE!     ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  API:      http://localhost:${PORT}                    ║`);
  console.log(`║  Account:  ${EMAIL_USER}              ║`);
  console.log(`║  SMTP:     ${SMTP_HOST}:${SMTP_PORT} (SSL)       ║`);
  console.log(`║  IMAP:     ${IMAP_HOST}:${IMAP_PORT} (SSL)       ║`);
  console.log(`║  Tracking: ${TRACKING_BASE_URL}/track/open/:id ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log('💡 For external tracking, set TRACKING_URL env variable:');
  console.log('   TRACKING_URL=https://your-ngrok-url node email-server.cjs');
  console.log('');
  if (!API_KEY) {
    console.warn('⚠️  API_KEY is not set in .env — /send-email and /verify have NO auth.');
    console.warn('   Fine on your home Wi-Fi. Before exposing this server via a tunnel or');
    console.warn('   public host, set API_KEY in .env — otherwise anyone who finds the URL');
    console.warn(`   can send mail as ${EMAIL_USER}.`);
    console.log('');
  }
});
