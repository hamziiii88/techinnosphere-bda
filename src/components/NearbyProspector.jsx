import React, { useState, useMemo } from 'react';
import {
  MapPin,
  PhoneCall,
  Mail,
  Search,
  Sparkles,
  UserCheck,
  Building2,
  Globe,
  Smartphone,
  Copy,
  Check,
  MessageSquare,
  CheckCircle2,
  Download,
  Plus,
  Compass,
  Filter
} from 'lucide-react';
import { REAL_MUMBAI_PROSPECTS, PAN_INDIA_LOCATIONS } from '../data/realMumbaiProspects';
import { openNativeWhatsAppApp } from '../utils/nativeAppLaunchers';

export default function NearbyProspector({ leads = [], onImportLead, onNavigateToCall, onNavigateToEmail }) {

  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [importedLeadsMap, setImportedLeadsMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 18;

  // Combine CRM leads + Curated Real Mumbai Prospects (deduplicated by company name)
  const allProspects = useMemo(() => {
    const map = new Map();
    // First add real Mumbai prospects
    REAL_MUMBAI_PROSPECTS.forEach(p => {
      map.set(p.company.toLowerCase().trim(), {
        ...p,
        id: p.id || `mumbai-${p.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        source: 'Mumbai Master Directory'
      });
    });
    // Then overlay CRM leads
    leads.forEach(l => {
      const key = l.company.toLowerCase().trim();
      const existing = map.get(key) || {};
      map.set(key, {
        ...existing,
        ...l,
        id: l.id || existing.id,
        isCRM: true,
        source: 'CRM Lead'
      });
    });
    return Array.from(map.values());
  }, [leads]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(allProspects.map(p => p.category || p.industry).filter(Boolean));
    return Array.from(cats).sort();
  }, [allProspects]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return allProspects.filter(p => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        p.company?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        (p.category || p.industry || '').toLowerCase().includes(q) ||
        (p.fullAddress || '').toLowerCase().includes(q);

      const matchLocation = selectedLocation === 'ALL' || (p.location || '').includes(selectedLocation);
      const matchCategory = selectedCategory === 'ALL' || (p.category === selectedCategory) || (p.industry === selectedCategory);

      return matchSearch && matchLocation && matchCategory;
    });
  }, [allProspects, searchTerm, selectedLocation, selectedCategory]);

  const totalPages = Math.ceil(filteredProspects.length / pageSize) || 1;
  const paginatedProspects = filteredProspects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDirectCallNow = (prospect) => {
    const leadObj = {
      id: prospect.id,
      name: prospect.name,
      role: prospect.role || 'Founder & Owner',
      company: prospect.company,
      industry: prospect.category || prospect.industry || 'Business',
      category: prospect.category || prospect.industry || 'Business',
      size: prospect.size || '10-30 employees',
      location: prospect.location,
      email: prospect.email,
      phone: prospect.phone,
      techInterest: prospect.serviceNeeded || prospect.techInterest || 'Custom Web Application',
      status: prospect.status || 'New Lead',
      priority: prospect.priority || 'High',
      notes: prospect.notes || `Sourced via Nearby Directory. Pitch: ${prospect.pitchAngle || ''}`,
      estimatedValue: prospect.estimatedValue || '₹1.5L - ₹3.0L'
    };

    if (onImportLead) onImportLead(leadObj);
    setImportedLeadsMap(prev => ({ ...prev, [prospect.id]: true }));

    const cleanPhone = (prospect.phone || '').replace(/\D/g, '');
    if (cleanPhone) window.location.href = `tel:${cleanPhone}`;
    if (onNavigateToCall) onNavigateToCall(leadObj);
  };

  const handleEmailPitch = (prospect) => {
    const leadObj = {
      id: prospect.id,
      name: prospect.name,
      role: prospect.role || 'Founder & Owner',
      company: prospect.company,
      industry: prospect.category || prospect.industry || 'Business',
      category: prospect.category || prospect.industry || 'Business',
      size: prospect.size || '10-30 employees',
      location: prospect.location,
      email: prospect.email,
      phone: prospect.phone,
      techInterest: prospect.serviceNeeded || prospect.techInterest || 'Custom Web Application',
      status: prospect.status || 'New Lead',
      priority: prospect.priority || 'High',
      notes: prospect.notes || `Sourced via Nearby Directory. Pitch: ${prospect.pitchAngle || ''}`,
      estimatedValue: prospect.estimatedValue || '₹1.5L - ₹3.0L'
    };

    if (onImportLead) onImportLead(leadObj);
    setImportedLeadsMap(prev => ({ ...prev, [prospect.id]: true }));
    if (onNavigateToEmail) onNavigateToEmail(leadObj);
  };

  const handleCopyEmail = (prospect) => {
    navigator.clipboard.writeText(prospect.email || '');
    setCopiedId(prospect.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Company Name', 'Contact Name', 'Role', 'Category', 'Location', 'Full Address', 'Phone', 'Email', 'Tech Pitch', 'Estimated Value'];
    const rows = filteredProspects.map(p => [
      `"${p.company}"`,
      `"${p.name}"`,
      `"${p.role || ''}"`,
      `"${p.category || p.industry || ''}"`,
      `"${p.location}"`,
      `"${(p.fullAddress || '').replace(/"/g, '""')}"`,
      `"${p.phone || ''}"`,
      `"${p.email || ''}"`,
      `"${(p.pitchAngle || p.serviceNeeded || '').replace(/"/g, '""')}"`,
      `"${p.estimatedValue || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `TechInnoSphere_Nearby_Mumbai_Leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Top Banner Header */}
      <div className="glass-panel" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(15, 23, 42, 0.95))',
        borderColor: 'rgba(6, 182, 212, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Compass size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PAN-INDIA CLIENT DIRECTORY & MULTI-CHANNEL CALL ENGINE
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700, color: '#fff' }}>
            PAN-India Real Business Directory ({filteredProspects.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Add real businesses you've personally verified across Mumbai, Pune, Bengaluru, Delhi NCR, Hyderabad, Chennai, Kolkata & other Indian commercial hubs — this list starts empty on purpose.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '0.6rem 1.25rem', background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Showing</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {filteredProspects.length}
            </div>
          </div>

          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ background: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.35)', color: '#38bdf8' }}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search business, owner, station, address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '100%', paddingLeft: '2.4rem' }}
          />
        </div>

        {/* Category Selector */}
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          style={{ flex: '1 1 220px' }}
        >
          <option value="ALL">🍽️ All Business Categories ({allProspects.length})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Location Selector */}
        <select
          className="form-select"
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setCurrentPage(1);
          }}
          style={{ flex: '1 1 240px' }}
        >
          <option value="ALL">📍 All Locations (Churchgate to Virar & PAN India)</option>
          <optgroup label="🚉 Western Railway Line (Churchgate to Virar)">
            {PAN_INDIA_LOCATIONS.slice(0, 28).map(loc => (
              <option key={loc} value={loc.split(',')[0].trim()}>{loc}</option>
            ))}
          </optgroup>
          <optgroup label="🇮🇳 Major PAN India Metros">
            {PAN_INDIA_LOCATIONS.slice(28).map(loc => (
              <option key={loc} value={loc.split('(')[0].trim()}>{loc}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* No results */}
      {filteredProspects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            No matching businesses found
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Try resetting your search query or switching the location filter.
          </p>
        </div>
      ) : (
        /* Paginated Directory Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {paginatedProspects.map(prospect => {
            const isImported = importedLeadsMap[prospect.id] || prospect.isCRM;
            const isCopied = copiedId === prospect.id;
            const pitch = prospect.pitchAngle || prospect.serviceNeeded || 'Custom Web Application & Ordering Portal';

            return (
              <div
                key={prospect.id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderColor: isImported ? 'rgba(16, 185, 129, 0.4)' : 'var(--bg-card-border)'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span className="badge badge-new" style={{ fontSize: '0.7rem' }}>
                      {prospect.category || prospect.industry || 'Business'}
                    </span>
                    <span className={`badge ${prospect.priority === 'High' ? 'badge-hot' : 'badge-won'}`} style={{ fontSize: '0.7rem' }}>
                      {prospect.priority || 'High'} Priority
                    </span>
                  </div>

                  {/* Company Name */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
                    {prospect.company}
                  </h3>

                  {/* Location Tag */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                    <MapPin size={14} />
                    <span>{prospect.location}</span>
                  </div>

                  {/* Details Block */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
                    {prospect.fullAddress && (
                      <div>
                        <strong>Address:</strong> {prospect.fullAddress}
                      </div>
                    )}

                    <div>
                      <strong>Decision Maker:</strong> {prospect.name}
                      {prospect.role && <span style={{ color: '#94a3b8' }}> ({prospect.role})</span>}
                    </div>

                    {/* Email Box */}
                    {prospect.email && (
                      <div style={{
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginTop: '0.2rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                          <Mail size={14} color="#22d3ee" />
                          <a
                            href={`mailto:${prospect.email}`}
                            style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none', fontSize: '0.83rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {prospect.email}
                          </a>
                        </div>

                        <button
                          onClick={() => handleCopyEmail(prospect)}
                          title="Copy Client Email"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', height: '26px', flexShrink: 0 }}
                        >
                          {isCopied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    {prospect.phone && (
                      <div>
                        <strong>Phone:</strong> <span style={{ color: '#34d399', fontWeight: 600 }}>{prospect.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Globe size={12} />
                      <span>No Custom Web App</span>
                    </div>

                    <div style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Smartphone size={12} />
                      <span>Missing Mobile Portal</span>
                    </div>
                  </div>

                  {/* Pitch Strategy */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sparkles size={13} />
                      <span>Recommended BDA Pitch:</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {pitch}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    Est. Value: <strong style={{ color: '#34d399' }}>{prospect.estimatedValue || '₹1.5L - ₹3.0L'}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {/* WhatsApp */}
                    {prospect.phone && (
                      <button
                        onClick={() => {
                          const firstName = prospect.name.split(' ')[0];
                          const msg = `Hi ${firstName}! Hamzah here from TechInnoSphere Software Solutions (Mumbai). I noticed ${prospect.company} in ${prospect.location} currently operates without a custom web/mobile platform. We build high-performance software for ${prospect.category || prospect.industry} establishments. Can we connect?`;
                          openNativeWhatsAppApp({ phone: prospect.phone, text: msg });
                        }}
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.4rem 0.65rem' }}
                        title="Pitch via Native WhatsApp App"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    {/* Direct Call */}
                    {prospect.phone && (
                      <button
                        onClick={() => handleDirectCallNow(prospect)}
                        className="btn btn-success btn-sm"
                        style={{ padding: '0.4rem 0.75rem', fontWeight: 700 }}
                        title="Direct Call Now"
                      >
                        <PhoneCall size={13} />
                        <span>Direct Call 📞</span>
                      </button>
                    )}

                    {/* Email Pitch */}
                    <button
                      onClick={() => handleEmailPitch(prospect)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title="Generate Executive Email Pitch"
                    >
                      <Mail size={13} color="#22d3ee" />
                      <span>Email Pitch</span>
                    </button>
                  </div>
                </div>

                {/* Imported confirmation */}
                {isImported && (
                  <div style={{
                    background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
                    borderRadius: '8px', padding: '0.35rem 0.65rem',
                    fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}>
                    <CheckCircle2 size={12} />
                    <span>Live in CRM & Cold Call Hub</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className="glass-panel" style={{
          marginTop: '1.5rem',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing Page <strong style={{ color: '#fff' }}>{currentPage}</strong> of <strong style={{ color: 'var(--accent-cyan)' }}>{totalPages}</strong> ({filteredProspects.length} verified real establishments)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn btn-secondary btn-sm"
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous Page
            </button>

            <span style={{ fontSize: '0.82rem', padding: '0 0.5rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn btn-primary btn-sm"
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next Page
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
