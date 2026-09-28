import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, QrCode, Download, Printer, User } from 'lucide-react';
import { Patient } from '../types';

interface AbhaCardProps {
  patient: Patient;
  onPrint?: () => void;
}

export const AbhaCard: React.FC<AbhaCardProps> = ({ patient, onPrint }) => {
  const [copied, setCopied] = useState(false);

  // Format 14-digit ABHA ID into official 91-XXXX-XXXX-XXXX format
  const rawAbha = patient.abhaId || '91456789012345';
  const cleanAbha = rawAbha.replace(/\D/g, '').padEnd(14, '0');
  const formattedAbha = `${cleanAbha.slice(0, 2)}-${cleanAbha.slice(2, 6)}-${cleanAbha.slice(6, 10)}-${cleanAbha.slice(10, 14)}`;
  
  // Format ABHA Address e.g. ramesh.kumar@abdm
  const abhaAddress = `${patient.fullName.toLowerCase().replace(/\s+/g, '.') || 'citizen'}@abdm`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedAbha);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Official ABHA PVC Card Replica */}
      <div className="relative w-full max-w-[460px] mx-auto rounded-2xl overflow-hidden border border-slate-300 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50/40 text-slate-800 font-sans select-none transition-all hover:shadow-2xl">
        
        {/* Top Government Header Strip with Indian Tricolor ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
        
        <div className="px-4 py-2.5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-2.5">
            {/* Ashoka Lion Insignia Replica */}
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center p-1">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300 fill-current">
                <path d="M12 2L15 8H9L12 2Z" opacity="0.8" />
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300 leading-tight">
                राष्ट्रीय स्वास्थ्य प्राधिकरण
              </p>
              <p className="text-[9px] uppercase font-semibold text-slate-300 tracking-wider">
                National Health Authority
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-teal-500/20 text-teal-300 border border-teal-400/40">
              ABDM MOCK VERIFIED
            </span>
            <p className="text-[8px] text-slate-400 tracking-tighter mt-0.5">Govt. of India</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 relative">
          {/* Subtle Watermark Emblem in Background */}
          <div className="absolute right-6 top-8 opacity-5 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-48 h-48 fill-current text-blue-950">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-4">
            {/* Left: Photo with holographic frame */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-24 rounded-lg bg-gradient-to-b from-slate-200 to-slate-300 border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                <User className="w-12 h-12 text-slate-500" />
                <div className="absolute bottom-0 inset-x-0 bg-blue-900/80 text-white text-[8px] font-bold text-center py-0.5">
                  CITIZEN
                </div>
              </div>
              <div className="mt-1.5 flex items-center space-x-1 text-[9px] text-emerald-700 font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>KYC LINKED</span>
              </div>
            </div>

            {/* Middle: Demographic Information */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Citizen Name / பெயர்</p>
                <p className="text-sm font-extrabold text-slate-900 truncate tracking-tight">{patient.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase">Gender / பாலினம்</p>
                  <p className="text-[11px] font-bold text-slate-800">
                    {patient.gender || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase">Year of Birth</p>
                  <p className="text-[11px] font-bold text-slate-800">
                    {patient.yearOfBirth || (patient.dateOfBirth ? patient.dateOfBirth.slice(0, 4) : '1988')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase">Mobile / அலைபேசி</p>
                <p className="text-[11px] font-mono font-bold text-slate-800">
                  +91 {patient.mobileNumber.slice(0, 5)} {patient.mobileNumber.slice(5)}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase">ABHA Address</p>
                <p className="text-[11px] font-mono font-bold text-indigo-700 truncate">
                  {abhaAddress}
                </p>
              </div>
            </div>

            {/* Right: Mock ABDM QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-1.5 bg-white rounded-lg border border-slate-300 shadow-xs relative">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 64 64" className="w-16 h-16 text-slate-900 fill-current">
                  {/* Outer Frame Top-Left */}
                  <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="8" y="8" width="8" height="8" fill="currentColor" />
                  
                  {/* Outer Frame Top-Right */}
                  <rect x="42" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="48" y="8" width="8" height="8" fill="currentColor" />

                  {/* Outer Frame Bottom-Left */}
                  <rect x="2" y="42" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="8" y="48" width="8" height="8" fill="currentColor" />

                  {/* Random Pattern Dots */}
                  <rect x="26" y="6" width="4" height="4" />
                  <rect x="34" y="6" width="4" height="4" />
                  <rect x="26" y="14" width="4" height="4" />
                  <rect x="34" y="14" width="4" height="8" />

                  <rect x="6" y="26" width="4" height="4" />
                  <rect x="14" y="26" width="8" height="4" />
                  <rect x="26" y="26" width="6" height="6" />
                  <rect x="36" y="26" width="4" height="4" />
                  <rect x="46" y="26" width="6" height="4" />
                  <rect x="56" y="26" width="4" height="4" />

                  <rect x="26" y="36" width="4" height="6" />
                  <rect x="34" y="38" width="6" height="4" />
                  <rect x="44" y="36" width="6" height="6" />
                  <rect x="54" y="36" width="6" height="4" />

                  <rect x="26" y="46" width="6" height="4" />
                  <rect x="36" y="48" width="6" height="6" />
                  <rect x="46" y="46" width="4" height="6" />
                  <rect x="54" y="46" width="6" height="6" />
                  <rect x="26" y="56" width="12" height="4" />
                  <rect x="42" y="56" width="6" height="4" />
                </svg>
              </div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">
                Scan & Share
              </span>
            </div>
          </div>

          {/* 14-Digit ABHA Number Display Strip */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/90 flex items-center justify-between bg-slate-100/70 -mx-4 -mb-4 px-4 py-2">
            <div>
              <p className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500">
                ABHA Number / ஆயுஷ்மான் பாரத் சுகாதார கணக்கு எண்
              </p>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm sm:text-base font-black tracking-widest text-blue-950">
                  {formattedAbha}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  title="Copy ABHA ID"
                  className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-mono text-slate-400">ABDM-M3-ID</span>
              <p className="text-[9px] font-bold text-blue-900">National ID</p>
            </div>
          </div>
        </div>

        {/* Bottom Tricolor Accent Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      </div>

      {/* Card Quick Actions */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 max-w-[460px] mx-auto">
        <span className="text-[11px]">
          Official NHA/ABDM Compliant PVC Specification
        </span>
        <button
          type="button"
          onClick={() => {
            if (onPrint) onPrint();
            else window.print();
          }}
          className="inline-flex items-center space-x-1 font-semibold text-teal-700 hover:text-teal-800 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print ABHA Card</span>
        </button>
      </div>
    </div>
  );
};
