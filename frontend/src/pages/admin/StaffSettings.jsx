import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  KeyRound, 
  ShieldAlert, 
  Users, 
  Search, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Save, 
  Plus, 
  Trash2, 
  Printer, 
  Settings, 
  FileText, 
  CheckCircle, 
  Percent, 
  Info, 
  MapPin, 
  BadgePercent, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function StaffSettings() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'billing' | 'printing' | 'staff' | 'customers'
  
  // Settings Configuration State
  const [config, setConfig] = useState({
    name: '',
    contact_phone: '',
    contact_email: '',
    location: '',
    logo_url: '',
    fssai_compliance: '',
    billing: {
      gst_enabled: true,
      gst_percentage: 5,
      service_charge_enabled: true,
      service_charge_percentage: 0,
      upi_id: '',
      payment_systems_enabled: true
    },
    printing: {
      hardware: {
        enabled: false,
        size: '80mm',
        printer_device: 'Default',
        kot_device: 'Default'
      },
      bill_setting: {
        show_logo: true,
        show_address: true,
        show_customer_info: true,
        custom_footer: 'Thank you for dining with us!'
      },
      kot_setting: {
        prep_ticket_layout: 'classic'
      },
      auto_print: {
        on_order_create: false,
        on_kot_create: true,
        on_settlement: true
      }
    },
    subscription: {
      planName: 'Bronze Plan',
      status: 'Trial',
      startDate: '',
      nextBillingDate: ''
    },
    qr_theme: 'classic'
  });

  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Credentials Tab states
  const [pins, setPins] = useState({
    admin: '',
    waiter: '',
    counter: '',
    cashier: '',
  });
  const [loadingPins, setLoadingPins] = useState(false);
  const [savingPins, setSavingPins] = useState(false);

  // Staff Management states
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', username: '', role: 'waiter', pin: '' });

  // Customer Directory Tab states
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch Config
  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);
      const { data } = await api.get('/settings/config');
      if (data) {
        setConfig({
          name: data.name || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          location: data.location || '',
          logo_url: data.logo_url || '',
          fssai_compliance: data.fssai_compliance || '',
          billing: {
            gst_enabled: data.billing?.gst_enabled ?? true,
            gst_percentage: data.billing?.gst_percentage ?? 5,
            service_charge_enabled: data.billing?.service_charge_enabled ?? true,
            service_charge_percentage: data.billing?.service_charge_percentage ?? 0,
            upi_id: data.billing?.upi_id ?? '',
            payment_systems_enabled: data.billing?.payment_systems_enabled ?? true,
          },
          printing: {
            hardware: {
              enabled: data.printing?.hardware?.enabled ?? false,
              size: data.printing?.hardware?.size ?? '80mm',
              printer_device: data.printing?.hardware?.printer_device ?? 'Default',
              kot_device: data.printing?.hardware?.kot_device ?? 'Default',
            },
            bill_setting: {
              show_logo: data.printing?.bill_setting?.show_logo ?? true,
              show_address: data.printing?.bill_setting?.show_address ?? true,
              show_customer_info: data.printing?.bill_setting?.show_customer_info ?? true,
              custom_footer: data.printing?.bill_setting?.custom_footer ?? 'Thank you for dining with us!',
            },
            kot_setting: {
              prep_ticket_layout: data.printing?.kot_setting?.prep_ticket_layout ?? 'classic',
            },
            auto_print: {
              on_order_create: data.printing?.auto_print?.on_order_create ?? false,
              on_kot_create: data.printing?.auto_print?.on_kot_create ?? true,
              on_settlement: data.printing?.auto_print?.on_settlement ?? true,
            }
          },
          subscription: data.subscription || { planName: 'Bronze Plan', status: 'Trial', startDate: '', nextBillingDate: '' },
          qr_theme: data.qr_theme || 'classic'
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings configuration');
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    
    if (config.contact_phone && !/^\d{10}$/.test(config.contact_phone)) {
      toast.error('Contact phone number must be exactly 10 digits');
      return;
    }

    try {
      setSavingConfig(true);
      await api.put('/settings/config', config);
      toast.success('Configuration updated successfully!');
      fetchConfig();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Load PINs
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

  // Load Staff Directory
  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const { data } = await api.get('/staff');
      setStaffList(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff accounts');
    } finally {
      setLoadingStaff(false);
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
    if (activeTab === 'general' || activeTab === 'billing' || activeTab === 'printing') {
      fetchConfig();
    } else if (activeTab === 'staff') {
      fetchPins();
      fetchStaff();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.username.trim() || !newStaff.pin.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (newStaff.pin.length < 4) {
      toast.error('Password must be at least 4 characters');
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

  const handlePinChange = (role, value) => {
    setPins((prev) => ({ ...prev, [role]: value.slice(0, 30) }));
  };

  const handleSavePins = async (e) => {
    e.preventDefault();
    const emptyPins = Object.entries(pins).filter(([_, pin]) => pin.length < 4);
    if (emptyPins.length > 0) {
      toast.error('All passwords must be at least 4 characters long');
      return;
    }

    try {
      setSavingPins(true);
      await api.put('/settings/pins', pins);
      toast.success('Credentials updated successfully!');
      
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
    <DashboardShell title="Platform Configurations & Settings" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap gap-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all shrink-0 ${
              activeTab === 'general' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General settings</span>
          </button>
          
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all shrink-0 ${
              activeTab === 'billing' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Billing & Taxes (GST)</span>
          </button>

          <button
            onClick={() => setActiveTab('printing')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all shrink-0 ${
              activeTab === 'printing' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Bill & KOT Printing</span>
          </button>
        </div>

        {/* ═══ TAB 1: GENERAL SETTINGS ═══ */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-display font-bold text-base text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" /> Restaurant Profile Settings
              </h3>
              
              {loadingConfig ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSaveConfig} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Restaurant Name</label>
                      <input 
                        type="text"
                        value={config.name}
                        onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Contact Email</label>
                      <input 
                        type="email"
                        value={config.contact_email}
                        onChange={(e) => setConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Contact Phone (10 digits)</label>
                      <input 
                        type="text"
                        value={config.contact_phone}
                        onChange={(e) => setConfig(prev => ({ ...prev, contact_phone: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                        placeholder="e.g. 9876543210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">FSSAI License Number / Regulatory Details</label>
                      <input 
                        type="text"
                        value={config.fssai_compliance}
                        onChange={(e) => setConfig(prev => ({ ...prev, fssai_compliance: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                        placeholder="e.g. 12345678901234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Restaurant Logo URL</label>
                    <input 
                      type="url"
                      value={config.logo_url}
                      onChange={(e) => setConfig(prev => ({ ...prev, logo_url: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Google Review Link (Leave Blank to Disable)</label>
                    <input 
                      type="url"
                      value={config.google_review_url || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, google_review_url: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                      placeholder="https://g.page/r/your-restaurant/review"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Customer Dining QR Theme</label>
                    <select
                      value={config.qr_theme || 'classic'}
                      onChange={(e) => setConfig(prev => ({ ...prev, qr_theme: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="classic">Classic Sand (Default)</option>
                      <option value="onyx">Onyx Dark</option>
                      <option value="emerald">Emerald Clean</option>
                      <option value="ruby">Ruby Royal</option>
                      <option value="amber">Amber Light</option>
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1">Select the color skin and visual presentation for the customer QR menus.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Address / Location</label>
                    <textarea 
                      rows={3}
                      value={config.location}
                      onChange={(e) => setConfig(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
                    >
                      {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{savingConfig ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar Details (Subscription + Logo preview) */}
            <div className="space-y-6 lg:col-span-1">
              {/* Logo Preview */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center">
                <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-4">Logo Preview</label>
                <div className="w-24 h-24 mx-auto bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                  {config.logo_url ? (
                    <img src={config.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-350 text-xs font-bold font-mono">No Logo</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-800 mt-4">{config.name || 'Unnamed Outlet'}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{config.location || 'No address configured.'}</p>
              </div>

              {/* Subscription details */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider">Subscription Status</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] text-slate-400">Current Plan</span>
                    <span className="text-xs font-bold text-indigo-300">{config.subscription?.planName || 'Bronze Plan'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] text-slate-400">Status</span>
                    <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase">
                      {config.subscription?.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Next Billing Date</span>
                    <span className="text-xs font-bold font-mono">
                      {config.subscription?.nextBillingDate ? new Date(config.subscription.nextBillingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-6 leading-relaxed">
                  Bhoj360 platform licenses are managed by the main agency. For billing changes, please contact support.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ═══ TAB 2: BILLING & GST ═══ */}
        {activeTab === 'billing' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm max-w-2xl animate-slide-up">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 font-bold">Taxes & Payment Settings</h3>
                <p className="text-[10px] text-slate-450">Set up GST, Service Charges, and UPI configurations for customers</p>
              </div>
            </div>

            {loadingConfig ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-6">
                {/* GST Enabled Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <h4 className="font-bold text-xs text-slate-805">Enable GST Tax</h4>
                    <p className="text-[10px] text-slate-440 mt-0.5">Toggle tax calculations on all generated customer receipts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, billing: { ...prev.billing, gst_enabled: !prev.billing.gst_enabled } }))}
                    className="text-indigo-650 focus:outline-none"
                  >
                    {config.billing.gst_enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                  </button>
                </div>

                {/* Service Charge Enabled Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <h4 className="font-bold text-xs text-slate-805">Enable Service Charge</h4>
                    <p className="text-[10px] text-slate-440 mt-0.5">Toggle service charge calculations on all order totals and bills</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, billing: { ...prev.billing, service_charge_enabled: !prev.billing.service_charge_enabled } }))}
                    className="text-indigo-650 focus:outline-none"
                  >
                    {config.billing.service_charge_enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                  </button>
                </div>

                {(config.billing.gst_enabled || config.billing.service_charge_enabled) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.billing.gst_enabled && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">GST Rate (%)</label>
                        <input 
                          type="number"
                          value={config.billing.gst_percentage}
                          onChange={(e) => setConfig(prev => ({ ...prev, billing: { ...prev.billing, gst_percentage: parseFloat(e.target.value) || 0 } }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                        />
                      </div>
                    )}
                    {config.billing.service_charge_enabled && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Service Charge Rate (%)</label>
                        <input 
                          type="number"
                          value={config.billing.service_charge_percentage}
                          onChange={(e) => setConfig(prev => ({ ...prev, billing: { ...prev.billing, service_charge_percentage: parseFloat(e.target.value) || 0 } }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* UPI VPA Config */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="font-bold text-xs text-slate-800">Online Payment Split Config</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Restaurant UPI ID (for QR Generation)</label>
                    <input 
                      type="text"
                      value={config.billing.upi_id}
                      onChange={(e) => setConfig(prev => ({ ...prev, billing: { ...prev.billing, upi_id: e.target.value } }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                      placeholder="merchant@upi"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">
                      This UPI ID is used to dynamically construct UPI checkout URLs and generate scanning QR codes for cashier dashboards.
                    </p>
                  </div>
                  
                  {/* Enable Splits */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div>
                      <h4 className="font-bold text-xs text-slate-805">Enable Multi-Payment split systems</h4>
                      <p className="text-[10px] text-slate-440 mt-0.5">Allow waiters to split a single bill into Cash and Online portions at checkout</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, billing: { ...prev.billing, payment_systems_enabled: !prev.billing.payment_systems_enabled } }))}
                      className="text-indigo-650 focus:outline-none"
                    >
                      {config.billing.payment_systems_enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
                  >
                    {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{savingConfig ? 'Saving Settings...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ═══ TAB 3: BILL & KOT PRINTING ═══ */}
        {activeTab === 'printing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Form Configurations (Left Side) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">Print Preview & Hardware Settings</h3>
                <p className="text-[10px] text-slate-450">Customize physical thermal printer connection, KOT details, and billing layout</p>
              </div>

              {loadingConfig ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  {/* Subsection 1: Hardware Connections */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-600 rounded-xs"></span>
                      1. Printer Hardware Connection
                    </h4>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div>
                        <h4 className="font-bold text-xs text-slate-805">Enable Direct Print Connection</h4>
                        <p className="text-[10px] text-slate-440 mt-0.5">Auto-routing of print files using local ESC/POS drivers</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, printing: { ...prev.printing, hardware: { ...prev.printing.hardware, enabled: !prev.printing.hardware.enabled } } }))}
                        className="text-indigo-650 focus:outline-none"
                      >
                        {config.printing.hardware.enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Paper Format Size</label>
                        <select 
                          value={config.printing.hardware.size}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, hardware: { ...prev.printing.hardware, size: e.target.value } } }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        >
                          <option value="58mm">58mm (Handheld/Thermal)</option>
                          <option value="80mm">80mm (Desktop Thermal)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Main Bill Device Name</label>
                        <input 
                          type="text"
                          value={config.printing.hardware.printer_device}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, hardware: { ...prev.printing.hardware, printer_device: e.target.value } } }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subsection 2: Bill Layout Setting */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-600 rounded-xs"></span>
                      2. Bill Details Setup
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={config.printing.bill_setting.show_logo}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, bill_setting: { ...prev.printing.bill_setting, show_logo: e.target.checked } } }))}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-700 font-semibold">Show Logo</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={config.printing.bill_setting.show_address}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, bill_setting: { ...prev.printing.bill_setting, show_address: e.target.checked } } }))}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-700 font-semibold">Show Address</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={config.printing.bill_setting.show_customer_info}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, bill_setting: { ...prev.printing.bill_setting, show_customer_info: e.target.checked } } }))}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-700 font-semibold">Show Cust. Phone</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Custom Footer Text</label>
                      <input 
                        type="text"
                        value={config.printing.bill_setting.custom_footer}
                        onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, bill_setting: { ...prev.printing.bill_setting, custom_footer: e.target.value } } }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Subsection 3: KOT Settings */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-600 rounded-xs"></span>
                      3. Kitchen Ticket (KOT) Setup
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">KOT Printer Device Name</label>
                        <input 
                          type="text"
                          value={config.printing.hardware.kot_device}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, hardware: { ...prev.printing.hardware, kot_device: e.target.value } } }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">KOT Ticket Format Style</label>
                        <select 
                          value={config.printing.kot_setting.prep_ticket_layout}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, kot_setting: { ...prev.printing.kot_setting, prep_ticket_layout: e.target.value } } }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        >
                          <option value="classic">Classic (Standard Line items)</option>
                          <option value="detailed">Detailed (Includes Waiter & Notes prominent)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subsection 4: Auto Print */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-indigo-600 rounded-xs"></span>
                      4. Auto-Print Triggers
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={config.printing.auto_print.on_order_create}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, auto_print: { ...prev.printing.auto_print, on_order_create: e.target.checked } } }))}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-700 font-semibold">Print Bill on Create</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={config.printing.auto_print.on_kot_create}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, auto_print: { ...prev.printing.auto_print, on_kot_create: e.target.checked } } }))}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-700 font-semibold">Auto-Print KOT</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={config.printing.auto_print.on_settlement}
                          onChange={(e) => setConfig(prev => ({ ...prev, printing: { ...prev.printing, auto_print: { ...prev.printing.auto_print, on_settlement: e.target.checked } } }))}
                          className="rounded"
                        />
                        <span className="text-xs text-slate-700 font-semibold">Print Bill on Settle</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
                    >
                      {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{savingConfig ? 'Saving Settings...' : 'Save Configuration'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Live Print Receipt Card (Right Side) */}
            <div className="lg:col-span-1 space-y-4">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Live Thermal Preview</label>
              
              {/* thermal preview wrapper */}
              <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200 shadow-inner flex justify-center">
                <div className={`bg-white text-black p-5 shadow-md border-x border-dashed border-slate-300 font-mono text-[10px] leading-relaxed select-none ${
                  config.printing.hardware.size === '58mm' ? 'w-52' : 'w-72'
                }`}>
                  <div className="text-center space-y-1 mb-3">
                    {config.printing.bill_setting.show_logo && (
                      config.logo_url ? (
                        <img src={config.logo_url} alt="Logo" className="w-10 h-10 rounded-full mx-auto object-contain bg-white border border-slate-200" style={{ display: 'block', margin: '0 auto' }} />
                      ) : (
                        <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-[9px] mx-auto uppercase">
                          {config.name ? config.name.charAt(0) : 'L'}
                        </div>
                      )
                    )}
                    <h3 className="font-bold text-[12px] uppercase">{config.name || 'Unnamed Restaurant'}</h3>
                    {config.printing.bill_setting.show_address && (
                      <p className="text-[8px] text-slate-700 leading-normal">{config.location || 'Plot 12, Sector 5, New Delhi'}</p>
                    )}
                    {config.fssai_compliance && (
                      <p className="text-[7.5px] text-slate-800">FSSAI No: {config.fssai_compliance}</p>
                    )}
                    <p className="border-b border-dashed border-black/30 pb-1.5"></p>
                  </div>

                  <div className="space-y-1 text-[8.5px] mb-3">
                    <div className="flex justify-between">
                      <span>Table: T12</span>
                      <span>Order: #1042</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date: {new Date().toLocaleDateString()}</span>
                      <span>Time: 12:30 PM</span>
                    </div>
                    {config.printing.bill_setting.show_customer_info && (
                      <div className="text-left font-bold">Cust. Phone: 9876543210</div>
                    )}
                    <p className="border-b border-dashed border-black/30 pb-1"></p>
                  </div>

                  <div className="space-y-1 text-[8.5px] mb-3">
                    <div className="flex justify-between font-bold">
                      <span className="w-1/2">Item Description</span>
                      <span className="w-1/6 text-center">Qty</span>
                      <span className="w-1/3 text-right">Price</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="w-1/2 truncate">Paneer Tikka Roll</span>
                      <span className="w-1/6 text-center">2</span>
                      <span className="w-1/3 text-right">₹320.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="w-1/2 truncate">Cold Coffee</span>
                      <span className="w-1/6 text-center">1</span>
                      <span className="w-1/3 text-right">₹120.00</span>
                    </div>
                    <p className="border-b border-dashed border-black/30 pb-1"></p>
                  </div>

                  <div className="space-y-1 text-[8.5px] mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹440.00</span>
                    </div>
                    {config.billing.gst_enabled && (
                      <div className="flex justify-between">
                        <span>GST ({config.billing.gst_percentage}%)</span>
                        <span>₹{(440 * (config.billing.gst_percentage / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    {config.billing.service_charge_enabled && config.billing.service_charge_percentage > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge ({config.billing.service_charge_percentage}%)</span>
                        <span>₹{(440 * (config.billing.service_charge_percentage / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-[10px] border-t border-dashed border-black/30 pt-1">
                      <span>TOTAL PAYABLE</span>
                      <span>₹{(440 + (config.billing.gst_enabled ? (440 * (config.billing.gst_percentage / 100)) : 0) + (config.billing.service_charge_enabled ? (440 * (config.billing.service_charge_percentage / 100)) : 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center text-[7.5px] leading-normal space-y-1">
                    <p className="font-bold uppercase">*** DUPLICATE RECEIPT ***</p>
                    <p>{config.printing.bill_setting.custom_footer}</p>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 text-center">Receipt width scales based on 58mm or 80mm selections.</p>
            </div>

          </div>
        )}

      </div>
    </DashboardShell>
  );
}
