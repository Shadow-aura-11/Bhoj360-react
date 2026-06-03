import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, ChefHat, Play, Check, Flame, ClipboardList, CheckSquare, Bell, Volume2, Clock, VolumeX } from 'lucide-react';
import { createApi, agencyApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import { useTables } from '../../hooks/useTables';
import { useOrders } from '../../hooks/useOrders';
import TableStatusBar from '../../components/Tables/TableStatusBar';
import OrderCard from '../../components/Orders/OrderCard';
import toast from 'react-hot-toast';

export default function CounterDashboard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const api = createApi(restaurantId);
  const { socket, isConnected } = useSocket(restaurantId);

  const session = JSON.parse(sessionStorage.getItem('session') || '{}');
  const restaurantName = session.name || 'Restaurant';

  const { tables } = useTables(restaurantId, socket);
  const { orders, refreshOrders } = useOrders(restaurantId, socket);

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const [speechEnabled, setSpeechEnabled] = useState(() => {
    const saved = localStorage.getItem('kds_speech_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSpeech = () => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('kds_speech_enabled', JSON.stringify(next));
      return next;
    });
  };

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

  const [currentTime, setCurrentTime] = useState(new Date());
  const [agencySettings, setAgencySettings] = useState({ logo_url: '' });
  const [mobileTab, setMobileTab] = useState('pending'); // 'pending' | 'preparing' | 'ready'
  const [printerSettings, setPrinterSettings] = useState({ enabled: false, size: '80mm' });
  const [printOrder, setPrintOrder] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await agencyApi.get('/agency/settings');
        setAgencySettings(data || { logo_url: '' });
      } catch (err) {
        console.warn('Failed to load settings', err);
      }
    };
    const fetchPrinterSettings = async () => {
      try {
        const { data } = await api.get('/settings/printer');
        if (data && data.printer) {
          setPrinterSettings({
            enabled: !!data.printer.enabled,
            size: data.printer.size || '80mm',
          });
        }
      } catch (err) {
        console.warn('Failed to load printer settings', err);
      }
    };
    loadSettings();
    fetchPrinterSettings();
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

  // Beep Audio Utility
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, audioCtx.currentTime); // E5 note
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('Web Audio API blocked or not supported');
    }
  };

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to new orders or status updates
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      playLoudSound();
      if (speechEnabled) {
        speakText(`टेबल ${order.table_number || order.table_id} का नया ऑर्डर प्राप्त हुआ है`);
      }
      toast(`New Order #${order.id} for Table ${order.table_number || order.table_id} Placed!`, {
        icon: '🔔',
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 'bold',
        },
        duration: 5000,
      });
      refreshOrders();
      if (printerSettings.enabled) {
        setPrintOrder(order);
      }
    };

    const handleCallWaiter = ({ tableNumber }) => {
      playLoudSound();
      if (speechEnabled) {
        speakText(`टेबल ${tableNumber} पर वेटर को बुलाया गया है`);
      }
      toast(`Table ${tableNumber} requests assistance!`, {
        icon: '🆘',
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 'bold',
        },
        duration: 5000,
      });
    };

    const handleOrderUpdated = ({ order }) => {
      if (order) {
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
        } else if (order.payment_status === 'pending_payment' && (!existingOrder || existingOrder.payment_status !== 'pending_payment')) {
          playLoudSound();
          if (speechEnabled) {
            speakText(`टेबल ${order.table_number || order.table_id} ने बिल माँगा है`);
          }
        }
      }
      refreshOrders();
    };

    const handleItemAdded = (order) => {
      playLoudSound();
      if (order && speechEnabled) {
        speakText(`टेबल ${order.table_number || order.table_id} के ऑर्डर में नए आइटम जोड़े गए हैं`);
      }
      refreshOrders();
      if (printerSettings.enabled && order) {
        setPrintOrder(order);
      }
    };

    socket.on('order:new', handleNewOrder);
    socket.on('waiter:called', handleCallWaiter);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:itemAdded', handleItemAdded);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('waiter:called', handleCallWaiter);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:itemAdded', handleItemAdded);
    };
  }, [socket, printerSettings.enabled, speechEnabled]);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: nextStatus });
      toast.success(`Order #${orderId} moved to ${nextStatus}`);
      refreshOrders();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('session');
    navigate(`/r/${restaurantId}/login`);
  };

  // Filter orders into columns
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const checkoutRequests = orders.filter((o) => o.payment_status === 'pending_payment');

  // Stats Computations
  const completedToday = orders.filter((o) => o.status === 'paid' || o.status === 'served').length;
  
  // Calculate average prep time simulated/mocked for display or calculated from order timestamps
  const getAveragePrepTime = () => {
    const closedOrders = orders.filter((o) => o.status === 'served' || o.status === 'paid');
    if (closedOrders.length === 0) return '12m';
    let totalMins = 0;
    closedOrders.forEach((o) => {
      const created = new Date(o.created_at);
      const updated = new Date(o.updated_at);
      const mins = Math.floor((updated - created) / 60000);
      totalMins += mins > 0 ? mins : 10; // clamp minimum to 10 mins
    });
    return `${Math.round(totalMins / closedOrders.length)}m`;
  };

  return (
    <div className="min-h-screen bg-rose-50/20 text-slate-800 flex flex-col font-body">
      
      {/* Upper header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-rose-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {agencySettings.logo_url ? (
            <img src={agencySettings.logo_url} alt="Agency Logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-md">
              {restaurantName[0] || 'C'}
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold font-display tracking-wide uppercase text-rose-700 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4" /> {restaurantName}
            </h1>
            <span className="text-[10px] text-slate-500 font-mono">
              KITCHEN DISPLAY SYSTEM
            </span>
          </div>
        </div>

        {/* Dynamic status pill */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold font-mono text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-rose-200 shadow-sm">
            {currentTime.toLocaleTimeString()}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-mono text-slate-500 uppercase hidden sm:inline">
              {isConnected ? 'Linked' : 'Offline'}
            </span>
          </div>

          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl transition-all font-bold text-xs shadow-xs ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl transition-colors font-bold text-xs shadow-xs"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Blinking Checkout Requests Banner */}
      {checkoutRequests.length > 0 && (
        <div className="bg-amber-500 text-slate-950 p-3 font-bold text-center text-xs tracking-wider uppercase animate-pulse flex items-center justify-center gap-3 border-b border-amber-405">
          <span className="text-sm">🔔</span>
          <span>{checkoutRequests.length} Pending Checkout Request(s): Table {checkoutRequests.map(r => r.table_number || r.table_id).join(', ')}</span>
          <span className="text-[10px] bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg">Awaiting Cashier Settlement</span>
        </div>
      )}

      {/* Seating status bar strips */}
      <div className="hidden md:block bg-rose-50/10 border-b border-rose-100 px-6 py-2 flex-shrink-0 overflow-x-auto no-print">
        <TableStatusBar tables={tables} />
      </div>

      {/* Active/Occupied tables status row */}
      <div className="hidden md:block px-6 pt-4 flex-shrink-0">
        <div className="bg-white border border-rose-100/60 rounded-3xl p-4 shadow-xs">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Occupied & Reserved Tables</h4>
          <div className="flex flex-wrap gap-2">
            {tables.filter(t => t.status !== 'available').length === 0 ? (
              <span className="text-xs text-slate-400 italic">All dining tables are available</span>
            ) : (
              tables.filter(t => t.status !== 'available').map(t => {
                let badgeStyle = 'bg-rose-50 text-rose-700 border-rose-100';
                if (t.status === 'reserved') {
                  badgeStyle = 'bg-blue-50 text-blue-700 border-blue-105';
                }
                return (
                  <div key={t.id} className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold ${badgeStyle}`}>
                    <span>Table {t.number}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    <span className="text-[9px] uppercase tracking-wider">{t.status}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="md:hidden bg-white border-b border-rose-100 px-4 py-2 sticky top-16 z-10 shadow-xs">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'pending', label: 'Pending', count: pendingOrders.length },
            { id: 'preparing', label: 'Preparing', count: preparingOrders.length },
            { id: 'ready', label: 'Ready', count: readyOrders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mobileTab === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-mono font-bold ${
                mobileTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-650'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 min-h-0 overflow-y-auto">
        
        {/* Column 1: Pending */}
        <section className={`bg-white border border-slate-200/80 rounded-3xl flex flex-col h-full min-h-[400px] overflow-hidden shadow-xs ${mobileTab === 'pending' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
              <ClipboardList className="w-4.5 h-4.5" /> NEW / PENDING
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 font-mono font-bold text-amber-800">
              {pendingOrders.length}
            </span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/30">
            {pendingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center py-20 italic">
                Queue empty. All meals handled!
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  variant="counter"
                  onStatusChange={handleStatusChange}
                  onPrint={(o) => setPrintOrder(o)}
                />
              ))
            )}
          </div>
        </section>

        {/* Column 2: Preparing */}
        <section className={`bg-white border border-slate-200/80 rounded-3xl flex flex-col h-full min-h-[400px] overflow-hidden shadow-xs ${mobileTab === 'preparing' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 bg-orange-50/80 border-b border-orange-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-orange-850 flex items-center gap-1.5 uppercase tracking-wide">
              <Flame className="w-4.5 h-4.5 animate-pulse text-orange-500" /> PREPARING
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200 font-mono font-bold text-amber-800">
              {preparingOrders.length}
            </span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/30">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center py-20 italic">
                Cooking queue empty. Waiting for orders...
              </div>
            ) : (
              preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  variant="counter"
                  onStatusChange={handleStatusChange}
                  onPrint={(o) => setPrintOrder(o)}
                />
              ))
            )}
          </div>
        </section>

        {/* Column 3: Ready */}
        <section className={`bg-white border border-slate-205 rounded-3xl flex flex-col h-full min-h-[400px] overflow-hidden shadow-xs ${mobileTab === 'ready' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 bg-green-50/80 border-b border-green-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-green-800 flex items-center gap-1.5 uppercase tracking-wide">
              <CheckSquare className="w-4.5 h-4.5" /> READY TO SERVE
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 border border-green-200 font-mono font-bold text-green-800">
              {readyOrders.length}
            </span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/30">
            {readyOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center py-20 italic">
                Ready queue empty. Speed up cooking!
              </div>
            ) : (
              readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  variant="counter"
                  onStatusChange={handleStatusChange}
                  onPrint={(o) => setPrintOrder(o)}
                />
              ))
            )}
          </div>
        </section>

      </main>

      {/* Bottom stats strip */}
      <footer className="hidden md:grid bg-white border-t border-rose-100 p-4 px-6 grid-cols-2 sm:grid-cols-4 gap-4 flex-shrink-0 text-center text-xs shadow-xs">
        <div>
          <span className="text-slate-400 block uppercase font-semibold">Avg Preparation Time</span>
          <span className="text-sm font-bold font-mono text-emerald-600 mt-0.5">{getAveragePrepTime()}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-semibold">Meals Completed Today</span>
          <span className="text-sm font-bold font-mono text-slate-700 mt-0.5">{completedToday}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-semibold">Active Cooking Pans</span>
          <span className="text-sm font-bold font-mono text-orange-600 mt-0.5">{preparingOrders.length}</span>
        </div>
        <div>
          <span className="text-slate-400 block uppercase font-semibold">KDS Queue depth</span>
          <span className="text-sm font-bold font-mono text-rose-600 mt-0.5">{pendingOrders.length} pending</span>
        </div>
      </footer>

      {/* Mobile Compact Footer */}
      <footer className="bg-white border-t border-rose-100 p-3 px-4 flex justify-between items-center flex-shrink-0 text-[10px] text-slate-500 shadow-xs md:hidden">
        <span>Completed: <strong className="text-slate-700 font-mono">{completedToday}</strong></span>
        <span>Avg Prep: <strong className="text-emerald-600 font-mono">{getAveragePrepTime()}</strong></span>
        <span>Active: <strong className="text-orange-600 font-mono">{preparingOrders.length}</strong></span>
      </footer>

      {/* Printer Scoped CSS and Print Ticket Layout */}
      <style>{`
        @media print {
          /* Hide everything except the print-kot-section */
          body * {
            visibility: hidden;
          }
          #print-kot-section, #print-kot-section * {
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
          }
          @page {
            size: ${printerSettings.size === '58mm' ? '58mm' : '80mm'} auto;
            margin: 0;
          }
        }
      `}</style>

      {printOrder && (
        <div id="print-kot-section" className="hidden print:block text-black bg-white p-2">
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="font-bold text-sm uppercase">{restaurantName}</h2>
            <p className="text-[10px]">KITCHEN ORDER TICKET (KOT)</p>
            <p className="text-[10px] font-mono mt-0.5">
              Order ID: #{printOrder.id}
            </p>
          </div>

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
            <div className="text-[9px] text-slate-500">
              TIME: {new Date(printOrder.created_at || new Date()).toLocaleString('en-IN')}
            </div>
          </div>

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
      )}

    </div>
  );
}
