import React from 'react';

const STATUS_CONFIG = {
  available: { color: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400', label: 'Available' },
  occupied: { color: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400', label: 'Occupied' },
  pending: { color: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
  preparing: { color: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Preparing' },
  ready: { color: '#a855f7', bg: 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-500/50', text: 'text-purple-300', label: 'Ready' },
  reserved: { color: '#3b82f6', bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Reserved' },
  inactive: { color: '#6b7280', bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Inactive' },
};

export default function StatusBadge({ status, size = 'md', className = '' }) {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.available;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2',
  };

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const isReady = status?.toLowerCase() === 'ready';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClasses[size]} ${
        isReady ? 'animate-pulse-ready' : ''
      } ${className}`}
    >
      <span
        className={`rounded-full ${dotSize[size]} flex-shrink-0`}
        style={{ backgroundColor: config.color }}
      />
      <span>{config.label}</span>
    </span>
  );
}
