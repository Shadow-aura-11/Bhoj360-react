import React, { useMemo } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { differenceInMinutes, parseISO } from 'date-fns';

const STATUS_COLORS = {
  available: '#22c55e',
  occupied: '#ef4444',
  pending: '#eab308',
  preparing: '#f97316',
  ready: '#a855f7',
  reserved: '#3b82f6',
  inactive: '#6b7280',
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '107, 114, 128';
}

export default function TableCard({ table, onClick, onDoubleClick, isSelected, compact }) {
  const statusColor = STATUS_COLORS[table.status] || STATUS_COLORS.inactive;
  const rgb = hexToRgb(statusColor);

  const reservationCountdown = useMemo(() => {
    if (!table.nextReservation) return null;
    const now = new Date();
    const resTime =
      typeof table.nextReservation === 'string'
        ? parseISO(table.nextReservation)
        : table.nextReservation instanceof Date
          ? table.nextReservation
          : table.nextReservation.time
            ? parseISO(table.nextReservation.time)
            : null;
    if (!resTime) return null;
    const diff = differenceInMinutes(resTime, now);
    if (diff > 0 && diff <= 60) return diff;
    return null;
  }, [table.nextReservation]);

  const isReady = table.status === 'ready';

  const lastTapRef = React.useRef(0);
  const handleTap = (e) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      onDoubleClick?.(table);
    } else {
      onClick?.(table);
    }
    lastTapRef.current = now;
  };

  return (
    <div
      onClick={handleTap}
      className={isReady ? 'animate-pulse-ready' : ''}
      style={{
        background: `rgba(${rgb}, 0.12)`,
        border: `2px solid rgba(${rgb}, 0.45)`,
        borderRadius: '0.75rem',
        padding: compact ? '0.75rem' : '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        outline: isSelected ? `2px solid ${statusColor}` : 'none',
        outlineOffset: isSelected ? '2px' : '0',
        boxShadow: isSelected ? `0 0 0 4px rgba(${rgb}, 0.25)` : 'none',
        minWidth: compact ? '80px' : '120px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isSelected
          ? `0 0 0 4px rgba(${rgb}, 0.2), 0 8px 25px rgba(0,0,0,0.15)`
          : '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isSelected
          ? `0 0 0 4px rgba(${rgb}, 0.2)`
          : 'none';
      }}
    >
      {/* Table Number */}
      <div
        style={{
          fontSize: compact ? '1rem' : '1.25rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: compact ? '0.25rem' : '0.5rem',
        }}
      >
        {table.number}
      </div>

      {/* Capacity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: compact ? '0.7rem' : '0.85rem',
          color: '#94a3b8',
          marginBottom: compact ? '0.25rem' : '0.5rem',
        }}
      >
        <span>👥</span>
        <span>{table.capacity}</span>
      </div>

      {/* Section Badge */}
      {!compact && table.section && (
        <div
          style={{
            display: 'inline-block',
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94a3b8',
            background: 'rgba(148, 163, 184, 0.1)',
            borderRadius: '0.375rem',
            padding: '0.125rem 0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          {table.section}
        </div>
      )}

      {/* Status Badge */}
      <div style={{ marginBottom: reservationCountdown || table.activeOrder ? '0.375rem' : 0 }}>
        <StatusBadge status={table.status} />
      </div>

      {/* Reservation Countdown */}
      {reservationCountdown && (
        <div
          style={{
            fontSize: '0.7rem',
            color: '#60a5fa',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
          Res. in {reservationCountdown}m
        </div>
      )}

      {/* Active Order Indicator */}
      {table.activeOrder && !compact && (
        <div
          style={{
            fontSize: '0.7rem',
            color: '#fbbf24',
            fontWeight: 500,
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
          Order #{typeof table.activeOrder === 'object' ? table.activeOrder.id : table.activeOrder}
        </div>
      )}

      {/* Pulse animation keyframes injected once */}
      <style>{`
        @keyframes pulseReady {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-ready {
          animation: pulseReady 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
