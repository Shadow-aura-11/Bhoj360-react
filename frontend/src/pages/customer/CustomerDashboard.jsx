import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Clipboard, Compass, ArrowRight, Bell, Soup, Utensils, Award, History, Clock, X, RefreshCw, CreditCard, DollarSign, LogOut } from 'lucide-react';
import { createApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import StatusBadge from '../../components/shared/StatusBadge';
import OrderTimeline from '../../components/Orders/OrderTimeline';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const api = createApi(restaurantId);
  const { socket, isConnected } = useSocket(restaurantId);

  const [session, setSession] = useState(null); // { role, restaurantId, tableNumber, tableId, customerPhone, qrToken }
  
  const urlTable = searchParams.get('table');
  const urlToken = searchParams.get('token');

  // Login form states
  const [loginStep, setLoginStep] = useState(1); // 1: phone, 2: table
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState(urlTable || '');
  const [customerName, setCustomerName] = useState('');
  
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'order' | 'track'
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [logoutRedirectUrl, setLogoutRedirectUrl] = useState('');
  const [theme, setTheme] = useState('classic');
  const [billingConfig, setBillingConfig] = useState(null);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.menu_item_id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: 1,
          notes: '',
          addons: [],
        },
      ];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQty = (itemId, amount) => {
    setCart((prev) =>
      prev
        .map((cartItem) => {
          if (cartItem.menu_item_id === itemId) {
            const nextQty = cartItem.quantity + amount;
            return nextQty > 0 ? { ...cartItem, quantity: nextQty } : null;
          }
          return cartItem;
        })
        .filter(Boolean)
    );
  };

  const toggleCartItemAddon = (itemId, addon) => {
    setCart((prev) =>
      prev.map((cartItem) => {
        if (cartItem.menu_item_id === itemId) {
          const currentAddons = cartItem.addons || [];
          const exists = currentAddons.some((a) => a.id === addon.id);
          const nextAddons = exists
            ? currentAddons.filter((a) => a.id !== addon.id)
            : [...currentAddons, addon];
          return { ...cartItem, addons: nextAddons };
        }
        return cartItem;
      })
    );
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    try {
      setLoading(true);
      await api.post('/orders/self', {
        items: cart,
        notes: notes,
        customer_phone: session.customerPhone,
        customer_name: session.customerName || '',
      }, {
        params: { table: session.tableNumber, token: session.qrToken }
      });
      toast.success('Your order has been sent to the kitchen!');
      setCart([]);
      setNotes('');
      setActiveTab('order');
      fetchActiveOrder();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  // Pay Modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'CASH'
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Sync session state from storage
  useEffect(() => {
    const ses = JSON.parse(sessionStorage.getItem('session') || '{}');
    if (ses.restaurantId === restaurantId && ses.role === 'customer') {
      setSession(ses);
    } else {
      setSession(null);
    }
  }, [restaurantId]);

  // Load menu items
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const { data } = await api.get('/menu', { params: { available: 1 } });
        const { data: cats } = await api.get('/menu/categories');
        setMenuItems(data);
        setCategories(['All', ...cats]);

        // Fetch health config to get restaurant name
        const { data: health } = await api.get('/health');
        if (health) {
          if (health.name) setRestaurantName(health.name);
          if (health.logout_redirect_url) setLogoutRedirectUrl(health.logout_redirect_url);
          if (health.google_review_url) setGoogleReviewUrl(health.google_review_url);
          if (health.theme) setTheme(health.theme);
          if (health.billing) setBillingConfig(health.billing);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (session) {
      loadMenu();
    }
  }, [session, restaurantId]);

  // Fetch active order for customer by phone number
  const fetchActiveOrder = async () => {
    if (!session?.customerPhone) return;
    try {
      setLoading(true);
      const { data } = await api.get('/orders/active', {
        params: { phone: session.customerPhone },
      });
      setActiveOrder(data.order || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchActiveOrder();
    }
  }, [session, activeTab]);

  // Socket room connection
  useEffect(() => {
    if (!socket || !session) return;

    if (session.tableNumber) {
      socket.emit('join-table', session.tableNumber);
    }
    if (session.customerPhone) {
      socket.emit('join-customer', session.customerPhone);
    }

    const handleOrderEvent = ({ order }) => {
      fetchActiveOrder();
      
      if (!order) return;
      const { status } = order;
      
      if (status === 'pending') {
        toast(`Order sent to kitchen! 🍳`, { id: `order-${order.id}`, icon: '📝' });
      } else if (status === 'preparing') {
        toast.success(`Chef is preparing your order! 🍳`, { id: `order-${order.id}`, duration: 5000 });
      } else if (status === 'ready') {
        toast(`Your order is ready to serve! 🍳`, {
          icon: '🎉',
          duration: 6000,
          style: {
            background: '#16a34a',
            color: '#ffffff',
          },
          id: `order-${order.id}`
        });
      } else if (status === 'served') {
        toast.success(`Your order has been served. Enjoy your meal! 🍽️`, { id: `order-${order.id}`, duration: 5000 });
      } else if (status === 'paid') {
        toast.success(`Order settled. Thank you for dining with us! 💰`, { id: `order-${order.id}`, duration: 5000 });
        setReviewModalOpen(true);
      }
    };

    socket.on('order:new', handleOrderEvent);
    socket.on('order:updated', handleOrderEvent);
    socket.on('order:itemAdded', handleOrderEvent);

    return () => {
      socket.off('order:new', handleOrderEvent);
      socket.off('order:updated', handleOrderEvent);
      socket.off('order:itemAdded', handleOrderEvent);
    };
  }, [socket, session]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginStep === 1) {
      const cleanPhone = customerPhone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
      setLoginStep(2);
      return;
    }

    if (!tableNumber.trim()) {
      toast.error('Please enter table number');
      return;
    }

    try {
      setLoading(true);
      const { data: tables } = await api.get('/tables');
      const tableExists = tables.find(
        (t) => t.number.toUpperCase() === tableNumber.trim().toUpperCase()
      );

      if (!tableExists) {
        toast.error(`Table ${tableNumber} not found`);
        return;
      }

      if (tableExists.status === 'inactive') {
        toast.error(`Table ${tableNumber} is inactive`);
        return;
      }

      const newSession = {
        role: 'customer',
        restaurantId,
        tableNumber: tableExists.number.toUpperCase(),
        tableId: tableExists.id,
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim(),
        qrToken: tableExists.qr_token,
      };

      sessionStorage.setItem('session', JSON.stringify(newSession));
      setSession(newSession);
      toast.success(`Welcome to Table ${tableExists.number}`);
    } catch (err) {
      console.error(err);
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = customerPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get('/menu/public', {
        params: { table: urlTable, token: urlToken },
      });
      
      const tableId = data.table ? data.table.id : null;

      const newSession = {
        role: 'customer',
        restaurantId,
        tableNumber: urlTable,
        tableId,
        customerPhone: cleanPhone,
        customerName: customerName.trim(),
        qrToken: urlToken,
      };

      sessionStorage.setItem('session', JSON.stringify(newSession));
      setSession(newSession);
      toast.success(`Welcome to Table ${urlTable}`);
    } catch (err) {
      console.error(err);
      toast.error('Invalid QR Code or seating session expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallWaiter = () => {
    if (!socket || !session) return;
    socket.emit('waiter:call', {
      tableNumber: session.tableNumber,
      tableId: session.tableId,
      timestamp: new Date().toISOString(),
    });
    toast.success('Waiter called! A staff member is on their way. 🔔', {
      duration: 5000,
    });
  };

  const handlePayRequest = async () => {
    if (!activeOrder || !session?.qrToken) return;
    try {
      setLoading(true);
      await api.post(`/orders/${activeOrder.id}/pay-request`, { payment_method: payMethod }, {
        params: { table: session.tableNumber, token: session.qrToken }
      });
      toast.success('Payment request submitted to cashier! 💰');
      setPayModalOpen(false);
      fetchActiveOrder();
    } catch (err) {
      console.error(err);
      toast.error('Failed to request payment');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    sessionStorage.removeItem('session');
    if (logoutRedirectUrl) {
      window.location.href = logoutRedirectUrl;
    } else {
      setSession(null);
      setLoginStep(1);
      setCustomerPhone('');
      setTableNumber('');
    }
  };

  const getCategoryEmoji = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('starter') || cat.includes('bread')) return '🍞';
    if (cat.includes('main') || cat.includes('biryani')) return '🍖';
    if (cat.includes('drink') || cat.includes('beverage') || cat.includes('lassi')) return '🥤';
    if (cat.includes('dessert') || cat.includes('cake') || cat.includes('ice')) return '🍰';
    return '🍽️';
  };

  const filteredItems = menuItems.filter(
    (item) => selectedCat === 'All' || item.category === selectedCat
  );

  if (!session) {
    /* Seating Entry Screen */
    return (
      <div className="min-h-screen bg-[#f0fdf4] text-slate-800 flex items-center justify-center p-6 relative font-body">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 translate-x-20 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 -translate-x-20 translate-y-10" />

        {urlTable && urlToken ? (
          /* Auto-filled Seating via QR */
          <div className="relative w-full max-w-sm bg-white border border-slate-100 p-8 rounded-3xl shadow-xl text-center animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-black font-display text-emerald-950 leading-tight">Welcome Guest</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">Table {urlTable}. Please enter your name and phone number to start dining.</p>

            <form onSubmit={handleUrlLoginSubmit} className="space-y-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your Name (Optional)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-2xl text-center font-bold text-base text-emerald-950 placeholder:text-slate-350"
              />
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Phone Number (e.g. 9876543210)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-2xl text-center font-bold text-lg font-mono text-emerald-950 placeholder:text-slate-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 transition-all font-semibold rounded-2xl text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
              >
                <span>{loading ? 'Entering...' : 'Proceed to Dining'}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Manual 2-Step Login Seating */
          <div className="relative w-full max-w-sm bg-white border border-slate-100 p-8 rounded-3xl shadow-xl text-center animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-7 h-7" />
            </div>
            
            {loginStep === 1 ? (
              <>
                <h2 className="text-2xl font-black font-display text-emerald-950 leading-tight">Welcome Guest</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">Please enter your 10-digit phone number to start dining</p>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-2xl text-center font-bold text-lg font-mono text-emerald-950 placeholder:lowercase"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 transition-all font-semibold rounded-2xl text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black font-display text-emerald-950 leading-tight">Table Selection</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">Please enter the Table number printed on your stand card</p>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. T1, O2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-2xl text-center font-bold text-lg font-mono text-emerald-950 placeholder:lowercase"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep(1)}
                      className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-2xl font-semibold transition-all text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 transition-all font-semibold rounded-2xl text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
                    >
                      <span>Enter Dining</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  const themeStyles = {
    classic: {
      bg: "#fafaf9",
      bgSub: "#f5f5f4",
      text: "#1c1917",
      textSub: "#78716c",
      primary: "#d97706", // amber-600
      primaryHover: "#b45309",
      accentBg: "#fef3c7",
      border: "#e7e5e4"
    },
    onyx: {
      bg: "#0a0a0a",
      bgSub: "#171717",
      text: "#f5f5f5",
      textSub: "#a3a3a3",
      primary: "#f59e0b", // amber-500
      primaryHover: "#d97706",
      accentBg: "#262626",
      border: "#262626"
    },
    emerald: {
      bg: "#fafaf9",
      bgSub: "#f4f4f5",
      text: "#0f172a",
      textSub: "#475569",
      primary: "#059669", // emerald-600
      primaryHover: "#047857",
      accentBg: "#ecfdf5",
      border: "#e2e8f0"
    },
    ruby: {
      bg: "#0c0a09",
      bgSub: "#1c1917",
      text: "#f5f5f4",
      textSub: "#a8a29e",
      primary: "#e11d48", // rose-600
      primaryHover: "#be123c",
      accentBg: "#292524",
      border: "#292524"
    },
    amber: {
      bg: "#faf6f0",
      bgSub: "#f4ebe1",
      text: "#1c1917",
      textSub: "#78716c",
      primary: "#b45309", // amber-700
      primaryHover: "#92400e",
      accentBg: "#fef3c7",
      border: "#f5e6d3"
    }
  };

  const getCustomerCalculatedTotal = () => {
    if (!activeOrder) return { subtotal: 0, discount: 0, taxableAmount: 0, gstAmount: 0, serviceChargeAmount: 0, grandTotal: 0 };
    const subtotal = activeOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || activeOrder.total || 0;
    const discount = activeOrder.discount_amount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const gstEnabled = billingConfig?.gst_enabled;
    const gstPercent = billingConfig?.gst_percentage || 0;
    const gstAmount = gstEnabled ? (taxableAmount * gstPercent) / 100 : 0;
    const serviceChargeEnabled = billingConfig?.service_charge_enabled ?? true;
    const serviceChargePercent = serviceChargeEnabled ? (billingConfig?.service_charge_percentage || 0) : 0;
    const serviceChargeAmount = (taxableAmount * serviceChargePercent) / 100;
    const grandTotal = taxableAmount + gstAmount + serviceChargeAmount;
    return { subtotal, discount, taxableAmount, gstAmount, serviceChargeAmount, grandTotal };
  };

  const { subtotal, discount, taxableAmount, gstAmount, serviceChargeAmount, grandTotal } = getCustomerCalculatedTotal();

  return (
    <div className="min-h-screen theme-bg-color theme-text-color flex flex-col font-body">
      <style>{`
        :root {
          --theme-primary: ${style.primary};
          --theme-primary-hover: ${style.primaryHover};
          --theme-bg: ${style.bg};
          --theme-bg-sub: ${style.bgSub};
          --theme-text: ${style.text};
          --theme-text-sub: ${style.textSub};
          --theme-accent-bg: ${style.accentBg};
          --theme-border: ${style.border};
        }
        .theme-bg-color {
          background-color: var(--theme-bg) !important;
        }
        .theme-text-color {
          color: var(--theme-text) !important;
        }
        .theme-text-sub-color {
          color: var(--theme-text-sub) !important;
        }
        .theme-primary-color {
          color: var(--theme-primary) !important;
        }
        .theme-primary-bg {
          background-color: var(--theme-primary) !important;
        }
        .theme-primary-bg-hover:hover {
          background-color: var(--theme-primary-hover) !important;
        }
        .theme-accent-bg {
          background-color: var(--theme-accent-bg) !important;
        }
        .theme-border-color {
          border-color: var(--theme-border) !important;
        }
        .active-tab {
          border-bottom-color: var(--theme-primary) !important;
          color: var(--theme-primary) !important;
        }
        .inactive-tab {
          border-bottom-color: transparent !important;
          color: var(--theme-text-sub) !important;
        }
      `}</style>
      
      {/* Header bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b theme-border-color theme-bg-color sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div>
          <span className="text-[9px] font-bold theme-primary-color tracking-widest block uppercase font-mono">{restaurantName}</span>
          <h1 className="text-sm font-bold font-display theme-text-color">Table {activeOrder?.table_number || session.tableNumber}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCallWaiter}
            className="px-3 py-1.5 theme-primary-bg theme-primary-bg-hover text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Call Waiter</span>
          </button>
          
          <button
            onClick={handleExit}
            className="text-slate-400 hover:text-rose-600 text-xs font-semibold px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1"
            title="Exit Seating"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex theme-bg-color border-b theme-border-color flex-shrink-0">
        {[
          { id: 'menu', label: 'Our Menu', icon: Soup },
          { id: 'order', label: 'My Order', icon: Clipboard },
          { id: 'track', label: 'Track Order', icon: Compass },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-[11px] font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'active-tab theme-accent-bg font-black'
                : 'inactive-tab hover:theme-text-color'
            }`}
          >
            <tab.icon className="w-4 h-4 flex-shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Workspace panel */}
      <main className="flex-1 p-6 overflow-y-auto max-w-lg w-full mx-auto min-h-0 pb-20">
        
        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth no-print">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCat === c
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Grid menu with Photos */}
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-3 bg-white border border-slate-100/80 rounded-2.5xl flex items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const emoji = parent.querySelector('[data-emoji]');
                          if (emoji) emoji.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      data-emoji
                      style={{ display: item.image_url ? 'none' : 'flex' }}
                      className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0"
                    >
                      {getCategoryEmoji(item.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-emerald-950 text-sm leading-snug">{item.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                      <span className="text-sm font-bold text-emerald-600 font-mono mt-1 block">₹{item.price}</span>
                    </div>
                  </div>
                  
                  {(() => {
                    const cartItem = cart.find((i) => i.menu_item_id === item.id);
                    return cartItem ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-800 px-1 w-4 text-center">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 flex-shrink-0"
                      >
                        Add
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>

            {/* Self ordering prompt card */}
            <div className="p-5 bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white rounded-3xl shadow-lg shadow-emerald-600/10 flex items-center gap-4 text-left">
              <Award className="w-10 h-10 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm leading-snug">Ordering is Self-Served!</h4>
                <p className="text-[11px] text-emerald-100/90 mt-0.5">Please scan the table QR code directly with your mobile camera to place order. 📱</p>
              </div>
            </div>
          </div>
        )}
        {/* My Order Tab */}
        {activeTab === 'order' && (
          <div className="space-y-4 animate-slide-up">
            {/* Basket Items to Submit */}
            {cart.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm">Your Order Basket</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Review items before sending to the kitchen</p>
                  </div>
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-rose-500 font-semibold"
                  >
                    Clear Basket
                  </button>
                </div>

                <div className="divide-y divide-slate-100/50">
                  {cart.map((item) => (
                    <div key={item.menu_item_id} className="py-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-medium text-slate-800 text-sm truncate">{item.item_name}</span>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQty(item.menu_item_id, -1)}
                            className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-800 px-1 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.menu_item_id, 1)}
                            className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCart(prev => prev.map(ci => ci.menu_item_id === item.menu_item_id ? { ...ci, notes: val } : ci));
                          }}
                          placeholder="Instructions (e.g., extra spicy...)"
                          className="flex-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-650 focus:outline-none"
                        />
                        <span className="text-xs font-mono font-bold text-slate-700 font-mono">₹{(item.price + (item.addons || []).reduce((s, ad) => s + ad.price, 0)) * item.quantity}</span>
                      </div>
                      
                      {(() => {
                        const menuItem = menuItems.find((mi) => mi.id === item.menu_item_id);
                        const availableAddons = menuItem?.addons || [];
                        if (availableAddons.length === 0) return null;
                        return (
                          <div className="mt-1 pl-2 border-l-2 border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add-ons:</span>
                            <div className="flex flex-col gap-1.5">
                              {availableAddons.map((ad) => {
                                const isSelected = (item.addons || []).some((a) => a.id === ad.id);
                                return (
                                  <label key={ad.id} className="flex items-center justify-between text-xs text-slate-650 cursor-pointer select-none">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleCartItemAddon(item.menu_item_id, ad)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                      />
                                      <span>{ad.name}</span>
                                    </div>
                                    <span className="font-mono text-slate-450 font-bold">+₹{ad.price}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-bold text-sm text-emerald-950">
                  <span className="text-slate-500 font-medium">Basket Total</span>
                  <span className="text-base font-bold font-mono text-emerald-600">₹{cart.reduce((sum, i) => sum + (i.price + (i.addons || []).reduce((s, ad) => s + ad.price, 0)) * i.quantity, 0)}</span>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add overall notes for the chef..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    onClick={handleOrderSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
                  >
                    <span>Send Order to Chef</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Order Details */}
            {activeOrder && (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono">ORDER ID: #{activeOrder.id}</span>
                    <h3 className="font-semibold text-emerald-955 text-sm mt-0.5">Dining order active</h3>
                  </div>
                  <StatusBadge status={activeOrder.status} size="sm" />
                </div>

                <div className="divide-y divide-slate-50/50">
                  {activeOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between gap-3 text-sm">
                      <span className="text-slate-655">
                        <strong className="text-emerald-600 font-mono font-bold">x{item.quantity}</strong>{' '}
                        {item.is_addon ? <span className="text-rose-600 font-bold mr-1">(Add-on)</span> : ''}
                        {item.item_name}
                      </span>
                      <span className="text-slate-400 font-mono text-xs">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>GST ({billingConfig?.gst_percentage || 0}%):</span>
                      <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {serviceChargeAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge ({billingConfig?.service_charge_percentage || 0}%):</span>
                      <span className="font-mono">₹{serviceChargeAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 font-bold text-sm text-emerald-950">
                    <span>Total Seated Amount</span>
                    <span className="text-base font-bold font-mono text-emerald-605">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Settle / Pay Bill Option */}
                {session.qrToken ? (
                  activeOrder.payment_status === 'pending_payment' ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs text-center font-semibold mt-2">
                      Payment request pending cashier approval via {activeOrder.payment_method?.toUpperCase()}.
                    </div>
                  ) : activeOrder.payment_status === 'paid' ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs text-center font-semibold mt-2">
                      Order settled. Thank you!
                    </div>
                  ) : (
                    <button
                      onClick={() => setPayModalOpen(true)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-md hover:-translate-y-0.5 transition-transform text-xs mt-2"
                    >
                      Pay Bill / Request Checkout
                    </button>
                  )
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-150 text-slate-500 rounded-2xl text-xs text-center font-medium mt-2">
                    To request online payment, please scan the table QR code. Alternatively, ask waiter to settle.
                  </div>
                )}
              </div>
            )}

            {loading && cart.length === 0 && !activeOrder && (
              <div className="skeleton h-48 rounded-3xl" />
            )}

            {!activeOrder && cart.length === 0 && !loading && (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl text-slate-500">
                <Soup className="w-12 h-12 mx-auto text-emerald-500/20 mb-3" />
                <p className="text-sm font-semibold">No active orders placed yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Please add items from the menu to start dining orders!</p>
              </div>
            )}
          </div>
        )}

        {/* Track Order Tab */}
        {activeTab === 'track' && (
          <div className="animate-slide-up space-y-4">
            <OrderTimeline order={activeOrder} />
            {activeOrder && activeOrder.payment_status === 'pending_payment' && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs text-center font-semibold">
                Payment request pending cashier approval via {activeOrder.payment_method?.toUpperCase()}.
                    </div>
            )}
          </div>
        )}

      </main>

      {/* Payment Method Selector Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setPayModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl flex flex-col gap-4 animate-slide-up border border-slate-100 text-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-black text-xl text-emerald-950">Select Payment Method</h3>
              </div>
              <button onClick={() => setPayModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Items List */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2.5xl text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Items Summary</span>
              <div className="max-h-24 overflow-y-auto pr-1 divide-y divide-slate-100/50 space-y-1">
                {activeOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 first:pt-0">
                    <span className="text-slate-600">
                      {item.is_addon ? '(Add-on) ' : ''}{item.item_name} <span className="font-bold font-mono text-slate-405">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-slate-500">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Details Breakdown */}
            <div className="space-y-1.5 border-b border-slate-100 pb-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              {gstAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST ({billingConfig?.gst_percentage || 0}%):</span>
                  <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
                </div>
              )}
              {serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge ({billingConfig?.service_charge_percentage || 0}%):</span>
                  <span className="font-mono">₹{serviceChargeAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-dashed border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-705">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: RefreshCw },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'CASH', label: 'Cash', icon: DollarSign },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    payMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-350 text-slate-500'
                  }`}
                >
                  <m.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handlePayRequest}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 mt-1"
            >
              <span>Confirm Checkout Request</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Banner */}
      {activeTab === 'menu' && cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-6 animate-slide-up no-print">
          <div className="bg-emerald-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-emerald-800/30">
            <div>
              <span className="text-[10px] text-emerald-450 font-bold block uppercase tracking-wider">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} {cart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'item' : 'items'} selected
              </span>
              <span className="text-sm font-black font-mono">₹{cart.reduce((sum, i) => sum + (i.price + (i.addons || []).reduce((s, ad) => s + ad.price, 0)) * i.quantity, 0)}</span>
            </div>
            <button
              onClick={() => setActiveTab('order')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5"
            >
              <span>View Basket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Google Review Modal Popup */}
      {reviewModalOpen && googleReviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4 animate-slide-up border border-slate-100 text-slate-800">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-1">
              <span className="text-3xl">⭐️</span>
            </div>
            
            <h3 className="font-display font-black text-xl text-slate-900">How was your dining experience?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thank you for dining with us! Your feedback helps us serve you better. Please take a moment to leave us a review on Google.
            </p>
            
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
              >
                Maybe Later
              </button>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-3 theme-primary-bg theme-primary-bg-hover text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <span>Write Review</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
