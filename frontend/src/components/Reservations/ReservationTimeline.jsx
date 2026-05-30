import React, { useMemo, useRef } from 'react';
import { format, isToday, parseISO, differenceInMinutes } from 'date-fns';

const STATUS_COLORS = {
  confirmed: '#3b82f6',
  seated: '#22c55e',
  cancelled: '#6b7280',
  'no-show': '#ef4444',
  pending: '#eab308',
};

const HOUR_WIDTH = 100;
const ROW_HEIGHT = 48;
const LABEL_WIDTH = 80;
const START_HOUR = 9;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;

export default function ReservationTimeline({ reservations = [], tables = [], date, onReservationClick }) {
  const containerRef = useRef(null);
  const viewDate = date instanceof Date ? date : date ? parseISO(date) : new Date();
  const showingToday = isToday(viewDate);

  const tableList = useMemo(() => {
    if (tables.length > 0) return tables;
    const tableMap = new Map();
    reservations.forEach((r) => {
      const tbl = r.tableNumber || r.table_number || r.table?.number || `T${r.tableId || r.table_id}`;
      if (!tableMap.has(tbl)) {
        tableMap.set(tbl, { number: tbl, id: r.tableId || r.table_id });
      }
    });
    return Array.from(tableMap.values());
  }, [tables, reservations]);

  const getTimePosition = (timeStr) => {
    let hours, minutes;
    if (timeStr instanceof Date) {
      hours = timeStr.getHours();
      minutes = timeStr.getMinutes();
    } else if (typeof timeStr === 'string') {
      if (timeStr.includes('T')) {
        const d = parseISO(timeStr);
        hours = d.getHours();
        minutes = d.getMinutes();
      } else if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    return (hours - START_HOUR + minutes / 60) * HOUR_WIDTH;
  };

  const getDurationWidth = (duration) => {
    const mins = parseInt(duration) || 60;
    return (mins / 60) * HOUR_WIDTH;
  };

  const currentTimePosition = useMemo(() => {
    if (!showingToday) return null;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours < START_HOUR || hours >= END_HOUR) return null;
    return (hours - START_HOUR + minutes / 60) * HOUR_WIDTH;
  }, [showingToday]);

  const reservationsByTable = useMemo(() => {
    const map = new Map();
    tableList.forEach((t) => map.set(t.number || t.id, []));
    reservations.forEach((r) => {
      const tbl = r.tableNumber || r.table_number || r.table?.number || `T${r.tableId || r.table_id}`;
      if (!map.has(tbl)) map.set(tbl, []);
      map.get(tbl).push(r);
    });
    return map;
  }, [reservations, tableList]);

  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '0.75rem',
        border: '1px solid #334155',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
          Reservation Timeline — {format(viewDate, 'EEEE, MMM d, yyyy')}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#94a3b8' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} />
              {status}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '500px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#334155 transparent',
        }}
      >
        <div style={{ minWidth: `${LABEL_WIDTH + TOTAL_HOURS * HOUR_WIDTH + 20}px` }}>
          {/* Hour Headers */}
          <div
            style={{
              display: 'flex',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: '#1e293b',
              borderBottom: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: `${LABEL_WIDTH}px`,
                flexShrink: 0,
                padding: '0.5rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Table
            </div>
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div
                key={i}
                style={{
                  width: `${HOUR_WIDTH}px`,
                  flexShrink: 0,
                  padding: '0.5rem 0',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#64748b',
                  borderLeft: '1px solid rgba(51, 65, 85, 0.5)',
                }}
              >
                {String(START_HOUR + i).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Table Rows */}
          {tableList.map((table, idx) => {
            const tblKey = table.number || table.id;
            const tblReservations = reservationsByTable.get(tblKey) || [];
            return (
              <div
                key={tblKey}
                style={{
                  display: 'flex',
                  position: 'relative',
                  height: `${ROW_HEIGHT}px`,
                  borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)',
                }}
              >
                {/* Table Label */}
                <div
                  style={{
                    width: `${LABEL_WIDTH}px`,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    background: 'inherit',
                    position: 'sticky',
                    left: 0,
                    zIndex: 5,
                    borderRight: '1px solid #334155',
                  }}
                >
                  {tblKey}
                </div>

                {/* Time Grid Lines */}
                <div style={{ position: 'relative', flex: 1 }}>
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${i * HOUR_WIDTH}px`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'rgba(51, 65, 85, 0.3)',
                      }}
                    />
                  ))}

                  {/* Reservation Blocks */}
                  {tblReservations.map((res, ri) => {
                    const time = res.reservation_time || res.time || res.startTime || res.start_time || res.dateTime || res.date_time;
                    const left = getTimePosition(time);
                    const width = getDurationWidth(res.duration || 60);
                    const color = STATUS_COLORS[res.status] || STATUS_COLORS.confirmed;
                    const isCancelled = res.status === 'cancelled';

                    return (
                      <div
                        key={res.id || ri}
                        onClick={() => onReservationClick?.(res)}
                        title={`${res.customerName || res.customer_name || 'Guest'} — ${res.status}`}
                        style={{
                          position: 'absolute',
                          left: `${Math.max(0, left)}px`,
                          top: '6px',
                          height: `${ROW_HEIGHT - 12}px`,
                          width: `${Math.max(20, width - 4)}px`,
                          background: `${color}30`,
                          border: `1px solid ${color}70`,
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 0.5rem',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          textDecoration: isCancelled ? 'line-through' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${color}50`;
                          e.currentTarget.style.zIndex = '15';
                          e.currentTarget.style.transform = 'scaleY(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${color}30`;
                          e.currentTarget.style.zIndex = '1';
                          e.currentTarget.style.transform = 'scaleY(1)';
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: '#f1f5f9',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {res.customerName || res.customer_name || 'Guest'}
                          {res.partySize || res.party_size ? ` (${res.partySize || res.party_size})` : ''}
                        </span>
                      </div>
                    );
                  })}

                  {/* Current Time Indicator */}
                  {currentTimePosition !== null && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${currentTimePosition}px`,
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        background: '#ef4444',
                        zIndex: 20,
                        borderLeft: '1px dashed #ef4444',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          left: '-4px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ef4444',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {tableList.length === 0 && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem',
              }}
            >
              No tables to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
