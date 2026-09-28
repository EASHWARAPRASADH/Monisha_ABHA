import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PhoneCall,
  Building2,
  Stethoscope,
  Users,
  History,
  MessageSquare,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  Radio,
  ExternalLink
} from 'lucide-react';
import { authApi } from '../services/api';
import { PrototypeDisclaimer } from '../components/PrototypeDisclaimer';
import { NationalHeader } from '../components/NationalHeader';

interface LayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authApi.getStoredUser();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Analytics & Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'OPD Queue Management', path: '/tokens', icon: Ticket, badge: 'Live' },
    { name: 'IVR Telephony Simulator', path: '/ivr-simulator', icon: PhoneCall, highlight: true },
    { name: 'Hospital Facilities', path: '/hospitals', icon: Building2 },
    { name: 'Clinical Specialties', path: '/departments', icon: Stethoscope },
    { name: 'Patients & ABHA Registry', path: '/patients', icon: UserCheck },
    { name: 'IVR Call Traces', path: '/ivr-calls', icon: History },
    { name: 'SMS Notification Logs', path: '/sms-logs', icon: MessageSquare },
    { name: 'Security Audit Trail', path: '/audit-logs', icon: ShieldCheck },
    { name: 'Staff & Role Management', path: '/users', icon: Users, role: ['ROLE_SUPER_ADMIN', 'ROLE_HOSPITAL_ADMIN'] },
    { name: 'Operational Parameters', path: '/settings', icon: Settings, role: ['ROLE_SUPER_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.role) return true;
    return user && item.role.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md z-30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <NationalHeader />
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/ivr-simulator"
                className="hidden sm:inline-flex items-center px-3 py-1.5 border border-teal-500/40 text-xs font-semibold rounded-lg text-teal-300 bg-teal-950/40 hover:bg-teal-900/50 transition shadow-xs space-x-1.5"
              >
                <Radio className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                <span>Simulate Call</span>
              </Link>

              {user && (
                <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-100">{user.fullName}</p>
                    <p className="text-[10px] text-teal-400 font-mono tracking-tight">
                      {user.role.replace('ROLE_', '').replace(/_/g, ' ')}
                      {user.hospitalName ? ` • ${user.hospitalName}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col justify-between py-4 px-3 overflow-y-auto">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Clinical & IVR Operations
              </div>
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                        : item.highlight
                        ? 'text-teal-300 hover:bg-slate-800/80 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2 text-[11px] text-slate-400">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Backend Node</span>
                  <span className="flex items-center text-emerald-400 text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                    ONLINE :8088
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Telephony Engine</span>
                  <span className="font-mono text-slate-300">TwiML v2</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>ABHA Registry</span>
                  <span className="font-mono text-slate-300">M1 Simulated</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PrototypeDisclaimer />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
