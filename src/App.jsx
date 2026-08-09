import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LeadManager from './components/LeadManager';
import ColdCallHub from './components/ColdCallHub';
import EmailOutreach from './components/EmailOutreach';
import MeetingScheduler from './components/MeetingScheduler';
import DailyReporter from './components/DailyReporter';
import NearbyProspector from './components/NearbyProspector';
import WhatsAppHub from './components/WhatsAppHub';
import LinkedInProspector from './components/LinkedInProspector';
import ClaudeAssistantModal from './components/ClaudeAssistantModal';

import { 
  getStoredLeads, 
  saveStoredLeads, 
  getStoredActivities, 
  saveStoredActivities, 
  getStoredMeetings, 
  saveStoredMeetings,
  resetAllData 
} from './utils/storage';

import { ShieldCheck, Building2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('prospector');
  const [showClaudeModal, setShowClaudeModal] = useState(false);
  
  const [leads, setLeads] = useState(getStoredLeads);
  const [activities, setActivities] = useState(getStoredActivities);
  const [meetings, setMeetings] = useState(getStoredMeetings);

  const [selectedLeadForAction, setSelectedLeadForAction] = useState(null);

  // Sync to local storage
  useEffect(() => {
    saveStoredLeads(leads);
  }, [leads]);

  useEffect(() => {
    saveStoredActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveStoredMeetings(meetings);
  }, [meetings]);

  // Lead CRUD handlers
  const handleAddLead = (newLead) => {
    setLeads(prev => {
      if (prev.some(l => l.company.toLowerCase() === newLead.company.toLowerCase())) {
        return prev;
      }
      return [newLead, ...prev];
    });
  };

  const handleUpdateLead = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleDeleteLead = (leadId) => {
    if (window.confirm('Are you sure you want to remove this lead?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
  };

  // Activity Loggers
  const handleLogCallActivity = ({ leadId, leadName, company, durationSeconds, outcome, notes }) => {
    const newAct = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Call',
      leadName,
      company,
      outcome,
      notes
    };
    setActivities(prev => [newAct, ...prev]);

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: outcome === 'Meeting Scheduled' ? 'Meeting Scheduled' : l.status === 'New Lead' ? 'Contacted' : l.status,
          callAttempts: (l.callAttempts || 0) + 1,
          lastContactDate: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    }));
  };

  const handleLogEmailActivity = ({ leadId, leadName, company, type = 'Email', outcome = 'Pitch Sent', notes }) => {
    const newAct = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      leadName,
      company,
      outcome,
      notes
    };
    setActivities(prev => [newAct, ...prev]);

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: l.status === 'New Lead' ? 'Contacted' : l.status,
          lastContactDate: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    }));
  };

  // Meetings handlers
  const handleDeleteActivity = (actId) => {
    setActivities(prev => prev.filter(a => a.id !== actId));
  };

  const handleAddMeeting = (newMeeting) => {
    setMeetings(prev => [newMeeting, ...prev]);


    // Log to real-time activity feed for EOD Report tracking
    const newAct = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Meeting',
      leadName: newMeeting.leadName,
      company: newMeeting.company,
      outcome: 'Technical Presentation Scheduled',
      notes: `Scheduled solution architecture presentation for ${newMeeting.date} at ${newMeeting.time}. Topic: ${newMeeting.topic}`
    };
    setActivities(prev => [newAct, ...prev]);

    if (newMeeting.leadId) {
      setLeads(prev => prev.map(l => {
        if (l.id === newMeeting.leadId) {
          return { ...l, status: 'Meeting Scheduled' };
        }
        return l;
      }));
    }
  };


  const handleDeleteMeeting = (meetingId) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  // Navigation helpers
  const handleSelectForCall = (lead) => {
    setSelectedLeadForAction(lead);
    setActiveTab('coldcall');
  };

  const handleSelectForEmail = (lead) => {
    setSelectedLeadForAction(lead);
    setActiveTab('outreach');
  };

  const handleSelectForMeeting = (lead) => {
    setSelectedLeadForAction(lead);
    setActiveTab('meetings');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all leads, call logs, and meetings to initial state?')) {
      const reset = resetAllData();
      setLeads(reset.leads);
      setActivities(reset.activities);
      setMeetings(reset.meetings);
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        leadsCount={leads.length}
        onOpenClaudeModal={() => setShowClaudeModal(true)}
      />

      <ClaudeAssistantModal
        isOpen={showClaudeModal}
        onClose={() => setShowClaudeModal(false)}
        leads={leads}
      />

      <main className="main-layout">
        {activeTab === 'prospector' && (
          <NearbyProspector
            leads={leads}
            onImportLead={handleAddLead}
            onNavigateToCall={handleSelectForCall}
            onNavigateToEmail={handleSelectForEmail}
          />
        )}



        {activeTab === 'linkedin' && (
          <LinkedInProspector
            leads={leads}
            onImportLead={handleAddLead}
            onNavigateToOutreach={handleSelectForEmail}
            onNavigateToCall={handleSelectForCall}
          />
        )}


        {activeTab === 'dashboard' && (
          <Dashboard 
            leads={leads}
            activities={activities}
            meetings={meetings}
            onNavigate={setActiveTab}
            onAddLeadClick={() => setActiveTab('leads')}
            onDeleteActivity={handleDeleteActivity}
          />
        )}


        {activeTab === 'leads' && (
          <LeadManager 
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onSelectForCall={handleSelectForCall}
            onSelectForEmail={handleSelectForEmail}
            onSelectForMeeting={handleSelectForMeeting}
          />
        )}

        {activeTab === 'coldcall' && (
          <ColdCallHub 
            leads={leads}
            selectedLead={selectedLeadForAction}
            onSelectLead={setSelectedLeadForAction}
            onLogCallActivity={handleLogCallActivity}
            onNavigateToMeeting={handleSelectForMeeting}
          />
        )}

        {activeTab === 'outreach' && (
          <EmailOutreach 
            leads={leads}
            selectedLead={selectedLeadForAction}
            onLogEmailActivity={handleLogEmailActivity}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppHub 
            leads={leads}
            activities={activities}
            meetings={meetings}
            selectedLead={selectedLeadForAction}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingScheduler 
            leads={leads}
            meetings={meetings}
            onAddMeeting={handleAddMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onNavigateToCall={handleSelectForCall}
          />
        )}

        {activeTab === 'reporter' && (
          <DailyReporter 
            leads={leads}
            activities={activities}
            meetings={meetings}
            onDeleteActivity={handleDeleteActivity}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}
      </main>

      {/* Production Footer Banner */}
      <footer style={{
        background: 'rgba(8, 12, 24, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.25rem 2rem',
        marginTop: '2rem'
      }}>
        <div style={{
          maxWidth: '1650px',
          margin: '0 auto',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={16} color="var(--accent-cyan)" />
            <span><strong>TechInnoSphere Software Solutions Private Limited</strong> (CIN: U62011MH2025PTC462587)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>LinkedIn Prospector Active — add and verify your own leads to search</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
