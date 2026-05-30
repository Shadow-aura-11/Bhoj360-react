import React, { useMemo, useState } from 'react';
import TableCard from './TableCard';

export default function FloorPlan({ tables = [], onTableClick, onTableDoubleClick, selectedTableId, compact = false }) {
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'small' | 'list'

  const groupedTables = useMemo(() => {
    const groups = {};
    tables.forEach((table) => {
      const section = table.section || 'General';
      if (!groups[section]) groups[section] = [];
      groups[section].push(table);
    });
    // Sort sections: VIP first, then alphabetical
    const sortOrder = ['VIP', 'Indoor', 'Outdoor', 'Bar', 'Patio', 'Terrace', 'General'];
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      const ai = sortOrder.indexOf(a);
      const bi = sortOrder.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return sorted;
  }, [tables]);

  if (!tables.length) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪑</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No tables configured</div>
        <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Add tables to see them on the floor plan
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Layout Mode Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        marginBottom: '0.25rem',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginLeft: '0.5rem' }}>
          Layout Mode:
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[
            { mode: 'grid', label: 'Grid' },
            { mode: 'small', label: 'Small Sq.' },
            { mode: 'list', label: 'List View' }
          ].map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLayoutMode(mode)}
              style={{
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                background: layoutMode === mode ? '#d97706' : 'transparent',
                color: layoutMode === mode ? '#ffffff' : '#64748b',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {groupedTables.map(([section, sectionTables]) => (
        <div key={section}>
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <h3
              style={{
                fontSize: compact ? '0.85rem' : '1rem',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              {section}
            </h3>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'rgba(148, 163, 184, 0.15)',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                background: 'rgba(100, 116, 139, 0.1)',
                borderRadius: '9999px',
                padding: '0.125rem 0.5rem',
              }}
            >
              {sectionTables.length} tables
            </span>
          </div>

          {/* Tables Render Container */}
          {layoutMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sectionTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                return (
                  <div
                    key={table.id || table.number}
                    onClick={() => onTableClick?.(table)}
                    onDoubleClick={() => onTableDoubleClick?.(table)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: isSelected ? 'rgba(217, 119, 6, 0.08)' : '#ffffff',
                      border: isSelected ? '2px solid #d97706' : '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 805, color: '#1e293b' }}>
                        Table {table.number}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.125rem 0.5rem', borderRadius: '0.375rem' }}>
                        Seats: {table.capacity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        textTransform: 'uppercase',
                        color:
                          table.status === 'available' ? '#15803d' :
                          table.status === 'occupied' ? '#b91c1c' :
                          table.status === 'reserved' ? '#1d4ed8' :
                          table.status === 'ready' ? '#6b21a8' : '#b45309',
                        background:
                          table.status === 'available' ? '#f0fdf4' :
                          table.status === 'occupied' ? '#fef2f2' :
                          table.status === 'reserved' ? '#eff6ff' :
                          table.status === 'ready' ? '#faf5ff' : '#fef3c7',
                      }}>
                        {table.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: layoutMode === 'small' || compact
                  ? 'repeat(auto-fill, minmax(80px, 1fr))'
                  : 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: layoutMode === 'small' || compact ? '0.5rem' : '0.75rem',
              }}
            >
              {sectionTables.map((table) => (
                <TableCard
                  key={table.id || table.number}
                  table={table}
                  onClick={onTableClick}
                  onDoubleClick={onTableDoubleClick}
                  isSelected={selectedTableId === table.id}
                  compact={layoutMode === 'small' || compact}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '0.5rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        {[
          { label: 'Available', color: '#22c55e' },
          { label: 'Occupied', color: '#ef4444' },
          { label: 'Pending', color: '#eab308' },
          { label: 'Preparing', color: '#f97316' },
          { label: 'Ready', color: '#a855f7' },
          { label: 'Reserved', color: '#3b82f6' },
          { label: 'Inactive', color: '#6b7280' },
        ].map(({ label, color }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.7rem',
              color: '#94a3b8',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
