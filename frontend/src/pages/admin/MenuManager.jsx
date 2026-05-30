import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, HelpCircle, UtensilsCrossed } from 'lucide-react';
import { createApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import DashboardShell from '../../components/Layout/DashboardShell';
import MenuGrid from '../../components/Menu/MenuGrid';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';

const PHOTO_PRESETS = [
  { name: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop' },
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop' },
  { name: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop' },
  { name: 'Pasta', url: 'https://images.unsplash.com/photo-1563379971899-660589a01cf3?w=600&auto=format&fit=crop' },
  { name: 'Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop' },
  { name: 'Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop' },
  { name: 'Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop' },
  { name: 'Coffee', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop' }
];

export default function MenuManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const { socket } = useSocket(restaurantId);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    newCategory: '',
    price: 0,
    available: 1,
    image_url: '',
  });
  const [showNewCategory, setShowNewCategory] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/menu');
      setMenuItems(data);

      const catsRes = await api.get('/menu/categories');
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  // Sync menu changes in real-time
  useEffect(() => {
    if (!socket) return;
    const handleMenuUpdated = () => fetchMenu();
    socket.on('menu:updated', handleMenuUpdated);
    return () => socket.off('menu:updated', handleMenuUpdated);
  }, [socket]);

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        description: editItem.description || '',
        category: editItem.category || '',
        newCategory: '',
        price: editItem.price || 0,
        available: editItem.available !== undefined ? editItem.available : 1,
        image_url: editItem.image_url || '',
      });
      setShowNewCategory(false);
    } else {
      setFormData({
        name: '',
        description: '',
        category: categories[0] || '',
        newCategory: '',
        price: 150,
        available: 1,
        image_url: '',
      });
      setShowNewCategory(false);
    }
  }, [editItem, modalOpen, categories]);

  const handleToggleAvailable = async (item) => {
    try {
      const nextStatus = item.available ? 0 : 1;
      await api.put(`/menu/${item.id}`, {
        ...item,
        available: nextStatus,
      });
      toast.success(`${item.name} availability updated`);
      fetchMenu();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle item availability');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Item name is required');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    const categoryText = showNewCategory ? formData.newCategory : formData.category;
    if (!categoryText) {
      toast.error('Category is required');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      category: categoryText,
      price: parseFloat(formData.price),
      available: formData.available ? 1 : 0,
      image_url: formData.image_url,
    };

    try {
      if (editItem) {
        await api.put(`/menu/${editItem.id}`, payload);
        toast.success(`${formData.name} updated successfully`);
      } else {
        await api.post('/menu', payload);
        toast.success(`${formData.name} created successfully`);
      }
      fetchMenu();
      setModalOpen(false);
      setEditItem(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save menu item');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteItem) return;
    try {
      await api.delete(`/menu/${confirmDeleteItem.id}`);
      toast.success(`${confirmDeleteItem.name} deleted successfully`);
      fetchMenu();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete menu item');
    } finally {
      setConfirmDeleteItem(null);
    }
  };

  return (
    <DashboardShell title="Menu Manager" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pl-2">
            <UtensilsCrossed className="w-4.5 h-4.5 text-indigo-600" />
            Product Catalog
          </h2>
          <button
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Menu grid container */}
        {loading ? (
          <div className="skeleton h-80 rounded-3xl" />
        ) : (
          <MenuGrid
            items={menuItems}
            categories={categories}
            onEdit={(item) => {
              setEditItem(item);
              setModalOpen(true);
            }}
            onDelete={(item) => setConfirmDeleteItem(item)}
            onToggle={handleToggleAvailable}
            editable={true}
          />
        )}
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-xl animate-slide-up flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">
                {editItem ? `Edit Menu Item` : 'Add Menu Item'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-450 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Cheese Pizza"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ingredients, sizes, dietary information..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm placeholder:text-slate-350"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                  {!showNewCategory ? (
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setShowNewCategory(true);
                          setFormData(prev => ({ ...prev, category: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, category: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 text-sm cursor-pointer"
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__new__">+ Create new...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.newCategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCategory: e.target.value }))}
                        placeholder="New category..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setFormData(prev => ({ ...prev, category: categories[0] || '' }));
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 text-xs rounded-xl font-semibold text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price (INR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="Paste custom image URL, select a preset, or upload below..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm mb-2 placeholder:text-slate-350"
                />
                
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const base64Data = reader.result.split(',')[1];
                          toast.loading('Uploading photo...', { id: 'menu-photo-upload' });
                          const { data } = await api.post('/menu/upload', {
                            filename: file.name,
                            base64Data,
                          });
                          setFormData(prev => ({ ...prev, image_url: data.url }));
                          toast.success('Photo uploaded successfully!', { id: 'menu-photo-upload' });
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to upload photo', { id: 'menu-photo-upload' });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Preset Food Photos</label>
                <div className="grid grid-cols-4 gap-2">
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: preset.url }))}
                      className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        formData.image_url === preset.url ? 'border-indigo-500 scale-95 shadow-md shadow-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white tracking-wide truncate px-1">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Availability Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Item In Stock</span>
                  <span className="text-[10px] text-slate-500 block">Guests can view and order this item</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, available: formData.available ? 0 : 1 }))}
                  className={`w-11 h-6 rounded-full transition-colors duration-150 flex items-center px-0.5 ${
                    formData.available ? 'bg-indigo-650' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                      formData.available ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditItem(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-slate-550 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Save Catalog Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item confirm */}
      <ConfirmModal
        isOpen={!!confirmDeleteItem}
        onClose={() => setConfirmDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Menu Catalog Item?"
        message={`Are you sure you want to permanently delete ${confirmDeleteItem?.name}? This cannot be undone and will affect historical logs.`}
        confirmText="Yes, Delete Item"
        variant="danger"
      />
    </DashboardShell>
  );
}
