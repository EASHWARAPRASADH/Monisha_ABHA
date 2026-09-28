import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Radio,
  FileCode2,
  Activity,
  BatteryMedium,
  Wifi,
  Signal,
  Check,
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';
import { ivrSimulatorApi, adminApi } from '../services/api';
import { SmsLog } from '../types';
import { telephonyAudio } from '../utils/audio';

export const IvrSimulatorPage: React.FC = () => {
  const [callerNumber, setCallerNumber] = useState('9876543210');
  const [callSid, setCallSid] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>('Ready. Press the green Call button to dial the Government Hospital OPD toll-free hotline.');
  const [currentActionUrl, setCurrentActionUrl] = useState<string>('/ivr/incoming');
  const [lastTwiml, setLastTwiml] = useState<string>('');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [callHistory, setCallHistory] = useState<{ sender: 'IVR' | 'USER'; text: string; time: string }[]>([]);
  const [recentSms, setRecentSms] = useState<SmsLog[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedSmsId, setCopiedSmsId] = useState<number | null>(null);

  const timerRef = useRef<any>(null);

  const steps = [
    { title: 'Inbound Call', desc: '1800-OPD-GOV Connection' },
    { title: 'Language', desc: 'English / தமிழ் / हिंदी' },
    { title: 'Patient Verification', desc: 'Phone Match / ABHA ID' },
    { title: 'OTP Check', desc: '6-digit SMS verification' },
    { title: 'Hospital Selection', desc: 'Facility matching' },
    { title: 'OPD Department', desc: 'Specialty quota check' },
    { title: 'Token Generated', desc: 'Voice readback & SMS' },
  ];

  useEffect(() => {
    loadRecentSms();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (callActive) {
      setCallSeconds(0);
      timerRef.current = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [callActive]);

  const loadRecentSms = async () => {
    try {
      const res = await adminApi.getSmsLogs(0, 5);
      setRecentSms(res.content);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = (text: string, lang = 'en') => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === 'ta') {
        utterance.lang = 'ta-IN';
      } else if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error', e);
    }
  };

  const startCall = async () => {
    if (soundEffectsEnabled) telephonyAudio.playRingback();
    const newSid = 'SIM_CALL_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setCallSid(newSid);
    setCallActive(true);
    setCallHistory([]);
    setInputBuffer('');
    setActiveStepIndex(0);

    try {
      const twiml = await ivrSimulatorApi.callEndpoint('/ivr/incoming', newSid, '', callerNumber);
      processTwiml(twiml, '/ivr/incoming');
    } catch (err: any) {
      setCurrentPrompt('Call connection failed: ' + (err.message || 'Network error'));
    }
  };

  const endCall = () => {
    setCallActive(false);
    setCurrentPrompt('Call disconnected. Thank you for using Government Hospital OPD Telephony Service.');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    loadRecentSms();
  };

  const handleKeyPress = async (key: string) => {
    if (!callActive) return;

    if (soundEffectsEnabled) {
      telephonyAudio.playDtmfTone(key);
    }

    setInputBuffer((prev) => prev + key);

    setCallHistory((prev) => [
      ...prev,
      { sender: 'USER', text: `Keypad pressed: ${key}`, time: new Date().toLocaleTimeString() },
    ]);

    try {
      let endpoint = currentActionUrl;
      if (endpoint.includes('/api/')) {
        endpoint = endpoint.substring(endpoint.indexOf('/api/') + 4);
      }

      const twiml = await ivrSimulatorApi.callEndpoint(endpoint, callSid, key, callerNumber);
      processTwiml(twiml, endpoint);
    } catch (err: any) {
      setCurrentPrompt('Telecom response error: ' + (err.message || 'Error'));
    }
  };

  const processTwiml = (twiml: string, fromEndpoint: string) => {
    setLastTwiml(twiml);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(twiml, 'text/xml');

    const sayElements = xmlDoc.getElementsByTagName('Say');
    let spokenText = '';
    let lang = selectedLanguage;

    if (sayElements.length > 0) {
      spokenText = Array.from(sayElements)
        .map((s) => s.textContent || '')
        .join(' ');
      const langAttr = sayElements[0].getAttribute('language');
      if (langAttr?.startsWith('ta')) lang = 'ta';
      if (langAttr?.startsWith('hi')) lang = 'hi';
      setSelectedLanguage(lang);
    }

    // Determine state advancement based on endpoint
    if (fromEndpoint.includes('/language')) {
      setActiveStepIndex(1);
    } else if (fromEndpoint.includes('/verify')) {
      setActiveStepIndex(spokenText.includes('OTP') ? 3 : 2);
    } else if (fromEndpoint.includes('/hospital')) {
      setActiveStepIndex(4);
    } else if (fromEndpoint.includes('/department') || fromEndpoint.includes('/token')) {
      setActiveStepIndex(spokenText.includes('token number') || spokenText.includes('டோக்கன் எண்') ? 6 : 5);
    }

    const gather = xmlDoc.getElementsByTagName('Gather')[0];
    if (gather) {
      const nextAction = gather.getAttribute('action') || fromEndpoint;
      setCurrentActionUrl(nextAction);
    } else {
      const hangup = xmlDoc.getElementsByTagName('Hangup')[0];
      if (hangup) {
        setTimeout(() => {
          endCall();
        }, 6000);
      }
    }

    if (spokenText) {
      setCurrentPrompt(spokenText);
      speakText(spokenText, lang);
      setCallHistory((prev) => [
        ...prev,
        { sender: 'IVR', text: spokenText, time: new Date().toLocaleTimeString() },
      ]);
    }

    setTimeout(() => {
      loadRecentSms();
      if (soundEffectsEnabled && (spokenText.includes('token number') || spokenText.includes('டோக்கன் எண்'))) {
        telephonyAudio.playSmsChime();
      }
    }, 1200);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSmsId(id);
    setTimeout(() => setCopiedSmsId(null), 2000);
  };

  const keypad = [
    { key: '1', sub: '⌕' },
    { key: '2', sub: 'ABC' },
    { key: '3', sub: 'DEF' },
    { key: '4', sub: 'GHI' },
    { key: '5', sub: 'JKL' },
    { key: '6', sub: 'MNO' },
    { key: '7', sub: 'PQRS' },
    { key: '8', sub: 'TUV' },
    { key: '9', sub: 'WXYZ' },
    { key: '*', sub: '＋' },
    { key: '0', sub: '␣' },
    { key: '#', sub: '⇧' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>High-Fidelity Feature Phone & IVR Telecom Simulator</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20">
              Web Audio DTMF
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Simulate an authentic non-smartphone button phone dialing the National Hospital OPD Telephony line
          </p>
        </div>

        {/* Audio Controls */}
        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
            className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              soundEffectsEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
          >
            <span>DTMF Beeps: {soundEffectsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              speechEnabled
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
          >
            {speechEnabled ? <Volume2 className="h-3.5 w-3.5 mr-1" /> : <VolumeX className="h-3.5 w-3.5 mr-1" />}
            <span>Voice: {speechEnabled ? 'ACTIVE' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Visual State Progression Stepper */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span className="uppercase tracking-wider text-[11px] text-slate-400">Interactive Telephony State Flow</span>
          <span className="font-mono text-teal-600">Stage {activeStepIndex + 1} of {steps.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {steps.map((st, idx) => {
            const isDone = activeStepIndex > idx;
            const isCurrent = activeStepIndex === idx && callActive;
            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : isDone
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-white border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span
                    className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-teal-600 text-white animate-pulse'
                        : isDone
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                </div>
                <p className={`text-[11px] font-bold truncate ${isCurrent ? 'text-teal-900' : 'text-slate-800'}`}>
                  {st.title}
                </p>
                <p className="text-[9px] text-slate-400 truncate">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Feature Phone & Live Telephony Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Realistic Feature Phone Hardware Device (Cols 5) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[330px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-[48px] p-5 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 relative">
            {/* Earpiece Grill */}
            <div className="w-14 h-1.5 bg-slate-800 rounded-full mx-auto mb-3 shadow-inner"></div>

            {/* LCD Screen Display */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3.5 text-white shadow-inner relative overflow-hidden">
              {/* LCD Top Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-slate-800/80 mb-2">
                <div className="flex items-center space-x-1 font-mono text-[9px]">
                  <Signal className="h-3 w-3 text-teal-400" />
                  <span className="text-slate-300 font-bold">Jio 4G</span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-semibold">
                  {callActive ? formatTimer(callSeconds) : '10:30 AM'}
                </div>
                <div className="flex items-center space-x-1 font-mono text-[9px]">
                  <span className="text-slate-300 font-semibold">92%</span>
                  <BatteryMedium className="h-3.5 w-3.5 text-teal-400" />
                </div>
              </div>

              {/* Call Header */}
              <div className="text-center py-1">
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px] font-mono text-teal-300 border border-slate-700/60 mb-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${callActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                  <span>{callActive ? 'CALL IN PROGRESS' : 'LINE READY'}</span>
                  <span>•</span>
                  <span className="uppercase">{selectedLanguage}</span>
                </div>
                <p className="text-xs font-bold text-slate-100">National Hospital OPD Hotline</p>
                <p className="text-[11px] text-slate-400 font-mono">1800-11-4455 (Toll-Free)</p>
              </div>

              {/* Interactive Speech & Prompt Display Box */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 my-2 min-h-[92px] max-h-[110px] overflow-y-auto shadow-inner text-slate-200">
                <p className="text-xs leading-relaxed font-medium">
                  {currentPrompt}
                </p>
              </div>

              {/* Keypad Buffer indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Caller: {callerNumber}</span>
                <span className="text-teal-400 font-bold">Digits: {inputBuffer || '—'}</span>
              </div>
            </div>

            {/* Soft Keys & D-Pad Rocker */}
            <div className="grid grid-cols-3 gap-2 mt-4 mb-2 items-center">
              {/* Left Soft Key */}
              <button
                type="button"
                className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-[10px] font-bold text-slate-300 border border-slate-700 transition"
              >
                SELECT
              </button>

              {/* Center D-Pad Navigation Rocker */}
              <div className="h-10 w-10 mx-auto rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-inner">
                <div className="h-5 w-5 rounded-full bg-teal-600/80 flex items-center justify-center text-[8px] font-bold text-white shadow-xs">
                  OK
                </div>
              </div>

              {/* Right Soft Key */}
              <button
                type="button"
                onClick={() => setInputBuffer('')}
                className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-[10px] font-bold text-slate-300 border border-slate-700 transition"
              >
                CLEAR
              </button>
            </div>

            {/* Primary Action Buttons: Call (Green) / End (Red) */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                disabled={callActive}
                onClick={startCall}
                className="h-11 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/60 disabled:opacity-40 transition"
              >
                <Phone className="h-4 w-4" />
                <span>Call Hotline</span>
              </button>

              <button
                type="button"
                disabled={!callActive}
                onClick={endCall}
                className="h-11 rounded-xl bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-950/60 disabled:opacity-40 transition"
              >
                <PhoneOff className="h-4 w-4" />
                <span>End Call</span>
              </button>
            </div>

            {/* Tactile 3x4 Number Keypad with DTMF Tone Triggers */}
            <div className="grid grid-cols-3 gap-2 p-1">
              {keypad.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  disabled={!callActive}
                  onClick={() => handleKeyPress(k.key)}
                  className="h-12 bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 active:scale-90 active:bg-teal-900/40 disabled:opacity-35 text-white rounded-xl flex flex-col items-center justify-center border border-slate-700/80 shadow-md transition-all select-none"
                >
                  <span className="text-base font-bold font-mono text-slate-100 leading-none">
                    {k.key}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono tracking-widest mt-0.5">
                    {k.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Mic hole & Chin */}
            <div className="flex justify-between items-center mt-3 px-3 text-[10px] text-slate-500 font-mono">
              <span>BharatVoLTE</span>
              <div className="h-1 w-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Live SMS & Telephony Inspector Panels (Cols 7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Scenario Fill Buttons */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="h-4 w-4 text-teal-600 mr-1.5" />
              Academic Demonstration Presets (Project Defense Scenarios)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              One-click preset phone numbers to showcase all rubric evaluation requirements:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCallerNumber('9876543210')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  callerNumber === '9876543210'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-bold">1. Verified Patient</p>
                <p className="text-[10px] text-slate-500 font-mono">9876543210 (Test Patient)</p>
                <p className="text-[9px] text-teal-700 mt-1">Direct Language & Menu Booking</p>
              </button>

              <button
                type="button"
                onClick={() => setCallerNumber('9999000111')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  callerNumber === '9999000111'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-bold">2. Unregistered Citizen</p>
                <p className="text-[10px] text-slate-500 font-mono">9999000111 (New Caller)</p>
                <p className="text-[9px] text-teal-700 mt-1">Triggers Mock ABHA & OTP Flow</p>
              </button>

              <button
                type="button"
                onClick={() => setCallerNumber('9876543211')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  callerNumber === '9876543211'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-bold">3. Female Citizen Profile</p>
                <p className="text-[10px] text-slate-500 font-mono">9876543211 (Anitha Kumar)</p>
                <p className="text-[9px] text-teal-700 mt-1">Test Tamil Voice (தமிழ்)</p>
              </button>
            </div>
          </div>

          {/* Authentic Government SMS Notification Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Simulated Patient SMS Receipt</h3>
                  <p className="text-[10px] text-slate-400">Automated DLT Transactional SMS dispatch</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                DLT-ID: GOVHSP-OPD
              </span>
            </div>

            {recentSms.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                <p>No SMS receipts delivered yet.</p>
                <p className="text-[11px] text-slate-400">Complete an IVR booking on the phone to receive real-time SMS.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {recentSms.map((sms) => (
                  <div key={sms.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 relative text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-slate-200/50">
                      <span className="font-mono font-bold text-slate-700">From: VK-GOVHSP</span>
                      <span>{new Date(sms.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <pre className="font-sans text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                      {sms.messageText}
                    </pre>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">Recipient: {sms.recipientPhone}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(sms.messageText, sms.id)}
                        className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {copiedSmsId === sms.id ? (
                          <>
                            <Check className="h-3 w-3 mr-1 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            <span>Copy Token SMS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Telephony Session Transcript Stream */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Activity className="h-4 w-4 text-teal-600 mr-1.5" />
                Live Telephony Interaction Audit Log
              </h3>
              <span className="text-xs text-slate-400 font-mono">Call SID: {callSid || 'IDLE'}</span>
            </div>

            {callHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Press Call Hotline on the virtual phone to begin transcript.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {callHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs ${
                      item.sender === 'IVR'
                        ? 'bg-slate-50 text-slate-800 border border-slate-200'
                        : 'bg-teal-50 text-teal-900 border border-teal-200 ml-6 text-right'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] opacity-75 mb-1 font-mono">
                      <span className="font-bold">{item.sender === 'IVR' ? 'Automated Voice (TwiML)' : 'Patient Dialpad'}</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="font-medium leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
