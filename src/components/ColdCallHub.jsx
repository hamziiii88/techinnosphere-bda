import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  Play, 
  Square, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  HelpCircle,
  PhoneOff,
  CalendarPlus,
  MessageSquare,
  Building2,
  ExternalLink,
  Check,
  Mic,
  MicOff,
  Volume2,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { REAL_MUMBAI_PROSPECTS } from '../data/realMumbaiProspects';

export default function ColdCallHub({ leads = [], selectedLead, onSelectLead, onLogCallActivity, onNavigateToMeeting }) {
  const prospectPool = leads.length > 0 ? leads : REAL_MUMBAI_PROSPECTS;
  const [activeLeadId, setActiveLeadId] = useState(selectedLead ? selectedLead.id : (prospectPool[0]?.id || ''));
  const [callTimerActive, setCallTimerActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [activeObjection, setActiveObjection] = useState(null);
  const [dialMethod, setDialMethod] = useState('phone'); // 'phone' | 'whatsapp' | 'webrtc'
  
  const [callOutcome, setCallOutcome] = useState('Meeting Scheduled');
  const [callNotes, setCallNotes] = useState('');
  const [loggedNotification, setLoggedNotification] = useState(null);

  // WebRTC Audio & Speech Recognition states
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const animFrameRef = useRef(null);

  const currentLead = prospectPool.find(l => l.id === activeLeadId) || prospectPool[0];

  // Timer effect
  useEffect(() => {
    let timer = null;
    if (callTimerActive) {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [callTimerActive]);

  // Clean up audio & speech recognition on unmount
  useEffect(() => {
    return () => {
      stopMicAndSpeech();
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startMicAndSpeech = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicActive(true);

      // WebAudio API analyzer
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setAudioLevel(Math.min(Math.round((average / 128) * 100), 100));
          animFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      }

      // Browser Speech Recognition for Live Call Notes Transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
          if (transcript) {
            setCallNotes(prev => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onend = () => {
          if (callTimerActive && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsTranscribing(true);
      }
    } catch (err) {
      console.log('Mic / Speech permission error:', err);
    }
  };

  const stopMicAndSpeech = () => {
    setMicActive(false);
    setAudioLevel(0);
    setIsTranscribing(false);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const handleStartCall = () => {
    setCallTimerActive(true);
    setCallSeconds(0);
    setLoggedNotification(null);

    // Dialing Route Actions
    if (currentLead && currentLead.phone) {
      const cleanPhone = currentLead.phone.replace(/\D/g, '');

      if (dialMethod === 'phone') {
        window.location.href = `tel:${cleanPhone}`;
      } else if (dialMethod === 'whatsapp') {
        window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi ${currentLead.name}, this is Hamzah calling from TechInnoSphere Software Solutions.`)}`, '_blank');
      } else if (dialMethod === 'webrtc') {
        startMicAndSpeech();
      }
    }
  };

  const handleStopAndLogCall = () => {
    stopMicAndSpeech();
    setCallTimerActive(false);

    if (currentLead) {
      onLogCallActivity({
        leadId: currentLead.id,
        leadName: currentLead.name,
        company: currentLead.company,
        durationSeconds: callSeconds,
        outcome: callOutcome,
        notes: callNotes || `Outbound call via ${dialMethod.toUpperCase()} (${formatTime(callSeconds)}). Outcome: ${callOutcome}`
      });

      if (callOutcome === 'Meeting Scheduled') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      setLoggedNotification(`✓ Real Call Logged: ${currentLead.name} (${currentLead.company}) - Duration: ${formatTime(callSeconds)} - Outcome: ${callOutcome}`);
      setTimeout(() => setLoggedNotification(null), 5000);
    }

    setCallSeconds(0);
  };

  // Objection Handling Battlecards
  const objections = [
    {
      id: 'inhouse',
      title: '“We already have an in-house tech team”',
      response: `“That’s great, {FirstName}! We actually don’t replace in-house teams — TechInnoSphere works as an extended development arm to accelerate your backlog, handle mobile app development, or build specialized modules faster. How is your team currently bandwidth-wise?”`
    },
    {
      id: 'email',
      title: '“Just send me an email”',
      response: `“I’d be happy to, {FirstName}! To make sure I send over case studies that are actually relevant to {Company}, are you currently prioritizing web platform upgrades, mobile apps, or cloud infrastructure?”`
    },
    {
      id: 'budget',
      title: '“We don’t have budget right now”',
      response: `“Understood, {FirstName}. Many of our clients are planning budget for next quarter. We offer flexible project-based and retainer models to fit lean budgets. Can we book a 10-min exploratory call for next week so you have our numbers ready when budget opens?”`
    },
    {
      id: 'not_interested',
      title: '“Not interested right now”',
      response: `“No problem at all, {FirstName}. Before I drop off, can I ask — is custom software development completely off your roadmap for this year, or is it just a matter of timing?”`
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Call Timer Controls */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: callTimerActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9))' : 'var(--bg-card)',
        borderColor: callTimerActive ? 'rgba(16, 185, 129, 0.4)' : 'var(--bg-card-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: callTimerActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            padding: '1rem',
            borderRadius: '14px',
            color: callTimerActive ? '#34d399' : '#60a5fa'
          }}>
            <PhoneCall size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
                Outbound Cold Call & WebRTC Softphone Hub
              </h1>
              {callTimerActive && <span className="badge badge-won animate-pulse">Call In Progress</span>}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Real dialer integration, live microphone audio analyzer & automated voice-to-text notes transcriber.
            </p>
          </div>
        </div>

        {/* Live Call Stopwatch Timer & Dial Method Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Dialing Route Switcher */}
          {!callTimerActive && (
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button 
                onClick={() => setDialMethod('phone')}
                className={`btn btn-sm ${dialMethod === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
              >
                📱 Mobile Phone
              </button>
              <button 
                onClick={() => setDialMethod('whatsapp')}
                className={`btn btn-sm ${dialMethod === 'whatsapp' ? 'btn-whatsapp' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
              >
                💬 WhatsApp Voice
              </button>
              <button 
                onClick={() => setDialMethod('webrtc')}
                className={`btn btn-sm ${dialMethod === 'webrtc' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
              >
                🎙️ WebRTC Softphone
              </button>
            </div>
          )}

          {/* Stopwatch */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.6rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Clock size={18} color={callTimerActive ? '#34d399' : 'var(--text-subtle)'} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: callTimerActive ? '#34d399' : '#fff'
            }}>
              {formatTime(callSeconds)}
            </span>
          </div>

          {!callTimerActive ? (
            <button onClick={handleStartCall} className="btn btn-success" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              <Play size={18} />
              <span>Start Call ({dialMethod.toUpperCase()})</span>
            </button>
          ) : (
            <button onClick={handleStopAndLogCall} className="btn btn-danger" style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
              <Square size={18} />
              <span>End & Log Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Live WebRTC Microphone Level & Audio Visualizer Bar */}
      {callTimerActive && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.9))',
          borderColor: 'rgba(6, 182, 212, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#0284c7', padding: '0.5rem', borderRadius: '50%', color: '#fff', display: 'flex' }}>
              <Mic size={18} className="animate-pulse" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                Live Microphone Active — WebRTC Audio Feed
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                {isTranscribing ? '🎙️ Auto-transcribing your voice into call notes...' : 'Listening to microphone input...'}
              </div>
            </div>
          </div>

          {/* Animated Volume Waveform Meter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
              Mic Level: {audioLevel}%
            </span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '28px', background: 'rgba(15,23,42,0.8)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[0.3, 0.7, 1.0, 0.5, 0.9, 0.4, 0.8].map((factor, idx) => {
                const barHeight = Math.max(4, Math.round((audioLevel / 100) * 20 * factor));
                return (
                  <div 
                    key={idx}
                    style={{
                      width: '5px',
                      height: `${barHeight}px`,
                      background: audioLevel > 50 ? '#34d399' : '#38bdf8',
                      borderRadius: '3px',
                      transition: 'height 0.1s ease'
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Toast Notification */}
      {loggedNotification && (
        <div className="animate-fade-in" style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          color: '#34d399',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <CheckCircle size={18} />
          <span>{loggedNotification}</span>
        </div>
      )}

      {/* Grid: Prospect Selector + Script Navigator */}
      <div className="grid-responsive-1-2">

        
        {/* Left: Prospect Detail & Lead Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Target Prospect to Call</label>
            <select 
              className="form-select"
              style={{ width: '100%', marginBottom: '1rem' }}
              value={activeLeadId}
              onChange={(e) => setActiveLeadId(e.target.value)}
            >
              {prospectPool.slice(0, 100).map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} — {lead.company} ({lead.location || 'Mumbai'})
                </option>
              ))}
            </select>

            {currentLead && (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{currentLead.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{currentLead.role}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentLead.company}</div>
                  </div>
                  <span className="badge badge-new">{currentLead.priority || 'High'} Priority</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.85rem 0' }} />

                <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Phone:</strong> <a href={`tel:${currentLead.phone}`} style={{ color: '#34d399', fontWeight: 700 }}>{currentLead.phone}</a></div>
                  <div><strong>Email:</strong> {currentLead.email}</div>
                  <div><strong>Tech Interest:</strong> {currentLead.techInterest || currentLead.serviceNeeded}</div>
                  <div><strong>Call Attempts:</strong> {currentLead.callAttempts || 0}</div>
                  {currentLead.notes && (
                    <div style={{ marginTop: '0.4rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                      "{currentLead.notes}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Call Outcome Logger Card */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
              Log Call Result & Notes
            </h3>

            <div className="form-group">
              <label className="form-label">Call Outcome</label>
              <select 
                className="form-select"
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
              >
                <option value="Meeting Scheduled">🎯 Meeting Scheduled</option>
                <option value="Connected - Follow Up Email">📧 Connected - Send Email Pitch</option>
                <option value="Connected - Busy / Call Back">⏳ Connected - Call Back Later</option>
                <option value="Left Voicemail">📞 Left Voicemail</option>
                <option value="No Answer">❌ No Answer</option>
                <option value="Not Interested">🚫 Not Interested</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Call Notes / Transcript</span>
                {isTranscribing && <span style={{ color: '#34d399', fontSize: '0.75rem' }}>🎙️ Voice Transcribing...</span>}
              </label>
              <textarea 
                className="form-textarea"
                rows={3}
                placeholder="Key takeaways, client requirements, budget mentioned..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
              />
            </div>

            <button 
              onClick={handleStopAndLogCall}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <CheckCircle size={16} />
              <span>Log Call Result Now</span>
            </button>
          </div>

        </div>

        {/* Right: Live Teleprompter Cold Call Script Navigator */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Live Pitch Script Teleprompter
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Step-by-step pitch tailored for {currentLead?.name || 'Prospect'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4].map(step => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`btn btn-sm ${activeStep === step ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '32px', padding: 0, justifyContent: 'center' }}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Script Step Cards */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
            {activeStep === 1 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  STEP 1: THE 10-SECOND PATTERN INTERRUPT
                </div>
                <p style={{ fontSize: '1rem', color: '#fff', lineHeight: 1.6 }}>
                  “Hi <strong>{currentLead?.name?.split(' ')[0] || 'Sir'}</strong>, this is Hamzah calling from <strong>TechInnoSphere Software Solutions</strong> in Mumbai. I know I’m calling you unannounced — do you have 30 seconds for me to share why I reached out, or did I catch you at a bad time?”
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  STEP 2: VALUE PROPOSITION & PAIN POINT
                </div>
                <p style={{ fontSize: '1rem', color: '#fff', lineHeight: 1.6 }}>
                  “We specialize in custom web applications, mobile apps, and cloud software for <strong>{currentLead?.company || 'businesses'}</strong>. We’ve noticed many companies struggle with off-the-shelf software limitations or slow tech development. We build 100% custom, high-speed software scaled to your exact business operations.”
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  STEP 3: QUALIFYING QUESTION
                </div>
                <p style={{ fontSize: '1rem', color: '#fff', lineHeight: 1.6 }}>
                  “Are you currently planning any web platform upgrades, mobile apps, or internal automation software for <strong>{currentLead?.company}</strong> in the next 3 to 6 months?”
                </p>
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  STEP 4: THE CLOSE (BOOKING THE TECHNICAL PRESENTATION)

                </div>
                <p style={{ fontSize: '1rem', color: '#fff', lineHeight: 1.6 }}>
                  “Fantastic! I’d love to arrange a quick 15-minute video call with Director Omar Khan to present our custom architecture and past client case studies. Would tomorrow at 11 AM or Thursday at 3 PM work better for your schedule?”
                </p>
              </div>
            )}
          </div>

          {/* Objection Battlecards Selector */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={15} color="#f59e0b" />
              <span>Real-Time Objection Handler Battlecards</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
              {objections.map(obj => (
                <button
                  key={obj.id}
                  onClick={() => setActiveObjection(activeObjection === obj.id ? null : obj.id)}
                  className={`btn ${activeObjection === obj.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {obj.title}
                </button>
              ))}
            </div>

            {activeObjection && (
              <div style={{ marginTop: '0.75rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  VERBATIM WINNING RESPONSE:
                </div>
                <p style={{ color: '#fff', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {objections.find(o => o.id === activeObjection)?.response
                    .replace('{FirstName}', currentLead?.name?.split(' ')[0] || 'Sir')
                    .replace('{Company}', currentLead?.company || 'your company')}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
