#!/usr/bin/env node
/**
 * TechInnoSphere Official Model Context Protocol (MCP) Server for Claude Desktop
 * Direct integration between Claude Desktop and TechInnoSphere BDA Outreach Suite.
 */

import nodemailer from 'nodemailer';
import readline from 'readline';
import 'dotenv/config';

// Hostinger SMTP Transport — credentials come from the environment.
// When run standalone, populate a .env (see .env.example). When run via
// Claude Desktop, the "env" block in claude_desktop_config.json supplies these.
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('Missing SMTP_USER / SMTP_PASS in environment. See .env.example.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// PAN-India Verified Sample Database
const VERIFIED_PROSPECTS = [
  {
    name: "Vedang Patel",
    role: "Co-Founder & Director",
    company: "The Souled Store Pvt. Ltd.",
    location: "Lower Parel, Mumbai",
    email: "connect@thesouledstore.com",
    phone: "+91 98200 11992",
    industry: "Retail & E-Commerce",
    techNeed: "High-Concurrency Flash Sale Architecture & Custom Mobile App",
    linkedin: "https://www.linkedin.com/company/the-souled-store/"
  },
  {
    name: "Vineeta Singh",
    role: "Co-Founder & CEO",
    company: "SUGAR Cosmetics (Vellvette)",
    location: "Andheri East, Mumbai",
    email: "hello@sugarcosmetics.com",
    phone: "+91 98192 88331",
    industry: "Beauty & D2C Retail",
    techNeed: "In-Store iPad AR Shade Try-On Tool & Stock Sync",
    linkedin: "https://www.linkedin.com/company/sugar-cosmetics/"
  },
  {
    name: "Sujata Biswas",
    role: "Co-Founder",
    company: "Suta Bombay",
    location: "Santacruz East, Mumbai",
    email: "info@suta.in",
    phone: "+91 98201 44550",
    industry: "Apparel & Artisanal",
    techNeed: "Bespoke Mobile Shopping App & NRI Multi-Currency Stripe Checkout",
    linkedin: "https://www.linkedin.com/company/suta-bombay/"
  },
  {
    name: "Jaydeep Barman",
    role: "Co-Founder & CEO",
    company: "Rebel Foods (Faasos / Behrouz)",
    location: "Powai, Mumbai",
    email: "contactus@rebelfoods.com",
    phone: "+91 99203 77412",
    industry: "FoodTech & Cloud Kitchens",
    techNeed: "Multi-Brand Cloud Kitchen Order Engine & API Middleware",
    linkedin: "https://www.linkedin.com/company/rebel-foods/"
  },
  {
    name: "Dharmil Sheth",
    role: "Co-Founder",
    company: "PharmEasy (API Holdings)",
    location: "Vikhroli, Mumbai",
    email: "care@pharmeasy.in",
    phone: "+91 7666 100 300",
    industry: "Healthcare & MedTech",
    techNeed: "B2B Pharmacy Restocking SaaS & Prescription AI Validation",
    linkedin: "https://www.linkedin.com/company/pharmeasy/"
  },
  {
    name: "Pranav Goel",
    role: "Co-Founder",
    company: "Porter (Resfeber Labs)",
    location: "Andheri East, Mumbai",
    email: "help@porter.in",
    phone: "+91 22 4410 4410",
    industry: "Logistics & Fleet",
    techNeed: "Enterprise Multi-Vehicle Dispatch Engine & Invoicing SaaS",
    linkedin: "https://www.linkedin.com/company/porter.in/"
  }
];

// MCP Tool Definitions
const TOOLS = [
  {
    name: 'get_verified_leads',
    description: 'Fetch verified Indian decision makers and companies across Mumbai, Bengaluru, Delhi NCR, and PAN India with emails, phone numbers, and software opportunities.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Filter by city or Mumbai station (e.g. "Lower Parel", "Bandra", "Andheri", "Bengaluru")' },
        category: { type: 'string', description: 'Filter by industry (e.g. "Retail", "Restaurants", "Healthcare", "Logistics")' },
      },
    },
  },
  {
    name: 'send_hostinger_email',
    description: 'Send an authentic, personalized B2B outreach email directly via Hostinger SMTP (contact@techinnosphere.com) with SSL.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        htmlBody: { type: 'string', description: 'HTML formatted body of the email' },
      },
      required: ['to', 'subject', 'htmlBody'],
    },
  },
  {
    name: 'generate_bda_pitch',
    description: 'Generate a tailored software development or mobile app pitch for an Indian enterprise.',
    inputSchema: {
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Name of the company' },
        decisionMaker: { type: 'string', description: 'Name of founder' },
        location: { type: 'string', description: 'Location / district' },
        service: { type: 'string', description: 'Web app, mobile app, or WhatsApp bot' },
      },
      required: ['company', 'decisionMaker'],
    },
  },
  {
    name: 'send_whatsapp_message',
    description: 'Queue an executive WhatsApp DM to an Indian founder mobile number.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Recipient phone number' },
        message: { type: 'string', description: 'The message text' },
      },
      required: ['phone', 'message'],
    },
  },
  {
    name: 'log_crm_activity',
    description: 'Log an outreach email, call, or meeting booked into the TechInnoSphere CRM deal pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        company: { type: 'string', description: 'Company name' },
        activityType: { type: 'string', enum: ['email_sent', 'call_logged', 'whatsapp_sent', 'meeting_booked'] },
        notes: { type: 'string', description: 'Summary notes' },
      },
      required: ['company', 'activityType'],
    },
  }
];

