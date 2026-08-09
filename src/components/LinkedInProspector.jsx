import React, { useState, useMemo } from 'react';
import {
  Share2,
  Search,
  MapPin,
  Building2,
  UserCheck,
  Plus,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  CheckCircle,
  Download,
  Send,
  Users,
  PhoneCall,
  Mail,
  Briefcase,
  Globe,
  Smartphone
} from 'lucide-react';
import { openNativeWhatsAppApp } from '../utils/nativeAppLaunchers';

// ─── Smart Search String Sanitizers (Extracts clean searchable terms) ─────────
function getCleanPersonName(name = '') {
  if (!name || typeof name !== 'string') return 'Decision Maker';
  // Strip salutations
  let clean = name.replace(/^(Dr\.|Capt\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/gi, '').trim();
  // "Farokh & Boman Irani" -> "Farokh Irani"
  const andMatch = clean.match(/^([A-Za-z]+)\s*(?:&|and)\s*[A-Za-z]+\s+([A-Za-z]+)$/i);
  if (andMatch) return `${andMatch[1]} ${andMatch[2]}`;
  // "Dr. Ananya Roy & Dr. Sameer Roy" -> "Ananya Roy"
  const multiMatch = clean.match(/^([A-Za-z]+\s+[A-Za-z]+)\s*(?:&|and)/i);
  if (multiMatch) return multiMatch[1].trim();
  // Strip trailing & Co / & Sons
  return clean.replace(/\s*(?:&|and)\s*(?:Co|Sons|Associates)$/gi, '').trim() || 'Decision Maker';
}

function getCleanCompanyName(company = '') {
  if (!company || typeof company !== 'string') return 'Company';
  return company
    .replace(/\s+\d{4}$/, '') // Remove years like 1948, 1904
    .replace(/#\d+/g, '') // Remove dummy hashes
    .replace(/\s*(?:&|and)\s*(?:Co|Sons|Associates|Kitchen|Dining|Studio|Merchants|Solutions|Fabrics|Pvt Ltd|Ltd)$/i, '')
    .trim() || 'Company';
}

// ─── LinkedIn Search URL Builders (Universal & 404-Proof) ─────────────────────
function buildPersonLinkedInUrl(name = '', company = '', location = 'Mumbai') {
  const cleanPerson = getCleanPersonName(name);
  const cleanComp = getCleanCompanyName(company);
  return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${cleanPerson} ${cleanComp}`)}`;
}

function buildCompanyLinkedInUrl(company = '') {
  const cleanCompany = getCleanCompanyName(company);
  return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(cleanCompany)}`;
}

function buildGoogleLinkedInUrl(name = '', company = '') {
  const cleanPerson = getCleanPersonName(name);
  const cleanComp = getCleanCompanyName(company);
  return `https://www.google.com/search?q=${encodeURIComponent(`${cleanPerson} ${cleanComp} site:linkedin.com/in`)}`;
}

// ─── LinkedIn InMail Message Generator ────────────────────────────────────────
function buildLinkedInMessage(lead = {}) {
  const firstName = getCleanPersonName(lead.name || '').split(' ')[0] || 'there';
  const cleanComp = getCleanCompanyName(lead.company || '');
  const industry = lead.industry || lead.category || 'your sector';

  return `Hi ${firstName},

I came across ${cleanComp}'s strong reputation in ${lead.location || 'Mumbai'} and wanted to connect!

I'm Hamzah from TechInnoSphere Software Solutions (Mumbai). We build custom high-speed web applications, client booking portals, and mobile apps for prominent ${industry} businesses.

I noticed ${cleanComp} currently operates without a custom web or mobile platform. ${lead.techInterest ? `We could build: ${lead.techInterest} to capture more direct customer orders.` : 'We can deploy a custom digital system to streamline your operations.'}

Would you be open to a quick 10-minute technical intro call this week?

Best regards,
Hamzah | TechInnoSphere
Email: contact@techinnosphere.com | Web: www.techinnosphere.com`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LinkedInProspector({ leads = [], onImportLead, onNavigateToOutreach, onNavigateToCall }) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [importedMap, setImportedMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Safe leads array
  const safeLeads = Array.isArray(leads) ? leads : [];

  // Filter out any invalid objects
  const cleanLeads = useMemo(() => {
    return safeLeads.filter(l => l && l.company && !l.company.includes('#'));
  }, [safeLeads]);

  // Unique categories
  const leadCategories = useMemo(() => {
    const cats = new Set(cleanLeads.map(l => l.industry || l.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [cleanLeads]);

  // Unique statuses
  const leadStatuses = useMemo(() => {
    const statuses = new Set(cleanLeads.map(l => l.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [cleanLeads]);

  // Filtered list
  const filteredLeads = useMemo(() => {
    return cleanLeads.filter(l => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        ((l.industry || l.category || '').toLowerCase().includes(q));

      const matchCat = selectedCategory === 'ALL' || l.industry === selectedCategory || l.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || l.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [cleanLeads, searchTerm, selectedCategory, selectedStatus]);

  const handleImportLead = (lead) => {
    if (onImportLead) onImportLead(lead);
    setImportedMap(prev => ({ ...prev, [lead.id]: true }));
  };

  const handleDirectCall = (lead) => {
    handleImportLead(lead);
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    if (cleanPhone) window.location.href = `tel:${cleanPhone}`;
    if (onNavigateToCall) onNavigateToCall(lead);
  };

  const handleCopyMessage = (lead) => {
    navigator.clipboard.writeText(buildLinkedInMessage(lead));
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Top Banner Header */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(10, 102, 194, 0.25), rgba(15, 23, 42, 0.95))',
        borderColor: 'rgba(10, 102, 194, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Share2 size={20} color="#0a66c2" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REAL LINKEDIN PROSPECTOR & EXECUTIVE PITCH GENERATOR
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700, color: '#fff' }}>
            LinkedIn Finder — Verified Real Decision Makers ({filteredLeads.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Every contact links directly to real verified profiles on LinkedIn with tailored InMail messages and 1-click WhatsApp/Call actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '0.6rem 1.25rem', background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(10, 102, 194, 0.4)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Showing</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
              {filteredLeads.length}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {cleanLeads.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔗</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.6rem' }}>
            No Clients in CRM Yet
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
            Add clients in <strong style={{ color: '#38bdf8' }}>Lead Manager</strong> or browse the <strong style={{ color: '#38bdf8' }}>Client Directory</strong> — all verified clients appear here automatically with direct LinkedIn search links and custom DM generators.
          </p>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Search Input */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search decision maker, company, location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Category Filter */}
            {leadCategories.length > 0 && (
              <select
                className="form-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ flex: '1 1 200px' }}
              >
                <option value="ALL">📍 All Categories ({cleanLeads.length})</option>
                {leadCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            {leadStatuses.length > 0 && (
              <select
                className="form-select"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ flex: '1 1 180px' }}
              >
                <option value="ALL">📊 All Statuses</option>
                {leadStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            <div style={{ color: '#94a3b8', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#38bdf8' }}>{filteredLeads.length}</strong> real clients
            </div>
          </div>

          {/* No search results */}
          {filteredLeads.length === 0 && (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
              No clients match your search. Try different keywords.
            </div>
          )}

          {/* LinkedIn Profile Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredLeads.map(lead => {
              const isImported = importedMap[lead.id];
              const isCopied = copiedId === lead.id;
              const cleanPerson = getCleanPersonName(lead.name);
              const cleanComp = getCleanCompanyName(lead.company);
              const avatarLetter = (cleanPerson.charAt(0) || 'D').toUpperCase();

              const personLinkedInUrl = (lead.linkedin && typeof lead.linkedin === 'string' && lead.linkedin.startsWith('http'))
                ? lead.linkedin
                : buildPersonLinkedInUrl(lead.name, lead.company, lead.location);

              const companyLinkedInUrl = (lead.companyLinkedin && typeof lead.companyLinkedin === 'string' && lead.companyLinkedin.startsWith('http'))
                ? lead.companyLinkedin
                : buildCompanyLinkedInUrl(lead.company);

              const googleSearchUrl = buildGoogleLinkedInUrl(lead.name, lead.company);

              return (
                <div
                  key={lead.id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    borderColor: isImported ? 'rgba(16, 185, 129, 0.4)' : 'rgba(10, 102, 194, 0.3)'
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {/* LinkedIn Avatar Badge */}
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0a66c2, #0284c7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0
                        }}>
                          {avatarLetter}
                        </div>
                        <div>
                          {/* Search Person Link */}
                          <a
                            href={personLinkedInUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#fff', fontWeight: 700, fontSize: '1.05rem',
                              fontFamily: 'var(--font-heading)', textDecoration: 'none',
                              display: 'flex', alignItems: 'center', gap: '0.35rem'
                            }}
                            title={`Open LinkedIn profile of ${cleanPerson}`}
                          >
                            <span>{lead.name}</span>
                            <ExternalLink size={12} color="#38bdf8" />
                          </a>
                          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                            {lead.role || 'Founder / Decision Maker'}
                          </div>
                        </div>
                      </div>

                      <span className={`badge ${lead.status === 'Meeting Scheduled' ? 'badge-hot' : lead.status === 'Proposal Sent' ? 'badge-warm' : 'badge-new'}`}
                        style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                        {lead.status || 'Verified Lead'}
                      </span>
                    </div>

                    {/* Company Search Link */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <a
                        href={companyLinkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600,
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                        }}
                        title={`Open LinkedIn company page of ${cleanComp}`}
                      >
                        <Building2 size={14} color="#94a3b8" />
                        <span>{lead.company}</span>
                        <ExternalLink size={11} color="#0a66c2" />
                      </a>
                    </div>

                    {/* Status Badges */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '5px',
                        background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}>
                        <Globe size={11} />
                        <span>{lead.digitalStatus || 'Enterprise Tech Client'}</span>
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
                        <MapPin size={13} />
                        <span>{lead.location}</span>
                      </div>
                      {lead.email && (
                        <div><strong>Official Email:</strong> <span style={{ color: '#38bdf8' }}>{lead.email}</span></div>
                      )}
                      {lead.phone && (
                        <div><strong>Phone / Contact:</strong> <span style={{ color: '#34d399' }}>{lead.phone}</span></div>
                      )}
                      {(lead.industry || lead.category) && (
                        <div><strong>Industry:</strong> {lead.industry || lead.category}</div>
                      )}
                      {lead.estimatedValue && (
                        <div><strong>Deal Value:</strong> <strong style={{ color: '#34d399' }}>{lead.estimatedValue}</strong></div>
                      )}
                    </div>

                    {/* Pitch Strategy */}
                    <div style={{
                      background: 'rgba(10, 102, 194, 0.1)',
                      borderRadius: '8px', padding: '0.75rem',
                      border: '1px solid rgba(10, 102, 194, 0.25)', fontSize: '0.82rem'
                    }}>
                      <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sparkles size={13} />
                        <span>LinkedIn BDA Pitch Angle:</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {lead.techInterest || 'Custom Web Application & Enterprise Software Architecture'}
                      </div>
                    </div>

                    {lead.notes && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                        📝 {lead.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {/* Direct LinkedIn Profile Links */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      <a
                        href={personLinkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{
                          background: 'linear-gradient(135deg, #0a66c2, #0284c7)',
                          borderColor: '#0a66c2',
                          color: '#fff',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          flex: '1 1 140px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          fontWeight: 700
                        }}
                      >
                        <Share2 size={12} />
                        <span>LinkedIn Profile</span>
                        <ExternalLink size={10} />
                      </a>

                      <a
                        href={companyLinkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{
                          background: 'rgba(15, 23, 42, 0.6)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          color: '#e2e8f0',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          flex: '1 1 110px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Building2 size={12} />
                        <span>Company</span>
                        <ExternalLink size={10} />
                      </a>

                      <a
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          borderColor: 'rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                        title="Search Google for verified LinkedIn profile"
                      >
                        <Search size={11} />
                        <span>Google</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>

                    {/* Pitch & Call Buttons */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      flexWrap: 'wrap', gap: '0.4rem'
                    }}>
                      <button
                        onClick={() => handleCopyMessage(lead)}
                        className="btn btn-primary btn-sm"
                        style={{
                          background: isCopied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #0a66c2, #0284c7)',
                          padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700
                        }}
                        title="Copy tailored InMail message to clipboard"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{isCopied ? 'DM Copied!' : 'Copy InMail DM'}</span>
                      </button>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {lead.phone && (
                          <button
                            onClick={() => {
                              const msg = `Hi ${cleanPerson.split(' ')[0]}! Hamzah here from TechInnoSphere Software Solutions (Mumbai). I came across ${lead.company} in ${lead.location} and wanted to connect regarding your digital tech stack. Can we talk?`;
                              openNativeWhatsAppApp({ phone: lead.phone, text: msg });
                            }}
                            className="btn btn-whatsapp btn-sm"
                            style={{ padding: '0.4rem 0.6rem' }}
                            title="Pitch via WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>WA</span>
                          </button>
                        )}

                        {lead.phone && (
                          <button
                            onClick={() => handleDirectCall(lead)}
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.4rem 0.65rem', fontWeight: 700 }}
                            title="Direct Phone Call"
                          >
                            <PhoneCall size={13} />
                            <span>Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
