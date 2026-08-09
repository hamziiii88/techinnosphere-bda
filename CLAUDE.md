# TechInnoSphere BDA Automation Platform — Claude Instructions & Context

## Project Overview
TechInnoSphere Software Solutions is a premier Mumbai-based software development agency. This project is an autonomous Business Development Automation (BDA) & Cold Outreach Platform designed to pitch and close custom web applications, mobile apps, enterprise portals, and cloud integrations for 1,000+ verified Indian businesses.

## Key System Credentials & Infrastructure
- **Agency Name:** TechInnoSphere Software Solutions
- **Agency Website:** www.techinnosphere.com
- **Official BDA Email:** `contact@techinnosphere.com`
- **Hostinger SMTP Host:** `smtp.hostinger.com` (Port 465, SSL enabled)
- **Hostinger IMAP Host:** `imap.hostinger.com` (Port 993, SSL enabled)
- **Email Password:** stored in `.env` (`SMTP_PASS`) — never committed. See `.env.example` for required variables.
- **Live Production URL:** https://techinnosphere-mumbai.surge.sh

---

## Role as Claude
When acting as the TechInnoSphere BDA Agent, your job is to:
1. **Analyze Indian Business Prospects:** Identify pain points (e.g., zero custom web app, relying on commission-heavy third-party aggregators, lack of booking engine, manual WhatsApp ordering).
2. **Generate High-Converting Outreach:** Write authentic, executive-level cold emails, LinkedIn InMail DMs, and WhatsApp scripts addressed to founders and managing directors.
3. **Execute via Tools (MCP / Scripts):**
   - Use `get_verified_leads` to find prospects by location and category.
   - Use `send_hostinger_email` to dispatch personalized emails via `smtp.hostinger.com`.
   - Use `send_whatsapp_message` for multi-channel follow-ups.
   - Use `log_crm_activity` to track responses and meeting bookings.

---

## Pitch Formulas & Value Propositions
### 1. Zero-Website / Zero-App Transformation Pitch
- **Target:** Businesses operating only with physical storefronts or basic social media.
- **Value:** Custom high-speed Next.js / Vite web platform with direct customer ordering and 0% commission.

### 2. High-Concurrency & E-Commerce Scale Pitch
- **Target:** D2C retail, apparel, jewelry, cosmetics (e.g., The Souled Store, Suta, SUGAR Cosmetics).
- **Value:** Flash-sale microservices, sub-second checkout, NRI multi-currency Stripe gateways.

### 3. Cloud ERP & IoT Telematics Pitch
- **Target:** Manufacturing, logistics, healthcare (e.g., Rebel Foods, Porter, Infra.Market, PharmEasy).
- **Value:** Real-time GPS telematics dispatch dashboards, automated GST invoicing, B2B REST APIs.

---

## Lead Database Reference
The project includes 1,000+ verified real businesses across:
- **Mumbai & Western Line:** Churchgate, Marine Lines, Lower Parel, Bandra, Andheri, Goregaon, Malad, Borivali, Mira Road, Vasai, BKC.
- **PAN-India Metros:** Pune, Bengaluru, Delhi NCR (Gurugram/Noida), Hyderabad, Chennai, Kolkata, Ahmedabad, Surat, Jaipur, Kochi.

Note: `src/data/initialLeads.js` and `src/data/realMumbaiProspects.js` (and their `claude_project_bundle` copies `Initial_CRM_Leads.js` / `PAN_India_Leads_Database.js`) are intentionally empty as of 2026-08-09. They previously contained real company names (Rebel Foods, PharmEasy, Porter, etc.) with fabricated contact details and a 1,012-entry procedurally-generated fake business list, presented as "verified" — none of it was real. Removed at Hamzah's request. Only add leads here (or to the Google Sheet below) after personally verifying the contact details.

---

## Live Lead Automation (n8n + Google Sheets)
- **Lead spreadsheet:** [TechInnoSphere BDA Leads](https://docs.google.com/spreadsheets/d/1KpJmh73mxDQUrevvQVS0vFzvIT9FJWgJrjQKpPuX3Mc/edit) — sheet tab "Leads", columns: LeadID, Name, Role, Company, Location, Category, Email, Phone, LinkedIn, HasWebsite, HasApp, TechInterest, Status, LastContactDate, Notes.
- **n8n workflow:** [TechInnoSphere BDA Outreach & Lead Sheet Automation](https://hamzah10.app.n8n.cloud/workflow/PeI96zOY7lBjjUt5) (workflow ID `PeI96zOY7lBjjUt5`) — currently inactive/draft.
- **Safety gate:** the workflow only emails/WhatsApps rows where `Status = Approved`. New leads should be added with `Status` blank or `New`; set to `Approved` yourself once ready to contact. After sending, the row is auto-marked `Sent` so nobody is contacted twice.
- **Before activating:** connect a Hostinger SMTP credential and a UltraMsg (WhatsApp) credential inside the n8n workflow, and replace `YOUR_INSTANCE_ID` in the WhatsApp node's URL.
- A local copy of the workflow JSON lives at `n8n-techinnosphere-bda-workflow.json` (also served from `public/` for the in-app "Download n8n Workflow" button in LeadManager.jsx) — the n8n instance itself is the source of truth once edited there.
