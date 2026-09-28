import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs(0, 50);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Security & Audit Trail</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable log of identity verifications, token bookings, status updates, and administrative actions
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
          <div className="p-12 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No audit events recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Metadata</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-teal-700">{log.action}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{log.userId}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.entityType}:{log.entityId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.metadata}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
