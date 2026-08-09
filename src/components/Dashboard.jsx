import React from 'react';
import { 
  PhoneCall, 
  Mail, 
  CalendarCheck, 
  UserCheck, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  MapPin,
  MessageSquare,
  DollarSign,
  Briefcase,
  Trash2
} from 'lucide-react';

export default function Dashboard({ leads, activities, meetings, onNavigate, onAddLeadClick, onDeleteActivity }) {

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysActivities = activities.filter(a => a.timestamp && a.timestamp.startsWith(todayStr));

  const callsToday = todaysActivities.filter(a => a.type === 'Call').length;
  const emailsToday = todaysActivities.filter(a => a.type === 'Email' || a.type === 'LinkedIn').length;
  const whatsappPitchesToday = todaysActivities.filter(a => a.type === 'WhatsApp').length;
  const meetingsBooked = leads.filter(l => l.status === 'Meeting Scheduled').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  
  const DAILY_CALL_TARGET = 30;
  const DAILY_EMAIL_TARGET = 20;

  const highPriorityLeads = leads.filter(l => l.priority === 'High');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.45), rgba(14, 165, 233, 0.15), rgba(15, 23, 42, 0.85))',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BUSINESS DEVELOPMENT AUTOMATION CENTER
            </span>
            <Sparkles size={16} color="var(--accent-cyan)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700 }} className="gradient-text">
            Welcome back, Hamzah! 🚀
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            TechInnoSphere Software Solutions Pvt. Ltd. — Business Development Performance Command Center
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('prospector')} className="btn btn-secondary" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}>
            <MapPin size={16} />
            <span>Discover Nearby Leads</span>
          </button>
          <button onClick={() => onNavigate('coldcall')} className="btn btn-primary">
            <PhoneCall size={16} />
            <span>Launch Cold Call Session</span>
          </button>
          <button onClick={() => onNavigate('whatsapp')} className="btn btn-whatsapp">
            <MessageSquare size={16} />
            <span>WhatsApp Outreach</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Outbound Calls */}
        <div 
          onClick={() => onNavigate('coldcall')}
          className="glass-panel glass-panel-hover" 
          style={{ padding: '1.35rem', cursor: 'pointer', position: 'relative' }}
          title="Click to Launch Cold Call Session"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Calls Logged Today</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {callsToday} <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', fontWeight: 500 }}>/ {DAILY_CALL_TARGET}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.85rem', borderRadius: '14px', color: '#60a5fa' }}>
              <PhoneCall size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
              <span>Daily Target</span>
              <span style={{ fontWeight: 700, color: '#60a5fa' }}>{Math.round((callsToday / DAILY_CALL_TARGET) * 100)}%</span>
            </div>
            <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(100, (callsToday / DAILY_CALL_TARGET) * 100)}%`,
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Launch Cold Call Session</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Emails Sent */}
        <div 
          onClick={() => onNavigate('outreach')}
          className="glass-panel glass-panel-hover" 
          style={{ padding: '1.35rem', cursor: 'pointer', position: 'relative' }}
          title="Click to Launch Email Outreach"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Emails & DMs Sent</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {emailsToday} <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', fontWeight: 500 }}>/ {DAILY_EMAIL_TARGET}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.85rem', borderRadius: '14px', color: '#22d3ee' }}>
              <Mail size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
              <span>Daily Target</span>
              <span style={{ fontWeight: 700, color: '#22d3ee' }}>{Math.round((emailsToday / DAILY_EMAIL_TARGET) * 100)}%</span>
            </div>
            <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(100, (emailsToday / DAILY_EMAIL_TARGET) * 100)}%`,
                background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#22d3ee', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Launch Email Generator</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Meetings Scheduled */}
        <div 
          onClick={() => onNavigate('meetings')}
          className="glass-panel glass-panel-hover" 
          style={{ padding: '1.35rem', cursor: 'pointer', position: 'relative' }}
          title="Click to Open Meeting Scheduler"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Meetings Booked</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {meetingsBooked}
              </div>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.85rem', borderRadius: '14px', color: '#c084fc' }}>
              <CalendarCheck size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1.1rem', fontSize: '0.82rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <TrendingUp size={15} />
            <span>{meetings.length} technical presentations scheduled</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#c084fc', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Manage Presentations Pipeline</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Total CRM Leads */}
        <div 
          onClick={() => onNavigate('leads')}
          className="glass-panel glass-panel-hover" 
          style={{ padding: '1.35rem', cursor: 'pointer', position: 'relative' }}
          title="Click to Open CRM Leads Directory"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total CRM Database</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {leads.length}
              </div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '14px', color: '#34d399' }}>
              <UserCheck size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1.1rem', fontSize: '0.82rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            <span>{qualifiedLeads} qualified tech projects</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>View Full CRM Database</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>


      {/* Main Grid: Pipeline Funnel & High Priority Leads */}
      <div className="grid-responsive-2-1">

        
        {/* Pipeline Stage Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Business Development Pipeline Funnel
            </h2>
            <button onClick={() => onNavigate('leads')} className="btn btn-secondary btn-sm">
              <span>View Full CRM</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { stage: 'New Lead', color: '#3b82f6', badgeClass: 'badge-new' },
              { stage: 'Contacted', color: '#f59e0b', badgeClass: 'badge-contacted' },
              { stage: 'Meeting Scheduled', color: '#a855f7', badgeClass: 'badge-meeting' },
              { stage: 'Qualified', color: '#10b981', badgeClass: 'badge-qualified' },
              { stage: 'Proposal Sent', color: '#06b6d4', badgeClass: 'badge-new' },
              { stage: 'Closed Won', color: '#25d366', badgeClass: 'badge-won' }
            ].map(item => {
              const count = leads.filter(l => l.status === item.stage).length;
              const percentage = Math.round((count / (leads.length || 1)) * 100);
              return (
                <div key={item.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span className={`badge ${item.badgeClass}`}>{item.stage}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {count} leads ({percentage}%)
                    </span>
                  </div>
                  <div style={{ height: '9px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: item.color,
                      borderRadius: '5px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Priority Target Accounts */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Flame size={18} color="var(--accent-amber)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              High Priority Targets
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {highPriorityLeads.slice(0, 4).map(lead => (
              <div 
                key={lead.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{lead.company} ({lead.role})</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                    Interest: {lead.techInterest}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={() => onNavigate('coldcall')}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="Call Target"
                  >
                    <PhoneCall size={13} />
                  </button>

                  <button 
                    onClick={() => onNavigate('whatsapp')}
                    className="btn btn-whatsapp btn-sm"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="WhatsApp Pitch"
                  >
                    <MessageSquare size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Activity Timeline */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Recent BD Activity Log
            </h2>
          </div>
          <button onClick={() => onNavigate('reporter')} className="btn btn-secondary btn-sm">
            <span>Generate Director EOD Report</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>No recent activity logged. Use Cold Call Hub or Email Generator to add logs.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {activities.slice(0, 5).map((act, idx) => (
              <div 
                key={act.id || idx}
                className="activity-item-responsive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 1.1rem',
                  background: 'rgba(15, 23, 42, 0.55)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{
                  padding: '0.55rem',
                  borderRadius: '10px',
                  background: act.type === 'Call' ? 'rgba(59, 130, 246, 0.15)' : act.type === 'WhatsApp' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                  color: act.type === 'Call' ? '#60a5fa' : act.type === 'WhatsApp' ? '#4ade80' : '#22d3ee',
                  flexShrink: 0
                }}>
                  {act.type === 'Call' ? <PhoneCall size={16} /> : act.type === 'WhatsApp' ? <MessageSquare size={16} /> : <Mail size={16} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                      {act.leadName}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                      ({act.company})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                    {act.notes}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div>
                    <span className="badge badge-meeting">{act.outcome}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {onDeleteActivity && (
                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }}
                      title="Delete Activity Log"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>


            ))}
          </div>
        )}
      </div>

    </div>
  );
}
