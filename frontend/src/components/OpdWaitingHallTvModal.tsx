import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, X, Megaphone, Clock, Building2, Stethoscope, AlertCircle } from 'lucide-react';
import { Token } from '../types';
import { telephonyAudio } from '../utils/audio';

interface OpdWaitingHallTvModalProps {
  tokens: Token[];
  hospitalName?: string;
  departmentName?: string;
  onClose: () => void;
  onCallToken?: (token: Token) => void;
}

export const OpdWaitingHallTvModal: React.FC<OpdWaitingHallTvModalProps> = ({
  tokens,
  hospitalName = 'RAJIV GANDHI GOVERNMENT GENERAL HOSPITAL',
  departmentName = 'ALL OPD SPECIALTIES',
  onClose,
  onCallToken
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<string | null>(null);

  // Identify currently called token (status === 'CALLED') or the first one in list
  const activeToken = tokens.find((t) => t.status === 'CALLED') || tokens[0] || null;

  // Upcoming tokens waiting in queue (status === 'BOOKED')
  const waitingTokens = tokens.filter((t) => t.status === 'BOOKED').slice(0, 8);

  // Clock update every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Announce token with chime and Web Speech synthesis
  const triggerVoiceAnnouncement = (tok: Token) => {
    if (!audioEnabled) return;

    // Play hospital chime tone
    telephonyAudio.playHospitalChime();

    // Voice announcement after brief chime delay
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        window.speechSynthesis.cancel(); // Cancel any existing speech
        const room = 'Room 104';
        const text = `Token number ${tok.tokenNumber}. Please proceed to ${room}, ${tok.departmentName}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
      }, 750);
    }
  };

  // Trigger announcement whenever activeToken changes to a CALLED status
  useEffect(() => {
    if (activeToken && activeToken.status === 'CALLED' && activeToken.tokenNumber !== lastAnnouncedToken) {
      triggerVoiceAnnouncement(activeToken);
      setLastAnnouncedToken(activeToken.tokenNumber);
    }
  }, [activeToken?.tokenNumber, activeToken?.status]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.error(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((e) => console.error(e));
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top TV Header Bar with Govt Insignia and Real-time Clock */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-blue-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center p-2">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-400 fill-current">
              <path d="M12 2L15 8H9L12 2Z" opacity="0.9" />
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-300 drop-shadow-sm">
              {hospitalName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wide flex items-center space-x-2">
              <span>CENTRAL OPD WAITING HALL DIGITAL SIGNAGE (வெளிநோயாளி பிரிவு)</span>
              <span>•</span>
              <span className="text-teal-400 font-bold">{departmentName}</span>
            </p>
          </div>
        </div>

        {/* Real-time Clock & Controls */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest leading-none">
              {currentTime}
            </p>
            <p className="text-xs text-amber-300/80 font-medium mt-1">{currentDate}</p>
          </div>

          {/* TV Screen Action Controls */}
          <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Mute Announcements' : 'Enable Announcements'}
              className={`p-2.5 rounded-xl border transition ${
                audioEnabled
                  ? 'bg-teal-600/30 border-teal-500 text-teal-300 hover:bg-teal-600/50'
                  : 'bg-rose-950/40 border-rose-800 text-rose-400 hover:bg-rose-900/60'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              title="Close TV Signage"
              className="p-2.5 rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-300 hover:bg-rose-600 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Waiting Room Screen Display (High-Impact Split Layout) */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT: NOW CALLING DISPLAY (Col 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/90 rounded-3xl border-2 border-teal-500/50 p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-teal-950/50">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  NOW CALLING / தற்போது அழைக்கப்படும் டோக்கன்
                </span>
                <p className="text-sm font-semibold text-slate-300">
                  Please proceed immediately to the assigned consultation room
                </p>
              </div>
            </div>

            {activeToken && (
              <button
                onClick={() => triggerVoiceAnnouncement(activeToken)}
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Play Chime & Voice
              </button>
            )}
          </div>

          {/* Center: Massive Token Number & Room Assignment */}
          {activeToken ? (
            <div className="my-auto py-6 text-center space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-widest">
                CONSULTATION IN PROGRESS
              </div>

              {/* Giant Glowing Token Number */}
              <div className="py-2">
                <p className="text-7xl sm:text-9xl font-mono font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 drop-shadow-[0_0_35px_rgba(20,184,166,0.4)]">
                  {activeToken.tokenNumber}
                </p>
              </div>

              {/* Patient & Room Detail Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Desk / அறை</p>
                  <p className="text-2xl font-black text-amber-300 mt-1">ROOM 104</p>
                  <p className="text-xs text-slate-300 font-medium">1st Floor, OPD Block B</p>
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Details</p>
                  <p className="text-xl font-bold text-white mt-1 truncate">{activeToken.patientName}</p>
                  <p className="text-xs text-teal-300 font-semibold">{activeToken.departmentName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center my-auto py-12">
              <Clock className="w-16 h-16 mx-auto text-slate-600 mb-3 animate-pulse" />
              <p className="text-xl font-bold text-slate-400">Queue is currently standing by</p>
              <p className="text-xs text-slate-500 mt-1">Call a token from the hospital desk to display here</p>
            </div>
          )}

          {/* Bottom Alert Banner */}
          <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 flex items-center space-x-3 text-xs text-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <p>
              Please keep your OPD Token Slip or SMS ready for verification by the nursing staff at Room 104.
            </p>
          </div>
        </div>

        {/* RIGHT: UPCOMING QUEUE LIST (Col 5) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/70 rounded-3xl border border-slate-800 p-6 overflow-hidden">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                NEXT IN QUEUE / அடுத்த டோக்கன்கள்
              </h2>
              <p className="text-xs text-slate-400 font-medium">Please wait in the hall until called</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              {waitingTokens.length} WAITING
            </span>
          </div>

          {/* Scrollable list of upcoming tokens */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {waitingTokens.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No patients waiting in queue.
              </div>
            ) : (
              waitingTokens.map((t, idx) => (
                <div
                  key={t.id}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-mono text-lg font-black text-teal-300">{t.tokenNumber}</p>
                      <p className="text-xs font-medium text-slate-300 truncate max-w-[140px]">{t.patientName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Est. Window</span>
                    <p className="text-xs font-mono font-bold text-amber-300">{t.estimatedTime}</p>
                    <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[120px]">
                      {t.departmentName}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Institutional Broadcast Ticker */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase text-[10px]">
            PUBLIC ANNOUNCEMENT
          </span>
          <p className="text-slate-300 truncate max-w-4xl">
            Free OPD Consultations under Ayushman Bharat Digital Mission (ABDM) • Emergency Ambulance: Dial 108 • 
            Senior citizens & pregnant mothers are requested to inform counter staff for priority queuing.
          </p>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
          <span>GATEWAY: TWILIO AUDIO ONLINE</span>
          <span>•</span>
          <span>SYSTEM VER: v2.4-GOV</span>
        </div>
      </div>
    </div>
  );
};
