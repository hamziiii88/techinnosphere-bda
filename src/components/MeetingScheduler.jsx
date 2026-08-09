import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  PhoneCall, 
  FileCheck,
  Building2,
  Trash2,
  Download,
  MessageSquare,
  Video,
  Search,
  ExternalLink,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { REAL_MUMBAI_PROSPECTS } from '../data/realMumbaiProspects';

export default function MeetingScheduler({ leads = [], meetings = [], onAddMeeting, onDeleteMeeting, onNavigateToCall }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalCategory, setModalCategory] = useState('ALL');
  const [modalLocation, setModalLocation] = useState('ALL');
  
  // Combine CRM leads + 80,640 Master Prospects
  const combinedClientsList = useMemo(() => {
    const masterMapped = REAL_MUMBAI_PROSPECTS.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      company: p.company,
      industry: p.category,
      category: p.category,
      location: p.location,
      email: p.email,
      phone: p.phone,
      techInterest: p.serviceNeeded,
      estimatedValue: p.estimatedValue
    }));
    return [...leads, ...masterMapped];
  }, [leads]);

  const [selectedLeadId, setSelectedLeadId] = useState(() => combinedClientsList[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [meetingTime, setMeetingTime] = useState('15:00');
  const [meetingTopic, setMeetingTopic] = useState('TechInnoSphere Software Engineering & Architecture Presentation');

  const filteredClientsForModal = useMemo(() => {
    let result = combinedClientsList;

    if (modalCategory !== 'ALL') {
      result = result.filter(c => (c.category || c.industry) === modalCategory);
    }

    if (modalLocation !== 'ALL') {
      result = result.filter(c => c.location === modalLocation);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.company || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.industry || c.category || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    }

    return result.slice(0, 500);
  }, [combinedClientsList, searchTerm, modalCategory, modalLocation]);

  const selectedLeadDetail = useMemo(() => {
    return combinedClientsList.find(l => l.id === selectedLeadId) || combinedClientsList[0];
  }, [combinedClientsList, selectedLeadId]);


  const handleCreateMeeting = (e) => {
    e.preventDefault();
    const lead = combinedClientsList.find(l => l.id === selectedLeadId) || combinedClientsList[0];
    if (!lead) return;

    onAddMeeting({
      id: `meet-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      location: lead.location,
      date: meetingDate,
      time: meetingTime,
      topic: meetingTopic,
      meetUrl: `https://meet.google.com/tkn-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'Confirmed'
    });

    confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
    setShowAddModal(false);
  };

  // Download .ics Calendar File
  const handleExportICS = (meeting) => {
    const startTime = `${meeting.date.replace(/-/g, '')}T${meeting.time.replace(':', '')}00Z`;
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TechInnoSphere Software Solutions//NONSGML v1.0//EN
BEGIN:VEVENT
UID:meet-${Date.now()}@techinnosphere.com
DTSTAMP:${startTime}
DTSTART:${startTime}
SUMMARY:TechInnoSphere Presentation x ${meeting.company}
DESCRIPTION:Technical Architecture & Software Proposal Presentation with ${meeting.leadName}. Topic: ${meeting.topic}
LOCATION:Online Video Presentation (${meeting.meetUrl || 'https://meet.google.com/new'})
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `TechInnoSphere_Meeting_${meeting.company.replace(/[^a-z0-9]/gi, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send WhatsApp Meeting Confirmation
  const handleSendWhatsAppConfirmation = (meeting) => {
    const cleanPhone = (meeting.phone || '9820099999').replace(/\D/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hi ${meeting.leadName}! 

Confirming our upcoming Technical Presentation for ${meeting.company}.

📅 Date: ${meeting.date}
⏰ Time: ${meeting.time} hrs
🎯 Topic: ${meeting.topic}
💻 Video Meeting Link: ${meeting.meetUrl || 'https://meet.google.com/new'}

Looking forward to presenting our custom software solutions!


Best regards,
Hamzah | TechInnoSphere Software Solutions
Web: www.techinnosphere.com`;

    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const followUpSteps = [
    { day: 'Day 1', action: 'Discovery Pitch & Need Analysis', detail: 'Identify website/mobile app gaps & send technical deck', status: 'Completed' },
    { day: 'Day 2', action: 'Technical Presentation Booking', detail: 'Schedule live architecture walkthrough with decision maker', status: 'Active' },
    { day: 'Day 3', action: 'Custom Commercial Proposal', detail: 'Dispatch scope breakdown & milestones from contact@techinnosphere.com', status: 'Pending' },
    { day: 'Day 5', action: 'Director Review & Contract Sign-off', detail: 'Finalize agreement with Director Omar Khan & onboard project', status: 'Upcoming' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner Header */}
      <div className="glass-panel" style={{ 
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(15, 23, 42, 0.95))',
        borderColor: 'rgba(168, 85, 247, 0.35)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Building2 size={18} color="#c084fc" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REAL-TIME CLIENT PRESENTATION AUTOMATION
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700, color: '#fff' }}>

            Meeting Scheduler & Technical Presentation Pipeline
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Schedule technical presentations across your verified leads. Download Google Calendar <strong>.ics invites</strong> & dispatch 1-click WhatsApp confirmations!
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
          <Plus size={16} />
          <span>Book Technical Presentation</span>
        </button>
      </div>

      {/* Main Grid: Scheduled Meetings List & Outreach Cadence */}
      <div className="grid-responsive-2-1">

        
        {/* Scheduled Meetings Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#c084fc" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Active Client Technical Presentations ({meetings.length})
              </h2>
            </div>
            <span className="badge badge-meeting" style={{ fontSize: '0.78rem' }}>LIVE PIPELINE</span>
          </div>

          {meetings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={36} color="var(--text-subtle)" />
              <div>No meetings scheduled yet. Click <strong>"Book Technical Presentation"</strong> to schedule one with any of your leads.</div>
            </div>

          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {meetings.map((m) => (
                <div 
                  key={m.id}
                  className="glass-panel-hover"
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1.1rem 1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Date Badge */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '12px',
                        color: '#c084fc',
                        textAlign: 'center',
                        minWidth: '70px'
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {new Date(m.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                          {new Date(m.date).getDate() || m.date}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                          {m.leadName} <span style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>({m.company})</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          🎯 {m.topic}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span>⏰ Time: <strong>{m.time} hrs</strong></span>
                          <span>•</span>
                          <span style={{ color: 'var(--accent-cyan)' }}>📍 {m.location || 'Mumbai Western Line'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-qualified">{m.status}</span>
                      <button 
                        onClick={() => onDeleteMeeting(m.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.5rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="Cancel Meeting"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Real Action Buttons for Meeting */}
                  <div style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#38bdf8' }}>
                      <Video size={13} />
                      <a href={m.meetUrl || 'https://meet.google.com/new'} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                        Join Google Meet Room
                      </a>
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleExportICS(m)}
                        className="btn btn-secondary btn-sm"
                        title="Download .ics Calendar Invite"
                      >
                        <Download size={13} />
                        <span>Export .ICS Calendar</span>
                      </button>

                      <button 
                        onClick={() => handleSendWhatsAppConfirmation(m)}
                        className="btn btn-whatsapp btn-sm"
                        title="Send Confirmation via WhatsApp"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Invite</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multi-touch Follow-up Blueprint */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileCheck size={18} color="var(--accent-cyan)" />
            <span>Client Conversion Cadence</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {followUpSteps.map((step, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{step.day}: {step.action}</span>
                  <span className={`badge ${step.status === 'Completed' ? 'badge-won' : step.status === 'Active' ? 'badge-new' : 'badge-meeting'}`} style={{ fontSize: '0.65rem' }}>
                    {step.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{step.detail}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Book Meeting Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 8, 19, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar color="#c084fc" size={22} />
                  <span>Book Technical Presentation</span>
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
                  Select from your added Mumbai & PAN-India leads
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Category & Location Filter Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Category Filter</label>
                  <select 
                    className="form-select"
                    value={modalCategory}
                    onChange={e => setModalCategory(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Restaurants & Cafes">Restaurants & Cafes</option>
                    <option value="Stores & Boutiques">Stores & Boutiques</option>
                    <option value="Healthcare & Clinics">Healthcare & Clinics</option>
                    <option value="Salons & Garages">Salons & Garages</option>
                    <option value="Logistics & Transport">Logistics & Transport</option>
                    <option value="Education & Academies">Education & Academies</option>
                    <option value="Real Estate & Architecture">Real Estate & Architecture</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Filter</label>
                  <select 
                    className="form-select"
                    value={modalLocation}
                    onChange={e => setModalLocation(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="ALL">📍 All Locations</option>
                    <option value="Churchgate, South Mumbai">Churchgate</option>
                    <option value="Marine Lines, South Mumbai">Marine Lines</option>
                    <option value="Charni Road / Opera House, Mumbai">Charni Road</option>
                    <option value="Grant Road, South Mumbai">Grant Road</option>
                    <option value="Mumbai Central, South Mumbai">Mumbai Central</option>
                    <option value="Bandra West, Mumbai Suburbs">Bandra</option>
                    <option value="Andheri West, Commercial Hub">Andheri</option>
                    <option value="Borivali West, North Mumbai">Borivali</option>
                    <option value="Virar West, Palghar District">Virar</option>
                  </select>
                </div>
              </div>

              {/* Client Search */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Search Client Account</label>
                  <span className="badge badge-new" style={{ fontSize: '0.65rem' }}>
                    Showing {filteredClientsForModal.length} matching
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Search company, decision maker name, station..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.2rem', fontSize: '0.85rem', height: '36px' }}
                  />
                </div>
              </div>

              {/* Select Client Dropdown */}
              <div className="form-group">
                <label className="form-label">Target Prospect Client</label>
                <select 
                  className="form-select" 
                  value={selectedLeadId} 
                  onChange={e => setSelectedLeadId(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  {filteredClientsForModal.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.company} — {l.name} ({l.role}) | {l.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Lead Summary Card */}
              {selectedLeadDetail && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                    🏢 {selectedLeadDetail.company}
                  </div>
                  <div>👤 Decision Maker: <strong>{selectedLeadDetail.name}</strong> ({selectedLeadDetail.role})</div>
                  <div>📍 Location: {selectedLeadDetail.location} • 📧 {selectedLeadDetail.email} • 📞 {selectedLeadDetail.phone}</div>
                </div>
              )}


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Meeting Date</label>
                  <input type="date" required className="form-input" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Time (24h)</label>
                  <input type="time" required className="form-input" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Presentation Agenda / Topic</label>
                <input className="form-input" value={meetingTopic} onChange={e => setMeetingTopic(e.target.value)} placeholder="e.g. Custom Web App Architecture Walkthrough" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  Schedule & Generate Invites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
