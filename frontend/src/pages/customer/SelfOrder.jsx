import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Utensils, ArrowRight, X, RefreshCw } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SelfOrder() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = createApi(restaurantId);

  const table = searchParams.get('table');
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [invalidToken, setInvalidToken] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [tableDetails, setTableDetails] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Validate Token and Seating configuration
  useEffect(() => {
    const validateToken = async () => {
      if (!table || !token) {
        setInvalidToken(true);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await api.get('/menu/public', {
          params: { table, token },
        });
        
        if (data.restaurant && data.restaurant.name) {
          setRestaurantName(data.restaurant.name);
        }
        if (data.table) {
          setTableDetails(data.table);
        }
      } catch (err) {
        console.error(err);
        setInvalidToken(true);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [table, token, restaurantId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customerPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    const newSession = {
      role: 'customer',
      restaurantId,
      tableNumber: tableDetails ? tableDetails.number : table,
      tableId: tableDetails ? tableDetails.id : null,
      customerPhone: customerPhone.trim(),
      customerName: customerName.trim(),
      qrToken: token,
    };

    sessionStorage.setItem('session', JSON.stringify(newSession));
    toast.success('Welcome! Redirecting to menu...');
    navigate(`/r/${restaurantId}/customer`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 text-slate-500 font-body">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mb-3" />
        <p className="text-sm font-semibold">Verifying table seating session...</p>
      </div>
    );
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-rose-50 text-rose-800 flex items-center justify-center p-6 font-body">
        <div className="w-full max-w-sm bg-white border border-rose-100 p-8 rounded-3xl shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-display text-rose-950">Invalid QR Code</h2>
          <p className="text-xs text-slate-400 mt-2">
            The authorization token for this table seating has expired or is invalid. Please ask staff to refresh or regenerate a printable QR token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 flex items-center justify-center p-6 relative font-body max-w-lg mx-auto shadow-md">
      <div className="relative w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 leading-tight">Welcome to {restaurantName}</h2>
        <p className="text-xs text-slate-450 mt-2 mb-6">
          Table {table}. Please enter your phone number to view the menu, order food, call waiters, and pay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your Name (Optional)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-amber-600 focus:outline-none rounded-2xl text-center font-bold text-base text-slate-800 placeholder:text-slate-350"
          />
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Phone Number (e.g. 9876543210)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-amber-600 focus:outline-none rounded-2xl text-center font-bold text-lg font-mono text-slate-800 placeholder:text-slate-300"
          />
          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-550 transition-all font-semibold rounded-2xl text-white shadow-lg shadow-amber-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
          >
            <span>Proceed to Dining</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
