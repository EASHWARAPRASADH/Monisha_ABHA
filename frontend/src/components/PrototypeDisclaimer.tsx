import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, ExternalLink, Cpu } from 'lucide-react';

export const PrototypeDisclaimer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-xs mb-5 transition-all text-xs">
      <div className="bg-slate-800/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-700/60">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center h-5 w-5 rounded-md bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wide uppercase text-[11px]">
            Academic Prototype Sandbox Environment • ABDM Architecture Reference
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-mono text-[10px] border border-teal-500/20">
            MOCK GATEWAY ACTIVE
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-slate-400 hover:text-slate-200 font-medium text-[11px] transition space-x-1"
        >
          <span>{expanded ? 'Hide Architecture Scope' : 'View Architecture Scope'}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="px-4 py-3 bg-slate-900/90 text-slate-300">
        <p className="leading-relaxed text-[12px] text-slate-300">
          <strong className="text-teal-400 font-semibold">Institutional Research Notice: </strong>
          This system is an academic engineering prototype developed to bridge the digital divide in public healthcare.
          All ABHA ID lookups, OTP validations, hospital appointments, and SMS dispatches operate via high-fidelity simulated micro-gateways. 
          No production citizen health data or unauthorized government credentials are used.
        </p>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-teal-300 block mb-1">M1: ABHA Registration</span>
              <p className="text-slate-400">
                Simulates demographic lookup against 14-digit ABHA numbers and 6-digit SMS verification OTPs with rate limiting.
              </p>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-teal-300 block mb-1">M2: Hospital Information (HMIS)</span>
              <p className="text-slate-400">
                Simulates e-Hospital / e-Sushrut OPD schedules with pessimistic database locks for zero duplicate token allocations.
              </p>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-teal-300 block mb-1">Telephony: Twilio Voice & TwiML</span>
              <p className="text-slate-400">
                Standards-compliant TwiML voice engine supporting Tamil, Hindi, and Indian English with Web Audio DTMF synthesis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
