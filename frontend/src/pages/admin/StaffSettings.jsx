import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KeyRound, ShieldAlert, Users, Search, RefreshCw, Smartphone, Mail, Calendar, CreditCard, Save } from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function StaffSettings() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  const [activeTab, setActiveTab] = useState('credentials'); // 'credentials' | 'customers'
  
  // Credentials Tab states
  const [pins, setPins] = useState({
    admin: '',
    waiter: '',
    counter: '',
    cashier: '',
  });
  const [loadingPins, setLoadingPins] = useState(false);
  const [savingPins, setSavingPins] = useState(false);

  // Customer Directory Tab states
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Load PINs on mount/tab switch
  const fetchPins = async () => {
    try {
      setLoadingPins(true);
      const { data } = await api.get('/settings/pins');
      if (data && data.pins) {
        setPins({
          admin: data.pins.admin || '',
          waiter: data.pins.waiter || '',
          counter: data.pins.counter || '',
          cashier: data.pins.cashier || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load login credentials');
    } finally {
      setLoadingPins(false);
    }
  };

  // Load Customer Directory
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const { data } = await api.get('/customers');
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customer list');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'credentials') {
      fetchPins();
    } else {
      fetchCustomers();
    }
  }, [activeTab]);

  const handlePinChange = (role, value) => {
    // Only allow numbers, maximum 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setPins((prev) => ({ ...prev, [role]: cleaned }));
  };

  const handleSavePins = async (e) => {
    e.preventDefault();
    
    // Validation
    const emptyPins = Object.entries(pins).filter(([_, pin]) => pin.length < 4);
    if (emptyPins.length > 0) {
      toast.error('All PINs must be at least 4 digits long');
      return;
    }

    try {
      setSavingPins(true);
      await api.put('/settings/pins', pins);
      toast.success('Credentials updated successfully!');
      
      // Update session if admin changed their own PIN
      const session = JSON.parse(sessionStorage.getItem('session') || '{}');
      if (session.role === 'admin' && session.pin !== pins.admin) {
        session.pin = pins.admin;
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

  // Filter customers by search
  const filteredCustomers = customers.filter((cust) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (cust.name && cust.name.toLowerCase().includes(term)) ||
      (cust.phone && cust.phone.includes(term)) ||
      (cust.email && cust.email.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardShell title="Staff & Client Settings" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
              activeTab === 'credentials'
                ? 'border-indigo-650 text-indigo-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Staff Credentials</span>
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-display text-sm font-bold transition-all ${
              activeTab === 'customers'
                ? 'border-indigo-650 text-indigo-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Directory</span>
          </button>
        </div>

        {/* ═══ TAB 1: STAFF CREDENTIALS ═══ */}
        {activeTab === 'credentials' && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800">Login PIN Settings</h3>
                <p className="text-xs text-slate-500">Configure numeric passcodes for staff roles. (Minimum 4 digits)</p>
              </div>
            </div>

            {loadingPins ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSavePins} className="space-y-6">
                
                {/* Admin PIN */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-750 uppercase tracking-wider mb-2">
                    Restaurant Admin PIN (Change Password)
                  </label>
                  <input
                    type="password"
                    pattern="[0-9]{4,6}"
                    value={pins.admin}
                    onChange={(e) => handlePinChange('admin', e.target.value)}
                    placeholder="Enter 4-6 digit numeric PIN"
                    className="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-xl font-mono text-center font-bold text-lg tracking-widest text-slate-800 placeholder:text-slate-300"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-2">Required to log in to this Admin Panel portal.</p>
                </div>

                {/* Staff PINs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Waiter */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-3">
                      Waiter Portal PIN
                    </span>
                    <input
                      type="text"
                      pattern="[0-9]{4,6}"
                      value={pins.waiter}
                      onChange={(e) => handlePinChange('waiter', e.target.value)}
                      placeholder="e.g. 2222"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none rounded-xl font-mono text-center font-bold text-base tracking-widest text-slate-800"
                      required
                    />
                  </div>

                  {/* Counter / Kitchen */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-3">
                      Counter / KDS PIN
                    </span>
                    <input
                      type="text"
                      pattern="[0-9]{4,6}"
                      value={pins.counter}
                      onChange={(e) => handlePinChange('counter', e.target.value)}
                      placeholder="e.g. 3333"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none rounded-xl font-mono text-center font-bold text-base tracking-widest text-slate-800"
                      required
                    />
                  </div>

                  {/* Cashier */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-3">
                      Cashier Portal PIN
                    </span>
                    <input
                      type="text"
                      pattern="[0-9]{4,6}"
                      value={pins.cashier}
                      onChange={(e) => handlePinChange('cashier', e.target.value)}
                      placeholder="e.g. 4444"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none rounded-xl font-mono text-center font-bold text-base tracking-widest text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPins}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10"
                  >
                    {savingPins ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{savingPins ? 'Saving Settings...' : 'Save Credentials'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ═══ TAB 2: CUSTOMER DIRECTORY ═══ */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            
            {/* Top Bar with Search & Refresh */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={fetchCustomers}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-650 transition-all font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCustomers ? 'animate-spin' : ''}`} />
                <span>Refresh Directory</span>
              </button>
            </div>

            {/* List and Table Grid */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              {loadingCustomers ? (
                <div className="flex justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-800">No Customers Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
                    {searchQuery ? 'Try clearing your search query' : 'Customer records populate automatically on reservation check-in and self-ordering.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Customer Details</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4 text-center">Orders Placed</th>
                        <th className="px-6 py-4 text-center">Reservations</th>
                        <th className="px-6 py-4 text-right">Total Spent</th>
                        <th className="px-6 py-4 text-right">Last Visit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredCustomers.map((cust, i) => (
                        <tr key={cust.phone || i} className="hover:bg-slate-50/50">
                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-display font-bold text-sm text-indigo-650">
                                {cust.name ? cust.name.charAt(0).toUpperCase() : 'G'}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">
                                  {cust.name || 'Walk-in Guest'}
                                </h4>
                                <span className="text-[10px] text-slate-400">Client Account</span>
                              </div>
                            </div>
                          </td>
                          {/* Contact */}
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono">{cust.phone || 'N/A'}</span>
                            </div>
                            {cust.email && cust.email !== 'N/A' && (
                              <div className="flex items-center gap-1.5 text-slate-450 text-[10px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{cust.email}</span>
                              </div>
                            )}
                          </td>
                          {/* Order count */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                              {cust.order_count} {cust.order_count === 1 ? 'order' : 'orders'}
                            </span>
                          </td>
                          {/* Reservations */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                              {cust.reservation_count} {cust.reservation_count === 1 ? 'booking' : 'bookings'}
                            </span>
                          </td>
                          {/* Total Spend */}
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono text-sm">
                            ₹{cust.total_spend || 0}
                          </td>
                          {/* Last Visit */}
                          <td className="px-6 py-4 text-right text-slate-500 text-[10px] font-mono">
                            {cust.last_visit ? new Date(cust.last_visit).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
