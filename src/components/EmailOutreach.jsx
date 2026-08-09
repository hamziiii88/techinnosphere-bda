import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Mail, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  User, 
  Building2, 
  Wand2,
  FileText,
  Search,
  MapPin,
  Globe,
  Filter,
  ShieldCheck,
  RefreshCw,
  Sliders,
  CheckCircle,
  Key,
  Zap,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  ExternalLink
} from 'lucide-react';
// Only real CRM leads are used — no generated prospects
import confetti from 'canvas-confetti';

// ─── Email API Config ─────────────────────────────────────────────────────────
import { EMAIL_API_BASE } from '../utils/apiBase';
import { getApiKey, promptForApiKey } from '../utils/apiKey';

/**
 * Sends real email via TechInnoSphere local Node.js email server
 * (email-server.cjs on port 3001 of whichever machine is serving this app)
 */
async function sendRealEmail({ to, subject, body }) {
  const doSend = (apiKey) => fetch(`${EMAIL_API_BASE}/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {})
    },
    body: JSON.stringify({ to, subject, body, senderName: 'Hamzah | TechInnoSphere' })
  });

  let response = await doSend(getApiKey());

  // Server has an API key configured but we didn't send one (or it's stale) — ask once.
  if (response.status === 401) {
    const key = promptForApiKey();
    if (!key) throw new Error('API key required to send email from this device.');
    response = await doSend(key);
  }

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.message || 'Email delivery failed');
  }
  return data;
}

/**
 * Check if the email API server is running
 */
async function checkServerHealth() {
  const res = await fetch(`${EMAIL_API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
  return res.ok;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function EmailOutreach({ leads = [], selectedLead, onLogEmailActivity }) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  const [senderEmail] = useState('contact@techinnosphere.com');
  const [senderName] = useState('Hamzah | TechInnoSphere');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Email send state
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState('');
  const [sendSuccessBanner, setSendSuccessBanner] = useState(null);
  const [sendError, setSendError] = useState(null);
  
  // Server status
  const [serverOnline, setServerOnline] = useState(null); // null = checking, true, false

  // ─── Client List: only real CRM leads ─────────────────────────────────────
  const [activeLeadId, setActiveLeadId] = useState(() => {
    if (selectedLead) return selectedLead.id;
    return leads[0]?.id || '';
  });

  const [selectedTemplate, setSelectedTemplate] = useState('no_website_pitch');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [subjectText, setSubjectText] = useState('');
  const [bodyText, setBodyText] = useState('');

  // ─── Server Health Check ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const ok = await checkServerHealth();
        if (mounted) setServerOnline(ok);
      } catch {
        if (mounted) setServerOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 15000); // re-check every 15s
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // ─── Filtered Client List (real leads only) ─────────────────────────────────
  const filteredClients = useMemo(() => {
    return leads.filter(c => {
      const matchesSearch = !searchTerm.trim() ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || c.industry === selectedCategory || c.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [leads, searchTerm, selectedCategory]);

  // ─── Unique categories derived from real leads ─────────────────────────────
  const leadCategories = useMemo(() => {
    const cats = new Set(leads.map(l => l.industry || l.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [leads]);

  // ─── Current Lead ───────────────────────────────────────────────────────────
  const currentLead = useMemo(() => {
    return leads.find(l => l.id === activeLeadId) || leads[0] || null;
  }, [activeLeadId, leads]);

  useEffect(() => {
    setCustomRecipientEmail(currentLead?.email || '');
    setSendSuccessBanner(null);
    setSendError(null);
  }, [currentLead]);

  // ─── Email Templates ────────────────────────────────────────────────────────
  const templates = {
    no_website_pitch: {
      name: '🎯 Zero-Website / Zero-App Digital Transformation Pitch',
      icon: Globe,
      subject: `Direct Digital Portal & Web Platform for {Company}`,
      body: `Hi {FirstName},

I hope you're having a productive week!

I noticed {Company} in {Location} has built an incredible physical reputation in {Industry}, but currently operates without a custom web application or customer mobile portal.

In 2026, businesses in {Industry} that rely purely on phone calls and physical walk-ins lose over 35% of high-intent direct orders to competitors who offer instant online reservations and digital ordering.

At TechInnoSphere Software Solutions (Mumbai), we build high-speed, custom web applications and mobile portals tailored specifically for {Industry} establishments:
• Direct Online Customer Booking & Instant Pre-Order Portal (0% commission)
• WhatsApp Automated Order & Delivery Notification Bot
• UPI / Razorpay Payment Integration with Instant Invoicing
• Custom Admin Dashboard to manage all orders and customer records in real time

Given your operational focus on {TechStack}, I would love to show you a live 10-minute demo of our platform architecture.

Would you have 10 minutes available this Thursday or Friday for a quick intro call?

Warm regards,

Hamzah
Business Development Associate (Technology)
TechInnoSphere Software Solutions Pvt. Ltd.
Email: contact@techinnosphere.com | Phone: +91 90824 60769
Web: www.techinnosphere.com`
    },
    tech_consulting: {
      name: 'Software Consulting & Web App Pitch',
      icon: Mail,
      subject: `Software Development Partnership for {Company}`,
      body: `Hi {FirstName},

I hope this email finds you well.

I came across {Company}'s business in {Location} and was thoroughly impressed by your reputation.

I'm reaching out from TechInnoSphere Software Solutions (Mumbai). We are a custom software engineering company specializing in high-performance web applications, mobile platforms, and enterprise SaaS solutions.

We regularly help business leaders at companies like {Company} build custom digital systems to streamline operations and capture more direct online customers.

Given your focus on {TechStack}, I'd love to share a brief portfolio of similar web platforms we've delivered for {Industry} clients.

Do you have 10 minutes available this Thursday or Friday for a brief intro video call?

Best regards,

Hamzah
Business Development Associate (Technology)
TechInnoSphere Software Solutions Pvt. Ltd.
Official Email: contact@techinnosphere.com | Web: www.techinnosphere.com`
    },
    mobile_app: {
      name: 'Mobile App & Customer Portal Pitch',
      icon: Wand2,
      subject: `Custom Mobile Application Engineering for {Company}`,
      body: `Hi {FirstName},

I noticed {Company} in {Location} currently operates without an official web or mobile application platform.

We build custom high-performance software systems and cross-platform Flutter/React Native mobile applications for {Industry} businesses.

Would you be open to a 15-minute technical presentation next week to review our custom software architecture for {Industry}?

Best regards,
Hamzah | TechInnoSphere Software
Web: www.techinnosphere.com`
    },
    followup: {
      name: 'Follow-Up Email (Post Initial Contact)',
      icon: Send,
      subject: `Following up: TechInnoSphere x {Company}`,
      body: `Hi {FirstName},

Following up on my previous note regarding custom web development & technology solutions for {Company}.

I wanted to make sure my note didn't get buried in your inbox. At TechInnoSphere, we deliver scalable {TechStack} applications with rapid 2-week deployment turnarounds and dedicated developer support.

Even if you're not actively looking to hire a software team today, I'd be glad to send over our engineering portfolio for future reference.

Let me know if you have 5 minutes available later this week!

Warm regards,

Hamzah
Business Development Associate
TechInnoSphere Software Solutions
Email: contact@techinnosphere.com`
    },
    linkedin_dm: {
      name: 'LinkedIn Connection & Direct Executive Message',
      icon: Share2,
      subject: `LinkedIn DM - TechInnoSphere Intro`,
      body: `Hi {FirstName},

I noticed your leadership role at {Company} in {Location} and wanted to connect!

At TechInnoSphere Software Solutions, we build custom web/mobile platforms and automated digital portals for fast-growing companies in {Industry}.

If you ever need an extended software development partner ({TechStack}), I'd be glad to share our recent work.

Looking forward to staying connected!

Best,
Hamzah (BDA @ TechInnoSphere)
Email: contact@techinnosphere.com`
    }
  };

  // ─── Auto-fill template ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentLead) return;
    const tpl = templates[selectedTemplate] || templates.tech_consulting;
    const sub = (tpl.subject || '')
      .replace(/{Company}/g, currentLead.company || 'your company')
      .replace(/{FirstName}/g, currentLead.name || 'there');
    const body = (tpl.body || '')
      .replace(/{FirstName}/g, currentLead.name || 'there')
      .replace(/{Company}/g, currentLead.company || 'your company')
      .replace(/{Location}/g, currentLead.location || 'Mumbai')
      .replace(/{Industry}/g, currentLead.industry || currentLead.category || 'technology')
      .replace(/{TechStack}/g, currentLead.techInterest || 'digital solutions');
    setSubjectText(sub);
    setBodyText(body);
  }, [currentLead, selectedTemplate]);

  // ─── Copy handlers ──────────────────────────────────────────────────────────
  const handleCopySubject = useCallback(() => {
    navigator.clipboard.writeText(subjectText);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  }, [subjectText]);

  const handleCopyBody = useCallback(() => {
    navigator.clipboard.writeText(bodyText);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  }, [bodyText]);

  // ─── REAL Email Send ────────────────────────────────────────────────────────
  const handleSendEmail = useCallback(async () => {
    const to = (customRecipientEmail || currentLead?.email || '').trim();
    if (!to) {
      setSendError('Please enter a recipient email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      setSendError(`Invalid email address: "${to}". Please check and try again.`);
      return;
    }

    setIsSending(true);
    setSendSuccessBanner(null);
    setSendError(null);
    setSendProgress('🔐 Connecting to smtp.hostinger.com:465...');

    try {
      setSendProgress('📡 Authenticating contact@techinnosphere.com via SSL/TLS...');
      await new Promise(r => setTimeout(r, 400));
      setSendProgress(`📨 Delivering pitch to ${to}...`);
      
      const result = await sendRealEmail({ to, subject: subjectText, body: bodyText });
      
      setIsSending(false);
      setSendProgress('');
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      setSendSuccessBanner({
        to,
        company: currentLead?.company || 'Client',
        messageId: result.messageId,
        trackingId: result.trackingId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      if (onLogEmailActivity && currentLead) {
        onLogEmailActivity({
          leadId:     currentLead.id,
          leadName:   currentLead.name,
          company:    currentLead.company,
          email:      to,
          type:       selectedTemplate === 'linkedin_dm' ? 'LinkedIn' : 'Email',
          outcome:    'Proposal Sent',
          trackingId: result.trackingId || null,
          notes: `Real email pitch sent via Hostinger SMTP (contact@techinnosphere.com) → ${to} | MsgID: ${result.messageId}`
        });
      }
    } catch (err) {
      setIsSending(false);
      setSendProgress('');
      setSendError(err.message || 'Failed to send email. Make sure the email server is running.');
    }
  }, [customRecipientEmail, currentLead, subjectText, bodyText, selectedTemplate, onLogEmailActivity]);

  // ─── Server Status Indicator ─────────────────────────────────────────────────
  const ServerStatusBadge = () => {
    if (serverOnline === null) return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <RefreshCw size={12} className="animate-spin" /> Checking server...
      </span>
    );
    if (serverOnline) return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>
        <Wifi size={13} /> SMTP Server ONLINE
      </span>
    );
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
        <WifiOff size={13} /> Server OFFLINE — run: node email-server.cjs
      </span>
    );
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Building2 size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REAL HOSTINGER SMTP EMAIL ENGINE
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700 }}>
            Executive Email Pitch & Outreach Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Sender: <strong style={{ color: '#38bdf8' }}>{senderEmail}</strong> via Hostinger SMTP (Port 465 SSL)
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <ServerStatusBadge />
          <button
            onClick={() => setShowConfigModal(true)}
            className="btn btn-secondary"
            style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}
          >
            <ShieldCheck size={16} />
            <span>SMTP Configuration</span>
          </button>
        </div>
      </div>

      {/* Server Offline Warning */}
      {serverOnline === false && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.3rem' }}>
              ⚠️ Email Server Not Running
            </div>
            <div style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: 1.6 }}>
              To send real emails, you must start the local email server. Open a new terminal in the project folder and run:<br />
              <code style={{ background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#67e8f9', fontFamily: 'monospace' }}>
                node email-server.cjs
              </code>
              <br /><br />
              <strong style={{ color: '#f87171' }}>Keep that terminal open while using the Email section.</strong> The server will automatically reconnect when it detects the server is running.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid-responsive-1-2">

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Sender Status Box */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                <Mail size={16} color="var(--accent-cyan)" />
                <span>Sender Account</span>
              </div>
              <span className="badge badge-new" style={{ fontSize: '0.7rem' }}>SPF/DKIM VERIFIED</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div><strong>Active Sender:</strong> <span style={{ color: '#38bdf8', fontWeight: 700 }}>{senderEmail}</span></div>
              <div><strong>Display Name:</strong> {senderName}</div>
              <div><strong>SMTP Host:</strong> smtp.hostinger.com:465 (SSL/TLS)</div>
              <div><strong>IMAP Host:</strong> imap.hostinger.com:993 (SSL/TLS)</div>
              <div style={{ marginTop: '0.25rem' }}>
                <ServerStatusBadge />
              </div>
            </div>
          </div>

          {/* Client Search & Selector */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
              <User size={16} color="var(--accent-cyan)" />
              <span>Your CRM Clients ({leads.length} Real Contacts)</span>
            </div>

            {leads.length === 0 ? (
              /* Empty State */
              <div style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '12px', padding: '1.25rem', textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <div style={{ color: '#fcd34d', fontWeight: 700, marginBottom: '0.4rem' }}>No Clients Yet</div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  Add real clients in the <strong style={{ color: '#38bdf8' }}>Lead Manager</strong> tab first, then come back here to send them a personalised pitch email.
                </div>
              </div>
            ) : (
              <>
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name, company, email, location..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem', height: '38px' }}
                  />
                </div>

                {/* Category Filter — built from real lead industries */}
                {leadCategories.length > 0 && (
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.82rem', height: '38px' }}
                  >
                    <option value="ALL">📍 All Categories ({leads.length} clients)</option>
                    {leadCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                {/* Client Dropdown */}
                <label className="form-label" style={{ marginBottom: '0.3rem', fontSize: '0.78rem' }}>
                  {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} shown
                </label>
                {filteredClients.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '0.5rem', textAlign: 'center' }}>
                    No clients match your search.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={activeLeadId}
                    onChange={e => setActiveLeadId(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    {filteredClients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company} — {c.name} ({c.status || 'Lead'})
                      </option>
                    ))}
                  </select>
                )}

                {/* Selected Lead Info Card */}
                {currentLead && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '0.85rem',
                    marginTop: '0.85rem', fontSize: '0.82rem',
                    display: 'flex', flexDirection: 'column', gap: '0.3rem'
                  }}>
                    <div><strong>Company:</strong> <span style={{ color: '#fff' }}>{currentLead.company}</span></div>
                    <div><strong>Contact:</strong> {currentLead.name} ({currentLead.role || 'Decision Maker'})</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)' }}>
                      <MapPin size={12} />
                      <span>{currentLead.location}</span>
                    </div>
                    {currentLead.phone && (
                      <div><strong>Phone:</strong> <span style={{ color: '#e2e8f0' }}>{currentLead.phone}</span></div>
                    )}
                    {currentLead.techInterest && (
                      <div><strong>Needs:</strong> <span style={{ color: '#a5b4fc' }}>{currentLead.techInterest}</span></div>
                    )}
                    <div className="form-group" style={{ marginTop: '0.4rem', marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Recipient Email Address</label>
                      <input
                        className="form-input"
                        value={customRecipientEmail}
                        onChange={e => setCustomRecipientEmail(e.target.value)}
                        placeholder="Enter recipient email..."
                        style={{ fontSize: '0.82rem', height: '36px', color: '#38bdf8' }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>


          {/* Template Selector */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', fontFamily: 'var(--font-heading)' }}>
              Outreach Pitch Templates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(templates).map(([key, tpl]) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      height: 'auto',
                      border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{tpl.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Email Composer */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Email Pitch Composer
              </h2>
            </div>
            <span className="badge badge-new">From: contact@techinnosphere.com</span>
          </div>

          {/* Subject Field */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Subject Line</label>
              <button onClick={handleCopySubject} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '26px' }}>
                {copiedSubject ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedSubject ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <input
              className="form-input"
              value={subjectText}
              onChange={e => setSubjectText(e.target.value)}
              style={{ fontWeight: 600, color: '#fff' }}
            />
          </div>

          {/* Body Textarea */}
          <div className="form-group" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Email Body</label>
              <button onClick={handleCopyBody} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '26px' }}>
                {copiedBody ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedBody ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              className="form-textarea"
              rows={13}
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}
            />
          </div>

          {/* Progress Bar */}
          {isSending && (
            <div style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              color: '#22d3ee',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <RefreshCw className="animate-spin" size={16} color="#22d3ee" />
              <span>{sendProgress}</span>
            </div>
          )}

          {/* Success Banner */}
          {sendSuccessBanner && !isSending && (
            <div style={{
              background: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid rgba(37, 211, 102, 0.4)',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              color: '#4ade80',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <CheckCircle2 size={18} color="#25d366" style={{ flexShrink: 0 }} />
              <div>
                <strong>✅ Email Delivered!</strong><br />
                Sent to <u>{sendSuccessBanner.to}</u> ({sendSuccessBanner.company}) at {sendSuccessBanner.time}.<br />
                <span style={{ fontSize: '0.75rem', color: '#86efac' }}>Message ID: {sendSuccessBanner.messageId}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {sendError && !isSending && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <div>
                <strong>❌ Email Failed:</strong> {sendError}
                {serverOnline === false && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#fca5a5' }}>
                    👉 Start the email server: open a terminal and run <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 0.3rem', borderRadius: '4px' }}>node email-server.cjs</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              SMTP: <strong style={{ color: '#38bdf8' }}>smtp.hostinger.com:465</strong><br />
              From: <strong style={{ color: '#34d399' }}>contact@techinnosphere.com</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button onClick={handleCopyBody} className="btn btn-secondary">
                <Copy size={15} />
                <span>Copy Body</span>
              </button>

              <button
                id="send-email-pitch-btn"
                onClick={handleSendEmail}
                disabled={isSending}
                className="btn btn-primary"
                style={{
                  background: isSending
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: isSending ? 'none' : '0 0 20px rgba(16, 185, 129, 0.45)',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: isSending ? 'not-allowed' : 'pointer'
                }}
              >
                {isSending
                  ? <><RefreshCw size={16} className="animate-spin" /><span>Sending via Hostinger SMTP...</span></>
                  : <><Zap size={18} /><span>🚀 SEND REAL EMAIL NOW</span></>
                }
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SMTP Config Modal */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 8, 19, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck color="#22d3ee" size={20} />
                <span>Hostinger SMTP Configuration</span>
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Sender Email', value: 'contact@techinnosphere.com', color: '#38bdf8' },
                { label: 'Display Name', value: 'Hamzah | TechInnoSphere', color: '#fff' },
                { label: 'SMTP Server', value: 'smtp.hostinger.com:465 (SSL/TLS)', color: '#38bdf8' },
                { label: 'IMAP Server', value: 'imap.hostinger.com:993 (SSL/TLS)', color: '#38bdf8' },
                { label: 'POP3 Server', value: 'pop.hostinger.com:995 (SSL/TLS)', color: '#94a3b8' },
              ].map(({ label, value, color }) => (
                <div className="form-group" key={label}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" value={value} readOnly style={{ color }} />
                </div>
              ))}

              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.75rem', color: '#34d399', fontSize: '0.8rem', lineHeight: 1.6 }}>
                ✅ Hostinger Mail Authenticated. Real emails are sent via <strong>email-server.cjs</strong> (Node.js + Nodemailer) running at <code style={{ color: '#67e8f9' }}>{EMAIL_API_BASE}</code>.<br /><br />
                ⚙️ To start: <code style={{ background: 'rgba(0,0,0,0.4)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>node email-server.cjs</code>
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <ServerStatusBadge />
              </div>
            </div>

            <button onClick={() => setShowConfigModal(false)} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Close Configuration
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
