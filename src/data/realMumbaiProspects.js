// Real, legitimate reference data: Mumbai/PAN-India neighborhoods and
// business districts. Used for location filters/dropdowns in the UI — not
// client data.
export const PAN_INDIA_LOCATIONS = [
  // ─── 1. MUMBAI & WESTERN RAILWAY LINE ──────────────────────────────────────
  'Churchgate, South Mumbai',
  'Marine Lines, South Mumbai',
  'Charni Road / Opera House, Mumbai',
  'Grant Road, South Mumbai',
  'Mumbai Central, South Mumbai',
  'Mahalaxmi / Lower Parel, Mumbai',
  'Prabhadevi / Worli, Mumbai',
  'Dadar West, Mumbai',
  'Matunga West, Mumbai',
  'Bandra West, Mumbai',
  'Bandra East / BKC, Mumbai',
  'Khar / Santacruz, Mumbai',
  'Vile Parle / Juhu, Mumbai',
  'Andheri East / SEEPZ, Mumbai',
  'Andheri West / Lokhandwala, Mumbai',
  'Goregaon West, Mumbai',
  'Malad West / Link Road, Mumbai',
  'Kandivali West, Mumbai',
  'Borivali West, Mumbai',
  'Mira Road / Bhayandar, Thane',
  'Vasai / Virar Industrial Belt, Palghar',
  'Navi Mumbai (Vashi / Belapur / Mahape)',
  'Thane (Wagle Estate / Ghodbunder Road)',

  // ─── 2. MAHARASHTRA & GUJARAT ──────────────────────────────────────────────
  'Pune (Hinjewadi / Baner / FC Road / Viman Nagar)',
  'Nagpur (MIDC Butibori / MIHAN)',
  'Nashik (Ambad / Satpur MIDC)',
  'Ahmedabad (SG Highway / Prahlad Nagar / Sanand)',
  'Surat (Diamond Bourse / Ring Road / Sachin)',
  'Vadodara (Alkapuri / Makarpura)',
  'Rajkot (Aji GIDC / Kalawad Road)',

  // ─── 3. SOUTH INDIA METROS ────────────────────────────────────────────────
  'Bengaluru (Indiranagar / Koramangala / Whitefield / HSR Layout)',
  'Hyderabad (HITEC City / Gachibowli / Madhapur / Banjara Hills)',
  'Chennai (OMR / Guindy / T Nagar / Anna Nagar)',
  'Kochi (Infopark / Kakkanad / MG Road)',
  'Coimbatore (Tidel Park / Peelamedu / Gandhipuram)',
  'Mysuru (Hebbal / Vijayanagar)',
  'Visakhapatnam (Rushikonda / Gajuwaka)',

  // ─── 4. NORTH INDIA & NCR ─────────────────────────────────────────────────
  'Delhi NCR (Connaught Place / Nehru Place / Okhla)',
  'Gurugram (Cyber City / Golf Course Road / Udyog Vihar)',
  'Noida (Sector 62 / Sector 18 / Expressway)',
  'Chandigarh (IT Park / Sector 17 / Mohali)',
  'Jaipur (Sitapura / Malviya Nagar / MI Road)',
  'Lucknow (Gomti Nagar / Hazratganj)',
  'Indore (Vijay Nagar / Super Corridor)',
  'Ludhiana (Industrial Area / Ferozepur Road)',
  'Dehradun (Rajpur Road / IT Park)',

  // ─── 5. EAST & CENTRAL INDIA ──────────────────────────────────────────────
  'Kolkata (Salt Lake Sector V / Park Street / Rajarhat)',
  'Bhubaneswar (Infocity / Chandrasekharpur)',
  'Patna (Exhibition Road / Fraser Road)',
  'Ranchi (Namkum / Ashok Nagar)',
  'Guwahati (GS Road / Dispur)',
  'Raipur (Naya Raipur / Telibandha)'
];

// This file previously exported REAL_MUMBAI_PROSPECTS: 12 real company names
// (Rebel Foods, Souled Store, etc.) paired with guessed contact details, plus
// 1,012 entirely fictional businesses procedurally generated from random
// name/company-name-root combinations — despite the file being labeled
// "1,000+ Verified Records." None of it was real client data. Removed
// 2026-08-09 at Hamzah's request.
//
// Add real prospects only after verifying them yourself, via the Lead
// Manager UI or the Google Sheet + n8n automation (see CLAUDE.md).
export const REAL_MUMBAI_PROSPECTS = [];
