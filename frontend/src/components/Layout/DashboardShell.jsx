import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createApi } from '../../api/client';
import Sidebar from './Sidebar';

export default function DashboardShell({
  children,
  title,
  restaurantId,
  role = 'admin',
  accent = '#6366f1',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();
  const api = createApi(restaurantId);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/tables/status'); // simple endpoint to fetch/ping
        // If config detail isn't in tables/status, let's fetch config from window if we saved it
        const session = JSON.parse(sessionStorage.getItem('session') || '{}');
        if (session.name) {
          setRestaurantName(session.name);
        }
      } catch (err) {
        console.error('Failed to contact microservice', err);
        setIsOnline(false);
      }
    };
    if (restaurantId) {
      fetchConfig();
    }
  }, [restaurantId]);

  // Sync online state based on browser online status
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        await api.get('/tables/status');
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    }, 15000);

    return () => clearInterval(pingInterval);
  }, [restaurantId]);

  const handleLogout = () => {
    sessionStorage.removeItem('session');
    navigate(`/r/${restaurantId}/login`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-body">
      <Sidebar
        restaurantId={restaurantId}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold font-display tracking-wide truncate max-w-[160px] sm:max-w-xs text-slate-800">
                {restaurantName}
              </h2>
              <span className="h-4 w-px bg-slate-200 hidden sm:inline" />
              <h3 className="text-sm font-semibold text-slate-500 hidden sm:inline">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-700 hidden sm:inline font-mono font-bold">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                  <span className="text-rose-600 hidden sm:inline font-mono font-bold">OFFLINE</span>
                </>
              )}
            </div>

            {/* Profile info & Logout */}
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-indigo-50 text-indigo-700 uppercase border border-indigo-200 font-bold">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 animate-fade-in relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
