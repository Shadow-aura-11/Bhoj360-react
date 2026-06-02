import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Landmark, Users, ShoppingCart, CheckSquare, Printer, Check, DollarSign, History, Volume2, LogOut, Plus, X, Gift, Send, RefreshCw } from 'lucide-react';
import { createApi, agencyApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import { useTables } from '../../hooks/useTables';
import { useOrders } from '../../hooks/useOrders';
import NewOrderModal from '../../components/Orders/NewOrderModal';
import toast from 'react-hot-toast';

export default function CashierDashboard() {
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
    return 'upi';
  };

  const [agencySettings, setAgencySettings] = useState({ logo_url: '' });
  const [config, setConfig] = useState(null);

  // Modals & form states
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleMethod, setSettleMethod] = useState('cash'); // 'cash' | 'upi' | 'split'
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Settle inputs & payment options states
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [upiQrBase64, setUpiQrBase64] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);

  // Cleanup history states
  const [deleteStart, setDeleteStart] = useState('');
  const [deleteEnd, setDeleteEnd] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeletePanel, setShowDeletePanel] = useState(false);

  // Load agency and restaurant settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await agencyApi.get('/agency/settings');
        if (data) {
          setAgencySettings(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const loadRestaurantConfig = async () => {
      try {
        const { data } = await api.get('/settings/config');
        if (data) {
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to load restaurant configuration', err);
      }
    };
    loadSettings();
    loadRestaurantConfig();
  }, []);

  const session = JSON.parse(sessionStorage.getItem('session') || '{}');
  const restaurantName = session.name || 'Restaurant';

  const { tables, refreshTables } = useTables(restaurantId, socket);
  const { orders, refreshOrders } = useOrders(restaurantId, socket);

  const [activeTab, setActiveTab] = useState('requests'); // 'tables' | 'requests' | 'history'
  const [selectedTable, setSelectedTable] = useState(null);

  // Receipt printing states
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Double tap gesture state
  const [lastTap, setLastTap] = useState({ tableId: null, time: 0 });

  // Computations
  const activeTable = tables.find(t => t.id === selectedTable?.id);
  const activeOrder = orders.find(o => o.table_id === selectedTable?.id && o.status !== 'paid' && o.status !== 'cancelled');
  const checkoutRequests = orders.filter(o => o.payment_status === 'pending_payment' && o.status !== 'paid');
  const orderToSettle = activeOrder || checkoutRequests.find(o => o.table_id === selectedTable?.id);
  const finalPayableTotal = (orderToSettle?.total || 0) - discountAmount;

  const handleTableTap = (table, order) => {
    const now = Date.now();
    const isDoubleTap = lastTap.tableId === table.id && (now - lastTap.time) < 300;
    
    setSelectedTable(table);
    
    if (isDoubleTap) {
      if (order) {
        setSettleMethod(normalizeMethod(order.payment_method));
        setSettleModalOpen(true);
      } else {
        setOrderModalOpen(true);
      }
      setLastTap({ tableId: null, time: 0 });
    } else {
      setLastTap({ tableId: table.id, time: now });
    }
  };

  // Beep Audio Utility
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio blocked');
    }
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to socket alerts
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      refreshOrders();
      refreshTables();
    };

    const handleOrderUpdated = ({ order }) => {
      refreshOrders();
      refreshTables();
      if (order && order.payment_status === 'pending_payment') {
        playBeep();
        toast(`Checkout requested by Table ${order.table_number || order.table_id} via ${order.payment_method}!`, {
          icon: '💰',
          style: {
            background: '#3b82f6',
            color: '#ffffff',
            fontWeight: 'bold',
          },
          duration: 6000,
        });
      }
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:itemAdded', handleNewOrder);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:itemAdded', handleNewOrder);
    };
  }, [socket]);

  // Sync Settle modal states
  useEffect(() => {
    if (settleModalOpen && orderToSettle) {
      setWhatsappPhone(orderToSettle.customer_phone || '');
      setCashAmount(orderToSettle.total - (orderToSettle.discount_amount || 0));
      setOnlineAmount(0);
      setDiscountAmount(orderToSettle.discount_amount || 0);
      setCouponCode(orderToSettle.coupon_code || '');
      setSettleMethod(normalizeMethod(orderToSettle.payment_method));
    }
  }, [settleModalOpen, orderToSettle]);

  // Sync UPI QR generation
  useEffect(() => {
    if (!settleModalOpen || !orderToSettle) return;
    const finalPayable = orderToSettle.total - discountAmount;
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
  }, [settleMethod, onlineAmount, settleModalOpen, discountAmount, orderToSettle]);

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
        const newTotal = orderToSettle.total - data.discount_amount;
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
    const finalTotal = (orderToSettle?.total || 0) - discountAmount;
    setCashAmount(cash);
    setOnlineAmount(Math.max(0, finalTotal - cash));
  };

  const handleOnlineAmountChange = (val) => {
    const online = parseFloat(val) || 0;
    const finalTotal = (orderToSettle?.total || 0) - discountAmount;
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

  const handleOrderSubmit = async (orderData) => {
    try {
      if (activeOrder) {
        await api.post(`/orders/${activeOrder.id}/items`, { items: orderData.items });
        toast.success(`Items added to order #${activeOrder.id}`);
      } else {
        await api.post('/orders', orderData);
        toast.success(`New order created for Table ${selectedTable.number}`);
      }
      refreshOrders();
      refreshTables();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save POS order');
    }
  };

  const handleSettleOrder = async () => {
    if (!orderToSettle) return;
    const finalTotal = orderToSettle.total - discountAmount;

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

  const handlePrintReceipt = (order) => {
    setReceiptOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDeleteHistory = async (e) => {
    e.preventDefault();
    if (!deleteStart || !deleteEnd) {
      toast.error('Please select both start and end dates for cleanup');
      return;
    }

    const confirmMsg = `WARNING: This will permanently delete ALL orders and itemized sales from ${deleteStart} to ${deleteEnd}. This cannot be undone. Are you absolutely sure you want to proceed?`;
    if (!confirm(confirmMsg)) return;

    const doubleConfirm = prompt("Please type 'DELETE' to confirm history purge:");
    if (doubleConfirm !== 'DELETE') {
      toast.error('Deletion cancelled. Confirmation keyword did not match.');
      return;
    }

    try {
      setDeleting(true);
      const { data: res } = await api.post('/orders/delete-history', {
        startDate: deleteStart,
        endDate: deleteEnd
      });
      toast.success(res.message || 'Transaction history deleted successfully');
      setDeleteStart('');
      setDeleteEnd('');
      refreshOrders();
      refreshTables();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to delete transaction history');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('session');
    navigate(`/r/${restaurantId}/login`);
  };

  const salesHistory = orders.filter(o => o.status === 'paid');
  const totalSalesToday = salesHistory.reduce((sum, o) => sum + o.total, 0);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-body relative">
      
      {/* SCOPED CSS PRINT LAYOUT */}
      <style>{`
        #print-receipt-section {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt-section, #print-receipt-section * {
            visibility: visible;
          }
          #print-receipt-section {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: ${config?.printing?.hardware?.size === '58mm' ? '58mm' : '80mm'};
            padding: 2mm;
            background: white !important;
            color: black !important;
            font-family: monospace !important;
            font-size: ${config?.printing?.hardware?.size === '58mm' ? '8.5px' : '10px'} !important;
            line-height: 1.3 !important;
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Dynamic Hidden Receipt Container */}
      {receiptOrder && (
        <div id="print-receipt-section">
          {/* Logo */}
          {config?.printing?.bill_setting?.show_logo && (
            config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="w-10 h-10 rounded-full mx-auto object-contain bg-white border border-slate-200 mb-1" style={{ display: 'block', margin: '0 auto' }} />
            ) : (
              <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-[9px] mx-auto uppercase mb-1" style={{ display: 'flex', margin: '0 auto', alignItems: 'center', justifyContent: 'center' }}>
                {config.name ? config.name.charAt(0) : 'L'}
              </div>
            )
          )}
          
          <div className="text-center font-bold text-[12px] uppercase mb-1">{config?.name || restaurantName}</div>
          
          {config?.printing?.bill_setting?.show_address && config?.location && (
            <div className="text-center text-[8px] text-slate-800 leading-normal mb-1">{config.location}</div>
          )}
          
          {config?.fssai_compliance && (
            <div className="text-center text-[7.5px] text-slate-800 mb-1">FSSAI No: {config.fssai_compliance}</div>
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
            {config?.printing?.bill_setting?.show_customer_info && receiptOrder.customer_phone && (
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
            {receiptOrder.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="w-1/2 truncate">{item.item_name}</span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/3 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-b border-dashed border-black pb-1"></div>
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-[8.5px] mb-4">
            {(() => {
              const subtotal = receiptOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || receiptOrder.total;
              const discount = receiptOrder.discount_amount || 0;
              const afterDiscount = subtotal - discount;
              const gstEnabled = config?.billing?.gst_enabled;
              const gstPercent = config?.billing?.gst_percentage || 0;
              const serviceChargePercent = config?.billing?.service_charge_percentage || 0;

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
            <p>{config?.printing?.bill_setting?.custom_footer || 'Thank you! Visit again.'}</p>
            <p className="text-[7px] text-slate-500">Powered by Bhoj360</p>
          </div>
        </div>
      )}

      {/* Main Header bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex-shrink-0 no-print shadow-sm">
        <div className="flex items-center gap-3">
          {agencySettings.logo_url ? (
            <img src={agencySettings.logo_url} alt="Agency Logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-md">
              {restaurantName[0] || 'C'}
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold font-display tracking-wide uppercase text-blue-750 flex items-center gap-1.5">
              <Landmark className="w-4.5 h-4.5" /> {restaurantName}
            </h1>
            <span className="text-[10px] text-slate-500 font-mono">
              Cashier Dashboard / POS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-bold font-mono text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            {currentTime.toLocaleTimeString()}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-mono text-slate-500 uppercase hidden sm:inline">
              {isConnected ? 'Linked' : 'Offline'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors font-bold text-xs shadow-xs"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl w-full mx-auto items-start min-h-0 overflow-y-auto no-print">
        
        {/* Navigation Sidebar / Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab Selection */}
          <div className="flex border border-slate-200 bg-slate-100 p-1 rounded-2xl gap-1">
            {[
              { id: 'tables', label: 'POS Floor & Bills', icon: Landmark, badge: null },
              { id: 'requests', label: 'Payment Requests', icon: DollarSign, badge: checkoutRequests.length },
              { id: 'history', label: 'Sales History Today', icon: History, badge: salesHistory.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white font-black text-[9px] rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: POS Floor Plan */}
          {activeTab === 'tables' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...tables].sort((a, b) => {
                const orderA = orders.find(o => o.table_id === a.id && o.status !== 'paid' && o.status !== 'cancelled');
                const orderB = orders.find(o => o.table_id === b.id && o.status !== 'paid' && o.status !== 'cancelled');
                
                const isReqA = orderA?.payment_status === 'pending_payment' ? 1 : 0;
                const isReqB = orderB?.payment_status === 'pending_payment' ? 1 : 0;
                if (isReqA !== isReqB) return isReqB - isReqA;
                
                const hasOrderA = orderA ? 1 : 0;
                const hasOrderB = orderB ? 1 : 0;
                if (hasOrderA !== hasOrderB) return hasOrderB - hasOrderA;
                
                // Fallback to table number sorting
                return String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
              }).map((table) => {
                const tableOrder = orders.find(o => o.table_id === table.id && o.status !== 'paid' && o.status !== 'cancelled');
                const isRequested = tableOrder?.payment_status === 'pending_payment';
                
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableTap(table, tableOrder)}
                    className={`p-5 rounded-3xl border text-left flex flex-col justify-between h-32 transition-all relative overflow-hidden shadow-xs ${
                      selectedTable?.id === table.id
                        ? 'border-blue-500 bg-blue-50/70 shadow-md ring-2 ring-blue-200'
                        : isRequested
                        ? 'border-amber-500 bg-amber-50/70 animate-pulse'
                        : 'border-slate-205 bg-white hover:border-slate-350'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black font-display text-slate-800">Table {table.number}</span>
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5 block">
                        Cap: {table.capacity}
                      </span>
                    </div>

                    <div className="mt-3">
                      {tableOrder ? (
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-bold text-emerald-605 font-mono">₹{tableOrder.total}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black font-mono ${
                            isRequested ? 'bg-amber-600 text-white animate-bounce' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {isRequested ? 'PAY REQ' : 'ACTIVE'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Available</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Settle Requests List */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {checkoutRequests.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl text-slate-400 shadow-xs">
                  <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No pending payment requests</p>
                  <p className="text-xs text-slate-400 mt-1">Guests will appear here when they request billing from tables.</p>
                </div>
              ) : (
                checkoutRequests.map((req) => (
                  <div key={req.id} className="p-5 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800 font-display">Table {req.table_number || req.table_id}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold animate-pulse font-mono uppercase">
                          Pay Request: {req.payment_method}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Order #{req.id} | Items: {req.items?.map(i => `${i.item_name} x${i.quantity}`).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <span className="text-xl font-bold font-mono text-emerald-600 mr-2">₹{req.total}</span>
                      <button
                        onClick={() => {
                          setSelectedTable(tables.find(t => t.id === req.table_id));
                          setSettleMethod(normalizeMethod(req.payment_method));
                          setSettleModalOpen(true);
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex-1 md:flex-none transition-transform hover:-translate-y-0.5"
                      >
                        Settle Payment
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(req)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Sales History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Shift Stats Card */}
              <div className="grid grid-cols-3 gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Sales Today</span>
                  <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">₹{totalSalesToday}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Settle Count</span>
                  <span className="text-2xl font-black font-mono text-slate-700 mt-1 block">{salesHistory.length} bills</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 uppercase font-semibold block">Restaurant Code</span>
                  <span className="text-lg font-bold font-mono text-blue-600 mt-1 block truncate">{restaurantId}</span>
                </div>
              </div>

              {/* Collapsible Purge History Panel */}
              <div className="bg-red-50/20 border border-red-100 p-4 rounded-2.5xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-750 uppercase tracking-wider block">Danger Zone: Clean-up/Purge History</span>
                  <button 
                    onClick={() => setShowDeletePanel(!showDeletePanel)}
                    className="text-[10px] text-red-650 hover:text-red-800 underline font-semibold focus:outline-none"
                  >
                    {showDeletePanel ? 'Hide Panel' : 'Show Panel'}
                  </button>
                </div>
                {showDeletePanel && (
                  <form onSubmit={handleDeleteHistory} className="space-y-3 mt-2">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Delete transaction database history records for a selected date range to save storage space.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">From Date</label>
                        <input 
                          type="date"
                          value={deleteStart}
                          onChange={(e) => setDeleteStart(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-455 uppercase mb-1">To Date</label>
                        <input 
                          type="date"
                          value={deleteEnd}
                          onChange={(e) => setDeleteEnd(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={deleting}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                    >
                      <span>{deleting ? 'Purging History...' : 'Delete Range History'}</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="space-y-2.5">
                {salesHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">No completed sales recorded today.</div>
                ) : (
                  salesHistory.map((historyOrder) => (
                    <div key={historyOrder.id} className="p-4 bg-white border border-slate-200 rounded-2.5xl flex justify-between items-center gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">Table {historyOrder.table_number || historyOrder.table_id}</span>
                          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-550 px-1.5 py-0.2 rounded font-mono">ORDER #{historyOrder.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Settled via {historyOrder.payment_method?.toUpperCase()} on {new Date(historyOrder.settled_at || historyOrder.updated_at).toLocaleDateString()} at {new Date(historyOrder.settled_at || historyOrder.updated_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-emerald-600">₹{historyOrder.total}</span>
                        <button
                          onClick={() => handlePrintReceipt(historyOrder)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 font-semibold text-[10px] rounded-lg border border-slate-200 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar: POS Settlement / Order panel */}
        <div className="lg:col-span-1">
          {activeTable ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6 animate-slide-up">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display font-black text-2xl text-blue-700">Table {activeTable.number}</h3>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Status: {activeTable.status.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-1 hover:bg-slate-100 rounded-xl text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order content */}
              {activeOrder ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">#{activeOrder.id}</span>
                      <span className="text-xs font-semibold text-slate-600">Total Seated:</span>
                    </div>
                    <span className="text-xl font-bold font-mono text-emerald-600">₹{activeOrder.total}</span>
                  </div>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {activeOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-b-0">
                        <span className="text-slate-650 font-medium">x{item.quantity} {item.item_name}</span>
                        <span className="text-slate-500 font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-150">
                    <button
                      onClick={() => {
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
                      <Printer className="w-4 h-4" /> Print Bill Invoice
                    </button>
                    <button
                      onClick={() => setOrderModalOpen(true)}
                      className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> POS Add Food
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">No active dining order seated.</p>
                  <button
                    onClick={() => setOrderModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md mx-auto flex items-center gap-1 transition-transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4.5 h-4.5" /> Start Order
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 shadow-xs">
              <Landmark className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Select Table Seating</p>
              <p className="text-xs text-slate-400 mt-1">Select table grid block to manage active POS checkout billing or seat settings.</p>
            </div>
          )}
        </div>

      </main>

      {/* POS Settle Dialog Modal */}
      {(settleModalOpen || (!settleModalOpen && selectedTable && activeOrder && activeTab === 'tables' && activeOrder.payment_status === 'pending_payment')) && orderToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSettleModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 animate-slide-up text-slate-800 no-print max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-blue-700">Settle Order Billing</h3>
                <p className="text-xs text-slate-500 mt-1">Table {selectedTable?.number} | Order #{orderToSettle.id}</p>
              </div>
              <button onClick={() => setSettleModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Items Subtotal:</span>
                <span className="font-mono">₹{orderToSettle.total}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-600">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-655 font-bold uppercase tracking-wider">Final Payable Total:</span>
                <span className="text-2xl font-bold font-mono text-emerald-600">₹{finalPayableTotal.toFixed(2)}</span>
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
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cash Share</label>
                  <input 
                    type="number" 
                    value={cashAmount}
                    onChange={(e) => handleCashAmountChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700"
                    min="0"
                    max={finalPayableTotal}
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
                    max={finalPayableTotal}
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
                  Online Share: ₹{(settleMethod === 'split' ? onlineAmount : finalPayableTotal).toFixed(2)}
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

      {/* POS Order Items modal */}
      <NewOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
        restaurantId={restaurantId}
        tableId={selectedTable?.id}
        tableNumber={selectedTable?.number}
        existingOrderId={activeOrder?.id}
      />

    </div>
  );
}
