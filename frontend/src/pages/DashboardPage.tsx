import React, { useEffect, useState } from 'react';
import {
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  PhoneCall,
  Building2,
  Stethoscope,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Radio,
  Tv,
  Users,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../services/api';
import { AdminStats } from '../types';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Synchronizing Hospital Operations Intelligence...</p>
      </div>
    );
  }

  // Calculate percentages and analytics
  const ivrSuccessRate = stats.totalIvrCalls > 0
    ? Math.round((stats.successfulIvrCalls / stats.totalIvrCalls) * 100)
    : 100;
  
  const completionRate = stats.totalTokensToday > 0
    ? Math.round((stats.completedToday / stats.totalTokensToday) * 100)
    : 0;

  // Calculate SVG Area Chart Path for Hourly Tokens
  const maxHourlyCount = Math.max(...stats.tokensByHour.map((h) => h.count), 5);
  const chartHeight = 160;
  const chartWidth = 600;
  const points = stats.tokensByHour.map((item, index) => {
    const x = (index / (stats.tokensByHour.length - 1 || 1)) * (chartWidth - 60) + 30;
    const y = chartHeight - (item.count / maxHourlyCount) * (chartHeight - 40) - 20;
    return { x, y, count: item.count, hour: item.hour };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';
  
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`
    : '';

  // Calculate Donut Segments for Departments
  const deptColors = ['#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#d97706', '#ec4899', '#64748b'];
  const totalDeptTokens = stats.tokensByDepartment.reduce((acc, d) => acc + d.count, 0) || 1;
  let accumulatedAngle = 0;
  const donutSegments = stats.tokensByDepartment.map((dept, index) => {
    const fraction = dept.count / totalDeptTokens;
    const strokeDasharray = `${fraction * 283} ${283}`;
    const strokeDashoffset = -accumulatedAngle * 283;
    accumulatedAngle += fraction;
    return {
      name: dept.name,
      count: dept.count,
      percent: Math.round(fraction * 100),
      color: deptColors[index % deptColors.length],
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top National Command Ribbon */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              LIVE OPD SHIFT 1 • 08:00 TO 16:00
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-mono">{currentTime || '09:30:00 AM'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Institutional Hospital Operations Command
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            National Health Authority (NHA) ABDM Sandbox Integrated OPD Queuing & Voice Telephony Gateway
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/ivr-simulator"
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition"
          >
            <PhoneCall className="h-4 w-4 mr-1.5" />
            Virtual Feature Phone
          </Link>
          <Link
            to="/tokens"
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Ticket className="h-4 w-4 mr-1.5 text-teal-400" />
            OPD Queue Desk
          </Link>
          <button
            onClick={loadStats}
            title="Refresh Real-time Telemetry"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 6-Card Executive Health Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Tokens */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Tokens</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Ticket className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalTokensToday}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Issued today</p>
          </div>
        </div>

        {/* Waiting / Active */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Waiting Queue</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600 tracking-tight">{stats.bookedToday}</p>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">In waiting hall</p>
          </div>
        </div>

        {/* Consultations Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Consulted</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-600 tracking-tight">{stats.completedToday}</p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">{completionRate}% throughput</p>
          </div>
        </div>

        {/* Cancellations */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cancelled</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-600 tracking-tight">{stats.cancelledToday}</p>
            <p className="text-[10px] text-rose-700 font-medium mt-0.5">Quota returned</p>
          </div>
        </div>

        {/* IVR Telephony Inbound */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">IVR Calls</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <PhoneCall className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-indigo-600 tracking-tight">{stats.totalIvrCalls}</p>
            <p className="text-[10px] text-indigo-700 font-medium mt-0.5">{ivrSuccessRate}% success rate</p>
          </div>
        </div>

        {/* Facilities & Specialties */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OPD Nodes</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-teal-700 tracking-tight">
              {stats.activeHospitals} <span className="text-sm font-normal text-slate-400">/ {stats.activeDepartments}</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Hospitals / Depts</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Consultation Velocity Curve (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Hourly Consultation Velocity Curve (08:00 - 16:00)
              </h2>
              <p className="text-xs text-slate-500">
                Peak load analysis: Concurrency tokens booked per hourly operational window
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[10px]">
                Peak Hour: 10:00 - 12:00
              </span>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="w-full overflow-x-auto py-2">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="30" y1="20" x2={chartWidth - 30} y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="30" y1={chartHeight / 2} x2={chartWidth - 30} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="30" y1={chartHeight - 10} x2={chartWidth - 30} y2={chartHeight - 10} stroke="#cbd5e1" strokeWidth="1" />

                {/* Gradient Area */}
                {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                {/* Line Path */}
                {pathD && <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Data Points & Value Badges */}
                {points.map((p, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#ffffff"
                      stroke="#0d9488"
                      strokeWidth="2.5"
                      className="group-hover:r-7 transition-all"
                    />
                    {/* Count Text */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-slate-700"
                    >
                      {p.count}
                    </text>
                    {/* Hour Axis Label */}
                    <text
                      x={p.x}
                      y={chartHeight + 10}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-400"
                    >
                      {p.hour.replace(':00', 'h')}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mt-2">
            <span>Operating Timings: 08:00 AM to 04:00 PM (8 Operational Windows)</span>
            <span className="font-mono text-teal-700 font-bold">15-min Slot Granularity</span>
          </div>
        </div>

        {/* Clinical Specialty Distribution Donut (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Specialty Load Breakdown</h2>
            <p className="text-xs text-slate-500">Distribution of patient tokens across clinical departments</p>
          </div>

          {/* SVG Donut Ring */}
          <div className="flex items-center justify-center my-2 relative">
            <svg viewBox="0 0 120 120" className="w-36 h-36 transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="14"
              />
              {donutSegments.map((seg, i) => (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-700"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total</span>
              <span className="text-2xl font-black text-slate-900 leading-none">{totalDeptTokens}</span>
              <span className="text-[10px] text-slate-400">Tokens</span>
            </div>
          </div>

          {/* Department Legend */}
          <div className="space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
            {donutSegments.map((seg, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-700 truncate font-medium">{seg.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-slate-900 font-bold">{seg.count}</span>
                  <span className="text-[10px] text-slate-400">({seg.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telephony Health & Inbound Telephony Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* IVR Voice Completion Funnel (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                IVR Voice Call Flow Conversion Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end patient telephony journey from dialing 1800-XXX-OPD to receiving token
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {ivrSuccessRate}% Booking Yield
            </span>
          </div>

          {/* Step Pipeline */}
          <div className="space-y-3">
            {[
              { step: '1. Inbound Call & IVR Greeting', pct: 100, label: `${stats.totalIvrCalls || 28} calls received`, color: 'bg-indigo-600' },
              { step: '2. Language Chosen (Tamil/Hindi/English)', pct: 96, label: '96% selected preference', color: 'bg-blue-600' },
              { step: '3. Hospital & Department Chosen (DTMF)', pct: 92, label: '92% completed selection', color: 'bg-teal-600' },
              { step: '4. Identity Verification (ABHA / Phone)', pct: 88, label: '88% identity verified', color: 'bg-emerald-600' },
              { step: '5. Token Number Spoken & Confirmed', pct: ivrSuccessRate, label: `${stats.successfulIvrCalls} tokens booked`, color: 'bg-emerald-500' },
              { step: '6. DLT Transactional SMS Dispatched', pct: Math.max(ivrSuccessRate - 2, 80), label: 'SMS confirmation delivered', color: 'bg-cyan-600' },
            ].map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 font-semibold">{f.step}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{f.label} ({f.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`${f.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Twilio Telephony Audio Webhook Gateway</span>
            <Link to="/ivr-calls" className="font-semibold text-teal-600 hover:text-teal-700 flex items-center">
              <span>Inspect Call Trace Audio</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Facility Load Matrix (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Hospital Facility Load Matrix</h2>
            <p className="text-xs text-slate-500">Real-time daily quota capacity & patient throughput</p>
          </div>

          <div className="space-y-4">
            {stats.tokensByHospital.map((hosp, i) => {
              const cap = 200; // Simulated hospital daily capacity
              const pct = Math.min(Math.round((hosp.count / cap) * 100), 100);
              return (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{hosp.name}</p>
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {hosp.count} / {cap}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Facility Utilization: {pct}%</span>
                    <span className="text-emerald-700 font-medium">Headroom: {cap - hosp.count} slots free</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Pessimistic write locking enabled</span>
            <Link to="/hospitals" className="font-semibold text-teal-600 hover:text-teal-700 flex items-center">
              <span>Manage Hospital Nodes</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
