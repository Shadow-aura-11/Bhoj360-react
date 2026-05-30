import React from 'react';

const STATUS_COLORS = {
  available: '#22c55e',
  occupied: '#ef4444',
  pending: '#eab308',
  preparing: '#f97316',
  ready: '#a855f7',
  reserved: '#3b82f6',
  inactive: '#6b7280',
};

export default function TableStatusBar({ tables = [], onTableClick }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.375rem',
        padding: '0.5rem 0.75rem',
        background: '#f8fafc',
        borderRadius: '0.75rem',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
        border: '1px solid #e2e8f0',
      }}
    >
      {tables.map((table) => {
        const color = STATUS_COLORS[table.status] || STATUS_COLORS.inactive;
        return (
          <button
            key={table.id || table.number}
            onClick={() => onTableClick?.(table)}
            title={`Table ${table.number} - ${table.status}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              background: '#ffffff',
              border: `1px solid ${color}40`,
              borderRadius: '9999px',
              cursor: onTableClick ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s',
              color: '#334155',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${color}15`;
              e.currentTarget.style.borderColor = `${color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = `${color}40`;
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
                flexShrink: 0,
                boxShadow: `0 0 6px ${color}80`,
              }}
            />
            {table.number}
          </button>
        );
      })}

      {tables.length === 0 && (
        <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '0.25rem' }}>
          No tables
        </span>
      )}
    </div>
  );
}
