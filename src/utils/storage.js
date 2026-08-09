import { INITIAL_LEADS, INITIAL_ACTIVITIES, INITIAL_MEETINGS } from '../data/initialLeads';

const LEADS_KEY = 'techinnosphere_bda_leads_v1';
const ACTIVITIES_KEY = 'techinnosphere_bda_activities_v1';
const MEETINGS_KEY = 'techinnosphere_bda_meetings_v1';

export const PERMANENT_SENDER_WHATSAPP = '+91 90824 60769';
export const PERMANENT_DIRECTOR_WHATSAPP = '9372015523';

// Note: no password here on purpose. The frontend never handles the SMTP
// credential directly — sending goes through email-server.cjs (localhost:3001),
// which reads SMTP_USER/SMTP_PASS from a local .env. See .env.example.
export const HOSTINGER_SMTP_CONFIG = {
  email: 'contact@techinnosphere.com',
  smtpHost: 'smtp.hostinger.com',
  smtpPort: 465,
  imapHost: 'imap.hostinger.com',
  imapPort: 993,
  protocol: 'SSL/TLS (Port 465)',
  status: 'AUTHENTICATED'
};



export const getStoredLeads = () => {
  try {
    const data = localStorage.getItem(LEADS_KEY);
    if (!data) {
      localStorage.setItem(LEADS_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    let parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LEADS_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }

    // ─── CRITICAL CLEANUP: Purge any legacy fake/unverified prospects ───────────
    // Covers the original placeholder batch, plus the "verified" leads removed
    // 2026-08-09 (real company names with guessed contact info, ids below) and
    // the procedurally-generated PAN-India batch (ids "pan-india-prospect-N").
    const REMOVED_FAKE_LEAD_IDS = new Set([
      'lead-rebel-foods', 'lead-wow-momo', 'lead-chai-point', 'lead-snackible',
      'lead-the-souled-store', 'lead-suta-bombay', 'lead-sugar-cosmetics',
      'lead-plum-goodness', 'lead-bombay-shaving', 'lead-pharmeasy',
      'lead-cult-fit', 'lead-porter', 'lead-infra-market', 'lead-nobroker',
      'lead-pepperfry', 'lead-zetwerk', 'lead-classplus', 'lead-cardekho',
      'lead-urban-company'
    ]);
    const hasFakeOrOutdated = parsed.some(l =>
      !l.company ||
      l.company.includes('#') ||
      l.id === 'lead-1' ||
      l.company.includes('Churchgate Heritage Bistro') ||
      l.company.includes('Trendz Fashion Grocery') ||
      l.company.includes('The Royal Bistro & Cafe') ||
      REMOVED_FAKE_LEAD_IDS.has(l.id) ||
      (typeof l.id === 'string' && l.id.startsWith('pan-india-prospect-'))
    );

    if (hasFakeOrOutdated) {
      localStorage.setItem(LEADS_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }

    // Merge any custom leads the user manually created
    const initialMap = new Map(INITIAL_LEADS.map(l => [l.id, l]));
    const merged = parsed.map(l => {
      const match = initialMap.get(l.id);
      return match ? { ...match, ...l } : l;
    });

    INITIAL_LEADS.forEach(initLead => {
      if (!merged.some(l => l.id === initLead.id || l.company.toLowerCase().trim() === initLead.company.toLowerCase().trim())) {
        merged.push(initLead);
      }
    });

    localStorage.setItem(LEADS_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('Failed to load leads from localStorage', err);
    return INITIAL_LEADS;
  }
};

export const saveStoredLeads = (leads) => {
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save leads to localStorage', err);
  }
};

export const getStoredActivities = () => {
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
  } catch (err) {
    console.error('Failed to load activities from localStorage', err);
    return INITIAL_ACTIVITIES;
  }
};

export const saveStoredActivities = (activities) => {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed to save activities to localStorage', err);
  }
};

export const getStoredMeetings = () => {
  try {
    const data = localStorage.getItem(MEETINGS_KEY);
    return data ? JSON.parse(data) : INITIAL_MEETINGS;
  } catch (err) {
    console.error('Failed to load meetings from localStorage', err);
    return INITIAL_MEETINGS;
  }
};

export const saveStoredMeetings = (meetings) => {
  try {
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
  } catch (err) {
    console.error('Failed to save meetings to localStorage', err);
  }
};

export const resetAllData = () => {
  localStorage.removeItem(LEADS_KEY);
  localStorage.removeItem(ACTIVITIES_KEY);
  localStorage.removeItem(MEETINGS_KEY);
  return {
    leads: INITIAL_LEADS,
    activities: INITIAL_ACTIVITIES,
    meetings: INITIAL_MEETINGS
  };
};
