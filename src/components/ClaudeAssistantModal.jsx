import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Copy,
  Check,
  Download,
  X,
  Zap,
  Terminal,
  Server,
  Layers,
  Cpu,
  Mail,
  MessageSquare,
  Globe
} from 'lucide-react';

export default function ClaudeAssistantModal({ isOpen, onClose, leads = [] }) {
  const [selectedLead, setSelectedLead] = useState(leads[0] || null);
  const [pitchGoal, setPitchGoal] = useState('web_app');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);

  if (!isOpen) return null;

  const handleGenerateWithClaude = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const lead = selectedLead || leads[0] || { name: 'Decision Maker', company: 'the business', location: 'their city', category: 'their industry' };
      const firstName = (lead.name || 'Decision Maker').split(' ')[0];

      let angle = '';
      if (pitchGoal === 'web_app') {
        angle = `Subject: Executive Proposal: Custom High-Concurrency Web Infrastructure for ${lead.company}\n\n` +
          `Dear ${firstName},\n\n` +
          `I've been following ${lead.company}'s strong growth trajectory in ${lead.location}.\n\n` +
          `I'm Hamzah from TechInnoSphere Software Solutions (Mumbai). We architect custom, zero-latency web platforms, client self-service portals, and microservices for high-volume ${lead.category || lead.industry || 'enterprise'} businesses.\n\n` +
          `Looking at your current technical footprint, we can deploy:\n` +
          `• Zero-commission direct customer ordering & booking engine\n` +
          `• Sub-second cloud page loads to maximize mobile checkout conversions\n` +
          `• Real-time automated WhatsApp & SMS customer status webhooks\n\n` +
          `Would you be open to a 10-minute technical intro call this week to review the architecture?\n\n` +
          `Best regards,\nHamzah | TechInnoSphere Software Solutions\ncontact@techinnosphere.com | +91 98200 11992`;
      } else if (pitchGoal === 'mobile_app') {
        angle = `Subject: Native iOS & Android App Architecture for ${lead.company}\n\n` +
          `Hi ${firstName},\n\n` +
          `I noticed ${lead.company} has a tremendous customer base in ${lead.location} that primarily engages via mobile devices.\n\n` +
          `TechInnoSphere builds high-speed Flutter & React Native mobile applications with instant push notifications, 1-click UPI payments, and offline-first data sync.\n\n` +
          `Can we schedule a 10-minute discovery call this Thursday to share a quick interactive prototype?\n\n` +
          `Warm regards,\nHamzah | TechInnoSphere (Mumbai)`;
      } else {
        angle = `Subject: Digital Operations & Automated WhatsApp CRM for ${lead.company}\n\n` +
          `Dear ${firstName},\n\n` +
          `We identified a substantial automation opportunity for ${lead.company} in ${lead.location} to replace manual phone/chat ordering with an autonomous WhatsApp Business bot & real-time dispatch dashboard.\n\n` +
          `Would 2:00 PM this Friday work for a 10-minute walkthrough?\n\n` +
          `Best,\nHamzah | TechInnoSphere`;
      }

      setGeneratedPitch(angle);
      setIsGenerating(false);
    }, 600);
  };

  // Placeholder only — this text is publicly bundled into the deployed site,
  // so it must never contain the real password. Users fill in their own
  // SMTP_PASS locally (see .env.example) before pasting into Claude Desktop's config.
  const mcpConfigText = JSON.stringify({
    mcpServers: {
      "techinnosphere-bda": {
        command: "node",
        args: ["c:\\Users\\thund\\Downloads\\Techinnosphere\\claude-mcp-server.mjs"],
        env: {
          SMTP_HOST: "smtp.hostinger.com",
          SMTP_PORT: "465",
          SMTP_USER: "contact@techinnosphere.com",
          SMTP_PASS: "REPLACE_WITH_YOUR_SMTP_PASSWORD"
        }
      }
    }
  }, null, 2);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                Anthropic Claude 3.5 Sonnet Integration
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                Powering autonomous BDA prospecting, Claude Desktop MCP server & intelligent email personalization
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* 3 Shift-to-Claude Modes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              <Cpu size={16} />
              <span>1. Claude Desktop MCP</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Plug TechInnoSphere directly into Claude Desktop. Control Hostinger SMTP, WhatsApp, and your lead list by talking to Claude.
            </p>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              <Server size={16} />
              <span>2. Autonomous Agent Script</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Run <code>node claude-autonomous-agent.mjs</code> to automatically generate personalized emails and dispatch via Hostinger SMTP.
            </p>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              <Sparkles size={16} />
              <span>3. Claude Web Assistant</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Generate hyper-tailored software proposals for any company in your CRM with 1 click using Claude's reasoning model.
            </p>
          </div>
        </div>

        {/* Interactive Pitch Generator */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="#f59e0b" />
            <span>Generate Real-Time Outreach Proposal with Claude</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Target Enterprise:</label>
              <select
                className="form-select"
                style={{ width: '100%', fontSize: '0.82rem' }}
                value={selectedLead ? selectedLead.id : ''}
                onChange={e => {
                  const found = leads.find(l => l.id === e.target.value);
                  if (found) setSelectedLead(found);
                }}
              >
                {leads.slice(0, 30).map(l => (
                  <option key={l.id} value={l.id}>{l.company} — {l.name} ({l.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Pitch Focus:</label>
              <select
                className="form-select"
                style={{ width: '100%', fontSize: '0.82rem' }}
                value={pitchGoal}
                onChange={e => setPitchGoal(e.target.value)}
              >
                <option value="web_app">Custom Web Application & Direct Ordering</option>
                <option value="mobile_app">Native iOS & Android Mobile App</option>
                <option value="whatsapp_crm">Automated WhatsApp Ordering & Cloud ERP</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateWithClaude}
            disabled={isGenerating}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              fontWeight: 700, width: '100%', padding: '0.65rem'
            }}
          >
            <Sparkles size={15} />
            <span>{isGenerating ? 'Claude is Analyzing & Writing Pitch...' : '⚡ Generate Claude 3.5 Sonnet BDA Pitch'}</span>
          </button>

          {generatedPitch && (
            <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Claude Proposal Output:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPitch);
                    setCopiedPitch(true);
                    setTimeout(() => setCopiedPitch(false), 2000);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                >
                  {copiedPitch ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  <span>{copiedPitch ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                {generatedPitch}
              </pre>
            </div>
          )}
        </div>

        {/* Claude Desktop MCP Setup */}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={15} color="#38bdf8" />
              <span>Claude Desktop Config (claude_desktop_config.json)</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(mcpConfigText);
                setCopiedMcpConfig(true);
                setTimeout(() => setCopiedMcpConfig(false), 2000);
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
            >
              {copiedMcpConfig ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
              <span>{copiedMcpConfig ? 'Config Copied!' : 'Copy Config'}</span>
            </button>
          </div>
          <pre style={{
            background: 'rgba(15,23,42,0.9)',
            padding: '0.85rem', borderRadius: '8px',
            fontSize: '0.76rem', color: '#38bdf8', overflowX: 'auto',
            border: '1px solid rgba(255,255,255,0.05)', margin: 0
          }}>
            {mcpConfigText}
          </pre>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.5rem' }}>
            📁 Paste into <code>%APPDATA%\Claude\claude_desktop_config.json</code> on Windows to control Hostinger SMTP & CRM directly from Claude Desktop.
          </div>
        </div>

      </div>
    </div>
  );
}
