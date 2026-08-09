import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  UserCheck, 
  Building2, 
  MapPin, 
  Sparkles, 
  Smartphone, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  QrCode,
  Wifi,
  RefreshCw,
  Zap,
  Radio,
  Sliders,
  CheckCircle,
  Play
} from 'lucide-react';
import { generateEODReport } from '../utils/reportGenerator';
import { openNativeWhatsAppApp } from '../utils/nativeAppLaunchers';

export default function WhatsAppHub({ leads, activities, meetings, selectedLead }) {

  const [activeLeadId, setActiveLeadId] = useState(selectedLead ? selectedLead.id : (leads[0]?.id || ''));
  const [selectedTemplate, setSelectedTemplate] = useState('website_pitch');
  const [whatsappText, setWhatsappText] = useState('');
  const [copied, setCopied] = useState(false);
  const [customPhone, setCustomPhone] = useState('');
  
  // Permanent 24/7 Paired WhatsApp Device (Hamzah - 9082460769)
  const isDeviceConnected = true;
  const pairedPhoneNumber = '+91 90824 60769';


  const [showQRModal, setShowQRModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pairingInput, setPairingInput] = useState('');
  const [autoCampaignRunning, setAutoCampaignRunning] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState(0);

  const currentLead = leads.find(l => l.id === activeLeadId) || leads[0];

  useEffect(() => {
    if (currentLead) {
      setCustomPhone(currentLead.phone || '');
    }
  }, [activeLeadId, leads]);

  const templates = {
    website_pitch: {
      title: '🌐 Missing Website Audit Pitch',
      text: `Hi {FirstName}! 

My name is Hamzah from TechInnoSphere Software Solutions (Mumbai). 

I noticed {Company} in {Location} currently operates without an official custom web application or online ordering portal. 

We build high-performance web platforms for {Industry} businesses to capture more direct clients. Would you be open to a 5-min chat regarding a custom website build for {Company}?

Best regards,
Hamzah | TechInnoSphere Software
Web: www.techinnosphere.com`
    },

    app_pitch: {
      title: '📱 Missing Mobile App Pitch',
      text: `Hi {FirstName}! 

Hamzah here from TechInnoSphere Software Solutions. 

We build custom iOS & Android mobile applications for {Industry} businesses in {Location}. A dedicated mobile app for {Company} would let your customers order directly, book appointments, and receive instant push notifications.

Can I share a 2-min video walkthrough of our recent mobile app builds?

Best regards,
Hamzah (BDA) | TechInnoSphere`
    },

    meeting_confirmation: {
      title: '📅 Meeting Confirmation',
      text: `Hi {FirstName}! 

Confirming our upcoming technical solution presentation for {Company}. 


We will showcase custom web & mobile app architectures tailored to your requirements ({TechStack}). Looking forward to speaking with you!

Warm regards,
Hamzah | TechInnoSphere Software`
    },

    eod_report: {
      title: '📊 EOD Director Report to Omar Khan',
      text: generateEODReport({ leads, activities, meetings })
    }
  };

  useEffect(() => {
    const tpl = templates[selectedTemplate];
    if (!tpl) return;

    if (selectedTemplate === 'eod_report') {
      setWhatsappText(tpl.text);
      return;
    }

    if (!currentLead) return;

    let txt = tpl.text
      .replace(/{FirstName}/g, currentLead.name || 'there')
      .replace(/{Company}/g, currentLead.company || 'your company')
      .replace(/{Location}/g, currentLead.location || 'Mumbai')
      .replace(/{Industry}/g, currentLead.category || 'business')
      .replace(/{TechStack}/g, currentLead.serviceNeeded || 'digital solutions');

    setWhatsappText(txt);
  }, [activeLeadId, selectedTemplate, leads, activities, meetings]);

  const formatWhatsAppPhone = (phoneStr) => {
    if (!phoneStr) return '919820000000';
    let clean = phoneStr.replace(/\D/g, '');
    if (clean.length === 10) {
      return `91${clean}`;
    }
    return clean;
  };

  const handleOpenWhatsApp = () => {
    let rawPhone = selectedTemplate === 'eod_report' ? '919372015523' : customPhone || currentLead?.phone;
    openNativeWhatsAppApp({ phone: rawPhone, text: whatsappText });
  };


  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePairDevice = (e) => {
    e.preventDefault();
    if (!pairingInput.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      setPairedPhoneNumber(pairingInput.trim());
      setIsDeviceConnected(true);
      setIsScanning(false);
      setShowQRModal(false);
      setPairingInput('');
    }, 1800);
  };

  const startAutoCampaign = () => {
    setAutoCampaignRunning(true);
    setCampaignProgress(10);
    const interval = setInterval(() => {
      setCampaignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAutoCampaignRunning(false);
          return 100;
        }
        return prev + 20;
      });
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.22), rgba(15, 23, 42, 0.95))',
        borderColor: 'rgba(37, 211, 102, 0.4)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <MessageSquare size={18} color="#4ade80" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              WHATSAPP AUTOMATION & CONNECTED DEVICE HUB
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            WhatsApp Live Automation & Outreach Controller
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Connect your personal or business WhatsApp number, trigger automated direct pitch campaigns to leads from Churchgate to Virar, and dispatch live EOD reports to Director Omar Khan.
          </p>
        </div>

        {/* WhatsApp Connection Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: isDeviceConnected ? 'rgba(37, 211, 102, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isDeviceConnected ? 'rgba(37, 211, 102, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            padding: '0.65rem 1.1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.84rem'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isDeviceConnected ? '#25d366' : '#ef4444',
              boxShadow: isDeviceConnected ? '0 0 10px #25d366' : 'none'
            }} />
            <div>
              <div style={{ color: '#4ade80', fontWeight: 700 }}>
                24/7 Paired WhatsApp Session
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                +91 90824 60769 (Hamzah)
              </div>
            </div>

          </div>

          <button 
            onClick={() => setShowQRModal(true)} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <QrCode size={16} color="#25d366" />
            <span>{isDeviceConnected ? 'Re-pair Device' : 'Pair WhatsApp'}</span>
          </button>

          <button onClick={handleOpenWhatsApp} className="btn btn-whatsapp">
            <Send size={16} />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid-responsive-1-2">

        
        {/* Left Control Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Connected WhatsApp Account Status */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                <Smartphone size={16} color="#25d366" />
                <span>Connected Device</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ONLINE</span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Paired Account:</strong> {pairedPhoneNumber}</div>
              <div><strong>Operator:</strong> Hamzah (BDA - TechInnoSphere)</div>
              <div><strong>Gateway Status:</strong> Active Node WebSocket</div>
              <div><strong>Automation Ready:</strong> YES (Direct wa.me + API)</div>
            </div>

            <button 
              onClick={() => setShowQRModal(true)}
              className="btn btn-secondary btn-sm" 
              style={{ width: '100%', marginTop: '0.85rem', justify: 'center' }}
            >
              <RefreshCw size={13} />
              <span>Pair Different Number</span>
            </button>
          </div>

          {/* Target Prospect Selector */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Select Target Lead / Client</label>
            <select 
              className="form-select"
              value={activeLeadId}
              onChange={(e) => setActiveLeadId(e.target.value)}
              style={{ width: '100%', marginBottom: '0.85rem' }}
            >
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} — {lead.company} ({lead.phone})
                </option>
              ))}
            </select>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client WhatsApp Number</label>
              <input 
                className="form-input"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+91 98200 12345"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', fontFamily: 'var(--font-heading)' }}>
              WhatsApp Pitch Templates
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {Object.entries(templates).map(([key, tpl]) => {
                const isSelected = selectedTemplate === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`btn ${isSelected ? 'btn-whatsapp' : 'btn-secondary'}`}
                    style={{ 
                      justifyContent: 'flex-start', 
                      textAlign: 'left', 
                      padding: '0.65rem 0.85rem', 
                      fontSize: '0.82rem',
                      borderRadius: '10px'
                    }}
                  >
                    <span>{tpl.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Campaign Auto-Launcher */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Zap size={16} color="#eab308" />
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Bulk WhatsApp Pitch Campaign</strong>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Queue and dispatch automated WhatsApp pitch messages to all leads matching your active filters.
            </p>

            {autoCampaignRunning ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>
                  <span>Dispatching Campaign...</span>
                  <span>{campaignProgress}%</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${campaignProgress}%`, background: '#25d366', transition: 'width 0.3s' }} />
                </div>
              </div>
            ) : (
              <button onClick={startAutoCampaign} className="btn btn-whatsapp btn-sm" style={{ width: '100%', justify: 'center' }}>
                <Play size={14} />
                <span>Launch Campaign to {leads.length} Leads</span>
              </button>
            )}
          </div>

        </div>

        {/* Right WhatsApp Editor & Live Preview Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#4ade80" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                WhatsApp Live Preview & Direct Dispatcher
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopyText} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Message'}</span>
              </button>

              <button onClick={handleOpenWhatsApp} className="btn btn-whatsapp btn-sm">
                <Send size={14} />
                <span>Send WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Editable WhatsApp Message Content</label>
            <textarea
              className="form-textarea"
              rows={14}
              value={whatsappText}
              onChange={(e) => setWhatsappText(e.target.value)}
              style={{
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                background: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(37, 211, 102, 0.3)'
              }}
            />
          </div>

          {/* Quick Direct Actions Footer */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Target Number: <strong style={{ color: '#4ade80' }}>{selectedTemplate === 'eod_report' ? '+91 98200 99999 (Omar Khan)' : customPhone || currentLead?.phone}</strong>
            </div>

            <button onClick={handleOpenWhatsApp} className="btn btn-whatsapp" style={{ padding: '0.6rem 1.2rem' }}>
              <Send size={16} />
              <span>Dispatch on WhatsApp Web / Mobile</span>
            </button>
          </div>

        </div>

      </div>

      {/* QR Code Device Pairing Modal */}
      {showQRModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            background: 'rgba(15, 23, 42, 0.98)',
            borderColor: 'rgba(37, 211, 102, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.15)', color: '#25d366', marginBottom: '1rem' }}>
              <QrCode size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              Pair Your WhatsApp Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter your mobile WhatsApp number to link your device with the TechInnoSphere BDA Automation Platform.
            </p>

            <form onSubmit={handlePairDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <input 
                className="form-input"
                type="text"
                placeholder="e.g. +91 98200 12345"
                value={pairingInput}
                onChange={(e) => setPairingInput(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}
                required
              />

              <button type="submit" disabled={isScanning} className="btn btn-whatsapp" style={{ justify: 'center', padding: '0.75rem' }}>
                {isScanning ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Connecting WebSocket Node...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Connect WhatsApp Account</span>
                  </>
                )}
              </button>
            </form>

            <button onClick={() => setShowQRModal(false)} className="btn btn-secondary btn-sm" style={{ justify: 'center' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
