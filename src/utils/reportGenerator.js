export const generateEODReport = ({ 
  leads = [], 
  activities = [], 
  meetings = [], 
  date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysActivities = activities.filter(act => act.timestamp && act.timestamp.startsWith(todayStr));
  
  const callsMade = todaysActivities.filter(a => a.type === 'Call').length;
  const emailsSent = todaysActivities.filter(a => a.type === 'Email' || a.type === 'LinkedIn').length;
  const whatsappSent = todaysActivities.filter(a => a.type === 'WhatsApp').length;
  const scheduledMeetingsCount = meetings.length;

  let reportText = `📌 *TECHINNOSPHERE SOFTWARE SOLUTIONS PVT. LTD.*
🏢 CIN: U62011MH2025PTC462587 | www.techinnosphere.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 *OFFICIAL EOD BUSINESS DEVELOPMENT & OUTREACH REPORT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 *Date:* ${date}
👤 *Prepared By:* Hamzah (Business Development Associate)
💼 *Submitted To:* Director Omar Khan (+91 98200 99999)
🎯 *Department:* Client Acquisition & Technology Strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 *1. DAILY OUTREACH & CONVERSION METRICS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 📞 *Outbound Calls Completed:* ${callsMade} calls logged today
• 💬 *WhatsApp Pitches Dispatched:* ${whatsappSent} clients contacted today
• ✉️ *Custom Email Proposals Sent:* ${emailsSent} proposals sent today
• 🤝 *Client Technical Sessions Scheduled:* ${scheduledMeetingsCount} active meetings
• 🏬 *Total Prospect Pipeline Database:* ${leads.length.toLocaleString()} active accounts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📑 *2. REAL-TIME CLIENT ENGAGEMENT & OUTCOME LOG*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  if (todaysActivities.length === 0) {
    reportText += `No activity logged for today yet. Use Cold Call Hub, Email Generator, or WhatsApp Hub to record client interactions.\n`;
  } else {
    todaysActivities.forEach((act, idx) => {
      const time = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      reportText += `${idx + 1}. *${act.leadName}* (${act.company})
   ├ Time: ${time} | Channel: ${act.type}
   ├ Outcome: ${act.outcome}
   └ Details: ${act.notes || 'Client interaction logged.'}\n\n`;
    });
  }

  reportText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *3. SCHEDULED CLIENT TECHNICAL PRESENTATIONS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  if (meetings.length === 0) {
    reportText += `No client meetings scheduled yet. Use Meeting Scheduler to book presentations.\n`;
  } else {
    meetings.forEach((m, i) => {
      reportText += `${i + 1}. *${m.leadName}* (${m.company})
   ├ Schedule: ${m.date} at ${m.time}
   ├ Focus Area: ${m.topic}
   └ Agenda: Architecture Walkthrough & Commercial Proposal Review\n\n`;
    });
  }

  reportText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *4. CRM STAGE BREAKDOWN & DEAL PIPELINE*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  if (Object.keys(statusCounts).length === 0) {
    reportText += `No active pipeline leads currently stored.\n`;
  } else {
    Object.entries(statusCounts).forEach(([status, count]) => {
      reportText += `• *${status.padEnd(20)}:* ${count} client accounts\n`;
    });
  }

  reportText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *5. STRATEGIC PRIORITIES FOR NEXT BUSINESS DAY*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Conduct scheduled technical presentation calls with key retail, healthcare & logistics decision makers.
2. Follow up on active commercial proposals dispatched via Email & WhatsApp.
3. Continue targeted phone and WhatsApp outreach across Mumbai Western Railway Line commercial hubs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respectfully submitted,

*Hamzah*
Business Development Associate (Technology Solutions)
*TechInnoSphere Software Solutions Private Limited*
Direct Line: +91 93720 15523 | team@techinnosphere.com
`;

  return reportText;
};
