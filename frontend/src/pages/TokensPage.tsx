import React, { useEffect, useState } from 'react';
import {
  Ticket,
  Filter,
  CheckCircle,
  XCircle,
  Megaphone,
  UserX,
  Search,
  Plus,
  RefreshCw,
  Clock,
  Building2,
  Tv,
  Printer,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Bot,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { tokenApi, hospitalApi, departmentApi, aiApi } from '../services/api';
import { Department, Hospital, Token, TokenStatus, DoctorClinicalBrief } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { OpdWaitingHallTvModal } from '../components/OpdWaitingHallTvModal';
import { OpdCaseSheetSlip } from '../components/OpdCaseSheetSlip';
import { telephonyAudio } from '../utils/audio';

export const TokensPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals & Slips
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTvModal, setShowTvModal] = useState(false);
  const [selectedSlipToken, setSelectedSlipToken] = useState<Token | null>(null);
  const [callingToken, setCallingToken] = useState<string | null>(null);

  // AI Doctor Clinical Brief State
  const [selectedBriefToken, setSelectedBriefToken] = useState<Token | null>(null);
  const [clinicalBrief, setClinicalBrief] = useState<DoctorClinicalBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // New Booking Form State
  const [newMobile, setNewMobile] = useState('');
  const [newName, setNewName] = useState('');
  const [newHospId, setNewHospId] = useState<number>(1);
  const [newDeptId, setNewDeptId] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    loadDropdowns();
    loadTokens();
  }, []);

  useEffect(() => {
    if (tokens.length > 0 && typeof window !== 'undefined' && window.location.search.includes('openBrief=true')) {
      handleOpenClinicalBrief(tokens[0]);
    }
  }, [tokens]);

  const loadDropdowns = async () => {
    try {
      const [hospData, deptData] = await Promise.all([
        hospitalApi.getAll(),
        departmentApi.getAll(),
      ]);
      setHospitals(hospData);
      setDepartments(deptData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTokens = async () => {
    try {
      setLoading(true);
      const data = await tokenApi.getAll({
        hospitalId: selectedHospital ? Number(selectedHospital) : undefined,
        departmentId: selectedDepartment ? Number(selectedDepartment) : undefined,
        status: selectedStatus ? (selectedStatus as TokenStatus) : undefined,
      });
      setTokens(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (tokenId: number, newStatus: TokenStatus) => {
    try {
      await tokenApi.updateStatus(tokenId, newStatus);
      if (newStatus === 'CALLED') {
        const t = tokens.find((tok) => tok.id === tokenId);
        if (t) {
          setCallingToken(t.tokenNumber);
          // Play official hospital chime tone
          telephonyAudio.playHospitalChime();

          // Audio cue using Web Speech
          if ('speechSynthesis' in window) {
            setTimeout(() => {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(
                `Token number ${t.tokenNumber}, please proceed to Room 104.`
              );
              utterance.lang = 'en-IN';
              window.speechSynthesis.speak(utterance);
            }, 600);
          }
          setTimeout(() => setCallingToken(null), 6000);
        }
      }
      loadTokens();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Status update failed');
    }
  };

  const handleCancelToken = async (tokenId: number) => {
    if (!window.confirm('Are you sure you want to cancel this token?')) return;
    try {
      await tokenApi.cancel(tokenId, 'Cancelled by hospital staff');
      loadTokens();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingMsg(null);
    try {
      const created = await tokenApi.book({
        patientMobile: newMobile,
        patientName: newName || undefined,
        hospitalId: newHospId,
        departmentId: newDeptId,
        channel: 'WEB',
      });
      setBookingMsg({ text: `Token ${created.tokenNumber} issued successfully!`, error: false });
      setNewMobile('');
      setNewName('');
      loadTokens();
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingMsg(null);
        setSelectedSlipToken(created);
      }, 1500);
    } catch (err: any) {
      setBookingMsg({ text: err.response?.data?.message || 'Failed to book token', error: true });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleOpenClinicalBrief = async (token: Token) => {
    setSelectedBriefToken(token);
    setClinicalBrief(null);
    setBriefLoading(true);
    try {
      const data = await aiApi.getClinicalBrief(token.id);
      setClinicalBrief(data);
    } catch (e) {
      console.error('Failed to load clinical brief:', e);
    } finally {
      setBriefLoading(false);
    }
  };

  const handleCopyFhirNote = (note: string) => {
    navigator.clipboard.writeText(note);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  // Filter tokens based on search query
  const filteredTokens = tokens.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tokenNumber.toLowerCase().includes(q) ||
      (t.patientName && t.patientName.toLowerCase().includes(q)) ||
      t.patientMobile.includes(q) ||
      (t.abhaId && t.abhaId.toLowerCase().includes(q))
    );
  });

  // Calculate live counter counts
  const totalCount = tokens.length;
  const waitingCount = tokens.filter((t) => t.status === 'BOOKED').length;
  const inConsultCount = tokens.filter((t) => t.status === 'CALLED').length;
  const completedCount = tokens.filter((t) => t.status === 'COMPLETED').length;
  const cancelledCount = tokens.filter((t) => t.status === 'CANCELLED' || t.status === 'NO_SHOW').length;

  return (
    <div className="space-y-6">
      
      {/* Top Page Header & Institutional Command Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              Hospital OPD Operations & Triage Desk
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Today's Outpatient Consultation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pessimistic concurrency locked token scheduling • Synchronized with IVR telecom gateway
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* TV Display Button */}
          <button
            onClick={() => setShowTvModal(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition"
          >
            <Tv className="h-4 w-4 mr-1.5 text-teal-400" />
            Waiting Hall TV Signage
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadTokens}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </button>

          {/* Manual Counter Booking */}
          <button
            onClick={() => setShowBookingModal(true)}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-500 shadow-sm transition"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Counter Token
          </button>
        </div>
      </div>

      {/* Real-time Calling Banner */}
      {callingToken && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Now Calling Token to Room 104</p>
              <p className="text-2xl font-black font-mono tracking-wider">{callingToken}</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
            Announcing over PA Speakers
          </span>
        </div>
      )}

      {/* Fast Metric Quick-Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => { setSelectedStatus(''); loadTokens(); }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedStatus === '' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">All Tokens</span>
          <p className="text-xl font-black mt-0.5">{totalCount}</p>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatus('BOOKED'); loadTokens(); }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedStatus === 'BOOKED' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">In Waiting Queue</span>
          <p className="text-xl font-black mt-0.5">{waitingCount}</p>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatus('CALLED'); loadTokens(); }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedStatus === 'CALLED' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">In Consultation</span>
          <p className="text-xl font-black mt-0.5">{inConsultCount}</p>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatus('COMPLETED'); loadTokens(); }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedStatus === 'COMPLETED' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Completed Today</span>
          <p className="text-xl font-black mt-0.5">{completedCount}</p>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatus('CANCELLED'); loadTokens(); }}
          className={`p-3 rounded-xl border text-left transition ${
            selectedStatus === 'CANCELLED' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Cancelled / No-Show</span>
          <p className="text-xl font-black mt-0.5">{cancelledCount}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Token (e.g. GGH-08-001), Patient, Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div>
          <select
            value={selectedHospital}
            onChange={(e) => {
              setSelectedHospital(e.target.value);
              loadTokens();
            }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Hospital Facilities</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              loadTokens();
            }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Medical Specialties</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              loadTokens();
            }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Queue Statuses</option>
            <option value="BOOKED">BOOKED (In Waiting Queue)</option>
            <option value="CALLED">CALLED (In Doctor Consultation)</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO SHOW</option>
          </select>
        </div>
      </div>

      {/* Main Queue Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-2" />
            <p className="text-xs font-medium">Synchronizing hospital queue...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="p-16 text-center">
            <Ticket className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No OPD tokens found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Simulate an incoming patient call in the Virtual Phone or create a walk-in token above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Token Serial</th>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Facility & Desk</th>
                  <th className="py-3 px-4">Est. Consultation Window</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition group">
                    {/* Token Number */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-black text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block shadow-2xs">
                        {t.tokenNumber}
                      </span>
                    </td>

                    {/* Patient / ABHA */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-xs">{t.patientName || 'Anonymous Citizen'}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">+91 {t.patientMobile}</p>
                      {t.abhaId ? (
                        <div className="flex items-center space-x-1 mt-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 w-fit">
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span className="font-mono">{t.abhaId}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No ABHA linked</span>
                      )}
                    </td>

                    {/* Hospital & Department */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{t.departmentName}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{t.hospitalName}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                        Room 104
                      </span>
                    </td>

                    {/* Consultation Time */}
                    <td className="py-3 px-4">
                      <div className="flex items-center text-slate-700 space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold font-mono">{t.estimatedTime}</span>
                      </div>
                    </td>

                    {/* Booking Channel & AI Triage Priority */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                          t.channel === 'IVR'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {t.channel === 'IVR' ? 'Automated IVR' : 'Counter Desk'}
                        </span>
                        {t.triageSeverity === 'EMERGENCY' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse w-fit">
                            🚨 EMERGENCY
                          </span>
                        ) : t.triageSeverity === 'PRIORITY' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300 w-fit">
                            ⚡ PRIORITY
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-50 text-slate-600 border border-slate-200 w-fit">
                            ROUTINE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* AI Doctor Clinical Briefing Button */}
                      <button
                        onClick={() => handleOpenClinicalBrief(t)}
                        title="AI Pre-Consultation Doctor Brief & Screening Checklist"
                        className="p-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 shadow-2xs transition"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                      </button>

                      {/* Print Official Thermal Case Slip */}
                      <button
                        onClick={() => setSelectedSlipToken(t)}
                        title="Print OPD Consultation Slip"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Call Desk Action with Audio Chime */}
                      {t.status === 'BOOKED' && (
                        <button
                          onClick={() => handleStatusChange(t.id, 'CALLED')}
                          title="Call Patient into Doctor's Room"
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs transition"
                        >
                          Call Desk
                        </button>
                      )}

                      {/* Complete Consultation */}
                      {(t.status === 'BOOKED' || t.status === 'CALLED') && (
                        <>
                          <button
                            onClick={() => handleStatusChange(t.id, 'COMPLETED')}
                            title="Mark Consultation Done"
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition"
                          >
                            Done
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(t.id, 'NO_SHOW')}
                            title="Mark as No-Show"
                            className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                          >
                            No-Show
                          </button>

                          <button
                            onClick={() => handleCancelToken(t.id)}
                            title="Cancel Token"
                            className="px-2 py-1.5 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable OPD Slip Modal */}
      {selectedSlipToken && (
        <OpdCaseSheetSlip
          token={selectedSlipToken}
          onClose={() => setSelectedSlipToken(null)}
        />
      )}

      {/* OPD Waiting Hall TV Signage Modal */}
      {showTvModal && (
        <OpdWaitingHallTvModal
          tokens={tokens}
          onClose={() => setShowTvModal(false)}
        />
      )}

      {/* Manual Counter Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Hospital Desk</span>
                <h3 className="text-base font-bold text-slate-900">Issue Walk-in OPD Token</h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {bookingMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 ${
                  bookingMsg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {bookingMsg.text}
              </div>
            )}

            <form onSubmit={handleManualBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10 digit mobile (e.g. 9876543210)"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Citizen Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Facility *</label>
                <select
                  value={newHospId}
                  onChange={(e) => setNewHospId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Department *</label>
                <select
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm disabled:opacity-50 transition"
                >
                  {bookingLoading ? 'Issuing...' : 'Generate Token & Print Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Doctor Pre-Consultation Clinical Briefing Modal */}
      {selectedBriefToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-teal-200 shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center space-x-2">
                    <span>AI Pre-Consultation Doctor Briefing</span>
                    <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded font-mono">
                      Token: {selectedBriefToken.tokenNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-teal-200/80">
                    Patient: {selectedBriefToken.patientName || 'Citizen'} • {selectedBriefToken.departmentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBriefToken(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {briefLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Bot className="w-8 h-8 mx-auto text-teal-600 animate-bounce mb-2" />
                  Generating Local AI Clinical Briefing...
                </div>
              ) : clinicalBrief ? (
                <>
                  {/* Triage & Severity Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Triage Urgency</p>
                      <p className="text-sm font-black mt-0.5 text-slate-900">{clinicalBrief.urgencyLevel}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidence</p>
                      <p className="text-sm font-black mt-0.5 text-teal-700">{(clinicalBrief.confidenceScore * 100).toFixed(0)}% Match</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Local Engine</p>
                      <p className="text-[11px] font-mono font-bold mt-0.5 text-slate-700 truncate">{clinicalBrief.aiTriageEngine}</p>
                    </div>
                  </div>

                  {/* Chief Complaint recorded via IVR */}
                  <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200">
                    <p className="text-xs font-bold text-teal-900 mb-1 flex items-center">
                      <Bot className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                      Recorded Chief Complaint (IVR Audio / Citizen Input):
                    </p>
                    <p className="text-xs text-slate-800 font-medium italic">
                      "{clinicalBrief.chiefComplaint}"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      <span className="font-semibold text-slate-700">Clinical Rationale: </span>
                      {clinicalBrief.clinicalRationale}
                    </p>
                  </div>

                  {/* Doctor Screening Checklist Questions */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 mr-1.5" />
                      Recommended Resident Doctor Screening Questions:
                    </h4>
                    <div className="space-y-1.5">
                      {clinicalBrief.suggestedDoctorQuestions?.map((q, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                          <span className="font-bold text-teal-700 shrink-0">{idx + 1}.</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Draft ABDM FHIR Clinical Document Note */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3.5 py-2 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Draft ABDM FHIR Clinical Consultation Note</span>
                      <button
                        onClick={() => handleCopyFhirNote(clinicalBrief.draftFhirNote)}
                        className="inline-flex items-center text-[11px] text-teal-700 hover:text-teal-900"
                      >
                        {copiedBrief ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {copiedBrief ? 'Copied!' : 'Copy to EMR'}
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-slate-800 bg-slate-50 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {clinicalBrief.draftFhirNote}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Could not retrieve clinical brief.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBriefToken(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
