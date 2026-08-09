import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin,
  Users, 
  PhoneCall, 
  Mail, 
  MessageSquare,
  Calendar, 
  FileText, 
  Building2,
  RefreshCw,
  Share2,
  Download,
  Smartphone,
  Bot
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onResetData, leadsCount, onOpenClaudeModal }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallAppClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install as a mobile app:\n\n• On iPhone (Safari): Tap Share button -> "Add to Home Screen"\n• On Android (Chrome): Tap 3-dots menu -> "Install App" or "Add to Home Screen"');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prospector', label: 'Nearby', icon: MapPin, highlight: true },
    { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
    { id: 'leads', label: 'CRM', icon: Users, badge: leadsCount },
    { id: 'coldcall', label: 'Calls', icon: PhoneCall },
    { id: 'outreach', label: 'Emails', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, whatsappStyle: true },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'reporter', label: 'EOD', icon: FileText },
  ];



  const mobileBottomItems = [
    { id: 'prospector', label: 'Nearby', icon: MapPin },
    { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
    { id: 'leads', label: 'CRM', icon: Users, badge: leadsCount },
    { id: 'coldcall', label: 'Call', icon: PhoneCall },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'reporter', label: 'EOD', icon: FileText },
    { id: 'dashboard', label: 'More', icon: LayoutDashboard },
  ];


  return (
    <>
      {/* Main Top Header */}
      <header className="app-header">
        <div className="header-content">
          
          {/* Brand Logo & Tagline Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div className="brand-icon">
              <Building2 size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                <span className="gradient-text" style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  TechInnoSphere
                </span>
                <span className="badge badge-new" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', textTransform: 'uppercase' }}>
                  BDA Suite
                </span>
              </div>
              <div className="brand-subtext" style={{ fontSize: '0.62rem', whiteSpace: 'nowrap', marginTop: '0.05rem', color: 'var(--text-muted)' }}>
                From Vision To Software We Build It All
              </div>
            </div>
          </div>

          {/* Desktop Center Nav Tabs Bar (Hidden on Mobile < 768px via CSS) */}
          <nav className="desktop-nav-tabs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    height: '32px',
                    padding: '0 0.4rem',
                    whiteSpace: 'nowrap',
                    border: isActive ? 'none' : 'transparent',
                    background: isActive 
                      ? item.whatsappStyle
                        ? 'linear-gradient(135deg, #25d366, #128c7e)'
                        : item.id === 'linkedin'
                        ? 'linear-gradient(135deg, #0a66c2, #0077b5)'
                        : 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                      : item.whatsappStyle
                      ? 'rgba(37, 211, 102, 0.15)'
                      : item.highlight 
                      ? 'rgba(6, 182, 212, 0.15)' 
                      : item.id === 'linkedin'
                      ? 'rgba(10, 102, 194, 0.15)'
                      : 'transparent',
                    color: isActive ? '#fff' : item.whatsappStyle ? '#4ade80' : item.highlight ? '#22d3ee' : item.id === 'linkedin' ? '#38bdf8' : 'var(--text-muted)',
                    fontSize: '0.73rem',
                    fontWeight: isActive ? 700 : 600,
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    flexShrink: 0
                  }}
                >
                  <Icon size={13} style={{ flexShrink: 0 }} />


                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{ 
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(59, 130, 246, 0.25)', 
                      color: isActive ? '#fff' : '#60a5fa', 
                      borderRadius: '9999px', 
                      padding: '0.08rem 0.4rem', 
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      lineHeight: 1
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Profile & Install App Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            
            <button 
              onClick={onOpenClaudeModal}
              className="btn btn-secondary btn-sm"
              style={{ 
                height: '32px',
                padding: '0 0.65rem',
                fontSize: '0.73rem',
                fontWeight: 700,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(180, 83, 9, 0.3))',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Anthropic Claude 3.5 Sonnet BDA Assistant"
            >
              <Bot size={13} />
              <span>Claude AI</span>
            </button>

            <button 
              onClick={handleInstallAppClick}
              className="btn btn-whatsapp btn-sm install-app-btn"
              style={{ 
                height: '32px',
                padding: '0 0.5rem',
                fontSize: '0.73rem',
                fontWeight: 700,
                borderRadius: '8px'
              }}
              title="Install Native App on Phone / PC"
            >
              <Smartphone size={13} />
              <span className="install-app-text">Install App</span>
            </button>

            <div className="desktop-user-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(24, 34, 58, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              height: '32px',
              padding: '0 0.5rem',
              borderRadius: '8px',
              fontSize: '0.73rem',
              whiteSpace: 'nowrap'
            }}>
              <div className="pulse-dot" style={{ flexShrink: 0 }}></div>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>Hamzah (BDA)</div>
            </div>


            <button 
              onClick={onResetData} 
              title="Reset Data" 
              className="btn btn-secondary btn-sm"
              style={{ 
                height: '34px',
                width: '34px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                borderRadius: '8px',
                flexShrink: 0
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Fixed Bottom App Bar (< 768px) */}
      <nav className="mobile-bottom-appbar">
        {mobileBottomItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-tab-btn ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '6px',
                  background: '#3b82f6',
                  color: '#fff',
                  borderRadius: '9999px',
                  fontSize: '0.6rem',
                  padding: '0.05rem 0.3rem',
                  fontWeight: 800
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </>
  );
}
