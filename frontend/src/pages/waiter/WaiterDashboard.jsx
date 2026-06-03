import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, Bell, Check, UtensilsCrossed, Calendar, Users, Coffee, Soup, Plus, AlertCircle, Volume2, X, Printer, Send, Gift, RefreshCw, VolumeX } from 'lucide-react';
import { createApi, agencyApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import { useTables } from '../../hooks/useTables';
import { useOrders } from '../../hooks/useOrders';
import { useReservations } from '../../hooks/useReservations';
import FloorPlan from '../../components/Tables/FloorPlan';
import StatusBadge from '../../components/shared/StatusBadge';
import NewOrderModal from '../../components/Orders/NewOrderModal';
import toast from 'react-hot-toast';
import { format, differenceInMinutes, parseISO } from 'date-fns';

const calculateTotalPayable = (order, discount, billingConfig) => {
  if (!order) return 0;
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || order.total || 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const gstEnabled = billingConfig?.gst_enabled;
  const gstPercent = billingConfig?.gst_percentage || 0;
  const gstAmount = gstEnabled ? (taxableAmount * gstPercent) / 100 : 0;
  const serviceChargeEnabled = billingConfig?.service_charge_enabled ?? true;
  const serviceChargePercent = serviceChargeEnabled ? (billingConfig?.service_charge_percentage || 0) : 0;
  const serviceChargeAmount = (taxableAmount * serviceChargePercent) / 100;
  return taxableAmount + gstAmount + serviceChargeAmount;
};

export default function WaiterDashboard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const api = createApi(restaurantId);
  const { socket, isConnected } = useSocket(restaurantId);

  const normalizeMethod = (method) => {
    if (!method) return 'cash';
    const m = method.toLowerCase();
    if (m === 'online' || m === 'upi') return 'upi';
    if (m === 'split') return 'split';
    if (m === 'cash') return 'cash';
    return 'cash';
  };

  const session = JSON.parse(sessionStorage.getItem('session') || '{}');
  const restaurantName = session.name || 'Restaurant';

  const { tables, loading: tablesLoading, refreshTables } = useTables(restaurantId, socket);
  const { orders, refreshOrders } = useOrders(restaurantId, socket);
  const { reservations } = useReservations(restaurantId, socket);

  const ordersRef = React.useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const [speechEnabled, setSpeechEnabled] = useState(() => {
    const saved = localStorage.getItem('waiter_speech_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSpeech = () => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('waiter_speech_enabled', JSON.stringify(next));
      return next;
    });
  };

  const [selectedTable, setSelectedTable] = useState(null);
  const [waiterCalls, setWaiterCalls] = useState({}); // tableNumber -> boolean
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentCustomerPhone, setCurrentCustomerPhone] = useState('');
  const [tableDetailsModalOpen, setTableDetailsModalOpen] = useState(false);
  const [modalTable, setModalTable] = useState(null);
  const [agencySettings, setAgencySettings] = useState({ logo_url: '' });
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'summary' | 'detail'
  const [printerSettings, setPrinterSettings] = useState({ enabled: false, size: '80mm' });
  const [restaurantConfig, setRestaurantConfig] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  // Settlement and payment states
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleMethod, setSettleMethod] = useState('cash'); // 'cash' | 'upi' | 'split'
  const [loading, setLoading] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [upiQrBase64, setUpiQrBase64] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [orderToSettle, setOrderToSettle] = useState(null);



  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await agencyApi.get('/agency/settings');
        setAgencySettings(data || { logo_url: '' });
      } catch (err) {
        console.warn('Failed to load settings', err);
      }
    };
    const fetchRestaurantConfig = async () => {
      try {
        const { data } = await api.get('/settings/config');
        if (data) {
          setRestaurantConfig(data);
          if (data.printing?.hardware) {
            setPrinterSettings({
              enabled: !!data.printing.hardware.enabled,
              size: data.printing.hardware.size || '80mm',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load restaurant config', err);
      }
    };
    loadSettings();
    fetchRestaurantConfig();
  }, []);

  // Trigger print when printOrder is set
  useEffect(() => {
    if (printOrder) {
      const timer = setTimeout(() => {
        window.print();
        setPrintOrder(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printOrder]);

  // Sync Settle modal states
  useEffect(() => {
    if (settleModalOpen && orderToSettle) {
      setWhatsappPhone(orderToSettle.customer_phone || '');
      const initialDiscount = orderToSettle.discount_amount || 0;
      setDiscountAmount(initialDiscount);
      setCouponCode(orderToSettle.coupon_code || '');
      const finalAmt = calculateTotalPayable(orderToSettle, initialDiscount, restaurantConfig?.billing);
      const normalized = normalizeMethod(orderToSettle.payment_method);
      setSettleMethod(normalized);
      if (normalized === 'cash') {
        setCashAmount(finalAmt);
        setOnlineAmount(0);
      } else if (normalized === 'upi') {
        setCashAmount(0);
        setOnlineAmount(finalAmt);
      } else if (normalized === 'split') {
        const ca = orderToSettle.cash_amount !== undefined && orderToSettle.cash_amount !== null && orderToSettle.cash_amount > 0 ? orderToSettle.cash_amount : finalAmt / 2;
        const oa = orderToSettle.online_amount !== undefined && orderToSettle.online_amount !== null && orderToSettle.online_amount > 0 ? orderToSettle.online_amount : finalAmt / 2;
        setCashAmount(ca);
        setOnlineAmount(oa);
      }
    }
  }, [settleModalOpen, orderToSettle, restaurantConfig]);

  // Sync UPI QR generation
  useEffect(() => {
    if (!settleModalOpen || !orderToSettle) return;
    const finalPayable = calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing);
    const qrAmt = settleMethod === 'split' ? onlineAmount : finalPayable;

    if ((settleMethod === 'upi' || settleMethod === 'split') && qrAmt > 0) {
      const fetchQr = async () => {
        try {
          setLoadingQr(true);
          const { data } = await api.get(`/settings/upi-qr?amount=${qrAmt}`);
          setUpiQrBase64(data.qr_base64);
        } catch (err) {
          console.error(err);
          setUpiQrBase64('');
        } finally {
          setLoadingQr(false);
        }
      };
      fetchQr();
    } else {
      setUpiQrBase64('');
    }
  }, [settleMethod, onlineAmount, settleModalOpen, discountAmount, orderToSettle, restaurantConfig]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !orderToSettle) return;

    try {
      setApplyingCoupon(true);
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        amount: orderToSettle.total
      });
      if (data.valid) {
        setDiscountAmount(data.discount_amount);
        const newTotal = calculateTotalPayable(orderToSettle, data.discount_amount, restaurantConfig?.billing);
        if (settleMethod === 'cash' || settleMethod === 'upi') {
          setCashAmount(settleMethod === 'cash' ? newTotal : 0);
          setOnlineAmount(settleMethod === 'upi' ? newTotal : 0);
        } else {
          setCashAmount(newTotal);
          setOnlineAmount(0);
        }
        toast.success(`Coupon applied successfully! Discount of ₹${data.discount_amount} credited.`);
      } else {
        toast.error(data.message || 'Invalid coupon');
        setDiscountAmount(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to validate coupon');
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCashAmountChange = (val) => {
    const cash = parseFloat(val) || 0;
    const finalTotal = calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing);
    setCashAmount(cash);
    setOnlineAmount(Math.max(0, finalTotal - cash));
  };

  const handleOnlineAmountChange = (val) => {
    const online = parseFloat(val) || 0;
    const finalTotal = calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing);
    setOnlineAmount(online);
    setCashAmount(Math.max(0, finalTotal - online));
  };

  const handleSendWhatsAppBill = async (orderId) => {
    if (!whatsappPhone || !/^\d{10}$/.test(whatsappPhone)) {
      toast.error('WhatsApp phone number must be exactly 10 digits');
      return;
    }
    const targetOrder = orderToSettle || orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const finalTotal = targetOrder.total - discountAmount;
    try {
      await api.post(`/orders/${targetOrder.id}/send-whatsapp`, { phone: whatsappPhone });
      const reviewLink = targetOrder.google_review_url || 'https://google.com';
      const msg = `Dear Customer, your bill for Order #${targetOrder.id} at ${restaurantName} is ₹${finalTotal}. Thank you for dining with us! Kindly leave a Google review here: ${reviewLink}`;
      window.open(`https://wa.me/91${whatsappPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      toast.success('WhatsApp bill link opened and sent!');
    } catch (e) {
      console.warn('Failed to send simulated WhatsApp');
      toast.error('Failed to send simulated WhatsApp');
    }
  };

  const handlePrintReceipt = (order) => {
    setReceiptOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleSettleOrder = async () => {
    if (!orderToSettle) return;
    const finalTotal = calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing);

    if (settleMethod === 'split') {
      if (Math.abs(parseFloat(cashAmount) + parseFloat(onlineAmount) - finalTotal) > 0.05) {
        toast.error(`Split amounts (Cash: ₹${cashAmount}, Online: ₹${onlineAmount}) must equal total of ₹${finalTotal}`);
        return;
      }
    }

    if (whatsappPhone && !/^\d{10}$/.test(whatsappPhone)) {
      toast.error('WhatsApp phone number must be exactly 10 digits');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/orders/${orderToSettle.id}/settle`, {
        payment_method: settleMethod,
        cash_amount: settleMethod === 'split' ? parseFloat(cashAmount) : undefined,
        online_amount: settleMethod === 'split' ? parseFloat(onlineAmount) : undefined,
        discount_amount: parseFloat(discountAmount),
        coupon_code: couponCode
      });
      toast.success(`Order #${orderToSettle.id} settled successfully!`);
      
      // Auto-load invoice for printing
      const { data: settledOrder } = await api.get(`/orders/${orderToSettle.id}`);
      setReceiptOrder(settledOrder);

      setSettleModalOpen(false);
      setTableDetailsModalOpen(false);
      setSelectedTable(null);
      refreshOrders();
      refreshTables();

      // Trigger automatic printing after a short delay
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to settle order');
    } finally {
      setLoading(false);
    }
  };

  // Loud Beep Audio Utility
  const playLoudSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Beep 1
      const osc1 = audioCtx.createOscillator();
      const gainNode1 = audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc1.connect(gainNode1);
      gainNode1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.12);
      
      // Beep 2
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gainNode2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gainNode2.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc2.connect(gainNode2);
        gainNode2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.2);
      }, 150);
    } catch (e) {
      console.warn('Audio failed:', e);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join-table', { tableNumber: '*' });

    const handleWaiterCall = ({ table, tableNumber }) => {
      const tblNum = table || tableNumber;
      if (!tblNum) return;
      playLoudSound();
      if (speechEnabled) {
        speakText(`टेबल ${tblNum} पर वेटर को बुलाया गया है`);
      }
      setWaiterCalls((prev) => ({ ...prev, [tblNum]: true }));
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: `Table ${tblNum} Called!`,
          time: new Date(),
          type: 'call',
        },
        ...prev,
      ]);
      toast(`Table ${tblNum} is calling for attention!`, {
        icon: '🔔',
        style: {
          background: '#f59e0b',
          color: '#ffffff',
          fontWeight: 'bold',
        },
        duration: 5000,
      });
    };

    const handleOrderUpdated = ({ order }) => {
      if (!order) return;
      
      const existingOrder = ordersRef.current.find((o) => o.id === order.id);
      if (existingOrder && existingOrder.status !== order.status) {
        let statusHindi = '';
        if (order.status === 'ready') statusHindi = 'तैयार है';
        else if (order.status === 'preparing') statusHindi = 'तैयार हो रहा है';
        else if (order.status === 'served') statusHindi = 'परोसा जा चुका है';
        else if (order.status === 'paid') statusHindi = 'का भुगतान हो गया है';
        else statusHindi = order.status;

        const msg = `टेबल ${order.table_number || order.table_id} का ऑर्डर ${statusHindi}`;
        playLoudSound();
        if (speechEnabled) {
          speakText(msg);
        }
      }

      if (order.status === 'ready' && (!existingOrder || existingOrder.status !== 'ready')) {
        toast.success(`Order #${order.id} for Table ${order.table_number} is READY!`, {
          icon: '🍳',
          duration: 6000,
        });
      }
      refreshOrders();
      refreshTables();
    };

    const handleNewOrder = (order) => {
      playLoudSound();
      if (order && speechEnabled) {
        speakText(`टेबल ${order.table_number || order.table_id} का नया ऑर्डर प्राप्त हुआ है`);
      }
      refreshOrders();
      refreshTables();
    };

    socket.on('waiter:called', handleWaiterCall);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:new', handleNewOrder);

    return () => {
      socket.off('waiter:called', handleWaiterCall);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:new', handleNewOrder);
    };
  }, [socket, speechEnabled]);

  // Keep selected table updated with latest list details
  const activeTable = tables.find((t) => t.id === selectedTable?.id) || selectedTable;

  // Find active orders for selected table (non-paid/non-cancelled)
  const activeOrder = orders.find(
    (o) => o.table_id === activeTable?.id && o.status !== 'paid' && o.status !== 'cancelled'
  );



  // Find today's reservation within 60 min for selected table
  const nextReservation = reservations.find((r) => {
    if (r.table_id !== activeTable?.id || r.status !== 'confirmed') return false;
    const [hours, minutes] = r.reservation_time.split(':').map(Number);
    const resDate = new Date();
    resDate.setHours(hours, minutes, 0, 0);
    const diff = differenceInMinutes(resDate, new Date());
    return diff >= 0 && diff <= 60;
  });

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setActiveTab('detail');
    // Dismiss call indicator once waiter views/selects table
    if (waiterCalls[table.number]) {
      setWaiterCalls((prev) => ({ ...prev, [table.number]: false }));
    }
  };

  const handleQuickStatusChange = async (status) => {
    try {
      await api.put(`/tables/${activeTable.id}`, {
        status,
      });
      toast.success(`Table ${activeTable.number} marked as ${status}`);
      refreshTables();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change table status');
    }
  };

  const handleOrderStatusAdvance = async (nextStatus) => {
    if (!activeOrder) return;
    try {
      await api.put(`/orders/${activeOrder.id}`, { status: nextStatus });
      toast.success(`Order #${activeOrder.id} status updated to ${nextStatus}`);
      refreshOrders();
      refreshTables();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };



  const handleOrderSubmit = async (orderData) => {
    try {
      if (activeOrder) {
        // Adding items to existing order
        await api.post(`/orders/${activeOrder.id}/items`, { items: orderData.items });
        toast.success(`Added ${orderData.items.length} items to order #${activeOrder.id}`);
      } else {
        // Create new order
        await api.post('/orders', {
          ...orderData,
          waiter_name: session.staffName || undefined,
        });
        toast.success(`Created new order for Table ${activeTable?.number || orderData.table_number}`);
        setCurrentCustomerPhone('');
      }
      refreshOrders();
      refreshTables();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save order');
    }
  };

  const handleTableDoubleClick = (table) => {
    handleTableSelect(table);
    setModalTable(table);
    setTableDetailsModalOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('session');
    navigate(`/r/${restaurantId}/login`);
  };



  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 flex flex-col font-body">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-amber-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {agencySettings.logo_url ? (
            <img src={agencySettings.logo_url} alt="Agency Logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-md">
              {restaurantName[0] || 'W'}
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold font-display tracking-wide uppercase text-amber-800">
              {restaurantName}
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">
              Waiter Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-rose-500 animate-pulse'}`} />
            <span className="text-slate-500 font-mono text-[10px] uppercase">
              {isConnected ? 'Syncing' : 'No connection'}
            </span>
          </div>

          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-xl transition-all font-bold text-xs shadow-xs ${
              speechEnabled
                ? 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title={speechEnabled ? "Mute Speech Alerts" : "Enable Speech Alerts"}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{speechEnabled ? "Speech On" : "Speech Off"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Selector */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 sticky top-16 z-10 shadow-xs">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'tables'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Floor Plan
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'summary'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table Status
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
              activeTab === 'detail'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Selected Table {activeTable && `(${activeTable.number})`}
            {waiterCalls[activeTable?.number] && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 border border-white rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl w-full mx-auto items-start min-h-0">
        {/* Left Side: Floor Plan */}
        <div className={`lg:col-span-2 space-y-4 ${activeTab === 'tables' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-800">Dining Room Floor Plan</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                {tables.length} tables
              </span>
            </div>
            
            {/* Custom wrapper with call alert badges mapped over floorplan cards */}
            <div className="relative">
              <FloorPlan
                tables={tables.map(t => ({
                  ...t,
                  // Inject call state so floor plan cards can display indicators
                  status: waiterCalls[t.number] ? 'ready' : t.status, 
                }))}
                onTableClick={handleTableSelect}
                onTableDoubleClick={handleTableDoubleClick}
                selectedTableId={activeTable?.id}
              />
            </div>
          </div>

          {/* Quick Alert Feed */}
          {notifications.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-3">Live alerts feed</h4>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <Bell className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-bounce" />
                    <span className="font-semibold">{n.title}</span>
                    <span className="ml-auto text-[10px] text-slate-455 font-mono">{format(n.time, 'HH:mm:ss')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Selected Table drawer */}
        <div className={`lg:col-span-1 space-y-6 ${activeTab === 'detail' || activeTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
          <div className={`${activeTab === 'detail' ? 'block' : 'hidden lg:block'}`}>
            {activeTable ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-slide-up">
                
                {/* Table Header Details */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display font-black text-3xl text-slate-800">
                      Table {activeTable.number}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mt-0.5">
                      Section: {activeTable.section} | Cap: {activeTable.capacity} guests
                    </span>
                  </div>
                  <StatusBadge status={activeTable.status} />
                </div>

                {/* Reservation Indicator */}
                {nextReservation && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Reservation at <strong>{nextReservation.reservation_time}</strong> for {nextReservation.customer_name}
                    </span>
                  </div>
                )}

                {/* Call help indicator */}
                {waiterCalls[activeTable.number] && (
                  <div className="p-3.5 bg-amber-50 border border-amber-205 rounded-xl text-xs text-amber-700 flex items-center justify-between gap-3 animate-pulse">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Bell className="w-4 h-4 text-amber-550" /> Guest needs assistance!
                    </span>
                    <button
                      onClick={() => setWaiterCalls(prev => ({ ...prev, [activeTable.number]: false }))}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-555 text-white rounded-lg font-bold text-[10px] transition-colors"
                    >
                      Clear Call
                    </button>
                  </div>
                )}

                {/* Active Order Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Active Dining Order
                  </h4>

                  {activeOrder ? (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2.5xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div>
                          <span className="text-slate-400 text-[10px] font-mono block">Order ID: #{activeOrder.id}</span>
                          {activeOrder.customer_phone && (
                            <span className="text-[9px] text-slate-500 font-mono block">Phone: {activeOrder.customer_phone}</span>
                          )}
                          <span className="text-xs font-semibold text-slate-700 mt-1 block">Status: {activeOrder.status.toUpperCase()}</span>
                        </div>
                        <span className="text-lg font-bold font-mono text-emerald-600">₹{activeOrder.total}</span>
                      </div>

                      {/* Items feed */}
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {activeOrder.items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center gap-3 text-xs py-1 border-b border-slate-205 last:border-b-0">
                            <span className="text-slate-655">
                              <strong className="text-amber-600 font-mono font-bold">x{item.quantity}</strong> {item.item_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-455 font-mono">₹{item.price * item.quantity}</span>
                              <button
                                onClick={async () => {
                                  if (confirm(`Cancel "${item.item_name}" from this order?`)) {
                                    try {
                                      await api.delete(`/orders/${activeOrder.id}/items/${item.id}`);
                                      toast.success(`Cancelled ${item.item_name}`);
                                      refreshOrders();
                                      refreshTables();
                                    } catch (err) {
                                      console.error(err);
                                      toast.error('Failed to cancel item');
                                    }
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-600 p-0.5 rounded transition-colors"
                                title="Cancel Item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Action Buttons */}
                      <div className="space-y-2 pt-3 border-t border-slate-200">
                        {activeOrder.status === 'pending' && (
                          <button
                            onClick={() => handleOrderStatusAdvance('preparing')}
                            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Mark: Preparing
                          </button>
                        )}
                        {activeOrder.status === 'preparing' && (
                          <button
                            onClick={() => handleOrderStatusAdvance('ready')}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-sm animate-pulse"
                          >
                            Mark: Food Ready
                          </button>
                        )}
                        {activeOrder.status === 'ready' && (
                          <button
                            onClick={() => handleOrderStatusAdvance('served')}
                            className="w-full py-2 bg-green-600 hover:bg-green-550 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Mark: Served
                          </button>
                        )}


                        <button
                          onClick={() => {
                            setOrderToSettle(activeOrder);
                            setSettleMethod(normalizeMethod(activeOrder.payment_method));
                            setSettleModalOpen(true);
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:-translate-y-0.5"
                        >
                          Settle Order (Bill Checkout)
                        </button>

                        <button
                          onClick={() => handlePrintReceipt(activeOrder)}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Bill Invoice</span>
                        </button>

                        <button
                          onClick={() => setPrintOrder(activeOrder)}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print KOT Slip</span>
                        </button>

                        <button
                          onClick={() => setOrderModalOpen(true)}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-655 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Items</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <Coffee className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400">No active dining order placed yet</p>
                      <button
                        onClick={() => {
                          const userPhone = prompt("Please enter customer's 10-digit phone number first to start the order:");
                          if (!userPhone) return;
                          const phone = userPhone.trim().replace(/\D/g, '');
                          if (phone.length !== 10) {
                            toast.error("Exactly 10-digit phone number is required.");
                            return;
                          }
                          setCurrentCustomerPhone(phone);
                          setOrderModalOpen(true);
                        }}
                        className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-555 text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Plus className="w-4 h-4" /> Start Dining Order
                      </button>
                    </div>
                  )}
                </div>

                {/* Table Seating status overrides */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-2.5">
                    Seat Status Overrides
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickStatusChange('available')}
                      disabled={activeTable.status === 'available'}
                      className="py-1.5 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl text-green-600 hover:bg-green-50 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleQuickStatusChange('occupied')}
                      disabled={activeTable.status === 'occupied'}
                      className="py-1.5 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Occupied
                    </button>
                    <button
                      onClick={() => handleQuickStatusChange('reserved')}
                      disabled={activeTable.status === 'reserved'}
                      className="py-1.5 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Reserved
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400">
                <Soup className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-semibold">Select Table</p>
                <p className="text-xs text-slate-400 mt-1">Tap a table card to modify its status, start dining orders, or view items.</p>
              </div>
            )}
          </div>

          {/* Table Status Summary Panel (Occupied and Reserved list) */}
          <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 ${activeTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
            <h3 className="font-display font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-700" />
              Table Status Summary
            </h3>
            
            <div className="space-y-3">
              {/* Occupied / Preparing / Pending Tables */}
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                  Occupied ({tables.filter(t => t.status === 'occupied' || t.status === 'preparing' || t.status === 'ready' || t.status === 'pending').length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tables.filter(t => t.status === 'occupied' || t.status === 'preparing' || t.status === 'ready' || t.status === 'pending').length === 0 ? (
                    <span className="text-[11px] text-slate-400">None</span>
                  ) : (
                    tables.filter(t => t.status === 'occupied' || t.status === 'preparing' || t.status === 'ready' || t.status === 'pending').map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleTableSelect(t)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all"
                      >
                        T-{t.number}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Reserved Tables */}
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Reserved ({tables.filter(t => t.status === 'reserved').length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tables.filter(t => t.status === 'reserved').length === 0 ? (
                    <span className="text-[11px] text-slate-400">None</span>
                  ) : (
                    tables.filter(t => t.status === 'reserved').map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleTableSelect(t)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all"
                      >
                        T-{t.number}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Creation Modals */}
      {/* Order Creation Modals */}
      <NewOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
        restaurantId={restaurantId}
        tableId={activeTable?.id}
        tableNumber={activeTable?.number}
        existingOrderId={activeOrder?.id}
        initialCustomerPhone={currentCustomerPhone}
      />

      {/* POS Settle Dialog Modal */}
      {settleModalOpen && orderToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSettleModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-205 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 animate-slide-up text-slate-800 no-print max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-blue-700">Settle Order Billing</h3>
                <p className="text-xs text-slate-500 mt-1">Table {selectedTable?.number} | Order #{orderToSettle.id}</p>
              </div>
              <button onClick={() => setSettleModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Items List */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2.5xl text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Items Summary</span>
              <div className="max-h-24 overflow-y-auto pr-1 divide-y divide-slate-100/50 space-y-1">
                {orderToSettle.items?.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 first:pt-0">
                    <span className="text-slate-600">
                      {item.is_addon ? '(Add-on) ' : ''}{item.item_name} <span className="font-bold font-mono text-slate-405">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-slate-500">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2">
              {(() => {
                const subtotal = orderToSettle.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || orderToSettle.total || 0;
                const taxableAmount = Math.max(0, subtotal - discountAmount);
                const gstEnabled = restaurantConfig?.billing?.gst_enabled;
                const gstPercent = restaurantConfig?.billing?.gst_percentage || 0;
                const gstAmount = gstEnabled ? (taxableAmount * gstPercent) / 100 : 0;
                const serviceChargeEnabled = restaurantConfig?.billing?.service_charge_enabled ?? true;
                const serviceChargePercent = serviceChargeEnabled ? (restaurantConfig?.billing?.service_charge_percentage || 0) : 0;
                const serviceChargeAmount = (taxableAmount * serviceChargePercent) / 100;

                return (
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Discount:</span>
                        <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {gstEnabled && (
                      <div className="flex justify-between">
                        <span>GST ({gstPercent}%):</span>
                        <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {serviceChargePercent > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge ({serviceChargePercent}%):</span>
                        <span className="font-mono">₹{serviceChargeAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-655 font-bold uppercase tracking-wider">Final Payable Total:</span>
                <span className="text-2xl font-bold font-mono text-emerald-600">₹{calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing).toFixed(2)}</span>
              </div>
            </div>

            {/* Coupons Section */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promo Coupon Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs uppercase font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{applyingCoupon ? '...' : 'Apply'}</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Settle Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'Cash Only' },
                  { id: 'upi', label: 'UPI / Online' },
                  { id: 'split', label: 'Split Payment' },
                ].map((m) => (
                  <button
                     key={m.id}
                     type="button"
                     onClick={() => {
                       setSettleMethod(m.id);
                       const finalPayableTotal = calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing);
                       if (m.id === 'cash') {
                         setCashAmount(finalPayableTotal);
                         setOnlineAmount(0);
                       } else if (m.id === 'upi') {
                         setCashAmount(0);
                         setOnlineAmount(finalPayableTotal);
                       } else {
                         setCashAmount(finalPayableTotal / 2);
                         setOnlineAmount(finalPayableTotal / 2);
                       }
                     }}
                     className={`py-2 px-3 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                       settleMethod === m.id
                         ? 'border-blue-600 bg-blue-50 text-blue-700 font-black'
                         : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                     }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Options Details */}
            {settleMethod === 'split' && (
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-205">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cash Share</label>
                  <input 
                    type="number" 
                    value={cashAmount}
                    onChange={(e) => handleCashAmountChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                    min="0"
                    max={calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing)}
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Online Share</label>
                  <input 
                    type="number" 
                    value={onlineAmount}
                    onChange={(e) => handleOnlineAmountChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                    min="0"
                    max={calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing)}
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Dynamic UPI QR Code Display */}
            {(settleMethod === 'upi' || settleMethod === 'split') && (
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2.5xl text-center space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scan to Pay via UPI QR</span>
                
                {loadingQr ? (
                  <div className="w-32 h-32 bg-slate-100 rounded-xl mx-auto flex items-center justify-center border border-slate-200">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                ) : upiQrBase64 ? (
                  <div className="bg-white p-2.5 border border-slate-200 rounded-xl w-36 h-36 mx-auto flex items-center justify-center shadow-sm">
                    <img src={upiQrBase64} alt="UPI Payment QR" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-rose-50 rounded-xl mx-auto flex items-center justify-center border border-rose-100 text-rose-500 text-[10px] p-2 leading-relaxed">
                    UPI Merchant ID is not configured in Billing settings.
                  </div>
                )}
                
                <span className="text-[8.5px] text-slate-400 uppercase tracking-widest font-mono font-semibold">
                  Online Share: ₹{(settleMethod === 'split' ? onlineAmount : calculateTotalPayable(orderToSettle, discountAmount, restaurantConfig?.billing)).toFixed(2)}
                </span>
              </div>
            )}

            {/* WhatsApp billing share trigger */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Customer Billing Share</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={10}
                  placeholder="10-digit customer number"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppBill(orderToSettle.id)}
                  className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Settle Action Button */}
            <button
              onClick={handleSettleOrder}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-sm mt-2 hover:-translate-y-0.5 transition-transform"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Payment & Close Bill</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Details Modal */}
      {tableDetailsModalOpen && modalTable && (() => {
        const tableActiveOrder = orders.find(
          (o) => o.table_id === modalTable.id && o.status !== 'paid' && o.status !== 'cancelled'
        );
        const tableNextReservation = reservations.find((r) => {
          if (r.table_id !== modalTable.id || r.status !== 'confirmed') return false;
          const [hours, minutes] = r.reservation_time.split(':').map(Number);
          const resDate = new Date();
          resDate.setHours(hours, minutes, 0, 0);
          const diff = differenceInMinutes(resDate, new Date());
          return diff >= 0 && diff <= 60;
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setTableDetailsModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-slide-up text-slate-800">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-black text-3xl text-slate-900">
                    Table {modalTable.number}
                  </h3>
                  <p className="text-[10px] text-slate-455 font-mono uppercase tracking-wider mt-0.5">
                    SECTION: {modalTable.section} | CAP: {modalTable.capacity} GUESTS
                  </p>
                </div>
                <StatusBadge status={modalTable.status} />
              </div>

              {/* Reservation Indicator */}
              {tableNextReservation && (
                <div className="p-3 bg-blue-50 border border-blue-105 rounded-xl text-xs text-blue-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Reservation at <strong>{tableNextReservation.reservation_time}</strong> for {tableNextReservation.customer_name}
                  </span>
                </div>
              )}

              {/* Help Alert indicator */}
              {waiterCalls[modalTable.number] && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center justify-between gap-3 animate-pulse">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Bell className="w-4 h-4 text-amber-500" /> Guest needs assistance!
                  </span>
                  <button
                    onClick={() => setWaiterCalls(prev => ({ ...prev, [modalTable.number]: false }))}
                    className="px-2.5 py-1 bg-amber-650 hover:bg-amber-550 text-white rounded-lg font-bold text-[10px]"
                  >
                    Clear Call
                  </button>
                </div>
              )}

              {/* Active Dining Order Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ACTIVE DINING ORDER
                </h4>

                {tableActiveOrder ? (
                  <div className="bg-slate-50 p-4 border border-slate-100/80 rounded-2.5xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="text-slate-400 text-[10px] font-mono block">Order ID: #{tableActiveOrder.id}</span>
                        {tableActiveOrder.customer_phone && (
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Phone: {tableActiveOrder.customer_phone}</span>
                        )}
                        <span className="text-xs font-semibold text-slate-700 mt-1 block">Status: {tableActiveOrder.status.toUpperCase()}</span>
                      </div>
                      <span className="text-lg font-bold font-mono text-emerald-600">₹{tableActiveOrder.total}</span>
                    </div>

                    {/* Items feed */}
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {tableActiveOrder.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center gap-3 text-xs py-1 border-b border-slate-200/50 last:border-b-0">
                          <span className="text-slate-655">
                            <strong className="text-amber-600 font-mono font-bold">x{item.quantity}</strong> {item.item_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-455 font-mono">₹{item.price * item.quantity}</span>
                            <button
                              onClick={async () => {
                                if (confirm(`Cancel "${item.item_name}" from this order?`)) {
                                  try {
                                    await api.delete(`/orders/${tableActiveOrder.id}/items/${item.id}`);
                                    toast.success(`Cancelled ${item.item_name}`);
                                    refreshOrders();
                                    refreshTables();
                                  } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to cancel item');
                                  }
                                }
                              }}
                              className="text-rose-500 hover:text-rose-600 p-0.5 rounded transition-colors"
                              title="Cancel Item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                      {tableActiveOrder.status === 'pending' && (
                        <button
                          onClick={() => {
                            api.put(`/orders/${tableActiveOrder.id}`, { status: 'preparing' })
                              .then(() => { toast.success('Order status updated'); refreshOrders(); refreshTables(); })
                              .catch(err => { console.error(err); toast.error('Failed'); });
                          }}
                          className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          Mark: Preparing
                        </button>
                      )}
                      {tableActiveOrder.status === 'preparing' && (
                        <button
                          onClick={() => {
                            api.put(`/orders/${tableActiveOrder.id}`, { status: 'ready' })
                              .then(() => { toast.success('Order status updated'); refreshOrders(); refreshTables(); })
                              .catch(err => { console.error(err); toast.error('Failed'); });
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          Mark: Food Ready
                        </button>
                      )}
                      {tableActiveOrder.status === 'ready' && (
                        <button
                          onClick={() => {
                            api.put(`/orders/${tableActiveOrder.id}`, { status: 'served' })
                              .then(() => { toast.success('Order status updated'); refreshOrders(); refreshTables(); })
                              .catch(err => { console.error(err); toast.error('Failed'); });
                          }}
                          className="w-full py-2 bg-green-600 hover:bg-green-550 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          Mark: Served
                        </button>
                      )}


                      <button
                        onClick={() => {
                          setSelectedTable(modalTable);
                          setOrderToSettle(tableActiveOrder);
                          setSettleModalOpen(true);
                        }}
                        className="col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                      >
                        Settle Order (Bill Checkout)
                      </button>

                      <button
                        onClick={() => handlePrintReceipt(tableActiveOrder)}
                        className="col-span-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" /> Print Bill Invoice
                      </button>

                      <button
                        onClick={() => setPrintOrder(tableActiveOrder)}
                        className="col-span-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 mt-1"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print KOT Slip</span>
                      </button>

                      <button
                        onClick={() => {
                          setTableDetailsModalOpen(false);
                          setSelectedTable(modalTable);
                          setOrderModalOpen(true);
                        }}
                        className="col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Items</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2.5xl flex flex-col items-center justify-center gap-2">
                    <Coffee className="w-10 h-10 text-slate-300" />
                    <p className="text-xs text-slate-400">No active dining order placed yet</p>
                    
                    <button
                      onClick={async () => {
                        const userPhone = prompt("Please enter customer's 10-digit phone number:");
                        if (!userPhone) return;
                        const phone = userPhone.trim().replace(/\D/g, '');
                        if (phone.length !== 10) {
                          toast.error("Exactly 10-digit phone number is required.");
                          return;
                        }
                        setCurrentCustomerPhone(phone);
                        
                        const activePhoneOrder = orders.find(
                          (o) => o.customer_phone === phone && o.status !== 'paid' && o.status !== 'cancelled'
                        );
                        
                        if (activePhoneOrder) {
                          if (activePhoneOrder.table_id !== modalTable.id) {
                            try {
                              await api.put(`/orders/${activePhoneOrder.id}`, { table_id: modalTable.id, table_number: modalTable.number });
                              toast.success(`Linked active order #${activePhoneOrder.id} to Table ${modalTable.number}`);
                              refreshOrders();
                              refreshTables();
                            } catch (e) {
                              console.error(e);
                            }
                          }
                        }
                        
                        setTableDetailsModalOpen(false);
                        setSelectedTable(modalTable);
                        setOrderModalOpen(true);
                      }}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 mt-1 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Start Dining Order</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Overrides */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  SEAT STATUS OVERRIDES
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/tables/${modalTable.id}`, { status: 'available' });
                        toast.success('Table status updated');
                        setTableDetailsModalOpen(false);
                        refreshTables();
                      } catch (err) { toast.error('Failed to update status'); }
                    }}
                    className="py-2 text-[10px] font-black bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl"
                  >
                    Available
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/tables/${modalTable.id}`, { status: 'occupied' });
                        toast.success('Table status updated');
                        setTableDetailsModalOpen(false);
                        refreshTables();
                      } catch (err) { toast.error('Failed to update status'); }
                    }}
                    className="py-2 text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-700 rounded-xl"
                  >
                    Occupied
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/tables/${modalTable.id}`, { status: 'reserved' });
                        toast.success('Table status updated');
                        setTableDetailsModalOpen(false);
                        refreshTables();
                      } catch (err) { toast.error('Failed to update status'); }
                    }}
                    className="py-2 text-[10px] font-black bg-blue-50 border border-blue-200 text-blue-700 rounded-xl"
                  >
                    Reserved
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Scoped printer style sheets */}
      <style>{`
        #print-receipt-section {
          display: none;
        }
        @media print {
          /* Hide everything except the visible print section */
          body * {
            visibility: hidden;
          }
          #print-kot-section, #print-kot-section * {
            visibility: visible;
          }
          #print-receipt-section, #print-receipt-section * {
            visibility: visible;
          }
          #print-kot-section {
            position: absolute;
            left: 0;
            top: 0;
            width: ${printerSettings.size === '58mm' ? '58mm' : '80mm'};
            margin: 0;
            padding: 5px;
            background: white;
            color: black;
            font-family: monospace;
            font-size: ${printerSettings.size === '58mm' ? '8.5px' : '10px'} !important;
            line-height: 1.3 !important;
            box-sizing: border-box !important;
          }
          #print-receipt-section {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: ${printerSettings.size === '58mm' ? '58mm' : '80mm'};
            padding: 2mm;
            background: white !important;
            color: black !important;
            font-family: monospace !important;
            font-size: ${printerSettings.size === '58mm' ? '8.5px' : '10px'} !important;
            line-height: 1.3 !important;
            box-sizing: border-box;
          }
          @page {
            size: ${printerSettings.size === '58mm' ? '58mm' : '80mm'} auto;
            margin: 0;
          }
        }
      `}</style>

      {/* Dynamic Hidden Receipt Container */}
      {receiptOrder && (
        <div id="print-receipt-section">
          {/* Logo */}
          {restaurantConfig?.logo_url ? (
            <img src={restaurantConfig.logo_url} alt="Logo" className="w-10 h-10 rounded-full mx-auto object-contain bg-white border border-slate-200 mb-1" style={{ display: 'block', margin: '0 auto' }} />
          ) : (
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-[9px] mx-auto uppercase mb-1" style={{ display: 'flex', margin: '0 auto', alignItems: 'center', justifyContent: 'center' }}>
              {restaurantConfig?.name ? restaurantConfig.name.charAt(0) : 'L'}
            </div>
          )}
          
          <div className="text-center font-bold text-[12px] uppercase mb-1">{restaurantConfig?.name || restaurantName}</div>
          
          {restaurantConfig?.printing?.bill_setting?.show_address && restaurantConfig?.location && (
            <div className="text-center text-[8px] text-slate-800 leading-normal mb-1">{restaurantConfig.location}</div>
          )}
          
          {restaurantConfig?.fssai_compliance && (
            <div className="text-center text-[7.5px] text-slate-800 mb-1">FSSAI No: {restaurantConfig.fssai_compliance}</div>
          )}
          
          <div className="border-b border-dashed border-black pb-1.5 mb-2"></div>
          
          {/* Metadata */}
          <div className="space-y-1 text-[8.5px] mb-3">
            <div className="flex justify-between">
              <span>Table: {receiptOrder.table_number || 'Takeaway'}</span>
              <span>Order: #{receiptOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Settled Date: {new Date(receiptOrder.settled_at || receiptOrder.created_at).toLocaleDateString()}</span>
              <span>Settled Time: {new Date(receiptOrder.settled_at || receiptOrder.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            {restaurantConfig?.printing?.bill_setting?.show_customer_info && receiptOrder.customer_phone && (
              <div className="text-left font-bold">Cust. Phone: {receiptOrder.customer_phone}</div>
            )}
            <div className="border-b border-dashed border-black pb-1"></div>
          </div>

          {/* Items */}
          <div className="space-y-1 text-[8.5px] mb-3">
            <div className="flex justify-between font-bold">
              <span className="w-1/2">Item Description</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/3 text-right">Price</span>
            </div>
            {receiptOrder.items?.map((item) => {
              const itemAddons = item.addons || (item.addons_json ? (() => {
                try { return JSON.parse(item.addons_json); } catch (e) { return []; }
              })() : []);
              return (
                <div key={item.id} className="mb-1">
                  <div className="flex justify-between">
                    <span className="w-1/2 truncate">
                      {item.is_addon ? '(Add-on) ' : ''}{item.item_name}
                    </span>
                    <span className="w-1/6 text-center">{item.quantity}</span>
                    <span className="w-1/3 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {itemAddons && itemAddons.length > 0 && (
                    <div className="pl-3 text-[7.5px] text-slate-700 italic space-y-0.5" style={{ paddingLeft: '8px' }}>
                      {itemAddons.map((ad, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>+ {ad.name}</span>
                          <span>₹{(ad.price * item.quantity).toFixed(2)} (Incl.)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="border-b border-dashed border-black pb-1"></div>
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-[8.5px] mb-4">
            {(() => {
              const subtotal = receiptOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || receiptOrder.total;
              const discount = receiptOrder.discount_amount || 0;
              const afterDiscount = subtotal - discount;
              const gstEnabled = restaurantConfig?.billing?.gst_enabled;
              const gstPercent = restaurantConfig?.billing?.gst_percentage || 0;
              const serviceChargeEnabled = restaurantConfig?.billing?.service_charge_enabled ?? true;
              const serviceChargePercent = serviceChargeEnabled ? (restaurantConfig?.billing?.service_charge_percentage || 0) : 0;

              const gstAmt = gstEnabled ? (afterDiscount * gstPercent) / 100 : 0;
              const scAmt = (afterDiscount * serviceChargePercent) / 100;
              const grandTotal = afterDiscount + gstAmt + scAmt;

              return (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({receiptOrder.coupon_code || 'Coupon'})</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {gstEnabled && (
                    <div className="flex justify-between">
                      <span>GST ({gstPercent}%)</span>
                      <span>₹{gstAmt.toFixed(2)}</span>
                    </div>
                  )}
                  {serviceChargePercent > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge ({serviceChargePercent}%)</span>
                      <span>₹{scAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[10px] border-t border-dashed border-black pt-1">
                    <span>TOTAL PAYABLE</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[8px] mt-1 italic text-slate-655">
                    <span>Settle Mode:</span>
                    <span className="uppercase">{receiptOrder.payment_method}</span>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="border-b border-dashed border-black mb-2"></div>
          <div className="text-center text-[8.5px] leading-normal space-y-1">
            <p>{restaurantConfig?.printing?.bill_setting?.custom_footer || 'Thank you! Visit again.'}</p>
            <p className="text-[7px] text-slate-500">Powered by Bhoj360</p>
          </div>
        </div>
      )}

      {printOrder && (
        <div id="print-kot-section" className="hidden print:block text-black bg-white p-2">
          {/* KITCHEN ORDER TICKET (KOT) */}
          <div>
              <div className="text-center border-b border-dashed border-black pb-2 mb-2">
                <h2 className="font-bold text-sm uppercase">{restaurantName}</h2>
                <p className="text-[10px] font-bold">KITCHEN ORDER TICKET (KOT)</p>
                <p className="text-[10px] font-mono mt-0.5">
                  Order ID: #{printOrder.id}
                </p>
              </div>

              {restaurantConfig?.printing?.kot_setting?.prep_ticket_layout === 'detailed' ? (
                <div className="text-[11px] space-y-1.5 mb-2 font-mono border-b border-dashed border-black pb-2">
                  <div className="flex justify-between text-xs font-extrabold bg-black text-white px-1">
                    <span>TABLE: {printOrder.table_number || printOrder.table_id}</span>
                    <span>{printOrder.type?.toUpperCase()}</span>
                  </div>
                  {printOrder.waiter_name && (
                    <div className="font-extrabold text-[11px]">WAITER: {printOrder.waiter_name.toUpperCase()}</div>
                  )}
                  {printOrder.customer_name && (
                    <div>GUEST NAME: {printOrder.customer_name}</div>
                  )}
                  {printOrder.notes && (
                    <div className="bg-yellow-50 border-l-2 border-black pl-1 font-bold text-[11px] text-black">
                      INSTRUCTIONS: {printOrder.notes}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-600">
                    TIME: {new Date(printOrder.created_at || new Date()).toLocaleString('en-IN')}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] space-y-1 mb-2 font-mono">
                  <div className="flex justify-between">
                    <span>TABLE: {printOrder.table_number || printOrder.table_id}</span>
                    <span>TYPE: {printOrder.type?.toUpperCase()}</span>
                  </div>
                  {printOrder.waiter_name && (
                    <div>WAITER: {printOrder.waiter_name.toUpperCase()}</div>
                  )}
                  {printOrder.customer_name && (
                    <div>GUEST: {printOrder.customer_name}</div>
                  )}
                  <div className="text-[9px] text-slate-500 font-mono">
                    TIME: {new Date(printOrder.created_at || new Date()).toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <table className="w-full text-xs font-mono border-t border-b border-dashed border-black py-1 mb-2">
                <thead>
                  <tr className="border-b border-dashed border-black">
                    <th className="text-left py-0.5">Item</th>
                    <th className="text-right py-0.5">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items && printOrder.items.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="py-0.5 text-[11px]">
                        {item.is_addon ? <span className="font-bold mr-1">(Add-on)</span> : ''}
                        {item.item_name}
                        {item.notes && (
                          <div className="text-[9px] italic pl-2">
                            * Note: {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="text-right py-0.5 text-[11px]">x{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {printOrder.notes && (
                <div className="text-[10px] font-mono border-b border-dashed border-black pb-1 mb-2 italic">
                  <span className="font-bold">Instructions:</span> {printOrder.notes}
                </div>
              )}

              <div className="text-center text-[9px] font-mono pt-1">
                <p>--- End of Ticket ---</p>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
