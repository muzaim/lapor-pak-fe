import React from 'react';

const statusConfig = {
  DIAJUKAN: {
    label: 'Diajukan',
    color: 'text-indigo-600 font-bold',
  },
  PENDING: {
    label: 'Menunggu',
    color: 'text-amber-600 font-bold',
  },
  MENUNGGU: {
    label: 'Menunggu',
    color: 'text-amber-600 font-bold',
  },
  IN_REVIEW: {
    label: 'Diproses',
    color: 'text-sky-600 font-bold',
  },
  DIPROSES: {
    label: 'Diproses',
    color: 'text-sky-600 font-bold',
  },
  RESOLVED: {
    label: 'Selesai',
    color: 'text-emerald-600 font-bold',
  },
  SELESAI: {
    label: 'Selesai',
    color: 'text-emerald-600 font-bold',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'text-rose-600 font-bold',
  },
  DITOLAK: {
    label: 'Ditolak',
    color: 'text-rose-600 font-bold',
  },
};

export default function StatusBadge({ status }) {
  const normKey = status ? String(status).toUpperCase() : '';
  const config = statusConfig[normKey] || {
    label: status ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase() : 'Unknown',
    color: 'text-slate-600 font-bold',
  };

  return (
    <span className={`text-xs inline-flex items-center ${config.color}`}>
      {config.label}
    </span>
  );
}
