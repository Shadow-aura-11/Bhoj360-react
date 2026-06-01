import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Grid, 
  CalendarCheck, 
  UtensilsCrossed, 
  BarChart3, 
  QrCode, 
  Settings,
  LogOut, 
  X 
} from 'lucide-react';

export default function Sidebar({ restaurantId, role, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('session');
    navigate(`/r/${restaurantId}/login`);
    if (onClose) onClose();
  };

  const navItems = [
    { label: 'Overview', path: `/r/${restaurantId}/admin`, icon: LayoutDashboard, end: true },
    { label: 'Tables', path: `/r/${restaurantId}/admin/tables`, icon: Grid },
    { label: 'Reservations', path: `/r/${restaurantId}/admin/reservations`, icon: CalendarCheck },
    { label: 'Menu Manager', path: `/r/${restaurantId}/admin/menu`, icon: UtensilsCrossed },
    { label: 'Analytics', path: `/r/${restaurantId}/admin/analytics`, icon: BarChart3 },
    { label: 'Print QR Codes', path: `/r/${restaurantId}/admin/print-qr`, icon: QrCode },
    { label: 'Settings', path: `/r/${restaurantId}/admin/settings`, icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-150">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-sm">
            R
          </div>
          <div>
            <h1 className="font-display font-bold text-base leading-tight text-slate-800">
              Agency Suite
            </h1>
            <span className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase font-bold">
              {role} portal
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-150 bg-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-64 h-full animate-slide-right shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
