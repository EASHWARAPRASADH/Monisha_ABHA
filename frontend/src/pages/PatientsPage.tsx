import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Phone,
  Search,
  Ticket,
  Calendar,
  Clock,
  Printer,
  FileText,
  UserPlus,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { adminApi, tokenApi } from '../services/api';
import { Patient, Token } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AbhaCard } from '../components/AbhaCard';
import { OpdCaseSheetSlip } from '../components/OpdCaseSheetSlip';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientTokens, setPatientTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [selectedSlipToken, setSelectedSlipToken] = useState<Token | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'VERIFIED' | 'UNLINKED'>('ALL');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPatients();
      setPatients(data);
      if (data.length > 0 && !selectedPatient) {
        inspectPatient(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const inspectPatient = async (p: Patient) => {
    setSelectedPatient(p);
    try {
      setLoadingTokens(true);
      const tokens = await tokenApi.getPatientTokens(p.mobileNumber);
      setPatientTokens(tokens);
    } catch (e) {
      console.error(e);
      setPatientTokens([]);
    } finally {
      setLoadingTokens(false);
    }
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      !search ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.mobileNumber.includes(search) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'VERIFIED') return !!p.abhaId;
    if (filterType === 'UNLINKED') return !p.abhaId;
    return true;
  });

  const verifiedCount = patients.filter((p) => !!p.abhaId).length;
  const unlinkedCount = patients.filter((p) => !p.abhaId).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Institutional Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              National Health Authority • ABDM Citizen Registry
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Registered Patients & ABHA Health Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Citizen database linked via mobile telephony and Ayushman Bharat Health Account (ABHA ID)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-72">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, Mobile, ABHA ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <button
            onClick={loadPatients}
            title="Refresh Directory"
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Citizens ({patients.length})
        </button>

        <button
          onClick={() => setFilterType('VERIFIED')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
            filterType === 'VERIFIED'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
          <span>ABHA Linked ({verifiedCount})</span>
        </button>

        <button
          onClick={() => setFilterType('UNLINKED')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            filterType === 'UNLINKED'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Phone Only ({unlinkedCount})
        </button>
      </div>

      {/* Main Split Layout: Directory (Col 6) & ABHA Dossier (Col 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Citizens List (Col 6) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Citizens Directory ({filtered.length})
            </span>
            <span className="text-[11px] text-slate-400">Click a citizen to view ABHA Card</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading citizens directory...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No matching citizens found.</div>
          ) : (
            <div className="overflow-x-auto max-h-[640px] overflow-y-auto divide-y divide-slate-100">
              {filtered.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => inspectPatient(p)}
                    className={`p-4 cursor-pointer transition flex items-center justify-between ${
                      isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        p.abhaId ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.fullName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-slate-900 text-xs truncate">{p.fullName}</p>
                          {p.abhaId && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200 flex items-center">
                              <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                              ABHA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">+91 {p.mobileNumber}</p>
                        {p.abhaId ? (
                          <p className="text-[10px] font-mono text-indigo-700 mt-0.5 truncate">
                            {p.abhaId}
                          </p>
                        ) : (
                          <p className="text-[10px] text-amber-600 mt-0.5">Pending ABHA creation</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">
                        {p.gender || 'Gen'} • {p.dateOfBirth?.slice(0, 4) || '1988'}
                      </span>
                      <span className="text-[11px] font-bold text-teal-700 hover:underline mt-1 inline-block">
                        View Dossier →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Citizen Dossier, ABHA Card & Past Tokens (Col 6) */}
        <div className="lg:col-span-6 space-y-6">
          {selectedPatient ? (
            <>
              {/* Official PVC ABHA Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Official Identity Credential
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">
                      Ayushman Bharat Health Account (ABHA) Card
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    UIDAI Verified
                  </span>
                </div>

                {/* Render the Authentic ABHA PVC Card */}
                <AbhaCard
                  patient={selectedPatient}
                  onPrint={() => window.print()}
                />
              </div>

              {/* Consultation History & OPD Visits */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      OPD Consultation History & Tokens
                    </h2>
                    <p className="text-xs text-slate-500">
                      Past tokens issued to {selectedPatient.fullName} (+91 {selectedPatient.mobileNumber})
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {patientTokens.length} Visits
                  </span>
                </div>

                {loadingTokens ? (
                  <div className="p-8 text-center text-xs text-slate-400">Loading visit history...</div>
                ) : patientTokens.length === 0 ? (
                  <div className="p-8 text-center">
                    <Ticket className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="text-xs text-slate-500 font-medium">No past OPD tokens found for this citizen.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {patientTokens.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {t.tokenNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{t.departmentName}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {t.hospitalName} • Window: {t.estimatedTime}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <StatusBadge status={t.status} />
                          <button
                            onClick={() => setSelectedSlipToken(t)}
                            title="Print OPD Case Slip"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Citizen Selected</p>
              <p className="text-xs text-slate-400 mt-0.5">Select a citizen from the directory to inspect their ABHA card.</p>
            </div>
          )}
        </div>
      </div>

      {/* OPD Case Slip Modal */}
      {selectedSlipToken && (
        <OpdCaseSheetSlip
          token={selectedSlipToken}
          onClose={() => setSelectedSlipToken(null)}
        />
      )}
    </div>
  );
};
