import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Search, RefreshCw, Smartphone, Mail, Calendar } from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function CustomerDirectory() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  // States
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const { data } = await api.get('/customers');
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load guest directory');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
    <DashboardShell title="Customer & Guest Directory" restaurantId={restaurantId} role="admin">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Search & Refresh Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Guest Database
            </h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Automated guest profile logging based on reservations, table seating, and billing history</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-650"
              />
            </div>
            
            <button
              onClick={fetchCustomers}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-650 transition-all font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCustomers ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table/List View */}
        <div>
          {loadingCustomers ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Guests Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
                {searchQuery ? 'Try clearing your search filters' : 'Guest records populate automatically as visitors order or place table bookings.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-3">Guest Details</th>
                    <th className="px-6 py-3">Contact Details</th>
                    <th className="px-6 py-3 text-center">Visits (Orders)</th>
                    <th className="px-6 py-3 text-center">Reservations</th>
                    <th className="px-6 py-3 text-right">Total Revenue Spent</th>
                    <th className="px-6 py-3 text-right">Last Dining Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCustomers.map((cust, idx) => (
                    <tr key={cust.phone || idx} className="text-slate-700 hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-display font-bold text-sm text-indigo-650">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : 'G'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-850 text-sm">
                              {cust.name || 'Anonymous Guest'}
                            </h4>
                            <span className="text-[10px] text-slate-400">Registered Client</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{cust.phone || 'N/A'}</span>
                        </div>
                        {cust.email && cust.email !== 'N/A' && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                            <Mail className="w-3 h-3 text-slate-350" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">
                          {cust.order_count} {cust.order_count === 1 ? 'order' : 'orders'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-750">
                          {cust.reservation_count} {cust.reservation_count === 1 ? 'booking' : 'bookings'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono text-sm">
                        ₹{(cust.total_spend || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-[10px] font-mono">
                        {cust.last_visit ? new Date(cust.last_visit).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
