import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KeyRound, Plus, Trash2, RefreshCw, Save, Users, ShieldCheck } from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function StaffManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  // States
  const [adminPin, setAdminPin] = useState('');
  const [loadingPins, setLoadingPins] = useState(false);
  const [savingPins, setSavingPins] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', username: '', role: 'waiter', pin: '' });

  // Fetch Admin PIN
  const fetchPins = async () => {
    try {
      setLoadingPins(true);
      const { data } = await api.get('/settings/pins');
      if (data && data.pins) {
        setAdminPin(data.pins.admin || '');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load credentials');
    } finally {
      setLoadingPins(false);
    }
  };

  // Fetch individual staff accounts
  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const { data } = await api.get('/staff');
      setStaffList(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff list');
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchPins();
    fetchStaff();
  }, []);

  const handleSavePins = async (e) => {
    e.preventDefault();
    if (adminPin.length < 4) {
      toast.error('Admin Password/PIN must be at least 4 characters long');
      return;
    }

    try {
      setSavingPins(true);
      await api.put('/settings/pins', { admin: adminPin });
      toast.success('Admin credentials updated successfully!');
      
      const session = JSON.parse(sessionStorage.getItem('session') || '{}');
      if (session.role === 'admin' && session.pin !== adminPin) {
        session.pin = adminPin;
        sessionStorage.setItem('session', JSON.stringify(session));
      }
      fetchPins();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save credentials');
    } finally {
      setSavingPins(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.username.trim() || !newStaff.pin.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (newStaff.pin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }
    try {
      setAddingStaff(true);
      await api.post('/staff', {
        name: newStaff.name.trim(),
        username: newStaff.username.trim(),
        role: newStaff.role,
        pin: newStaff.pin.trim()
      });
      toast.success('Staff account added successfully!');
      setNewStaff({ name: '', username: '', role: 'waiter', pin: '' });
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to add staff account');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm('Are you sure you want to delete this staff account?')) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff account deleted successfully');
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete staff account');
    }
  };

  return (
    <DashboardShell title="Staff & Terminal Management" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        
        {/* Top Section: Master Passwords + Add Staff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Admin Credentials */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between animate-fade-in">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800">Change Admin Credentials</h3>
                  <p className="text-[10px] text-slate-450">Modify your administrator panel login PIN/password</p>
                </div>
              </div>

              {loadingPins ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSavePins} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Panel Password / PIN</label>
                    <input 
                      type="password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.slice(0, 30))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center font-mono focus:bg-white focus:outline-none focus:border-indigo-650"
                      required
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPins}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                    >
                      {savingPins ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Admin Credentials</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Card 2: Add New Staff Account */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800">Add Staff Account</h3>
                  <p className="text-[10px] text-slate-450">Create personalized staff access accounts</p>
                </div>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-605"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Staff ID / Number</label>
                    <input 
                      type="text"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff(p => ({ ...p, username: e.target.value }))}
                      placeholder="e.g. 1001"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-605"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                    <select 
                      value={newStaff.role}
                      onChange={(e) => setNewStaff(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer focus:bg-white focus:border-indigo-605"
                    >
                      <option value="waiter">Waiter</option>
                      <option value="counter">KDS / Counter</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Login PIN (Min. 4 digits)</label>
                    <input 
                      type="password"
                      value={newStaff.pin}
                      onChange={(e) => setNewStaff(p => ({ ...p, pin: e.target.value }))}
                      placeholder="PIN"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-center font-mono focus:bg-white focus:border-indigo-605"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={addingStaff}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    {addingStaff ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Create Staff Account</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Section: Staff Accounts List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-display font-bold text-base text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-650" /> Active Staff Accounts ({staffList.length})
          </h3>

          {loadingStaff ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-150 rounded-2xl">
              <p className="text-slate-400 text-xs">No individual staff accounts found. Create one above to enable custom logins.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Staff Details</th>
                    <th className="pb-3">Staff Username / ID</th>
                    <th className="pb-3">Terminal Role</th>
                    <th className="pb-3 text-center">PIN Password</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/20">
                      <td className="py-4 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-display font-bold text-xs text-indigo-600">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        {st.name}
                      </td>
                      <td className="py-4 font-mono font-semibold">{st.username}</td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          st.role === 'waiter' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          st.role === 'counter' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {st.role}
                        </span>
                      </td>
                      <td className="py-4 text-center font-mono font-bold text-slate-350">••••</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteStaff(st.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
