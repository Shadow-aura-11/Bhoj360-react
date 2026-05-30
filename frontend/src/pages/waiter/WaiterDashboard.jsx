import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, Bell, Check, UtensilsCrossed, Calendar, Users, Coffee, Soup, Plus, AlertCircle, Volume2, X } from 'lucide-react';
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

export default function WaiterDashboard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const api = createApi(restaurantId);
  const { socket, isConnected } = useSocket(restaurantId);

  const session = JSON.parse(sessionStorage.getItem('session') || '{}');
  const restaurantName = session.name || 'Restaurant';

  const { tables, loading: tablesLoading, refreshTables } = useTables(restaurantId, socket);
  const { orders, refreshOrders } = useOrders(restaurantId, socket);
  const { reservations } = useReservations(restaurantId, socket);

  const [selectedTable, setSelectedTable] = useState(null);
  const [waiterCalls, setWaiterCalls] = useState({}); // tableNumber -> boolean
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentCustomerPhone, setCurrentCustomerPhone] = useState('');
  const [tableDetailsModalOpen, setTableDetailsModalOpen] = useState(false);
  const [modalTable, setModalTable] = useState(null);
  const [agencySettings, setAgencySettings] = useState({ logo_url: '' });
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'summary' | 'detail'

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await agencyApi.get('/agency/settings');
        setAgencySettings(data || { logo_url: '' });
      } catch (err) {
        console.warn('Failed to load settings', err);
      }
    };
    loadSettings();
  }, []);

  // Beep Audio Utility
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Web Audio API blocked or not supported');
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join-table', { tableNumber: '*' });

    const handleWaiterCall = ({ table, tableNumber }) => {
      const tblNum = table || tableNumber;
      if (!tblNum) return;
      playBeep();
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
      if (order.status === 'ready') {
        playBeep();
        toast.success(`Order #${order.id} for Table ${order.table_number} is READY!`, {
          icon: '🍳',
          duration: 6000,
        });
      }
      refreshOrders();
      refreshTables();
    };

    socket.on('waiter:called', handleWaiterCall);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:new', () => { refreshOrders(); refreshTables(); });

    return () => {
      socket.off('waiter:called', handleWaiterCall);
      socket.off('order:updated', handleOrderUpdated);
    };
  }, [socket]);

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
        ...activeTable,
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
        await api.post('/orders', orderData);
        toast.success(`Created new order for Table ${activeTable.number}`);
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
                        {activeOrder.status === 'served' && (
                          <button
                            onClick={() => handleOrderStatusAdvance('paid')}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Mark: Bill Settled
                          </button>
                        )}

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
                          if (phone.length < 10) {
                            toast.error("Valid 10-digit phone number is required.");
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
                      {tableActiveOrder.status === 'served' && (
                        <button
                          onClick={() => {
                            api.put(`/orders/${tableActiveOrder.id}`, { status: 'paid' })
                              .then(() => { toast.success('Order status updated'); refreshOrders(); refreshTables(); })
                              .catch(err => { console.error(err); toast.error('Failed'); });
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-555 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          Mark: Settled
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setTableDetailsModalOpen(false);
                          setSelectedTable(modalTable);
                          setOrderModalOpen(true);
                        }}
                        className="col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm mt-1"
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
                        if (phone.length < 10) {
                          toast.error("Valid 10-digit phone number is required.");
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
                        await api.put(`/tables/${modalTable.id}`, { ...modalTable, status: 'available' });
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
                        await api.put(`/tables/${modalTable.id}`, { ...modalTable, status: 'occupied' });
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
                        await api.put(`/tables/${modalTable.id}`, { ...modalTable, status: 'reserved' });
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
    </div>
  );
}
