import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { adminApi } from '../services/api';
import { SystemSetting } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

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
          Manage OPD consultation hours, token allocation quotas, OTP limits, and telecom parameters
        </p>
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
