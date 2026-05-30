import React, { useEffect, useState } from 'react';
import { differenceInMinutes, parse, format } from 'date-fns';
import { Check, X, Clock, User, Users } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function TodayReservations({
  reservations = [],
  onSeat,
  onNoShow,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getStatusOverlay = (res) => {
    if (res.status !== 'confirmed') return null;

    const resTimeStr = res.reservation_time; // HH:mm format
    const [hours, minutes] = resTimeStr.split(':').map(Number);
    
    const resDate = new Date();
    resDate.setHours(hours, minutes, 0, 0);

    const diff = differenceInMinutes(resDate, time);

    if (diff < -15) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
          OVERDUE
        </span>
      );
    } else if (diff >= 0 && diff <= 60) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
          IN {diff} MIN
        </span>
      );
    }
    return null;
  };

  // Only show confirmed reservations for quick actions
  const activeReservations = reservations
    .filter(r => r.status === 'confirmed')
    .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Today's Waitlist
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-850 border border-slate-700 text-slate-400 font-mono">
          {activeReservations.length} upcoming
        </span>
      </div>

      {activeReservations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-500 text-center">
          <p className="text-sm">No upcoming reservations left for today.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 max-h-[350px] pr-1">
          {activeReservations.map((res) => (
            <div
              key={res.id}
              className="p-3.5 bg-slate-850 hover:bg-slate-800 rounded-2xl border border-slate-800/80 transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-indigo-400">
                    {res.reservation_time}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                    Table {res.table_number || res.table_id}
                  </span>
                  {getStatusOverlay(res)}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{res.customer_name}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{res.party_size} people</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>{res.duration_minutes}m</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onSeat(res)}
                  title="Mark Seated"
                  className="p-2 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-xl transition-all border border-transparent hover:border-green-500/30 bg-slate-900"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNoShow(res)}
                  title="Mark No-Show"
                  className="p-2 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl transition-all border border-transparent hover:border-rose-500/30 bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
