import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Check, 
  Send, 
  Calendar, 
  Award, 
  Building2, 
  UserCheck,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Share2,
  TrendingUp,
  Clock,
  PhoneCall,
  Mail,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Video,
  Trash2,
  Eye,
  MailOpen,
  MailCheck,
  RefreshCw,
  AlertCircle,
  Wifi
} from 'lucide-react';
import { generateEODReport } from '../utils/reportGenerator';
import { EMAIL_API_BASE } from '../utils/apiBase';

export default function DailyReporter({ leads = [], activities = [], meetings = [], onDeleteActivity, onDeleteMeeting }) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetPhone, setTargetPhone] = useState('9372015523');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'text'
  const [selectedMetricModal, setSelectedMetricModal] = useState(null);

  // ─── Email Open Tracking ──────────────────────────────────────────────────
  const [trackingModal, setTrackingModal] = useState(null);   // { act } or null
  const [trackingData, setTrackingData] = useState(null);     // API response
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  const fetchTrackingStatus = useCallback(async (act) => {
    setTrackingModal(act);
    setTrackingData(null);
    setTrackingError(null);

    if (!act.trackingId) {
      setTrackingError('No tracking ID for this email. Was it sent via the email server?');
      return;
    }
    setTrackingLoading(true);
    try {
      const res  = await fetch(`${EMAIL_API_BASE}/track/status/${act.trackingId}`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setTrackingData(data);
    } catch (err) {
      setTrackingError(err.message || 'Could not connect to tracking server.');
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysActivities = activities.filter(act => act.timestamp && act.timestamp.startsWith(todayStr));

  const callsTodayList = todaysActivities.filter(a => a.type === 'Call');
  const whatsappTodayList = todaysActivities.filter(a => a.type === 'WhatsApp');
  const emailsTodayList = todaysActivities.filter(a => a.type === 'Email' || a.type === 'LinkedIn');

  const callsToday = callsTodayList.length;
  const whatsappToday = whatsappTodayList.length;
  const emailsToday = emailsTodayList.length;
  const meetingsToday = meetings.length;

  const formattedReportText = generateEODReport({
    leads,
    activities,
    meetings,
    date: new Date(reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  });

  const handleCopyReport = () => {
    navigator.clipboard.writeText(formattedReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([formattedReportText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `TechInnoSphere_EOD_Report_${reportDate}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendWhatsAppEOD = () => {
    let cleanPhone = targetPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    const encodedText = encodeURIComponent(formattedReportText);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner Header */}
      <div className="glass-panel" style={{ 
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(15, 23, 42, 0.95))',
        borderColor: 'rgba(6, 182, 212, 0.35)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Building2 size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OFFICIAL DIRECTOR REPORTING AUTOMATION
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700, color: '#fff' }}>
            Executive End of Day (EOD) Performance Report
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Official daily business development summary formatted for Director Omar Khan. Click any KPI card to inspect exact records!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.85)', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Calendar size={15} color="var(--accent-cyan)" />
            <input 
              type="date"
              className="form-input"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.85rem' }}
            />
          </div>

          <button onClick={handleSendWhatsAppEOD} className="btn btn-whatsapp">
            <MessageSquare size={16} />
            <span>Send EOD to 9372015523</span>
          </button>

          <button onClick={handleCopyReport} className="btn btn-primary">
            {copied ? <Check size={16} color="#fff" /> : <Copy size={16} />}
            <span>{copied ? 'Report Copied!' : 'Copy Executive Report'}</span>
          </button>

          <button onClick={handleDownloadReport} className="btn btn-secondary">
            <Download size={16} />
            <span>Download Report (.TXT)</span>
          </button>
        </div>
      </div>

      {/* Main View Panel with Toggle */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.25rem', 
          borderBottom: '1px solid rgba(255,255,255,0.08)', 
          paddingBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Executive Live Presentation View
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* View Mode Buttons */}
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button 
                onClick={() => setViewMode('visual')}
                className={`btn btn-sm ${viewMode === 'visual' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: 'none' }}
              >
                📊 Visual Live Cards
              </button>
              <button 
                onClick={() => setViewMode('text')}
                className={`btn btn-sm ${viewMode === 'text' ? 'btn-whatsapp' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: 'none' }}
              >
                💬 WhatsApp Presentation Message
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
              <span>Director WhatsApp:</span>
              <input 
                className="form-input"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', width: '130px', height: '32px' }}
              />
            </div>
          </div>
        </div>

        {viewMode === 'visual' ? (
          /* Visual Presentation Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Header Document Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '14px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Building2 color="#22d3ee" size={24} />
                    <span>TechInnoSphere Software Solutions Private Limited</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    CIN: U62011MH2025PTC462587 • www.techinnosphere.com • team@techinnosphere.com
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-new" style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem' }}>
                    LIVE TRACKED EOD REPORT
                  </span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '0.3rem' }}>
                    Date: {new Date(reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Prepared By</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Hamzah</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>Business Development Associate</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Submitted To</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Omar Khan</div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399' }}>Director (+91 98200 99999)</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Target WhatsApp</div>
                  <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.95rem' }}>+91 {targetPhone}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Direct WhatsApp Recipient</div>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Clickable Performance KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              {/* Outbound Calls Card */}
              <div 
                onClick={() => setSelectedMetricModal('Call')}
                className="glass-panel-hover"
                style={{ 
                  background: 'rgba(15, 23, 42, 0.75)', 
                  border: '1px solid rgba(59, 130, 246, 0.35)', 
                  borderRadius: '12px', 
                  padding: '1.1rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Outbound Calls</div>
                  <PhoneCall size={16} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
                  {callsToday} Calls
                </div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{callsToday > 0 ? '✓ Live Calls Logged' : '⚡ Click to inspect'}</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* WhatsApp Pitches Card */}
              <div 
                onClick={() => setSelectedMetricModal('WhatsApp')}
                className="glass-panel-hover"
                style={{ 
                  background: 'rgba(15, 23, 42, 0.75)', 
                  border: '1px solid rgba(37, 211, 102, 0.35)', 
                  borderRadius: '12px', 
                  padding: '1.1rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp Pitches</div>
                  <MessageSquare size={16} color="#4ade80" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ade80', marginTop: '0.2rem' }}>
                  {whatsappToday} Dispatched
                </div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{whatsappToday > 0 ? '✓ Live WhatsApp Sent' : '⚡ Click to inspect'}</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Email Proposals Card */}
              <div 
                onClick={() => setSelectedMetricModal('Email')}
                className="glass-panel-hover"
                style={{ 
                  background: 'rgba(15, 23, 42, 0.75)', 
                  border: '1px solid rgba(6, 182, 212, 0.35)', 
                  borderRadius: '12px', 
                  padding: '1.1rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Proposals</div>
                  <Mail size={16} color="#22d3ee" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22d3ee', marginTop: '0.2rem' }}>
                  {emailsToday} Proposals
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{emailsToday > 0 ? '✓ Live Emails Dispatched' : '⚡ Click to inspect'}</span>
                  <ChevronRight size={13} />
                </div>
              </div>

              {/* Technical Presentations Card */}

              <div 
                onClick={() => setSelectedMetricModal('Meeting')}
                className="glass-panel-hover"
                style={{ 
                  background: 'rgba(15, 23, 42, 0.75)', 
                  border: '1px solid rgba(168, 85, 247, 0.35)', 
                  borderRadius: '12px', 
                  padding: '1.1rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Technical Presentations</div>

                  <Calendar size={16} color="#c084fc" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
                  {meetingsToday} Scheduled
                </div>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{meetingsToday > 0 ? '✓ Active Calendar Meetings' : '⚡ Click to inspect'}</span>
                  <ChevronRight size={13} />
                </div>
              </div>

            </div>

            {/* Live Today's Logged Activity Log */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} />
                <span>Today's Tracked Client Interactions ({todaysActivities.length})</span>
              </div>

              {todaysActivities.length === 0 ? (
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                  No activities recorded today yet. Start logging outbound calls, WhatsApp pitches, or email proposals to automatically build your live EOD report!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {todaysActivities.map((act, idx) => (
                    <div key={act.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 12, 24, 0.6)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.83rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{act.leadName}</span>
                        <span style={{ color: 'var(--text-subtle)' }}>({act.company})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-new">{act.type}</span>
                        {(act.type === 'Email' || act.type === 'LinkedIn') && act.outcome === 'Proposal Sent' ? (
                          <button
                            onClick={() => fetchTrackingStatus(act)}
                            title="Click to check if client opened this email"
                            style={{
                              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
                              border: '1px solid rgba(16,185,129,0.5)',
                              borderRadius: '20px',
                              color: '#34d399',
                              cursor: 'pointer',
                              padding: '0.2rem 0.65rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.4),rgba(6,182,212,0.4))'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.2))'; }}
                          >
                            <Eye size={11} />
                            <span>Proposal Sent — Track Open</span>
                          </button>
                        ) : (
                          <span className="badge badge-won">{act.outcome}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strategic Agenda & Action Items */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} />
                <span>Next Business Day Strategic Focus Areas</span>
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Conduct scheduled technical solution presentations with key retail, healthcare & logistics decision makers.</li>
                <li>Dispatch customized commercial proposals to client accounts expressing immediate software purchase intent.</li>
                <li>Maintain active phone and WhatsApp outreach across key Mumbai Western Line commercial hubs (Churchgate, Bandra, Andheri, Borivali, Virar).</li>
              </ul>
            </div>

          </div>
        ) : (
          /* High-End WhatsApp Presentation Chat Card UI/UX */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* WhatsApp Header Container Bar */}
            <div style={{
              background: 'linear-gradient(135deg, #075e54, #128c7e)',
              borderRadius: '14px 14px 0 0',
              padding: '1rem 1.35rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#25d366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                  OK
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    Director Omar Khan
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span>Direct WhatsApp Target (+91 {targetPhone})</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleCopyReport} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Message'}</span>
                </button>
                <button onClick={handleSendWhatsAppEOD} className="btn btn-sm" style={{ background: '#25d366', color: '#fff', border: 'none', fontWeight: 700 }}>
                  <MessageSquare size={14} />
                  <span>Send Direct WhatsApp</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Message Bubble Frame */}
            <div style={{
              background: 'rgba(6, 12, 24, 0.95)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              borderRadius: '0 0 14px 14px',
              padding: '1.75rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                background: 'rgba(15, 26, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#e2e8f0',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.92rem',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {formattedReportText}
              </div>

              {/* Bottom Quick Dispatch Footer Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Formatted for 1-click dispatch to <strong style={{ color: '#4ade80' }}>+91 {targetPhone}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleCopyReport} className="btn btn-secondary">
                    {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Formatted Text'}</span>
                  </button>

                  <button onClick={handleSendWhatsAppEOD} className="btn btn-whatsapp">
                    <MessageSquare size={16} />
                    <span>Dispatch WhatsApp Message</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* KPI Inspection Modal Popup */}
      {selectedMetricModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 8, 19, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedMetricModal === 'Call' && <PhoneCall color="#60a5fa" size={20} />}
                {selectedMetricModal === 'WhatsApp' && <MessageSquare color="#4ade80" size={20} />}
                {selectedMetricModal === 'Email' && <Mail color="#22d3ee" size={20} />}
                {selectedMetricModal === 'Meeting' && <Calendar color="#c084fc" size={20} />}
                <span>
                  {selectedMetricModal === 'Call' && `Tracked Calls Today (${callsToday})`}
                  {selectedMetricModal === 'WhatsApp' && `Tracked WhatsApp Pitches (${whatsappToday})`}
                  {selectedMetricModal === 'Email' && `Tracked Email Proposals (${emailsToday})`}
                  {selectedMetricModal === 'Meeting' && `Scheduled Technical Meetings (${meetingsToday})`}
                </span>
              </h3>
              <button onClick={() => setSelectedMetricModal(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedMetricModal === 'Meeting' ? (
                meetings.length === 0 ? (
                  <div style={{ color: 'var(--text-subtle)', padding: '1.5rem', textAlign: 'center' }}>
                    No technical presentations scheduled yet.
                  </div>
                ) : (
                  meetings.map((m, idx) => (
                    <div key={m.id || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{m.leadName} ({m.company})</div>
                          <div style={{ color: '#c084fc', fontSize: '0.78rem', marginTop: '0.2rem' }}>📅 {m.date} at {m.time} • {m.topic}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>🔗 {m.meetUrl || 'https://meet.google.com/new'}</div>
                        </div>
                        {onDeleteMeeting && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete meeting with ${m.leadName} (${m.company})?`)) {
                                onDeleteMeeting(m.id);
                              }
                            }}
                            title="Delete this meeting"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              borderRadius: '8px',
                              color: '#f87171',
                              cursor: 'pointer',
                              padding: '0.35rem 0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.75rem',
                              flexShrink: 0,
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.borderColor = '#f87171'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                (selectedMetricModal === 'Call' ? callsTodayList : selectedMetricModal === 'WhatsApp' ? whatsappTodayList : emailsTodayList).length === 0 ? (
                  <div style={{ color: 'var(--text-subtle)', padding: '1.5rem', textAlign: 'center' }}>
                    No {selectedMetricModal.toLowerCase()} activities recorded for today yet.
                  </div>
                ) : (
                  (selectedMetricModal === 'Call' ? callsTodayList : selectedMetricModal === 'WhatsApp' ? whatsappTodayList : emailsTodayList).map((act, idx) => (
                    <div key={act.id || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#fff', flex: 1 }}>{act.leadName} ({act.company})</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {selectedMetricModal === 'Email' && act.outcome === 'Proposal Sent' ? (
                            <button
                              onClick={() => fetchTrackingStatus(act)}
                              title="Check if client opened this email"
                              style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
                                border: '1px solid rgba(16,185,129,0.5)',
                                borderRadius: '20px',
                                color: '#34d399',
                                cursor: 'pointer',
                                padding: '0.25rem 0.7rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.4),rgba(6,182,212,0.4))'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.2))'; }}
                            >
                              <Eye size={11} />
                              <span>Proposal Sent — Track Open</span>
                            </button>
                          ) : (
                            <span className="badge badge-won">{act.outcome}</span>
                          )}
                          {onDeleteActivity && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete this ${selectedMetricModal} entry for ${act.leadName}?`)) {
                                  onDeleteActivity(act.id);
                                }
                              }}
                              title="Delete this entry"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                borderRadius: '8px',
                                color: '#f87171',
                                cursor: 'pointer',
                                padding: '0.35rem 0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.75rem',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.borderColor = '#f87171'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>{act.notes || 'Activity logged.'}</div>
                      <div style={{ color: 'var(--text-subtle)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                        Timestamp: {new Date(act.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedMetricModal(null)} className="btn btn-primary btn-sm">
                Close Inspection Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Email Open Tracking Modal ─────────────────────────────────────── */}
      {trackingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 8, 19, 0.88)', backdropFilter: 'blur(10px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Eye size={18} color="var(--accent-cyan)" />
                Email Open Tracking
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => fetchTrackingStatus(trackingModal)}
                  className="btn btn-secondary btn-sm"
                  disabled={trackingLoading}
                  title="Refresh tracking status"
                >
                  <RefreshCw size={13} className={trackingLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button onClick={() => { setTrackingModal(null); setTrackingData(null); setTrackingError(null); }} className="btn btn-secondary btn-sm">✕</button>
              </div>
            </div>

            {/* Recipient Info */}
            <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong style={{ color: '#94a3b8' }}>Recipient:</strong> <span style={{ color: '#fff', fontWeight: 700 }}>{trackingModal.leadName}</span> <span style={{ color: 'var(--text-subtle)' }}>({trackingModal.company})</span></div>
              <div><strong style={{ color: '#94a3b8' }}>Email sent to:</strong> <span style={{ color: '#38bdf8' }}>{trackingModal.email || trackingModal.notes?.match(/→\s*([^\s|]+)/)?.[1] || 'N/A'}</span></div>
              <div><strong style={{ color: '#94a3b8' }}>Sent at:</strong> <span style={{ color: '#e2e8f0' }}>{new Date(trackingModal.timestamp).toLocaleString()}</span></div>
              {trackingModal.trackingId && <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>Tracking ID: {trackingModal.trackingId}</div>}
            </div>

            {/* Loading */}
            {trackingLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#38bdf8', padding: '1rem', justifyContent: 'center' }}>
                <RefreshCw size={18} className="animate-spin" />
                <span style={{ fontSize: '0.9rem' }}>Checking tracking server...</span>
              </div>
            )}

            {/* Error */}
            {trackingError && !trackingLoading && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <strong>Tracking Unavailable:</strong> {trackingError}
                  {!trackingModal.trackingId && (
                    <div style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                      💡 Only emails sent via <strong>🚀 SEND REAL EMAIL NOW</strong> button have tracking. Old entries don't have tracking IDs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Data */}
            {trackingData && !trackingLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Open Status Hero Card */}
                <div style={{
                  background: trackingData.opened
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.18))'
                    : 'rgba(15, 23, 42, 0.7)',
                  border: trackingData.opened
                    ? '1px solid rgba(16,185,129,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', padding: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                  <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                    {trackingData.opened ? '👁️' : '📨'}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: trackingData.opened ? '#34d399' : '#94a3b8' }}>
                      {trackingData.opened ? '✅ Email Opened!' : '⏳ Not Opened Yet'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {trackingData.opened
                        ? `Client opened this email ${trackingData.openCount} time${trackingData.openCount !== 1 ? 's' : ''}`
                        : 'Client has not opened the email yet'}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {[
                    { label: 'Total Opens', value: trackingData.openCount || 0, color: '#38bdf8' },
                    { label: 'Status', value: trackingData.opened ? 'READ' : 'UNREAD', color: trackingData.opened ? '#34d399' : '#f59e0b' },
                    { label: 'First Opened', value: trackingData.firstOpenAt ? new Date(trackingData.firstOpenAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—', color: '#e2e8f0' },
                    { label: 'Last Opened',  value: trackingData.lastOpenAt  ? new Date(trackingData.lastOpenAt).toLocaleString('en-IN',  { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—', color: '#e2e8f0' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color }}>{String(value)}</div>
                    </div>
                  ))}
                </div>

                {/* Opens Timeline */}
                {trackingData.opens && trackingData.opens.length > 0 && (
                  <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Events Timeline</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                      {trackingData.opens.map((ev, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ color: '#34d399', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                          <div>
                            <span style={{ color: '#e2e8f0' }}>{new Date(ev.openedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
                            <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.1rem' }}>{(ev.userAgent || 'Unknown').substring(0, 65)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!trackingData.opened && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#fcd34d', lineHeight: 1.6 }}>
                    💡 <strong>Note:</strong> Tracking works when the client loads images in their email. Some clients (e.g. Gmail) block tracking pixels by default. Click <strong>Refresh</strong> to re-check.
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setTrackingModal(null); setTrackingData(null); setTrackingError(null); }} className="btn btn-primary">
                Close Tracking Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}