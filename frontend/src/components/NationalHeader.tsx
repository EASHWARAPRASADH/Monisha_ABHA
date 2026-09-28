import React from 'react';

export const NationalHeader: React.FC = () => {
  return (
    <div className="flex items-center space-x-3.5">
      {/* Institutional Crest SVG */}
      <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 flex items-center justify-center p-1 shadow-inner">
        <svg viewBox="0 0 100 100" className="h-8 w-8 text-amber-400 drop-shadow-xs" fill="currentColor">
          {/* Emblem representation of Ashoka Pillar & Wheel */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#F59E0B" strokeWidth="3" opacity="0.4" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
          {/* 24 spokes representation */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="36"
              x2="50"
              y2="64"
              stroke="#38BDF8"
              strokeWidth="1.5"
              transform={`rotate(${i * 15} 50 50)`}
            />
          ))}
          {/* Hospital Cross in center */}
          <rect x="47" y="42" width="6" height="16" fill="#10B981" />
          <rect x="42" y="47" width="16" height="6" fill="#10B981" />
          <polygon points="50,14 42,26 58,26" fill="#F59E0B" />
        </svg>
      </div>

      <div className="leading-tight">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] tracking-wider text-amber-400 font-semibold uppercase">
            भारत सरकार • GOVT OF INDIA
          </span>
          <span className="text-[10px] text-slate-500">•</span>
          <span className="text-[10px] tracking-wider text-teal-300 font-semibold uppercase">
            ABDM COMPLIANT
          </span>
        </div>
        <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center">
          National Hospital OPD Token System
        </h1>
        <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
          Interactive Voice Response (IVR) Service for Digital Inclusion in Primary Healthcare
        </p>
      </div>
    </div>
  );
};
