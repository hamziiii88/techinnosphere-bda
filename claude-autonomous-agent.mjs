/**
 * TechInnoSphere Autonomous Outreach Agent Powered by Anthropic Claude 3.5 Sonnet
 * Usage: node claude-autonomous-agent.mjs
 */

import Anthropic from '@anthropic-ai/sdk';
import nodemailer from 'nodemailer';
import 'dotenv/config';

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('Missing SMTP_USER / SMTP_PASS in environment. Copy .env.example to .env and fill in credentials.');
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const TARGET_LEADS = [
  {
    name: "Vedang Patel",
    company: "The Souled Store",
    location: "Lower Parel, Mumbai",
    email: "connect@thesouledstore.com",
    industry: "E-Commerce / D2C Fashion",
    techNeed: "Flash sale high-concurrency order engine & custom mobile app"
  },
  {
    name: "Sujata Biswas",
    company: "Suta Bombay",
    location: "Santacruz East, Mumbai",
    email: "info@suta.in",
    industry: "Artisanal Sarees & Apparel",
    techNeed: "Bespoke mobile shopping app with multi-currency NRI Stripe checkout"
  },
  {
    name: "Vineeta Singh",
    company: "SUGAR Cosmetics",
    location: "Andheri East, Mumbai",
    email: "hello@sugarcosmetics.com",
    industry: "Beauty & Retail",
    techNeed: "In-store iPad AR shade try-on tool & omnichannel stock sync"
  }
];

async function runClaudeAutonomousOutreach() {
  console.log('🚀 Starting TechInnoSphere Autonomous Claude 3.5 Sonnet Outreach...');

  for (const lead of TARGET_LEADS) {
    console.log(`\n🧠 Asking Claude to analyze ${lead.company} (${lead.name})...`);

    const prompt = `You are the lead Business Development Architect (BDA) for TechInnoSphere Software Solutions in Mumbai.
Write an authentic, highly persuasive, high-converting cold outreach email to ${lead.name}, founder of ${lead.company} located in ${lead.location}.
Their industry is ${lead.industry}.
The software/web application opportunity we identified is: "${lead.techNeed}".

Rules:
1. Tone: Professional, direct, technical yet executive-friendly.
2. Structure:
   - Subject line (creative, punchy, high open rate)
   - Friendly personalized opening citing their location/brand reputation
   - Specific software solution proposed by TechInnoSphere
   - 3 bullet points of business benefits (zero commission, faster speed, higher conversions)
   - Call to action for a 10-minute technical intro call this week
   - Signature: Hamzah | TechInnoSphere Software Solutions (contact@techinnosphere.com)
3. Return as valid JSON with keys: "subject", "htmlBody", "plainText"`;

    try {
      let subject = `Partnership: Custom Web & Software Stack for ${lead.company}`;
      let htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
          <p>Hi ${lead.name.split(' ')[0]},</p>
          <p>I came across <strong>${lead.company}</strong> in ${lead.location} and wanted to reach out regarding your digital infrastructure.</p>
          <p>At <strong>TechInnoSphere (Mumbai)</strong>, we build custom high-speed web platforms and mobile apps tailored for ${lead.industry} leaders.</p>
          <p>We can implement <strong>${lead.techNeed}</strong> to streamline operations and capture more direct customer transactions.</p>
          <p>Would you be open to a 10-minute intro call this week?</p>
          <p>Best regards,<br><strong>Hamzah</strong><br>TechInnoSphere Software Solutions<br>contact@techinnosphere.com | +91 98200 11992</p>
        </div>
      `;

      if (process.env.ANTHROPIC_API_KEY) {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        });

        const textContent = response.content[0].text;
        try {
          const parsed = JSON.parse(textContent);
          subject = parsed.subject || subject;
          htmlBody = parsed.htmlBody || htmlBody;
        } catch (e) {
          htmlBody = textContent;
        }
      }

      console.log(`✉️ Sending email to ${lead.email} via Hostinger SMTP...`);
      const info = await transporter.sendMail({
        from: '"Hamzah | TechInnoSphere" <contact@techinnosphere.com>',
        to: lead.email,
        subject: subject,
        html: htmlBody,
      });

      console.log(`✅ Dispatched successfully! MessageID: ${info.messageId}`);
    } catch (err) {
      console.error(`❌ Error processing ${lead.company}:`, err.message);
    }
  }

  console.log('\n🎉 Autonomous Claude outreach cycle completed!');
}

runClaudeAutonomousOutreach().catch(console.error);
