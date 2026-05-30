import React, { useState, useMemo } from 'react';
import MenuItemCard from './MenuItemCard';

export default function MenuGrid({ items = [], categories = [], onEdit, onDelete, onToggle, editable = false }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = useMemo(() => {
    const cats = new Set(categories);
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [items, categories]);

  const filteredItems = useMemo(() => {
    let filtered = items;
    if (activeCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [items, activeCategory, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search + Category Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem 0.625rem 2.25rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              color: '#1e293b',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '0.85rem',
            }}
          >
            🔍
          </span>
        </div>

        {/* Category Chips */}
        <div
          style={{
            display: 'flex',
            gap: '0.375rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent',
          }}
        >
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s',
                background: activeCategory === cat ? '#6366f1' : 'rgba(99, 102, 241, 0.06)',
                color: activeCategory === cat ? '#fff' : '#4f46e5',
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span
                  style={{
                    marginLeft: '0.375rem',
                    fontSize: '0.7rem',
                    opacity: 0.7,
                  }}
                >
                  {items.filter((i) => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id || item.name}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              editable={editable}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍽️</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>No items found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {searchQuery ? 'Try a different search term' : 'Add some menu items to get started'}
          </div>
        </div>
      )}
    </div>
  );
}
