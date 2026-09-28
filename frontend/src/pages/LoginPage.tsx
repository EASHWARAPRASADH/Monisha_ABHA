import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Phone, CheckCircle2, Building2, KeyRound, AlertCircle, FileCheck } from 'lucide-react';
import { authApi } from '../services/api';
import { PrototypeDisclaimer } from '../components/PrototypeDisclaimer';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('superadmin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      
      {/* Top Government Masthead & Tricolor Ribbon */}
      <div>
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
        
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-2xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* National Insignia */}
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-1.5">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-600 fill-current">
                  <path d="M12 2L15 8H9L12 2Z" opacity="0.8" />
                  <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 leading-tight">
                  स्वास्थ्य एवं परिवार कल्याण मंत्रालय
                </p>
                <p className="text-xs font-black uppercase tracking-tight text-slate-900">
                  Ministry of Health and Family Welfare
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Government of India</p>
              </div>
            </div>

            {/* Right: ABDM Badge */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 block">
                  ABDM COMPLIANT PROTOTYPE
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">NIC e-Hospital Node #1</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Login Card Area */}
      <main className="my-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Card Header Strip */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 mx-auto flex items-center justify-center mb-3">
                <Phone className="w-6 h-6 text-teal-300" />
              </div>
              <h2 className="text-lg font-black tracking-tight">
                Central OPD Hospital Portal
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                IVR-Based Token Booking System Integrated with ABHA
              </p>
            </div>

            {/* Form & Actions */}
            <div className="p-6 sm:p-8 space-y-5">
              
              {/* Security Warning Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Authorized Personnel Only:</strong> Access to this hospital portal is restricted to hospital administrators and counter registration staff under IT Act 2000.
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Officer Username / பயனர்பெயர்
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-medium"
                      placeholder="Enter government username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password / கடவுச்சொல்
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-medium font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Authenticating with NHA SSO...' : 'Sign In to Hospital Portal'}</span>
                </button>
              </form>

              {/* Institutional One-Click Demo Credentials */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Quick Evaluation Demo Roles (Pre-configured)
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('superadmin', 'superadmin123')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-teal-800">Super Administrator (NHA Directorate)</p>
                      <p className="text-[10px] text-slate-500 font-mono">superadmin / superadmin123</p>
                    </div>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">Fill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('admin_ggh', 'admin123')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-blue-800">Medical Superintendent (Rajiv Gandhi GGH)</p>
                      <p className="text-[10px] text-slate-500 font-mono">admin_ggh / admin123</p>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Fill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('staff_ggh', 'staff123')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">OPD Counter Registrar (Registration Desk 3)</p>
                      <p className="text-[10px] text-slate-500 font-mono">staff_ggh / staff123</p>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">Fill</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Card Security Stamp */}
            <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                256-Bit TLS Encrypted
              </span>
              <span>NHA Security Guideline v2.1</span>
            </div>
          </div>

          {/* Collapsible ABDM Prototype Sandbox Notice */}
          <div className="mt-4">
            <PrototypeDisclaimer />
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          Government of India • Ministry of Health and Family Welfare • National Health Authority
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Ayushman Bharat Digital Mission (ABDM) • Final Year Engineering Academic Project Prototype
        </p>
      </footer>
    </div>
  );
};
