import React from 'react';
import { Check, Clock, RotateCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function OrderTimeline({ order }) {
  if (!order) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-3xl">
        No active order on this table.
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Sent to the kitchen' },
    { key: 'preparing', label: 'Preparing', desc: 'Chef is cooking your meal' },
    { key: 'ready', label: 'Ready to Serve', desc: 'Food is plated and hot' },
    { key: 'served', label: 'Served', desc: 'Food has arrived at your table' },
    { key: 'paid', label: 'Paid', desc: 'Bill has been settled' },
  ];

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
    if (status === 'cancelled') return -1;
    return statuses.indexOf(status?.toLowerCase());
  };

  const currentIdx = getStatusIndex(order.status);

  // Simple hardcoded average wait times in minutes based on items count
  const itemsCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const estimatedWait = Math.max(10, itemsCount * 3 + 5);

  const getStepStatus = (index) => {
    if (order.status === 'cancelled') return 'cancelled';
    if (currentIdx >= index) return 'completed';
    if (currentIdx + 1 === index) return 'active';
    return 'upcoming';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-100">Track Order</h3>
          <span className="text-xs text-slate-500 font-mono mt-0.5 block">#{order.id}</span>
        </div>
        
        {(order.status === 'pending' || order.status === 'preparing') && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-semibold font-mono">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>EST: ~{estimatedWait} MIN</span>
          </div>
        )}
      </div>

      {order.status === 'cancelled' ? (
        <div className="text-center py-6 text-rose-400 bg-rose-500/5 rounded-2xl border border-rose-500/10">
          <p className="font-semibold">This order has been cancelled.</p>
        </div>
      ) : (
        <div className="relative pl-8 space-y-8">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[15px] top-1 bottom-1 w-0.5 bg-slate-800">
            <div
              className="w-full bg-indigo-500 transition-all duration-500"
              style={{
                height: `${Math.max(0, Math.min(100, (currentIdx / (steps.length - 1)) * 100))}%`,
              }}
            />
          </div>

          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            
            return (
              <div key={step.key} className="relative flex gap-4 animate-slide-up">
                {/* Step Circle */}
                <div
                  className={`absolute -left-[33px] w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                    stepStatus === 'completed'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/35 scale-105'
                      : stepStatus === 'active'
                      ? 'bg-slate-900 border-indigo-500 text-indigo-400 scale-110 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : stepStatus === 'active' ? (
                    <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <span className="text-xs font-mono font-bold">{index + 1}</span>
                  )}
                </div>

                <div>
                  <h4
                    className={`font-semibold text-sm transition-colors duration-300 ${
                      stepStatus === 'completed'
                        ? 'text-slate-100'
                        : stepStatus === 'active'
                        ? 'text-indigo-400 text-base font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
