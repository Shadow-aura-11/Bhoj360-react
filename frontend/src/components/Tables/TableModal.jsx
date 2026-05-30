import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';

export default function TableModal({ isOpen, onClose, onSubmit, table, existingSections = [] }) {
  const isEdit = !!table;
  const [activeTab, setActiveTab] = useState('single');

  // Single table form
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('');
  const [newSection, setNewSection] = useState('');
  const [showNewSection, setShowNewSection] = useState(false);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});

  // Bulk add form
  const [bulkPrefix, setBulkPrefix] = useState('T');
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkCapacity, setBulkCapacity] = useState(4);
  const [bulkSection, setBulkSection] = useState('');
  const [bulkNewSection, setBulkNewSection] = useState('');
  const [showBulkNewSection, setShowBulkNewSection] = useState(false);

  useEffect(() => {
    if (isEdit && table) {
      setNumber(table.number || '');
      setCapacity(table.capacity || 4);
      setSection(table.section || '');
      setActive(table.active !== undefined ? table.active : true);
      setActiveTab('single');
    } else {
      setNumber('');
      setCapacity(4);
      setSection(existingSections[0] || '');
      setActive(true);
      setNewSection('');
      setShowNewSection(false);
    }
    setErrors({});
  }, [isEdit, table, isOpen, existingSections]);

  const bulkPreview = useMemo(() => {
    const items = [];
    for (let i = 0; i < Math.min(bulkCount, 50); i++) {
      items.push({
        number: `${bulkPrefix}${bulkStart + i}`,
        capacity: bulkCapacity,
        section: showBulkNewSection ? bulkNewSection : bulkSection,
      });
    }
    return items;
  }, [bulkPrefix, bulkStart, bulkCount, bulkCapacity, bulkSection, bulkNewSection, showBulkNewSection]);

  const validate = () => {
    const errs = {};
    if (!number.trim()) errs.number = 'Table number is required';
    if (number.length > 6) errs.number = 'Max 6 characters';
    if (!capacity || capacity < 1 || capacity > 20) errs.capacity = 'Capacity must be 1-20';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'single') {
      if (!validate()) return;
      const finalSection = showNewSection ? newSection : section;
      onSubmit({
        number: number.trim(),
        capacity: parseInt(capacity),
        section: finalSection,
        active,
      });
    } else {
      const finalSection = showBulkNewSection ? bulkNewSection : bulkSection;
      if (!finalSection && !bulkSection) return;
      onSubmit({
        bulk: true,
        tables: bulkPreview.map((t) => ({
          ...t,
          section: finalSection,
          active: true,
        })),
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    color: '#f1f5f9',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const errorStyle = {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '32rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#1e293b',
          borderRadius: '1rem 1rem 0.5rem 0.5rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #334155',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>
            {isEdit ? `Edit Table ${table.number}` : 'Add Table'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.375rem',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs (only for add mode) */}
        {!isEdit && (
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              padding: '0.75rem 1.5rem 0',
            }}
          >
            {['single', 'bulk'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '0.5rem 0.5rem 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#0f172a' : 'transparent',
                  color: activeTab === tab ? '#f1f5f9' : '#64748b',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {tab === 'single' ? 'Single Table' : 'Bulk Add'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          {activeTab === 'single' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Table Number */}
              <div>
                <label style={labelStyle}>Table Number</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.slice(0, 6))}
                  placeholder="e.g., T1, A01"
                  style={{
                    ...inputStyle,
                    borderColor: errors.number ? '#ef4444' : '#334155',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = errors.number ? '#ef4444' : '#334155')}
                />
                {errors.number && <div style={errorStyle}>{errors.number}</div>}
              </div>

              {/* Capacity */}
              <div>
                <label style={labelStyle}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  style={{
                    ...inputStyle,
                    borderColor: errors.capacity ? '#ef4444' : '#334155',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = errors.capacity ? '#ef4444' : '#334155')}
                />
                {errors.capacity && <div style={errorStyle}>{errors.capacity}</div>}
              </div>

              {/* Section */}
              <div>
                <label style={labelStyle}>Section</label>
                {!showNewSection ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={section}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setShowNewSection(true);
                          setSection('');
                        } else {
                          setSection(e.target.value);
                        }
                      }}
                      style={{ ...inputStyle, cursor: 'pointer', flex: 1 }}
                    >
                      <option value="">Select section...</option>
                      {existingSections.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="__new__">+ Add new...</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      placeholder="New section name"
                      style={{ ...inputStyle, flex: 1 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewSection(false);
                        setNewSection('');
                      }}
                      style={{
                        background: '#334155',
                        border: 'none',
                        color: '#94a3b8',
                        borderRadius: '0.5rem',
                        padding: '0 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>Active</label>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? '#6366f1' : '#334155',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      position: 'absolute',
                      top: '3px',
                      left: active ? '23px' : '3px',
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
              </div>
            </div>
          ) : (
            /* Bulk Add Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Prefix</label>
                  <input
                    type="text"
                    value={bulkPrefix}
                    onChange={(e) => setBulkPrefix(e.target.value.slice(0, 3))}
                    placeholder="T"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Start Number</label>
                  <input
                    type="number"
                    min={1}
                    value={bulkStart}
                    onChange={(e) => setBulkStart(parseInt(e.target.value) || 1)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Count</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.min(50, parseInt(e.target.value) || 1))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Capacity (each)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={bulkCapacity}
                    onChange={(e) => setBulkCapacity(parseInt(e.target.value) || 4)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Section for bulk */}
              <div>
                <label style={labelStyle}>Section</label>
                {!showBulkNewSection ? (
                  <select
                    value={bulkSection}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setShowBulkNewSection(true);
                        setBulkSection('');
                      } else {
                        setBulkSection(e.target.value);
                      }
                    }}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select section...</option>
                    {existingSections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="__new__">+ Add new...</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={bulkNewSection}
                      onChange={(e) => setBulkNewSection(e.target.value)}
                      placeholder="New section name"
                      style={{ ...inputStyle, flex: 1 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkNewSection(false);
                        setBulkNewSection('');
                      }}
                      style={{
                        background: '#334155',
                        border: 'none',
                        color: '#94a3b8',
                        borderRadius: '0.5rem',
                        padding: '0 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div>
                <label style={labelStyle}>Preview ({bulkPreview.length} tables)</label>
                <div
                  style={{
                    background: '#0f172a',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.375rem',
                  }}
                >
                  {bulkPreview.map((t) => (
                    <span
                      key={t.number}
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.625rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        color: '#a5b4fc',
                        fontWeight: 500,
                      }}
                    >
                      {t.number} (👥{t.capacity})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #334155',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#334155',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.625rem 1.5rem',
                background: '#6366f1',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Plus size={16} />
              {isEdit ? 'Save Changes' : activeTab === 'bulk' ? `Create ${bulkCount} Tables` : 'Add Table'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
