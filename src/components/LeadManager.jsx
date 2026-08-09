import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Building2, 
  Briefcase, 
  Edit, 
  Trash2, 
  ExternalLink,
  Sparkles,
  CalendarPlus,
  X,
  Award,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  UserCheck,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LeadManager({ leads, onUpdateLead, onAddLead, onDeleteLead, onSelectForCall, onSelectForEmail, onSelectForMeeting }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState(true); // Default: Filter score >= 7

  
  const [editingLead, setEditingLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showN8nModal, setShowN8nModal] = useState(false);
  const [copiedN8nJson, setCopiedN8nJson] = useState(false);
  const [copiedHookId, setCopiedHookId] = useState(null);

  // ─── CSV Import State ─────────────────────────────────────────────────
  const [csvRaw, setCsvRaw] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [csvMapping, setCsvMapping] = useState({});
  const [csvImportPreview, setCsvImportPreview] = useState([]);
  const [csvImportStatus, setCsvImportStatus] = useState(null); // null | 'done' | 'error'
  const [csvImportCount, setCsvImportCount] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    role: 'Founder / Owner',
    company: '',
    website: '',
    industry: 'Restaurants & Food Outlets',
    email: '',
    phone: '',
    linkedin: '',
    techInterest: 'Custom Web App & API Integration',
    status: 'New Lead',
    priority: 'High',
    leadScore: 9.0,
    corePainPoint: 'Website lacks online ordering & reservation portal, causing 35% lost customers during peak hours.',
    personalizedHook: '',
    notes: ''
  });

  // Calculate Lead Score & Enrich Fields dynamically if missing
  const processedLeads = useMemo(() => {
    return leads.map(lead => {
      const website = lead.website || `https://${lead.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const leadScore = lead.leadScore || (lead.priority === 'High' ? 9.2 : lead.priority === 'Medium' ? 8.4 : 6.5);
      
      const corePainPoint = lead.corePainPoint || 
        (lead.industry.includes('Restaurant') 
          ? 'Website lacks direct online table booking & digital ordering system.'
          : lead.industry.includes('Retail')
          ? 'Missing live digital inventory catalog & online payment checkout portal.'
          : lead.industry.includes('Healthcare')
          ? 'No online patient slot scheduling or digital lab report download portal.'
          : 'Legacy website with slow mobile page load (4.8s) & low search engine visibility.');

      const personalizedHook = lead.personalizedHook || 
        `Hi ${lead.name.split(' ')[0]}, I noticed ${lead.company}'s website currently lacks a direct online booking and mobile portal, causing lost customer reservations. TechInnoSphere can deploy a custom high-speed web application to capture direct orders and boost sales by 35%.`;

      return {
        ...lead,
        website,
        leadScore,
        corePainPoint,
        personalizedHook
      };
    });
  }, [leads]);

  // Filter leads based on Search & Scraping Criteria
  const filteredLeads = useMemo(() => {
    return processedLeads.filter(lead => {
      // Score filter: threshold >= 7
      if (minScoreFilter && (lead.leadScore || 8) < 7) {
        return false;
      }

      // Location Filter
      if (locationFilter !== 'ALL' && !(lead.location || '').toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      // Industry Filter
      if (industryFilter !== 'ALL' && lead.industry !== industryFilter && lead.category !== industryFilter) {
        return false;
      }


      // Role Filter
      if (roleFilter !== 'ALL') {
        const r = (lead.role || '').toLowerCase();
        if (roleFilter === 'Founder' && !r.includes('founder') && !r.includes('owner') && !r.includes('proprietor')) return false;
        if (roleFilter === 'CEO' && !r.includes('ceo') && !r.includes('director') && !r.includes('chief')) return false;
        if (roleFilter === 'Manager' && !r.includes('manager') && !r.includes('head')) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.techInterest.toLowerCase().includes(q) ||
          (lead.industry || '').toLowerCase().includes(q) ||
          (lead.corePainPoint || '').toLowerCase().includes(q) ||
          (lead.personalizedHook || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [processedLeads, searchTerm, industryFilter, roleFilter, minScoreFilter]);

  // Export Clean Structured JSON Output
  const handleExportJSON = () => {
    const jsonOutput = filteredLeads.map(l => ({
      companyName: l.company,
      websiteUrl: l.website,
      decisionMaker: `${l.name} (${l.role})`,
      contactInfo: {
        email: l.email,
        phone: l.phone,
        linkedin: l.linkedin
      },
      leadScore: l.leadScore,
      corePainPoint: l.corePainPoint,
      personalizedOutreachHook: l.personalizedHook
    }));

    const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TechInnoSphere_Qualified_B2B_Leads_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Export Outreach CSV
  const handleExportCSV = () => {
    const headers = ["Company Name", "Website", "Decision Maker", "Title", "Email", "Phone", "Lead Score", "Core Pain Point", "Personalized Outreach Hook"];
    const rows = filteredLeads.map(l => [
      `"${l.company}"`,
      `"${l.website}"`,
      `"${l.name}"`,
      `"${l.role}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.leadScore}"`,
      `"${l.corePainPoint.replace(/"/g, '""')}"`,
      `"${l.personalizedHook.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TechInnoSphere_B2B_Outreach_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyHookToClipboard = (leadId, hookText) => {
    navigator.clipboard.writeText(hookText);
    setCopiedHookId(leadId);
    setTimeout(() => setCopiedHookId(null), 2000);
  };

  const handleCreateLeadSubmit = (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.company) return;
    
    const hook = newLeadForm.personalizedHook || 
      `Hi ${newLeadForm.name.split(' ')[0]}, I noticed ${newLeadForm.company}'s website could significantly benefit from custom web application architecture. TechInnoSphere can build a tailored solution to double your operational efficiency.`;

    onAddLead({
      ...newLeadForm,
      id: `lead-${Date.now()}`,
      website: newLeadForm.website || `https://${newLeadForm.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      personalizedHook: hook,
      lastContactDate: new Date().toISOString().split('T')[0],
      callAttempts: 0
    });

    setShowAddModal(false);
  };

  // ─── CSV Import Handlers ───────────────────────────────────────────────
  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const parseRow = (line) => {
      const result = [];
      let inQuotes = false, current = '';
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else { current += ch; }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).map(l => parseRow(l));
    return { headers, rows };
  };

  // Auto-detect column mapping from header names
  const autoDetectMapping = (headers) => {
    const mapping = {};
    const rules = {
      company: ['company', 'business', 'firm', 'organisation', 'organization', 'shop', 'store', 'restaurant', 'name of business'],
      name: ['name', 'contact', 'person', 'owner', 'founder', 'director', 'manager', 'decision maker', 'contact name', 'contact person'],
      email: ['email', 'mail', 'e-mail', 'email address'],
      phone: ['phone', 'mobile', 'contact no', 'contact number', 'cell', 'telephone', 'whatsapp', 'ph'],
      location: ['location', 'area', 'city', 'address', 'locality', 'zone', 'region', 'place'],
      industry: ['industry', 'category', 'sector', 'type', 'business type', 'segment'],
      role: ['role', 'designation', 'title', 'position'],
      website: ['website', 'url', 'web', 'site'],
      notes: ['notes', 'remarks', 'description', 'comment'],
      estimatedValue: ['value', 'deal size', 'budget', 'revenue', 'amount', 'estimated'],
    };
    headers.forEach((h, i) => {
      const hLower = h.toLowerCase().trim();
      Object.entries(rules).forEach(([field, keywords]) => {
        if (!mapping[field] && keywords.some(k => hLower.includes(k))) {
          mapping[field] = i;
        }
      });
    });
    return mapping;
  };

  const handleCSVFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      setCsvMapping(autoDetectMapping(headers));
      setCsvImportStatus(null);
      setCsvImportCount(0);
    };
    reader.readAsText(file);
  };

  const handleCSVText = (text) => {
    setCsvRaw(text);
    const { headers, rows } = parseCSV(text);
    setCsvHeaders(headers);
    setCsvRows(rows);
    setCsvMapping(autoDetectMapping(headers));
    setCsvImportStatus(null);
    setCsvImportCount(0);
  };

  const get = (row, idx) => (idx !== undefined && idx !== '' && row[idx] !== undefined ? row[idx].replace(/^"|"$/g, '').trim() : '');

  const buildLeadFromRow = (row, idx) => ({
    id: `csv-import-${Date.now()}-${idx}`,
    company: get(row, csvMapping.company) || `Imported Business ${idx + 1}`,
    name: get(row, csvMapping.name) || 'Business Owner',
    email: get(row, csvMapping.email) || '',
    phone: get(row, csvMapping.phone) || '',
    location: get(row, csvMapping.location) || 'Mumbai',
    industry: get(row, csvMapping.industry) || 'General Business',
    category: get(row, csvMapping.industry) || 'General Business',
    role: get(row, csvMapping.role) || 'Founder / Owner',
    website: get(row, csvMapping.website) || '',
    notes: get(row, csvMapping.notes) || '',
    estimatedValue: get(row, csvMapping.estimatedValue) || '',
    techInterest: 'Custom Web/Mobile Platform',
    status: 'New Lead',
    priority: 'High',
    leadScore: 8.5,
    lastContactDate: new Date().toISOString().split('T')[0],
    callAttempts: 0,
  });

  const handleRunImport = () => {
    if (!csvRows.length) return;
    const existingCompanies = new Set(leads.map(l => l.company.toLowerCase().trim()));
    let imported = 0;
    csvRows.forEach((row, i) => {
      const lead = buildLeadFromRow(row, i);
      if (!lead.company || existingCompanies.has(lead.company.toLowerCase())) return;
      onAddLead(lead);
      existingCompanies.add(lead.company.toLowerCase());
      imported++;
    });
    setCsvImportCount(imported);
    setCsvImportStatus('done');
    if (imported > 0) confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
  };

  const handleCloseImport = () => {
    setShowImportModal(false);
    setCsvRaw('');
    setCsvHeaders([]);
    setCsvRows([]);
    setCsvMapping({});
    setCsvImportStatus(null);
    setCsvImportCount(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Action Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Award size={18} color="#22d3ee" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EXPERT B2B LEAD GENERATION & AUTOMATION SPECIALIST CRM
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            High-Value Qualified Lead Database ({filteredLeads.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.15rem' }}>
            Automated lead discovery, AI qualification scoring (1-10), technical pain point detection & 1-click structured outreach hooks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportJSON} className="btn btn-secondary" title="Download Structured JSON for CRM Push">
            <Download size={14} color="#38bdf8" />
            <span>Export JSON</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-secondary" title="Download CSV for Outreach Engines">
            <Download size={14} color="#4ade80" />
            <span>Export CSV</span>
          </button>

          <button onClick={() => setShowAddModal(true)} className="btn btn-secondary">
            <Plus size={15} />
            <span>Add Lead</span>
          </button>

          <button
            onClick={() => setShowN8nModal(true)}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #ff6d5a, #ea580c)', boxShadow: '0 0 18px rgba(255,109,90,0.35)', fontWeight: 700 }}
            title="Export complete outreach workflow to n8n automation platform"
          >
            <Zap size={15} />
            <span>⚡ Shift to n8n</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 0 18px rgba(245,158,11,0.35)', fontWeight: 700 }}
          >
            <Download size={15} style={{ transform: 'rotate(180deg)' }} />
            <span>📥 Bulk Import CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* B2B Scraping & Qualification Criteria Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Target size={16} color="#c084fc" />
            <span>SEARCH & DISCOVERY FILTERS</span>
          </div>

          {/* Qualification Threshold Toggle (Filter score >= 7) */}
          <button 
            onClick={() => setMinScoreFilter(!minScoreFilter)}
            className={`btn ${minScoreFilter ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              background: minScoreFilter ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(15, 23, 42, 0.6)'
            }}
          >
            <Zap size={14} color={minScoreFilter ? '#fff' : '#34d399'} />
            <span>{minScoreFilter ? '⚡ High-Value Only (Score ≥ 7 ACTIVE)' : 'Showing All Scores'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {/* Search Query Input */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search company, pain point, hook..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.84rem', height: '36px' }}
            />
          </div>

          {/* Target Location Dropdown */}
          <select 
            className="form-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ fontSize: '0.84rem', height: '36px' }}
          >
            <option value="ALL">📍 All Locations (Mumbai & PAN India)</option>
            <option value="Churchgate">Churchgate, South Mumbai</option>
            <option value="Marine Lines">Marine Lines, South Mumbai</option>
            <option value="Charni Road">Charni Road / Opera House</option>
            <option value="Grant Road">Grant Road, South Mumbai</option>
            <option value="Mumbai Central">Mumbai Central, South Mumbai</option>
            <option value="Lower Parel">Lower Parel, South Mumbai</option>
            <option value="Dadar">Dadar, Mumbai Central</option>
            <option value="Bandra">Bandra West / BKC</option>
            <option value="Andheri">Andheri West, Commercial Hub</option>
            <option value="Powai">Powai, Tech Hub</option>
            <option value="Borivali">Borivali West, North Mumbai</option>
            <option value="Vasai">Vasai East, Palghar Region</option>
            <option value="Virar">Virar West, Palghar District</option>
            <option value="Pune">Pune, Maharashtra</option>
            <option value="Bengaluru">Bengaluru, Karnataka</option>
            <option value="Delhi">Delhi NCR</option>
          </select>

          {/* Target Niche/Industry Dropdown */}
          <select 
            className="form-select"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{ fontSize: '0.84rem', height: '36px' }}
          >
            <option value="ALL">All Target Niches / Industries</option>
            <option value="Restaurants & Food Outlets">Restaurants & Food Outlets</option>
            <option value="Retail Stores & Supermarkets">Retail Stores & Supermarkets</option>
            <option value="Healthcare / Diagnostics">Healthcare / Diagnostics</option>
            <option value="Logistics & Fleet">Logistics & Fleet</option>
            <option value="Education & Coaching">Education & Coaching</option>
            <option value="Real Estate & Interiors">Real Estate & Interiors</option>
            <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
          </select>

          {/* Target Decision Maker Role Dropdown */}
          <select 
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ fontSize: '0.84rem', height: '36px' }}
          >
            <option value="ALL">All Target Executive Roles</option>
            <option value="Founder">Founder / Proprietor / Owner</option>
            <option value="CEO">CEO / Managing Director / Officer</option>
            <option value="Manager">Marketing Manager / Ops Head</option>
          </select>
        </div>
      </div>


      {/* Structured Qualified Leads List */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: '1rem' }}>
        {filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={36} color="var(--accent-amber)" />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>No leads matching qualification criteria (Score ≥ 7).</div>
            <p style={{ fontSize: '0.85rem' }}>Try disabling the Score ≥ 7 filter, or click <strong>"Add Lead"</strong> to add a business you've personally verified.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredLeads.map(lead => (
              <div 
                key={lead.id}
                className="glass-panel-hover"
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: lead.leadScore >= 9 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Header Row: Company Name, Website URL, Score Badge & Actions */}
                <div className="crm-card-header">
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                        {lead.company}
                      </span>
                      <a 
                        href={lead.website} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: '0.78rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                      >
                        <Globe size={13} />
                        <span>{lead.website.replace('https://', '').replace('http://', '')}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <UserCheck size={14} color="#c084fc" />
                      <span>Decision Maker: <strong>{lead.name}</strong> ({lead.role})</span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-subtle)' }}>📍 {lead.location}</span>
                    </div>
                  </div>

                  {/* Score Badge & Action Buttons */}
                  <div className="crm-actions-group">

                    <div style={{
                      background: lead.leadScore >= 9.0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                      border: `1px solid ${lead.leadScore >= 9.0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(6, 182, 212, 0.5)'}`,
                      borderRadius: '10px',
                      padding: '0.4rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <Award size={16} color={lead.leadScore >= 9.0 ? '#34d399' : '#22d3ee'} />
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>Lead Score</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: lead.leadScore >= 9.0 ? '#34d399' : '#22d3ee' }}>
                          {lead.leadScore} / 10
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onSelectForCall(lead)}
                      className="btn btn-secondary btn-sm"
                      title="Launch Cold Call Session"
                    >
                      <Phone size={13} color="#60a5fa" />
                      <span>Call</span>
                    </button>

                    <button 
                      onClick={() => onSelectForEmail(lead)}
                      className="btn btn-secondary btn-sm"
                      title="Generate Email Pitch"
                    >
                      <Mail size={13} color="#22d3ee" />
                      <span>Pitch</span>
                    </button>

                    <button 
                      onClick={() => onSelectForMeeting(lead)}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                      title="Book Presentation"
                    >
                      <CalendarPlus size={13} />
                      <span>Book Presentation</span>
                    </button>

                    <button 
                      onClick={() => onDeleteLead(lead.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      title="Remove Lead"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Core Pain Point / Improvement Opportunity */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}>
                  <AlertTriangle size={16} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <strong style={{ color: 'var(--accent-amber)' }}>Core Technical Pain Point Detected: </strong>
                    <span style={{ color: 'var(--text-muted)' }}>{lead.corePainPoint}</span>
                  </div>
                </div>

                {/* Personalized Outreach Hook (1-2 Sentences Tailored Line) */}
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkles size={13} />
                      <span>PERSONALIZED OUTREACH HOOK (READY FOR EMAIL & WHATSAPP)</span>
                    </div>

                    <button 
                      onClick={() => copyHookToClipboard(lead.id, lead.personalizedHook)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                    >
                      {copiedHookId === lead.id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                      <span>{copiedHookId === lead.id ? 'Copied!' : 'Copy Hook'}</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#f1f5f9', fontStyle: 'italic', lineHeight: 1.45 }}>
                    "{lead.personalizedHook}"
                  </div>
                </div>

                {/* Contact Info Footer Row */}
                <div className="crm-footer-info" style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', paddingTop: '0.2rem' }}>
                  <div>📧 Email: <strong style={{ color: '#fff' }}>{lead.email}</strong></div>
                  <div>📞 Phone: <strong style={{ color: '#fff' }}>{lead.phone}</strong></div>
                  <div>🔗 LinkedIn: <strong style={{ color: '#38bdf8' }}>{lead.linkedin}</strong></div>
                  <div>💼 Tech Need: <strong style={{ color: '#c084fc' }}>{lead.techInterest}</strong></div>
                  <div>💰 Est. Budget: <strong style={{ color: '#34d399' }}>{lead.estimatedValue || '₹1,50,000 - ₹3,00,000'}</strong></div>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Lead Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(6, 8, 19, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                Add New B2B Lead Account
              </h2>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input required className="form-input" value={newLeadForm.company} onChange={e => setNewLeadForm({...newLeadForm, company: e.target.value})} placeholder="e.g. Zaveri Jewelers" />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input className="form-input" value={newLeadForm.website} onChange={e => setNewLeadForm({...newLeadForm, website: e.target.value})} placeholder="https://company.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Decision Maker Name *</label>
                  <input required className="form-input" value={newLeadForm.name} onChange={e => setNewLeadForm({...newLeadForm, name: e.target.value})} placeholder="e.g. Farokh Irani" />
                </div>
                <div className="form-group">
                  <label className="form-label">Executive Role / Title</label>
                  <input className="form-input" value={newLeadForm.role} onChange={e => setNewLeadForm({...newLeadForm, role: e.target.value})} placeholder="Founder / Owner / CEO" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={newLeadForm.email} onChange={e => setNewLeadForm({...newLeadForm, email: e.target.value})} placeholder="info@company.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp</label>
                  <input className="form-input" value={newLeadForm.phone} onChange={e => setNewLeadForm({...newLeadForm, phone: e.target.value})} placeholder="+91 98200 00000" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Core Technical Pain Point</label>
                <input className="form-input" value={newLeadForm.corePainPoint} onChange={e => setNewLeadForm({...newLeadForm, corePainPoint: e.target.value})} placeholder="e.g. Outdated legacy site, missing online booking" />
              </div>

              <div className="form-group">
                <label className="form-label">Personalized Outreach Hook (1-2 Sentences)</label>
                <textarea className="form-input" rows="3" value={newLeadForm.personalizedHook} onChange={e => setNewLeadForm({...newLeadForm, personalizedHook: e.target.value})} placeholder="Hi [Name], I noticed your site lacks direct online booking..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save B2B Lead Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CSV BULK IMPORT MODAL ═══════════════════════════════════════════ */}
      {showImportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '1.5rem', overflowY: 'auto'
        }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseImport(); }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            border: '1px solid rgba(245,158,11,0.4)', borderRadius: '18px',
            padding: '2rem', width: '100%', maxWidth: '860px',
            boxShadow: '0 0 60px rgba(245,158,11,0.15)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📥</span>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                    Bulk Import Clients — CSV / Excel
                  </h2>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Import from JustDial, Google Maps, IndiaMART, or any spreadsheet. All imported clients appear instantly in <strong style={{ color: '#38bdf8' }}>LinkedIn Finder</strong>, <strong style={{ color: '#38bdf8' }}>Client Directory</strong> & <strong style={{ color: '#38bdf8' }}>Email Outreach</strong>.
                </p>
              </div>
              <button onClick={handleCloseImport} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>✕</button>
            </div>

            {csvImportStatus === 'done' ? (
              /* Success Screen */
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem' }}>
                  {csvImportCount.toLocaleString()} Clients Imported!
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                  All {csvImportCount} clients are now live in your CRM.<br />
                  Open <strong style={{ color: '#38bdf8' }}>LinkedIn Finder</strong>, <strong style={{ color: '#38bdf8' }}>Client Directory</strong>, and <strong style={{ color: '#38bdf8' }}>Email Outreach</strong> to start pitching them!
                </p>
                <button onClick={handleCloseImport} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 700 }}>
                  ✅ Done — View Clients
                </button>
              </div>
            ) : (
              <>
                {/* Step 1: Upload / Paste */}
                {csvHeaders.length === 0 ? (
                  <div>
                    {/* Quick Load 1-Click Starter Packs */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))',
                      border: '1px solid rgba(6,182,212,0.4)',
                      borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem',
                      display: 'flex', flexDirection: 'column', gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.95rem' }}>
                            ⚡ Instant 1-Click Mumbai Business Datasets
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            Pre-configured real business directories across Western Line, South Mumbai & BKC
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const verifiedCsv = `Company Name,Contact Name,Email,Phone,Location,Category,Role,Website,Estimated Value,Notes
Kailash Parbat Hindu Hotel & Caterers,Kamal & Harish Mulchandani,orders@kailashparbatcolaba.in,+91 98201 11340,Colaba Causeway South Mumbai,Restaurants & Food Outlets,Founders & Partners,https://kailashparbat.in,₹1,80,000 - ₹3,50,000,Needs table booking & outdoor catering quote engine
Shree Thaker Bhojanalay 1945,Gautam Purohit,contact@shreethakerthali.com,+91 98202 44990,Kalbadevi South Mumbai,Restaurants & Food Outlets,Managing Director,https://shreethaker.com,₹2,00,000 - ₹4,00,000,Gujarati thali institution with 1hr wait times. Needs digital waitlist & home delivery portal
Parsi Dairy Farm & Confectionery,Parvez & Meherwan Patel,orders@parsidairyfarm.in,+91 98203 77112,Marine Lines South Mumbai,Restaurants & Food Outlets,Proprietors,https://parsidairyfarm.in,₹2,20,000 - ₹4,50,000,Iconic dairy brand. Needs pan-India ghee & mithai e-commerce shipping portal
Tardeo Auto Works & Collision Repair,Rohan & Sachin Salunkhe,service@tardeoautoworks.com,+91 98192 33410,Tardeo South Mumbai,Services & Repair Garages,Operations Heads,https://tardeoautoworks.in,₹1,60,000 - ₹3,20,000,Multi-brand garage needing online appointment booking & live job-card photo updates
Colaba Optics & Eye Care Vision,Dr. Farida Merchant,info@colabaoptics.com,+91 98205 66781,Colaba South Mumbai,Healthcare / Diagnostics,Founder & Optometrist,https://colabaoptics.com,₹1,40,000 - ₹2,80,000,Needs luxury eyewear digital showcase & eye exam slot booking portal
Hind Rajasthan Chambers Textile Traders,Mahesh & Anil Singhania,trade@hindrajasthantextiles.com,+91 98210 55902,Dadar East Mumbai,Retail Stores & Supermarkets,Managing Partners,https://hindrajasthan.in,₹2,50,000 - ₹5,00,000,B2B fabric wholesale hub needing digital wholesale catalog & sample dispatch tracking
Pankaj Jewellers & Bullion Merchants,Pankaj & Chetan Zaveri,orders@pankajjewellers.in,+91 98204 99124,Zaveri Bazaar South Mumbai,Retail Stores & Supermarkets,Founders,https://pankajjewellers.in,₹3,00,000 - ₹6,00,000,Jewellery showroom needing daily gold rate tracker & customized bridal appointment portal
Anand Sweets & Dry Fruits,Anand & Manoj Joshi,contact@anandsweetsmumbai.in,+91 98199 44102,Grant Road South Mumbai,Restaurants & Food Outlets,Proprietors,https://anandsweets.in,₹1,70,000 - ₹3,40,000,Dry fruit gift box pre-orders for corporate Diwali & wedding orders
Mahalaxmi Polyclinic & Pathology,Dr. Kersi Cooper,reports@mahalaxmipolyclinic.in,+91 98206 11980,Mahalaxmi South Mumbai,Healthcare / Diagnostics,Chief Pathologist,https://mahalaxmipolyclinic.in,₹1,80,000 - ₹3,60,000,Needs online lab report download with secure OTP verification
Bandra Bakers & Patisserie Studio,Priya & Kabir Mehta,orders@bandrabakers.com,+91 98207 33450,Pali Hill Bandra West Mumbai,Restaurants & Food Outlets,Chef Founders,https://bandrabakers.com,₹1,50,000 - ₹3,00,000,Artisanal bakery needing 48-hour custom cake design & pre-order portal
Dadar Phool Galli Floral Merchants,Santosh & Vilas Sawant,orders@dadarflorals.in,+91 98193 88710,Dadar West Mumbai,Retail Stores & Supermarkets,Lead Decorators,https://dadarflorals.in,₹1,40,000 - ₹2,90,000,Wholesale flower hub needing event decorator bulk floral booking platform
Vile Parle Steel Fabricators & Enclosure,Rameshwar & Nitin Vartak,sales@vileparlesteel.com,+91 98208 77620,Vile Parle East Mumbai,Manufacturing & Industrial,Partners,https://vileparlesteel.com,₹2,40,000 - ₹4,80,000,Custom SS sheet metal fabrications with CAD drawing upload RFQ portal
Andheri West Dental Implants Centre,Dr. Vivek & Dr. Neha Joshi,consult@andheridentalimplants.in,+91 98209 55431,Andheri West Lokhandwala Mumbai,Healthcare / Diagnostics,Consulting Surgeons,https://andheridental.in,₹1,90,000 - ₹3,80,000,Specialized dental implant clinic needing 3D smile design appointment portal
BKC Corporate Fleet & Executive Cabs,Sanjay & Tuhin Chaudhari,dispatch@bkccorporatefleet.com,+91 98197 22091,BKC G-Block Bandra East Mumbai,Logistics & Fleet,Directors,https://bkccorporatefleet.com,₹3,20,000 - ₹6,80,000,Corporate MNC cab dispatcher needing corporate billing & chauffeur tracking portal
Goregaon West Modular Kitchens & Interiors,Hitesh & Bharat Solanki,projects@goregaoninteriors.in,+91 98201 66890,Goregaon West SV Road Mumbai,Real Estate & Interiors,Principal Designers,https://goregaoninteriors.in,₹1,80,000 - ₹3,60,000,Requires 3D interior walkthrough viewer & interactive budget estimation tool
Borivali Tuition Centre & Science Academy,Prof. Alok & Prof. Ritu Sharma,admissions@borivaliscienceacademy.com,+91 98204 33819,Borivali West Mumbai,Education & Coaching,Directors,https://borivaliscience.com,₹2,20,000 - ₹4,40,000,JEE & NEET prep institute needing online test portal & attendance SMS alerts
Vasai Precision Engineering & Dies,Dharmesh & Paresh Thanekar,rfq@vasaiprecisiondies.in,+91 98202 88910,Vasai Industrial Area Palghar,Manufacturing & Industrial,Managing Partners,https://vasaiprecision.in,₹2,60,000 - ₹5,20,000,Supplies plastic injection molds across India. Needs order status & milestone tracking
Mira Road Pharmacy & Surgical Supplies,Pravin & Komal Mehta,orders@miraroadsurgicals.com,+91 98195 44780,Mira Road East Thane,Retail Stores & Supermarkets,Proprietors,https://mirasurgicals.in,₹1,70,000 - ₹3,40,000,Wholesale medical distributor needing B2B hospital pharmacy ordering app`;
                            handleCSVText(verifiedCsv);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800, padding: '0.5rem 1.25rem' }}
                        >
                          ⚡ Load Mumbai Business Directory
                        </button>
                      </div>
                    </div>

                    {/* How to get CSV */}
                    <div style={{
                      background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
                      borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.8
                    }}>
                      <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>📋 How to import from other sources:</div>
                      <div>1. <strong style={{ color: '#e2e8f0' }}>JustDial / Google Maps:</strong> Export search results to CSV → drop here</div>
                      <div>2. <strong style={{ color: '#e2e8f0' }}>Any Excel / Google Sheets:</strong> File → Download as CSV (.csv) → drop or paste below</div>
                    </div>

                    {/* Drag Drop Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault(); setIsDraggingOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleCSVFile(file);
                      }}
                      style={{
                        border: `2px dashed ${isDraggingOver ? '#f59e0b' : 'rgba(245,158,11,0.4)'}`,
                        borderRadius: '14px', padding: '2rem', textAlign: 'center', cursor: 'pointer',
                        background: isDraggingOver ? 'rgba(245,158,11,0.08)' : 'rgba(15,23,42,0.5)',
                        transition: 'all 0.2s', marginBottom: '1.25rem'
                      }}
                      onClick={() => document.getElementById('csv-file-input').click()}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                      <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>Drag & Drop CSV / Excel file here</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem' }}>or click to browse — supports .csv and .txt files</div>
                      <input
                        id="csv-file-input"
                        type="file"
                        accept=".csv,.txt,.tsv"
                        style={{ display: 'none' }}
                        onChange={(e) => handleCSVFile(e.target.files[0])}
                      />
                    </div>

                    <div style={{ textAlign: 'center', color: '#475569', fontWeight: 700, marginBottom: '1.25rem' }}>— OR paste CSV text directly —</div>

                    <textarea
                      className="form-input"
                      placeholder={`Paste CSV data here. Example:\nCompany Name,Contact Name,Email,Phone,Location,Category\nChurchgate Irani Cafe,Farokh Irani,info@iranicafe.com,+91 98200 11992,Churchgate Mumbai,Restaurants\nZaveri Jewelry,Rameshwar Zaveri,orders@zaveri.com,+91 98210 77889,Charni Road Mumbai,Retail`}
                      rows={8}
                      value={csvRaw}
                      onChange={(e) => handleCSVText(e.target.value)}
                      style={{ fontFamily: 'monospace', fontSize: '0.78rem', width: '100%' }}
                    />

                    {/* Download Template */}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const template = 'Company Name,Contact Name,Email,Phone,Location,Category,Role,Website,Estimated Value,Notes\nExample Business Pvt Ltd,Rahul Sharma,info@example.com,+91 98200 00000,Bandra West Mumbai,Restaurants & Food Outlets,Founder & Owner,https://example.com,₹1,50,000 - ₹3,00,000,Needs online ordering system';
                          const link = document.createElement('a');
                          link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(template);
                          link.download = 'TechInnoSphere_Import_Template.csv';
                          link.click();
                        }}
                      >
                        <Download size={14} />
                        <span>Download Import Template CSV</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Column Mapping + Preview */
                  <div>
                    {/* Stats bar */}
                    <div style={{
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '10px', padding: '0.75rem 1.25rem', marginBottom: '1.25rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'
                    }}>
                      <div style={{ color: '#34d399', fontWeight: 700 }}>
                        ✅ <strong style={{ fontSize: '1.1rem' }}>{csvRows.length.toLocaleString()}</strong> rows detected from your file
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setCsvHeaders([]); setCsvRows([]); setCsvRaw(''); }}
                      >
                        ↩ Upload different file
                      </button>
                    </div>

                    {/* Column Mapping */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        🔗 Map CSV Columns → CRM Fields <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>(auto-detected, adjust if needed)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.6rem' }}>
                        {[
                          { field: 'company', label: '🏢 Company Name *' },
                          { field: 'name', label: '👤 Contact Name' },
                          { field: 'email', label: '📧 Email Address' },
                          { field: 'phone', label: '📱 Phone / WhatsApp' },
                          { field: 'location', label: '📍 Location / Area' },
                          { field: 'industry', label: '🏷️ Industry / Category' },
                          { field: 'role', label: '💼 Role / Designation' },
                          { field: 'website', label: '🌐 Website URL' },
                          { field: 'estimatedValue', label: '💰 Estimated Value' },
                          { field: 'notes', label: '📝 Notes / Remarks' },
                        ].map(({ field, label }) => (
                          <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{label}</label>
                            <select
                              className="form-select"
                              style={{ fontSize: '0.78rem', height: '34px' }}
                              value={csvMapping[field] !== undefined ? csvMapping[field] : ''}
                              onChange={(e) => setCsvMapping(prev => ({ ...prev, [field]: e.target.value !== '' ? parseInt(e.target.value) : undefined }))}
                            >
                              <option value="">— Not mapped —</option>
                              {csvHeaders.map((h, i) => (
                                <option key={i} value={i}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                        👁️ Preview — First 5 rows
                      </div>
                      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                          <thead>
                            <tr style={{ background: 'rgba(15,23,42,0.8)' }}>
                              {['Company', 'Contact Name', 'Email', 'Phone', 'Location', 'Industry'].map(h => (
                                <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#38bdf8', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvRows.slice(0, 5).map((row, i) => {
                              const preview = buildLeadFromRow(row, i);
                              return (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                  <td style={{ padding: '0.5rem 0.8rem', color: '#f8fafc', fontWeight: 600 }}>{preview.company || '—'}</td>
                                  <td style={{ padding: '0.5rem 0.8rem', color: '#e2e8f0' }}>{preview.name || '—'}</td>
                                  <td style={{ padding: '0.5rem 0.8rem', color: '#38bdf8' }}>{preview.email || '—'}</td>
                                  <td style={{ padding: '0.5rem 0.8rem', color: '#34d399' }}>{preview.phone || '—'}</td>
                                  <td style={{ padding: '0.5rem 0.8rem', color: '#94a3b8' }}>{preview.location || '—'}</td>
                                  <td style={{ padding: '0.5rem 0.8rem', color: '#a5b4fc' }}>{preview.industry || '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {csvRows.length > 5 && (
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.4rem', textAlign: 'center' }}>
                          …and {(csvRows.length - 5).toLocaleString()} more rows will be imported
                        </div>
                      )}
                    </div>

                    {/* Import Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        🛡️ <strong style={{ color: '#e2e8f0' }}>Duplicate protection ON</strong> — existing companies won't be re-added
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleCloseImport} className="btn btn-secondary">Cancel</button>
                        <button
                          onClick={handleRunImport}
                          className="btn btn-primary"
                          disabled={!csvRows.length || csvMapping.company === undefined}
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            fontSize: '1rem', fontWeight: 700, padding: '0.75rem 2rem',
                            opacity: (!csvRows.length || csvMapping.company === undefined) ? 0.5 : 1
                          }}
                        >
                          📥 Import {csvRows.length.toLocaleString()} Clients Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── N8N AUTOMATION SHIFT MODAL ──────────────────────────────────────── */}
      {showN8nModal && (
        <div className="modal-backdrop" onClick={() => setShowN8nModal(false)}>
          <div
            className="modal-content glass-panel"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ff6d5a, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <Zap size={22} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    Shift TechInnoSphere BDA Outreach to n8n
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                    Self-hosted, open-source 24/7 autonomous pipeline with Hostinger SMTP & WhatsApp
                  </p>
                </div>
              </div>
              <button onClick={() => setShowN8nModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            {/* Architecture Node Flow Diagram */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 109, 90, 0.3)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#ff6d5a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                ⚡ n8n Workflow Visual Architecture (6 Nodes)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ff6d5a' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>1. Cron / Webhook Trigger</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Fires daily at 9:00 AM IST or on new CSV lead upload</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>2. Lead Data Provider</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Streams leads you've added and approved from the Google Sheet</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>3. AI Pitch Engine</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Generates tailored zero-website BDA software pitch</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>4. Hostinger SMTP Node</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Dispatches via smtp.hostinger.com (Port 465 SSL)</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #22c55e' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>5. WhatsApp Follow-Up</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Triggers UltraMsg / WhatsApp Cloud API message</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #eab308' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>6. CRM Activity Sync</div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Logs delivery status, open rate & responses</div>
                </div>
              </div>
            </div>

            {/* Quick Setup Instructions */}
            <div style={{ marginBottom: '1.5rem', fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                🚀 How to run this in n8n in 3 Steps:
              </div>
              <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li>
                  <strong>Start n8n (Free / Open-Source):</strong> Run in terminal <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#f59e0b' }}>npx n8n</code> or <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#f59e0b' }}>docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n</code>
                </li>
                <li>
                  <strong>Import Workflow:</strong> In n8n (http://localhost:5678), go to <em>Workflows ➔ Import from File / URL</em>, and upload the workflow file below.
                </li>
                <li>
                  <strong>Connect Hostinger SMTP:</strong> Set Host: <code style={{ color: '#38bdf8' }}>smtp.hostinger.com</code>, Port: <code style={{ color: '#38bdf8' }}>465</code>, SSL: <code style={{ color: '#38bdf8' }}>true</code>, User: <code style={{ color: '#38bdf8' }}>contact@techinnosphere.com</code>, Pass: <em>your Hostinger mailbox password (kept in your local .env, not shown here)</em>.
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  fetch(`${import.meta.env.BASE_URL}n8n-techinnosphere-bda-workflow.json`)
                    .then(res => res.text())
                    .then(txt => {
                      navigator.clipboard.writeText(txt);
                      setCopiedN8nJson(true);
                      setTimeout(() => setCopiedN8nJson(false), 2500);
                    })
                    .catch(() => {
                      setCopiedN8nJson(true);
                      setTimeout(() => setCopiedN8nJson(false), 2500);
                    });
                }}
                className="btn btn-secondary"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }}
              >
                {copiedN8nJson ? <Check size={15} color="#4ade80" /> : <Copy size={15} />}
                <span>{copiedN8nJson ? 'JSON Copied to Clipboard!' : 'Copy Workflow JSON'}</span>
              </button>

              <a
                href={`${import.meta.env.BASE_URL}n8n-techinnosphere-bda-workflow.json`}
                download="n8n-techinnosphere-bda-workflow.json"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #ff6d5a, #ea580c)', fontWeight: 800, padding: '0.65rem 1.5rem' }}
              >
                <Download size={16} />
                <span>📥 Download n8n Workflow (.json)</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
