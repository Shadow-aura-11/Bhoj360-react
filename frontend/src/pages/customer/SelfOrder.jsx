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
  const [theme, setTheme] = useState('classic');

  const themeStyles = {
    classic: {
      bg: "bg-[#fafaf9] text-slate-800",
      card: "bg-white border border-slate-200",
      btn: "bg-amber-600 hover:bg-amber-550 text-white shadow-lg shadow-amber-600/20",
      text: "text-amber-600",
      input: "bg-slate-50 border border-slate-200 focus:border-amber-600 text-slate-850 placeholder:text-slate-350",
      loading: "text-amber-650",
      badge: "bg-amber-500/10 text-amber-600"
    },
    onyx: {
      bg: "bg-neutral-950 text-neutral-100",
      card: "bg-neutral-900 border border-neutral-800",
      btn: "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20",
      text: "text-amber-500",
      input: "bg-neutral-800 border border-neutral-700 focus:border-amber-500 text-neutral-100 placeholder:text-neutral-500",
      loading: "text-amber-500",
      badge: "bg-amber-500/10 text-amber-500"
    },
    emerald: {
      bg: "bg-slate-50 text-slate-900",
      card: "bg-white border border-slate-200",
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20",
      text: "text-emerald-600",
      input: "bg-slate-50 border border-slate-200 focus:border-emerald-600 text-slate-850 placeholder:text-slate-350",
      loading: "text-emerald-650",
      badge: "bg-emerald-500/10 text-emerald-600"
    },
    ruby: {
      bg: "bg-stone-950 text-stone-100",
      card: "bg-stone-900 border border-stone-800",
      btn: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20",
      text: "text-rose-500",
      input: "bg-stone-850 border border-stone-750 focus:border-rose-500 text-stone-100 placeholder:text-stone-500",
      loading: "text-rose-500",
      badge: "bg-rose-500/10 text-rose-500"
    },
    amber: {
      bg: "bg-[#faf6f0] text-stone-900",
      card: "bg-white border border-amber-100",
      btn: "bg-amber-700 hover:bg-amber-600 text-white shadow-lg shadow-amber-700/20",
      text: "text-amber-750",
      input: "bg-stone-50 border border-stone-200 focus:border-amber-700 text-stone-850 placeholder:text-stone-400",
      loading: "text-amber-700",
      badge: "bg-amber-500/10 text-amber-750"
    }
  };

  const style = themeStyles[theme] || themeStyles.classic;

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
        
        if (data.restaurant) {
          if (data.restaurant.name) {
            setRestaurantName(data.restaurant.name);
          }
          if (data.restaurant.qr_theme) {
            setTheme(data.restaurant.qr_theme);
          }
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
      <div className={`min-h-screen ${style.bg} flex flex-col items-center justify-center p-6 font-body`}>
        <RefreshCw className={`w-8 h-8 ${style.loading} animate-spin mb-3`} />
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
    <div className={`min-h-screen ${style.bg} flex items-center justify-center p-6 relative font-body max-w-lg mx-auto shadow-md`}>
      <div className={`relative w-full ${style.card} p-8 rounded-3xl shadow-xl text-center`}>
        <div className={`w-14 h-14 rounded-2xl ${style.badge} flex items-center justify-center mx-auto mb-4`}>
          <Utensils className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black font-display leading-tight">Welcome to {restaurantName}</h2>
        <p className="text-xs mt-2 mb-6 opacity-80">
          Table {table}. Please enter your phone number to view the menu, order food, call waiters, and pay.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your Name (Optional)"
            className={`w-full px-4 py-3 ${style.input} rounded-2xl text-center font-bold text-base`}
          />
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Phone Number (e.g. 9876543210)"
            className={`w-full px-4 py-3 ${style.input} rounded-2xl text-center font-bold text-lg font-mono`}
          />
          <button
            type="submit"
            className={`w-full py-3 ${style.btn} transition-all font-semibold rounded-2xl flex items-center justify-center gap-1.5 hover:-translate-y-0.5`}
          >
            <span>Proceed to Dining</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