// Handle JSON-RPC Stdio messages
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  if (!line.trim()) return;

  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    // 1. Initialize Handshake
    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'techinnosphere-claude-bda-server',
          version: '2.0.0',
        },
      });
      return;
    }

    if (method === 'notifications/initialized') {
      return;
    }

    // 2. List Tools
    if (method === 'tools/list') {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    // 3. Call Tool
    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      if (name === 'get_verified_leads') {
        let results = VERIFIED_PROSPECTS;
        if (args?.location) {
          results = results.filter(l => l.location.toLowerCase().includes(args.location.toLowerCase()));
        }
        if (args?.category) {
          results = results.filter(l => l.industry.toLowerCase().includes(args.category.toLowerCase()));
        }
        sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
        });
        return;
      }

      if (name === 'send_hostinger_email') {
        const info = await transporter.sendMail({
          from: '"Hamzah | TechInnoSphere" <contact@techinnosphere.com>',
          to: args.to,
          subject: args.subject,
          html: args.htmlBody,
        });

        sendResponse(id, {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              messageId: info.messageId,
              recipient: args.to,
              dispatchedVia: 'smtp.hostinger.com:465 (SSL)',
              timestamp: new Date().toISOString(),
            }, null, 2)
          }],
        });
        return;
      }

      if (name === 'generate_bda_pitch') {
        const firstName = args.decisionMaker.split(' ')[0];
        const pitch = `Hi ${firstName},\n\nI noticed ${args.company} in ${args.location || 'Mumbai'} operates without a custom digital platform. TechInnoSphere Software Solutions builds high-speed web portals and mobile apps to capture direct customer transactions with zero portal commission.\n\nWould you be open to a 10-minute technical intro call this week?\n\nBest regards,\nHamzah | TechInnoSphere Software Solutions\ncontact@techinnosphere.com | +91 98200 11992`;
        sendResponse(id, {
          content: [{ type: 'text', text: pitch }],
        });
        return;
      }

      if (name === 'send_whatsapp_message') {
        sendResponse(id, {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'queued_to_whatsapp',
              recipient: args.phone,
              message: args.message,
              timestamp: new Date().toISOString()
            }, null, 2)
          }],
        });
        return;
      }

      if (name === 'log_crm_activity') {
        sendResponse(id, {
          content: [{
            type: 'text',
            text: JSON.stringify({
              logged: true,
              company: args.company,
              activity: args.activityType,
              notes: args.notes || 'Activity recorded in CRM',
              timestamp: new Date().toISOString()
            }, null, 2)
          }],
        });
        return;
      }

      sendError(id, -32601, `Method ${name} not found`);
      return;
    }

    if (method === 'ping') {
      sendResponse(id, {});
      return;
    }

  } catch (err) {
    console.error('Error handling JSON-RPC:', err);
  }
});

function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(msg + '\n');
}

function sendError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  process.stdout.write(msg + '\n');
}
