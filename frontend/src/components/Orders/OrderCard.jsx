import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Play, Check, ChevronRight, CheckSquare, DollarSign, Clock, Printer } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function OrderCard({
  order,
  onStatusChange,
  onViewDetails,
  onPrint,
  compact = false,
  variant = 'waiter',
}) {
  const timeElapsed = formatDistanceToNow(parseISO(order.created_at || new Date().toISOString()));
  
  // Calculate if pending/preparing for more than 15 minutes
  const isDelayed = () => {
    if (order.status !== 'pending' && order.status !== 'preparing') return false;
    const minutes = Math.floor((new Date() - parseISO(order.created_at)) / 60000);
    return minutes > 15;
  };

  const getActionConfig = () => {
    switch (order.status) {
      case 'pending':
        return {
          label: 'Start Preparing',
          color: 'bg-orange-600 hover:bg-orange-500 ring-orange-500/20 text-white',
          next: 'preparing',
          icon: Play,
        };
      case 'preparing':
        return {
          label: 'Mark Ready',
          color: 'bg-purple-600 hover:bg-purple-500 ring-purple-500/20 text-white',
          next: 'ready',
          icon: CheckSquare,
        };
      case 'ready':
        return {
          label: 'Mark Served',
          color: 'bg-green-600 hover:bg-green-500 ring-green-500/20 text-white',
          next: 'served',
          icon: Check,
        };
      case 'served':
        return {
          label: 'Collect Payment',
          color: 'bg-blue-600 hover:bg-blue-500 ring-blue-500/20 text-white',
          next: 'paid',
          icon: DollarSign,
        };
      default:
        return null;
    }
  };

  const action = getActionConfig();

  const isCounter = variant === 'counter';

  const isPendingPayment = order.payment_status === 'pending_payment';

  return (
    <div
      className={`bg-white border border-slate-205 rounded-3xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 shadow-md animate-slide-in-top transition-all ${
        isDelayed() ? 'border-rose-300 bg-rose-50/40' : ''
      } ${
        isPendingPayment ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-500/10' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`font-display font-black text-slate-800 ${isCounter ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
              Table {order.table_number || order.table_id}
            </span>
            {isDelayed() && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-600 animate-pulse">
                DELAYED
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block truncate">
            ID: #{order.id}
          </span>
          {order.customer_name && (
            <span className="text-xs font-semibold text-slate-700 mt-1 block truncate">
              Guest: {order.customer_name}
            </span>
          )}
          {order.customer_phone && (
            <a
              href={`tel:${order.customer_phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] text-indigo-650 hover:underline font-semibold font-mono tracking-tight mt-0.5 flex items-center gap-1"
            >
              <span>📞 {order.customer_phone}</span>
            </a>
          )}
          {order.waiter_name && (
            <span className="text-[9px] text-indigo-650 font-bold bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.2 mt-1 inline-block">
              Waiter: {order.waiter_name}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={order.status} size="sm" />
          <span className={`text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
            order.payment_status === 'paid'
              ? 'bg-green-50 border-green-200 text-green-700'
              : order.payment_status === 'pending_payment'
              ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            {order.payment_status === 'pending_payment' ? `PAY: ${order.payment_method || ''}` : order.payment_status || 'unpaid'}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-450 mt-0.5">
            <Clock className="w-3 h-3" />
            <span className={isDelayed() ? 'text-rose-600 font-medium' : ''}>{timeElapsed}</span>
          </div>
        </div>
      </div>

      {/* Items list */}
      {!compact && order.items && order.items.length > 0 && (
        <div className="border-y border-slate-100 py-2.5 my-0.5 space-y-2">
          {order.items.map((item) => {
            const itemAddons = item.addons || (item.addons_json ? (() => {
              try { return JSON.parse(item.addons_json); } catch (e) { return []; }
            })() : []);
            return (
              <div key={item.id} className="text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <span className="text-indigo-650 font-mono font-bold">x{item.quantity}</span>
                      <span className="truncate">
                        {item.is_addon ? <span className="text-rose-600 font-bold mr-1">(Add-on)</span> : ''}
                        {item.item_name}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs font-mono font-semibold">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
                
                {/* Render Addons in Card */}
                {itemAddons && itemAddons.length > 0 && (
                  <div className="pl-5 text-[10px] text-slate-500 italic space-y-0.5 font-medium">
                    {itemAddons.map((ad, idx) => (
                      <div key={idx}>+ {ad.name}</div>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 border border-amber-100 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Notes (Order wide) */}
      {!compact && order.notes && (
        <div className="text-xs text-slate-655 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <span className="font-semibold text-slate-700 block mb-0.5">Instructions:</span>
          {order.notes}
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between gap-4 mt-auto pt-1">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-450 font-semibold uppercase tracking-wider">Total Amount</span>
          <span className="text-base sm:text-lg font-bold font-mono text-emerald-600">₹{order.total || 0}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {variant === 'counter' && order.items && order.items.length > 0 && (
            <button
              onClick={() => onPrint && onPrint(order)}
              className="p-2 text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 rounded-xl transition-all"
              title="Print KOT"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order)}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
              title="View Detail"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {action && onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, action.next)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs shadow-lg ring-4 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 ${action.color}`}
            >
              <action.icon className="w-4 h-4 flex-shrink-0" />
              <span>{action.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
