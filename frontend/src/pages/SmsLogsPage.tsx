import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';
import { SmsLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const SmsLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSmsLogs(0, 50);
      setLogs(res.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Outbound SMS Dispatch Logs</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit history of automated OPD token SMS notifications sent to patients
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading SMS logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No SMS dispatches recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      To: {s.recipientPhone}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Provider: {s.provider}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap bg-slate-50 border border-slate-200/60 p-3 rounded-lg leading-relaxed">
                    {s.messageText}
                  </pre>
                </div>
                <div className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
