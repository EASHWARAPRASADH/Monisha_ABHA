import React from 'react';
import { Printer, X, CheckCircle, Clock, MapPin, User, Building, QrCode } from 'lucide-react';
import { Token } from '../types';

interface OpdCaseSheetSlipProps {
  token: Token | null;
  onClose: () => void;
}

export const OpdCaseSheetSlip: React.FC<OpdCaseSheetSlipProps> = ({ token, onClose }) => {
  if (!token) return null;

  const handlePrint = () => {
    window.print();
  };

  // Format booking date/time
  const bookingDate = token.bookingDate || new Date().toISOString().split('T')[0];
  const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header Actions (Excluded in Print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold tracking-tight">OPD Patient Consultation Slip</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt / Case Slip Area */}
        <div className="p-6 overflow-y-auto font-mono text-slate-900 bg-white print:p-0 print:m-0">
          <div className="border-2 border-dashed border-slate-300 p-5 rounded-xl relative overflow-hidden bg-amber-50/20">
            
            {/* Tricolor Ribbon on top */}
            <div className="h-1 -mx-5 -mt-5 mb-4 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

            {/* Official Hospital Header */}
            <div className="text-center border-b border-slate-300 pb-3 mb-3">
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-600">
                GOVERNMENT OF TAMIL NADU • DIRECTORATE OF MEDICAL EDUCATION
              </p>
              <h2 className="text-base font-sans font-black uppercase tracking-tight text-slate-900 mt-0.5">
                {token.hospitalName || 'RAJIV GANDHI GOVERNMENT GENERAL HOSPITAL'}
              </h2>
              <p className="text-[10px] font-sans text-slate-500">
                EVR Periyar Salai, Park Town, Chennai - 600003
              </p>
              <div className="mt-1.5 inline-block bg-slate-900 text-white text-[9px] font-sans font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                CENTRAL OPD TOKEN & TRIAGE SLIP (அரசு மருத்துவமனை சீட்டு)
              </div>
            </div>

            {/* Giant Token Number Highlight */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center my-3">
              <p className="text-[9px] uppercase font-sans font-bold tracking-widest text-slate-500">
                YOUR CONSULTATION TOKEN NUMBER (டோக்கன் எண்)
              </p>
              <p className="text-4xl font-mono font-black tracking-wider text-teal-800 my-1">
                {token.tokenNumber}
              </p>
              <div className="flex items-center justify-center space-x-3 text-xs font-sans text-slate-600">
                <span>Date: <strong>{formattedDate}</strong></span>
                <span>•</span>
                <span>Est. Window: <strong className="text-slate-900">{token.estimatedTime}</strong></span>
              </div>
            </div>

            {/* Consultation Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3 mb-3">
              <div>
                <p className="text-[9px] text-slate-400 font-sans uppercase">Department / துறை</p>
                <p className="font-bold text-slate-900 font-sans">{token.departmentName}</p>
                <p className="text-[10px] text-slate-500 font-sans">Desk: OPD Room 104, Block-B</p>
              </div>

              <div>
                <p className="text-[9px] text-slate-400 font-sans uppercase">Booking Channel</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-sans font-bold">
                  {token.channel === 'IVR' ? 'Automated Voice (IVR)' : 'Walk-in Counter'}
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Status: {token.status}</p>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="space-y-1.5 text-xs border-b border-slate-200 pb-3 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Patient Name:</span>
                <span className="font-bold font-sans text-slate-900">{token.patientName || 'Anonymous Citizen'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Registered Mobile:</span>
                <span className="font-mono font-bold text-slate-800">+91 {token.patientMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">ABHA ID (Ayushman):</span>
                <span className="font-mono font-bold text-indigo-700">
                  {token.abhaId || 'Linked via Phone OTP'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Consultation Fee:</span>
                <span className="font-bold text-emerald-700">₹ 0.00 (Free Public Healthcare)</span>
              </div>
            </div>

            {/* Barcode & Rubber Stamp section */}
            <div className="flex items-center justify-between pt-1 relative">
              {/* Barcode simulation */}
              <div className="space-y-1">
                <svg viewBox="0 0 160 36" className="w-36 h-9">
                  {/* Generated Code 128 barcode bars */}
                  <rect x="0" y="0" width="3" height="36" fill="#000" />
                  <rect x="5" y="0" width="1" height="36" fill="#000" />
                  <rect x="8" y="0" width="2" height="36" fill="#000" />
                  <rect x="13" y="0" width="4" height="36" fill="#000" />
                  <rect x="19" y="0" width="2" height="36" fill="#000" />
                  <rect x="23" y="0" width="1" height="36" fill="#000" />
                  <rect x="26" y="0" width="3" height="36" fill="#000" />
                  <rect x="32" y="0" width="2" height="36" fill="#000" />
                  <rect x="36" y="0" width="3" height="36" fill="#000" />
                  <rect x="42" y="0" width="1" height="36" fill="#000" />
                  <rect x="45" y="0" width="4" height="36" fill="#000" />
                  <rect x="52" y="0" width="2" height="36" fill="#000" />
                  <rect x="56" y="0" width="2" height="36" fill="#000" />
                  <rect x="61" y="0" width="3" height="36" fill="#000" />
                  <rect x="66" y="0" width="1" height="36" fill="#000" />
                  <rect x="69" y="0" width="4" height="36" fill="#000" />
                  <rect x="75" y="0" width="2" height="36" fill="#000" />
                  <rect x="80" y="0" width="3" height="36" fill="#000" />
                  <rect x="85" y="0" width="1" height="36" fill="#000" />
                  <rect x="88" y="0" width="2" height="36" fill="#000" />
                  <rect x="92" y="0" width="4" height="36" fill="#000" />
                  <rect x="98" y="0" width="2" height="36" fill="#000" />
                  <rect x="103" y="0" width="3" height="36" fill="#000" />
                  <rect x="108" y="0" width="1" height="36" fill="#000" />
                  <rect x="111" y="0" width="2" height="36" fill="#000" />
                  <rect x="116" y="0" width="4" height="36" fill="#000" />
                  <rect x="122" y="0" width="1" height="36" fill="#000" />
                  <rect x="125" y="0" width="3" height="36" fill="#000" />
                  <rect x="130" y="0" width="2" height="36" fill="#000" />
                  <rect x="134" y="0" width="3" height="36" fill="#000" />
                  <rect x="140" y="0" width="2" height="36" fill="#000" />
                  <rect x="144" y="0" width="4" height="36" fill="#000" />
                  <rect x="151" y="0" width="2" height="36" fill="#000" />
                  <rect x="156" y="0" width="3" height="36" fill="#000" />
                </svg>
                <p className="text-[8px] font-mono tracking-widest text-slate-500">
                  REF-{token.tokenNumber}-{token.id}
                </p>
              </div>

              {/* Authentic Circular Rubber Stamp Effect */}
              <div className="w-24 h-24 rounded-full border-2 border-red-600/80 p-1 flex items-center justify-center transform -rotate-12 select-none opacity-85">
                <div className="w-full h-full rounded-full border border-dashed border-red-500/80 flex flex-col items-center justify-center text-center p-1 text-red-600 font-sans">
                  <span className="text-[6.5px] font-black uppercase tracking-tight leading-none">
                    GOVT HOSPITAL OPD
                  </span>
                  <span className="text-[8px] font-black uppercase my-0.5 tracking-tighter">
                    ★ VERIFIED ★
                  </span>
                  <span className="text-[6px] font-semibold tracking-tighter leading-none">
                    REGISTRATION DESK
                  </span>
                  <span className="text-[6px] font-mono mt-0.5">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Official Patient Instructions (Bilingual) */}
            <div className="mt-4 pt-3 border-t border-slate-300 text-[9px] font-sans text-slate-600 space-y-1">
              <p className="font-bold text-slate-700">INSTRUCTIONS FOR PATIENTS (நோயாளிகளுக்கான வழிமுறைகள்):</p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                <li>Please report to the OPD Waiting Hall 15 minutes before your estimated window ({token.estimatedTime}).</li>
                <li>Keep this case sheet ready when your token number is announced on the Waiting Hall TV.</li>
                <li>அழைப்பு வரும் வரை காத்திருப்பு அறையில் காத்திருக்கவும்.</li>
                <li>Token is valid only for today ({formattedDate}) during OPD operating hours (08:00 - 16:00).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>ABDM Scan & Share Compliant Standard Form</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
