import React from 'react';
import { TokenStatus } from '../types';

interface StatusBadgeProps {
  status: TokenStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'BOOKED':
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'CALLED':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-semibold animate-pulse';
      case 'COMPLETED':
      case 'DELIVERED':
      case 'SENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RESCHEDULED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'NO_SHOW':
      case 'EXPIRED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {status}
    </span>
  );
};
