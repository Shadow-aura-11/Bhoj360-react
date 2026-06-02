import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BadgePercent, Plus, Trash2, RefreshCw, Save, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function CouponsManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  // States
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    value: 10,
    min_order_amount: 100,
    active: 1
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons');
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (newCoupon.value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (newCoupon.discount_type === 'percentage' && newCoupon.value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        discount_type: newCoupon.discount_type,
        value: Number(newCoupon.value),
        min_order_amount: Number(newCoupon.min_order_amount),
        active: Number(newCoupon.active)
      };

      if (editingId) {
        payload.id = editingId;
      }

      await api.post('/coupons', payload);
      toast.success(editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      
      // Reset form
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        value: 10,
        min_order_amount: 100,
        active: 1
      });
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setNewCoupon({
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount,
      active: coupon.active
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      if (editingId === id) {
        setEditingId(null);
        setNewCoupon({
          code: '',
          discount_type: 'percentage',
          value: 10,
          min_order_amount: 100,
          active: 1
        });
      }
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const updatedActive = coupon.active === 1 ? 0 : 1;
      await api.post('/coupons', {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        value: coupon.value,
        min_order_amount: coupon.min_order_amount,
        active: updatedActive
      });
      toast.success(`Coupon ${coupon.code} ${updatedActive === 1 ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle coupon status');
    }
  };

  return (
    <DashboardShell title="Coupons & Discount Codes" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create/Edit Coupon Form (Left Column) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
                <BadgePercent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  {editingId ? 'Edit Coupon Code' : 'Create Coupon Code'}
                </h3>
                <p className="text-[10px] text-slate-450">Set rules for discounts and promotions</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Coupon Code</label>
                <input 
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. BHOJ50"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider font-mono focus:outline-none focus:bg-white focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Discount Type</label>
                  <select 
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon(p => ({ ...p, discount_type: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
                    {newCoupon.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                  </label>
                  <input 
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:bg-white focus:border-indigo-600"
                    min="1"
                    max={newCoupon.discount_type === 'percentage' ? 100 : 100000}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Min. Order Amount (₹)</label>
                <input 
                  type="number"
                  value={newCoupon.min_order_amount}
                  onChange={(e) => setNewCoupon(p => ({ ...p, min_order_amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:bg-white focus:border-indigo-600"
                  min="0"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <h4 className="font-bold text-xs text-slate-805">Active</h4>
                  <p className="text-[9px] text-slate-440">Toggle to enable/disable code</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCoupon(p => ({ ...p, active: p.active === 1 ? 0 : 1 }))}
                  className="text-indigo-650 focus:outline-none"
                >
                  {newCoupon.active === 1 ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-300" />}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2 justify-end">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setNewCoupon({
                        code: '',
                        discount_type: 'percentage',
                        value: 10,
                        min_order_amount: 100,
                        active: 1
                      });
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{editingId ? 'Update Coupon' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Coupons List (Right Columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-800 mb-6 flex items-center gap-2">
              <BadgePercent className="w-5 h-5 text-indigo-650" /> Active Coupons & Codes ({coupons.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-150 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <Info className="w-8 h-8 text-slate-300" />
                <p className="text-slate-400 text-xs font-semibold">No coupon codes configured yet.</p>
                <p className="text-[10px] text-slate-400">Use the form on the left to add your first discount code.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Coupon Code</th>
                      <th className="pb-3">Discount Details</th>
                      <th className="pb-3">Min. Order Amount</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-slate-50/20">
                        <td className="py-4 font-mono font-bold tracking-wider text-slate-900">
                          <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="py-4 font-semibold">
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.value}% Off` 
                            : `₹${coupon.value} Flat Off`}
                        </td>
                        <td className="py-4 font-semibold font-mono text-slate-500">
                          ₹{coupon.min_order_amount}
                        </td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer border ${
                              coupon.active === 1 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            {coupon.active === 1 ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(coupon)}
                              className="px-2.5 py-1 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-lg transition-colors font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
