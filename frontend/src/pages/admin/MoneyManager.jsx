import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CircleDollarSign, 
  RefreshCw, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  Wallet, 
  Users, 
  AlertTriangle,
  ChevronDown,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function MoneyManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  // States
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    orders: [],
    totals: { totalCollected: 0, totalCash: 0, totalOnline: 0 },
    staffAttribution: {}
  });

  // Filters
  const getFirstDayOfMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  };
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(todayStr);

  // Deletion state
  const [deleteStart, setDeleteStart] = useState('');
  const [deleteEnd, setDeleteEnd] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [billOrder, setBillOrder] = useState(null);
  const [billLoadingId, setBillLoadingId] = useState(null);

  // Fetch Money Analytics
  const fetchMoneyAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data: resData } = await api.get('/analytics/money', { params });
      setData(resData || {
        orders: [],
        totals: { totalCollected: 0, totalCash: 0, totalOnline: 0 },
        staffAttribution: {}
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load money analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoneyAnalytics();
  }, [startDate, endDate]);

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
      fetchMoneyAnalytics();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to delete transaction history');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewBill = async (orderId) => {
    try {
      setBillLoadingId(orderId);
      const { data: order } = await api.get(`/orders/${orderId}`);
      setBillOrder(order);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bill details');
    } finally {
      setBillLoadingId(null);
    }
  };

  const formatSettledDate = (value) => (
    value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
  );

  const formatSettledTime = (value) => (
    value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'
  );

  const displayPaymentMethod = (method) => {
    if (method === 'upi' || method === 'online') return 'UPI / Online';
    if (method === 'split') return 'Split';
    return method || 'N/A';
  };

  return (
    <DashboardShell title="Money Management & Attribution" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        
        {/* Date Filter Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-indigo-600" /> Revenue & Attribution Tracker
            </h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Filter payment records, attribution parameters, and clear logs</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-350 px-1">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={fetchMoneyAnalytics}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Collected */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Settled</span>
              <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">₹{data.totals.totalCollected.toFixed(2)}</h2>
            </div>
          </div>

          {/* Cash Portion */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash Collected</span>
              <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">₹{data.totals.totalCash.toFixed(2)}</h2>
            </div>
          </div>

          {/* Online Portion */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-650">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online UPI Settled</span>
              <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">₹{data.totals.totalOnline.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Range Data Cleanup Component (Left Column) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit space-y-4">
            <div className="flex items-center gap-2 text-red-655 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-display font-bold text-sm text-slate-800">Danger Zone: Purge History</h3>
            </div>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Delete order database history records for a selected date range. Useful for routine maintenance or clearing demo data. Note: Cashiers and Admins can perform this action.
              </p>

              <form onSubmit={handleDeleteHistory} className="space-y-3 bg-red-50/20 border border-red-100 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Purge From</label>
                    <input 
                      type="date"
                      value={deleteStart}
                      onChange={(e) => setDeleteStart(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Purge To</label>
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
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{deleting ? 'Purging History...' : 'Delete Range History'}</span>
                </button>
              </form>
            </div>

          {/* Transactions Ledger (Right Columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-display font-bold text-sm text-slate-800">Settled Transactions Ledger ({data.orders.length})</h3>
              {loading && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />}
            </div>

            {data.orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">No transactions recorded in this range.</div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs text-slate-700">
                  <thead className="sticky top-0 bg-white z-10 shadow-xs">
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Table</th>
                      <th className="pb-3">Settlement Date</th>
                      <th className="pb-3">Settle Time</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Settled By</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3 text-right">Bill</th>
                      <th className="pb-3 text-right">Settled Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/20">
                        <td className="py-3 font-semibold text-slate-900">
                          Table {order.table_number || 'N/A'}
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[10px]">
                          {formatSettledDate(order.settled_at)}
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[10px]">
                          {formatSettledTime(order.settled_at)}
                        </td>
                        <td className="py-3">
                          {order.customer_name ? (
                            <div>
                              <span className="block font-semibold">{order.customer_name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{order.customer_phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-slate-700">{order.settled_by || 'System'}</span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            order.payment_method === 'cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            (order.payment_method === 'online' || order.payment_method === 'upi') ? 'bg-sky-50 text-sky-700 border-sky-100' :
                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {displayPaymentMethod(order.payment_method)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewBill(order.id)}
                            disabled={billLoadingId === order.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded-lg border border-slate-200 disabled:opacity-60"
                          >
                            {billLoadingId === order.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                            View Bill
                          </button>
                        </td>
                        <td className="py-3 text-right font-bold font-mono text-slate-900">
                          ₹{order.total?.toFixed(2)}
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

      {billOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setBillOrder(null)} />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between rounded-t-3xl">
              <div>
                <h3 className="font-display font-black text-lg text-slate-900">Bill #{billOrder.id}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Table {billOrder.table_number || 'N/A'} | {formatSettledDate(billOrder.settled_at || billOrder.updated_at)} at {formatSettledTime(billOrder.settled_at || billOrder.updated_at)}
                </p>
              </div>
              <button onClick={() => setBillOrder(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</span>
                  <span className="block mt-1 font-bold text-slate-800">{displayPaymentMethod(billOrder.payment_method)}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Settled By</span>
                  <span className="block mt-1 font-bold text-slate-800">{billOrder.settled_by || 'System'}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="text-left p-3">Item</th>
                      <th className="text-center p-3">Qty</th>
                      <th className="text-right p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(billOrder.items || []).map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-semibold text-slate-800">{item.item_name}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-800">Rs. {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                {billOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount {billOrder.coupon_code ? `(${billOrder.coupon_code})` : ''}</span>
                    <span>-Rs. {billOrder.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {billOrder.payment_method === 'split' && (
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Split</span>
                    <span>Cash Rs. {(billOrder.cash_amount || 0).toFixed(2)} | Online Rs. {(billOrder.online_amount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-base font-black text-slate-900">
                  <span>Total Settled</span>
                  <span className="font-mono">Rs. {(billOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
              >
                <Printer className="w-4 h-4" /> Print Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
