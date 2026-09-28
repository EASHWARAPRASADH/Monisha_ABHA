import React, { useEffect, useState } from 'react';
import { PhoneCall, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';
import { IvrCall } from '../types';

export const IvrCallsPage: React.FC = () => {
  const [calls, setCalls] = useState<IvrCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCalls();
  }, [page]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getIvrCalls(page, 20);
      setCalls(data.content);
      setTotal(data.totalElements);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">IVR Telephony Call Traces</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time call logs, state transitions, caller number hashes, and telecom performance
          </p>
        </div>
        <button
          onClick={loadCalls}
          className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Logs
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading telephony logs...</div>
        ) : calls.length === 0 ? (
          <div className="p-12 text-center">
            <PhoneCall className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No IVR calls recorded yet</p>
            <p className="text-xs text-slate-400">Use the Virtual Phone Simulator to simulate caller traffic.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Call SID</th>
                  <th className="py-3 px-4">Caller Hash</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Terminal State</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calls.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{c.callSid}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{c.callerNumberHash || 'HASHED_001'}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] uppercase bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                        {c.language}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-indigo-700 font-medium">
                        {c.currentState}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.callStatus === 'COMPLETED' ? (
                        <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          TOKEN ISSUED
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-700 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          {c.failureReason || c.callStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.startTime).toLocaleString()}
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
