import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Utensils, ClipboardList, Users, ArrowLeft, ArrowRight, Download, Landmark } from 'lucide-react';
import { createApi } from '../api/client';
import toast from 'react-hot-toast';

export default function Login() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' | 'waiter' | 'counter' | 'cashier' | 'customer'
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerStep, setCustomerStep] = useState(1); // 1: phone, 2: table
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [themeColor, setThemeColor] = useState('#fafaf9');
  const [agencyName, setAgencyName] = useState('');
  const [agencyUrl, setAgencyUrl] = useState('');
  
  // PWA Install properties
  const [isBlocked, setIsBlocked] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);
  const [showInstallBtn, setShowInstallBtn] = useState(!!window.deferredPrompt);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  
  const api = createApi(restaurantId);
  const isRoleLocked = new URLSearchParams(window.location.search).has('role');

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'waiter': return 'Waiter';
      case 'counter': return 'Kitchen Display (KDS)';
      case 'cashier': return 'Cashier Terminal (POS)';
      default: return role ? role.toUpperCase() : 'Staff';
    }
  };

  // 1. Dynamic Manifest injection
  useEffect(() => {
    if (restaurantId) {
      let manifestLink = document.getElementById('dynamic-manifest');
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.id = 'dynamic-manifest';
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = `/r/${restaurantId}/manifest.json`;
    }
  }, [restaurantId]);

  // 2. iOS and Standalone detection for showing install button on phones
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsIOS(ios);
    setIsStandalone(standalone);

    // Show manual install guide box for mobile users if they aren't already running in standalone mode
    if (/iPhone|iPad|iPod|Android/i.test(ua) && !standalone) {
      setShowInstallBtn(true);
    }
  }, []);

  // 3. Early native installation event prompt capture
  useEffect(() => {
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setShowInstallBtn(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
      const name = sessionStorage.getItem('restaurant_name') || 'this restaurant';
      toast(`Install the app for ${name} on your device for quick access! 📲`, {
        duration: 8000,
        id: 'pwa-install-toast',
        style: {
          background: '#d97706',
          color: '#ffffff',
          fontWeight: 'bold',
        }
      });
    };

    const handlePromptReady = () => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
        setShowInstallBtn(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  // 4. Auto-detect role from query parameter (logout/direct link routing)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    if (roleParam && ['admin', 'waiter', 'counter', 'cashier'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, []);

  // Load restaurant details on mount
  useEffect(() => {
    const loadRestaurantDetails = async () => {
      try {
        const { data } = await api.get('/health');
        if (data.name) {
          setRestaurantName(data.name);
          sessionStorage.setItem('restaurant_name', data.name);
        }
        if (data.logo_url) setLogoUrl(data.logo_url);
        if (data.description) setDescription(data.description);
        if (data.login_theme_color) setThemeColor(data.login_theme_color);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403 && err.response?.data?.blocked) {
          setIsBlocked(true);
        }
      }
    };
    const loadAgencySettings = async () => {
      try {
        const res = await fetch('/api/agency/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.agency_name) setAgencyName(data.agency_name);
          if (data.agency_url) setAgencyUrl(data.agency_url);
        }
      } catch (err) { /* silent */ }
    };
    if (restaurantId) {
      loadRestaurantDetails();
      loadAgencySettings();
    }
  }, [restaurantId]);

  // Set body background style to match theme color
  useEffect(() => {
    document.body.style.backgroundColor = themeColor;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [themeColor]);

  const handleInstallApp = async () => {
    const prompt = deferredPrompt || window.deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log(`PWA installation outcome: ${outcome}`);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      setShowInstallBtn(false);
    } else if (isIOS) {
      toast((t) => (
        <div className="flex flex-col gap-1 text-slate-800">
          <span className="font-bold text-xs text-indigo-600">To install on iPhone/iPad:</span>
          <span className="text-[11px] leading-relaxed text-slate-600">
            1. Tap the Safari browser's <strong>Share</strong> button (📤) at the bottom.<br />
            2. Scroll down and tap <strong>Add to Home Screen</strong> (➕).
          </span>
        </div>
      ), { 
        duration: 10000, 
        id: 'ios-install-toast',
        style: {
          background: '#ffffff',
          color: '#1e293b',
          border: '2px solid #6366f1',
          borderRadius: '1.25rem',
          padding: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
      });
    } else {
      toast((t) => (
        <div className="flex flex-col gap-1 text-slate-800">
          <span className="font-bold text-xs text-indigo-600">To install on your device:</span>
          <span className="text-[11px] leading-relaxed text-slate-600">
            1. Tap the browser menu (three dots <strong>⋮</strong> at top right or share button).<br />
            2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
          </span>
        </div>
      ), { 
        duration: 10000, 
        id: 'android-install-toast',
        style: {
          background: '#ffffff',
          color: '#1e293b',
          border: '2px solid #6366f1',
          borderRadius: '1.25rem',
          padding: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
      });
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    const isAd = selectedRole === 'admin';
    const targetUsername = isAd ? 'admin' : staffUsername.trim();
    if (!isAd && !targetUsername) {
      toast.error('Please enter your Staff ID or Username');
      return;
    }
    if (staffPin.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    try {
      setLoading(true);
      const payload = isAd
        ? { role: 'admin', pin: staffPin }
        : { username: targetUsername, pin: staffPin };

      const { data } = await api.post('/auth', payload);

      // Save session
      sessionStorage.setItem('session', JSON.stringify({
        role: data.role,
        restaurantId,
        pin: staffPin,
        name: data.name,
        staffName: data.staffName || (isAd ? 'Admin' : data.role.toUpperCase()),
        username: data.username || targetUsername,
      }));

      toast.success(`Logged in as ${data.staffName || (isAd ? 'Admin' : data.role.toUpperCase())}`);

      // Redirect to correct dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        if (data.role === 'admin') navigate(`/r/${restaurantId}/admin`);
        else if (data.role === 'waiter') navigate(`/r/${restaurantId}/waiter`);
        else if (data.role === 'counter') navigate(`/r/${restaurantId}/counter`);
        else if (data.role === 'cashier') navigate(`/r/${restaurantId}/cashier`);
      }

    } catch (err) {
      console.error(err);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const errorMsg = err.response?.data?.error || 'Invalid credentials or password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (customerStep === 1) {
      if (!customerPhone.trim() || customerPhone.trim().length < 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
      setCustomerStep(2);
      return;
    }

    if (!tableNumber.trim()) {
      toast.error('Please enter your table number');
      return;
    }
    
    try {
      setLoading(true);
      // Validate table exists
      const { data: tables } = await api.get('/tables');
      const tableExists = tables.find(
        (t) => t.number.toUpperCase() === tableNumber.trim().toUpperCase()
      );

      if (!tableExists) {
        toast.error(`Table ${tableNumber} not found`);
        return;
      }

      // Check if table is active
      if (tableExists.status === 'inactive') {
        toast.error(`Table ${tableNumber} is not in service`);
        return;
      }

      // Save customer session
      sessionStorage.setItem('session', JSON.stringify({
        role: 'customer',
        restaurantId,
        tableNumber: tableExists.number.toUpperCase(),
        tableId: tableExists.id,
        customerPhone: customerPhone.trim(),
        customerName: customerName.trim(),
        qrToken: tableExists.qr_token,
      }));

      toast.success(`Welcome to Table ${tableExists.number}`);
      navigate(`/r/${restaurantId}/customer`);

    } catch (err) {
      console.error(err);
      toast.error('Failed to validate table status');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCustomerStep(1);
    setCustomerPhone('');
    setCustomerName('');
    setTableNumber('');
    setStaffUsername('');
    setStaffPin('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-0 md:p-6 relative overflow-hidden font-body" style={{ backgroundColor: themeColor }}>
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(217,119,6,0.03),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.03),transparent_40%)]" />

      {/* Built by credit — desktop: top-left clickable link; mobile: bottom footer plain text */}
      {agencyName && (
        <>
          {/* Desktop: positioned at top-left */}
          <a
            href={agencyUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-5 left-5 hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors z-20 group"
          >
            <span>Built by</span>
            <span className="font-semibold group-hover:underline">{agencyName}</span>
          </a>
        </>
      )}

      {/* Main 2-Column Wrapper */}
      <div 
        className={`w-full ${
          isRoleLocked ? 'max-w-md md:rounded-[2rem] min-h-[500px]' : 'max-w-5xl flex-col md:flex-row min-h-[600px]'
        } md:bg-white md:border md:border-slate-200/80 md:rounded-[2.5rem] md:shadow-2xl flex overflow-hidden z-10 animate-slide-up`}
      >
        
        {/* Left Side: Graphical marketing/info panel (Visible on Desktop, Hidden on Mobile) */}
        {!isRoleLocked && (
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-amber-800 to-amber-955 p-12 text-white flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-20 -translate-y-20 animate-pulse" />
            
            <div className="space-y-6 z-10">
              {/* Logo */}
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={restaurantName} 
                  className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-lg bg-white" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 shadow-md">
                  <Utensils className="w-8 h-8" />
                </div>
              )}

              <div>
                <h2 className="text-3xl font-black font-display tracking-tight leading-tight">{restaurantName}</h2>
                {description ? (
                  <p className="text-sm text-amber-100/90 mt-3 leading-relaxed font-medium">
                    {description}
                  </p>
                ) : (
                  <p className="text-sm text-amber-100/90 mt-3 leading-relaxed font-medium">
                    Welcome to our restaurant. Log in to your portal to start managing tables, cooking orders, or dining.
                  </p>
                )}
              </div>
            </div>

            {/* Graphical points */}
            <div className="space-y-4 z-10 my-8">
              {[
                { title: 'Scan & Order Self Service', desc: 'Customers scan QR code at tables to view menu and order directly.', icon: '🍽️' },
                { title: 'Real-time Tracking & Alerts', desc: 'Instant socket synchronization between Waiters, Kitchen, and Customers.', icon: '⚡' },
                { title: 'One-Tap Waiter Calling', desc: 'Send alert requests directly to waiter dashboard with a single button.', icon: '🔔' },
                { title: 'Contactless Digital Settlement', desc: 'Secure UPI, card, and cash settle flow directly from table checks.', icon: '💳' },
              ].map((pt, i) => (
                <div key={i} className="flex gap-3.5 items-start p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-xl shrink-0 mt-0.5">{pt.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs leading-none text-white">{pt.title}</h4>
                    <p className="text-[10px] text-amber-100/70 mt-1 leading-snug">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="z-10 text-[10px] text-amber-105/50 font-mono tracking-wider uppercase">
              Restaurant Management Agency Suite
            </div>
          </div>
        )}

        {/* Right Side: Login Form Panel */}
        <div className={`w-full ${isRoleLocked ? 'w-full' : 'md:w-1/2'} p-8 md:p-12 bg-white flex flex-col justify-center items-center relative`}>
          
          {/* Mobile-only Header (shows logo and restaurant details on mobile only) */}
          {!isRoleLocked && (
            <div className="md:hidden flex flex-col items-center mb-6">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={restaurantName} 
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-205 shadow-md mb-3" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-slate-205 shadow-xs mb-3">
                  <Utensils className="w-6 h-6" />
                </div>
              )}
              <h1 className="text-2xl font-black text-slate-805 text-center font-display leading-tight">{restaurantName}</h1>
              {description && (
                <p className="text-xs text-slate-500 mt-1 text-center max-w-[280px] leading-relaxed">{description}</p>
              )}
            </div>
          )}

          {/* PWA Install Banner */}
          {showInstallBtn && !isRoleLocked && (
            <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-150 rounded-2xl flex items-center justify-between gap-3 animate-pulse-ready">
              <div className="flex items-center gap-2 text-amber-800 text-xs">
                <Download className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span className="font-semibold text-slate-700">Install the {restaurantName} app!</span>
              </div>
              <button
                onClick={handleInstallApp}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-550 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                Install
              </button>
            </div>
          )}

          {/* Top role header (Desktop only) */}
          <div className="hidden md:block text-center mb-6 w-full">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Portal Authorization
            </h3>
          </div>

          {isBlocked ? (
            <div className="w-full text-center space-y-6 py-8 animate-slide-up">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Shield className="w-8 h-8 text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 font-display">Portal Suspended</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  This restaurant portal is currently offline or suspended by the administration.
                  Please contact support if you think this is a mistake.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-[11px] text-slate-500 max-w-sm mx-auto">
                Tenant: <span className="font-mono font-bold text-slate-700">{restaurantId}</span>
              </div>
            </div>
          ) : !selectedRole ? (
            /* Role grid */
            <div className="w-full space-y-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-2">
                Select Your Role
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Admin */}
                <button
                  onClick={() => handleSelectRole('admin')}
                  className="p-4 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-2xl flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-605 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-705 font-display">Admin</span>
                </button>

                {/* Waiter */}
                <button
                  onClick={() => handleSelectRole('waiter')}
                  className="p-4 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-350 rounded-2xl flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-655 flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-705 font-display">Waiter</span>
                </button>

                {/* Counter */}
                <button
                  onClick={() => handleSelectRole('counter')}
                  className="p-4 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-350 rounded-2xl flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-655 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-705 font-display">Counter</span>
                </button>

                {/* Cashier */}
                <button
                  onClick={() => handleSelectRole('cashier')}
                  className="p-4 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-350 rounded-2xl flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-655 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-705 font-display">Cashier</span>
                </button>

                {/* Customer */}
                <button
                  onClick={() => handleSelectRole('customer')}
                  className="p-4 bg-slate-50 hover:bg-amber-50/55 border border-slate-200 hover:border-amber-350 rounded-2xl flex flex-col items-center text-center gap-2 group transition-all sm:col-span-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-655 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-705 font-display">Customer Seating</span>
                </button>
              </div>
            </div>
          ) : (
            /* Input portal */
            <div className="w-full flex flex-col items-center">
              {/* Back button */}
              {!window.location.search.includes('role=') && (
                <button
                  onClick={() => setSelectedRole(null)}
                  className="self-start flex items-center gap-1.5 text-xs text-slate-505 hover:text-slate-800 mb-6 transition-colors font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Role</span>
                </button>
              )}

              {selectedRole === 'customer' ? (
                /* Customer Login Form */
                <form onSubmit={handleCustomerSubmit} className="w-full space-y-4 animate-slide-up">
                  {customerStep === 1 ? (
                    /* Step 1: Phone */
                    <>
                      <div className="text-center mb-4">
                        <span className="text-[10px] font-bold text-amber-750 uppercase tracking-wider block">
                          Customer Login — Step 1
                        </span>
                        <p className="text-xs text-slate-500 mt-1">Please enter your 10-digit phone number to continue</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Your Name (Optional)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-amber-600 focus:bg-white text-center font-bold text-base placeholder:text-slate-350"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Phone Number (e.g. 9876543210)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-amber-600 focus:bg-white text-center font-mono font-bold text-xl placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-amber-600 hover:bg-amber-550 text-white rounded-xl font-semibold shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    /* Step 2: Table */
                    <>
                      <div className="text-center mb-4">
                        <span className="text-[10px] font-bold text-amber-755 uppercase tracking-wider block">
                          Customer Login — Step 2
                        </span>
                        <p className="text-xs text-slate-500 mt-1">Please enter your assigned table number below</p>
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. T1, O2, VIP-1"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-amber-600 focus:bg-white text-center font-mono font-bold text-xl uppercase placeholder:lowercase placeholder:text-slate-350"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerStep(1)}
                          className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-xl font-semibold transition-all text-xs"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-2/3 py-3 bg-amber-600 hover:bg-amber-550 text-white rounded-xl font-semibold shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                          <span>Enter Dining Room</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                /* Credentials login for admin/waiter/counter/cashier */
                isRoleLocked && !showLoginForm ? (
                  <div className="w-full flex flex-col items-center py-6 text-center animate-fade-in">
                    {/* Large Restaurant Logo */}
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden mb-6 shadow-md bg-white">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Utensils className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    {/* Restaurant Name & Role */}
                    <h2 className="text-2xl font-black font-display text-slate-800 mb-1 leading-tight">
                      {restaurantName}
                    </h2>
                    <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200/60 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
                      {getRoleLabel(selectedRole)} Profile
                    </span>

                     {/* PWA Install Button */}
                    {!isStandalone && (
                      <button
                        onClick={handleInstallApp}
                        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 mb-4"
                        style={{ backgroundColor: '#4f46e5' }}
                      >
                        <Download className="w-5 h-5 animate-bounce" />
                        <span>Install {getRoleLabel(selectedRole)} App</span>
                      </button>
                    )}

                    {/* Login Button */}
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-550 active:scale-98 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/10 hover:-translate-y-0.5"
                    >
                      <span>Login to Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleStaffLogin} className={`w-full space-y-4 animate-slide-up ${shake ? 'animate-bounce' : ''}`}>
                    {/* Locked profile header inside active login form */}
                    {isRoleLocked && (
                      <div className="flex flex-col items-center mb-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mb-3 shadow-xs bg-white">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <Utensils className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <h2 className="text-lg font-bold font-display text-slate-800 leading-tight">
                          {restaurantName}
                        </h2>
                        <span className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">
                          {getRoleLabel(selectedRole)} Portal
                        </span>
                      </div>
                    )}

                    {!isRoleLocked && (
                      <div className="text-center mb-4">
                        <span className="text-[10px] font-bold text-amber-750 uppercase tracking-wider block">
                          {selectedRole.toUpperCase()} PORTAL LOGIN
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedRole === 'admin' 
                            ? 'Enter admin username and password to log in' 
                            : `Enter your ${selectedRole} ID and password to log in`}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          disabled={selectedRole === 'admin'}
                          value={selectedRole === 'admin' ? 'admin' : staffUsername}
                          onChange={(e) => setStaffUsername(e.target.value)}
                          placeholder="Staff ID or Username"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white text-center font-bold text-base placeholder:text-slate-350 disabled:opacity-75 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          required
                          value={staffPin}
                          onChange={(e) => setStaffPin(e.target.value)}
                          placeholder="Password"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white text-center font-mono font-bold text-xl tracking-widest placeholder:text-slate-350"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-550 text-white rounded-xl font-semibold shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    >
                      <span>{loading ? 'Logging in...' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {isRoleLocked && (
                      <button
                        type="button"
                        onClick={() => setShowLoginForm(false)}
                        className="w-full py-2 text-xs text-slate-400 hover:text-slate-655 font-bold transition-all text-center mt-2 hover:underline"
                      >
                        Back to Lock Screen
                      </button>
                    )}
                  </form>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only Built By credit (plain text, no link) */}
      {agencyName && (
        <p className="md:hidden absolute bottom-4 text-center text-[10px] text-slate-400 z-20 w-full px-4">
          Built by <span className="font-semibold">{agencyName}</span>
        </p>
      )}
    </div>
  );
}
