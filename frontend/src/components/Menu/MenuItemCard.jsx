import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function MenuItemCard({ item, onEdit, onDelete, onToggle, editable }) {
  const isAvailable = !!item.available;

  return (
    <div
      style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        opacity: isAvailable ? 1 : 0.55,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Unavailable Overlay */}
      {!isAvailable && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            borderRadius: '0.75rem',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              background: '#ef4444',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Unavailable
          </span>
        </div>
      )}

      {/* Menu Item Photo */}
      {(item.image_url || item.image_placeholder) && (
        <div
          style={{
            position: 'relative',
            height: '140px',
            width: '100%',
            overflow: 'hidden',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                const fb = parent.querySelector('[data-fallback]');
                if (fb) fb.style.display = 'block';
              }}
            />
          ) : null}
          <div
            data-fallback
            style={{
              display: item.image_url ? 'none' : 'block',
              fontSize: '3rem',
              textAlign: 'center',
            }}
          >
            {item.image_placeholder}
          </div>
        </div>
      )}

      <div style={{ padding: '1.25rem' }}>
        {/* Header: Name + Category */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 605,
              color: '#1e293b',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {item.name}
          </h3>

          {item.category && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#4f46e5',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '0.375rem',
                padding: '0.15rem 0.5rem',
                marginLeft: '0.5rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {item.category}
            </span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.8rem',
              color: '#64748b',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        )}

        {/* Price + Actions row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#16a34a',
            }}
          >
            ₹{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </span>

          {/* Editable actions */}
          {editable && (
            <div
              data-actions
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: 1,
                transition: 'opacity 0.2s',
              }}
            >
              {/* Toggle availability */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle?.(item);
                }}
                title={isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isAvailable ? '#22c55e' : '#cbd5e1',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: isAvailable ? '18px' : '2px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>

              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(item);
                }}
                title="Edit"
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.375rem',
                  cursor: 'pointer',
                  color: '#4f46e5',
                  display: 'flex',
                  transition: 'background 0.2s',
                }}
              >
                <Edit size={14} />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(item);
                }}
                title="Delete"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.375rem',
                  cursor: 'pointer',
                  color: '#dc2626',
                  display: 'flex',
                  transition: 'background 0.2s',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
