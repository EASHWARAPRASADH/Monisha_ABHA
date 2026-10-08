import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldAlert, Bot, Cpu, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { adminApi, aiApi } from '../services/api';
import { SystemSetting, AiModelStatus } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // AI Diagnostics State
  const [aiStatus, setAiStatus] = useState<AiModelStatus | null>(null);
  const [aiStatusLoading, setAiStatusLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAiDiagnostics();
  }, []);

  const loadAiDiagnostics = async () => {
    try {
      setAiStatusLoading(true);
      const data = await aiApi.getStatus();
      setAiStatus(data);
    } catch (e) {
      console.error('Failed to load AI status:', e);
    } finally {
      setAiStatusLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await adminApi.updateSetting(key, value);
      setSaveSuccess(key);
      setTimeout(() => setSaveSuccess(null), 2500);
      loadSettings();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Telephony Configuration</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage OPD consultation hours, token allocation quotas, OTP limits, telecom parameters, and on-premise AI models
        </p>
      </div>

      {/* On-Premise Local AI Model Diagnostics & Sovereignty Card */}
      <div className="bg-white rounded-2xl border border-teal-200 shadow-xs p-6 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>On-Premise Local AI Model & Clinical Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Data Sovereignty
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Ollama local daemon client • Zero-cloud ABDM compliance • Embedded clinical fallback
              </p>
            </div>
          </div>

          <button
            onClick={loadAiDiagnostics}
            disabled={aiStatusLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${aiStatusLoading ? 'animate-spin' : ''}`} />
            Refresh Diagnostics
          </button>
        </div>

        {aiStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ollama Daemon</span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${aiStatus.isOllamaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <p className="text-xs font-bold text-slate-900">
                    {aiStatus.isOllamaConnected ? 'Connected (Port 11434)' : 'Offline (Fallback Active)'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Engine</span>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {aiStatus.activeEngine}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Logged Triage Queries</span>
                <p className="text-xs font-black text-slate-900 mt-1">
                  {aiStatus.totalTriageRequestsLogged} Calls
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Red Flags</span>
                <p className="text-xs font-black text-rose-700 mt-1">
                  {aiStatus.emergencyCasesIdentified} Urgent Alerts
                </p>
              </div>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200/80 flex items-start space-x-2.5 text-xs text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">ABDM Healthcare Privacy Guarantee</p>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  {aiStatus.complianceNote} All symptom classification, voice routing, and pre-consultation briefings are executed locally on hospital hardware without third-party cloud API leakage.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">Loading AI diagnostics...</div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading settings...</div>
        ) : (
          settings.map((s) => (
            <div key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-800">{s.settingKey}</span>
                  {saveSuccess === s.settingKey && (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Saved
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{s.description}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  defaultValue={s.settingValue}
                  id={`input-${s.settingKey}`}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500 w-44"
                />
                <button
                  disabled={savingKey === s.settingKey}
                  onClick={() => {
                    const el = document.getElementById(`input-${s.settingKey}`) as HTMLInputElement;
                    if (el) handleUpdate(s.settingKey, el.value);
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
