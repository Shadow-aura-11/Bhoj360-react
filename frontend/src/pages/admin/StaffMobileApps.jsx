import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Smartphone, Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

export default function StaffMobileApps() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [copiedRole, setCopiedRole] = useState(null);
  const [showQRRole, setShowQRRole] = useState(null);

  useEffect(() => {
    const fetchRestName = async () => {
      try {
        const { data: config } = await api.get('/settings/config').catch(() => ({ data: null }));
        if (config && config.name) {
          setRestaurantName(config.name);
        } else {
          const session = JSON.parse(sessionStorage.getItem('session') || '{}');
          if (session.name) {
            setRestaurantName(session.name);
          }
        }
      } catch (err) {
        const session = JSON.parse(sessionStorage.getItem('session') || '{}');
        if (session.name) {
          setRestaurantName(session.name);
        }
      }
    };
    if (restaurantId) {
      fetchRestName();
    }
  }, [restaurantId]);

  const handleCopyLink = (path, name) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedRole(name);
    toast.success(`${name} link copied!`);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const rolesList = [
    {
      name: 'Admin Dashboard',
      role: 'Admin',
      path: `/r/${restaurantId}/admin`,
      desc: 'Full control over settings, staff, reports, and menus.',
    },
    {
      name: 'Waiter App',
      role: 'Waiter',
      path: `/r/${restaurantId}/waiter`,
      desc: 'Table order management, kitchen sending, and billing.',
    },
    {
      name: 'Kitchen Display (KDS)',
      role: 'Kitchen',
      path: `/r/${restaurantId}/counter`,
      desc: 'Real-time order ticket display and status preparation.',
    },
    {
      name: 'Cashier Terminal (POS)',
      role: 'Cashier',
      path: `/r/${restaurantId}/cashier`,
      desc: 'Settle payments, print bills, and process daily sales.',
    },
  ];

  return (
    <DashboardShell title="Staff Mobile Apps" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 flex-shrink-0">
              <Smartphone className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800">
                Staff Mobile Apps (PWA)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Download role-specific mobile apps. Staff can scan the QR code or use the links below to install them on their phones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {rolesList.map((r) => {
              const roleParam = r.role === 'Kitchen' ? 'counter' : r.role.toLowerCase();
              const fullUrl = `${window.location.origin}/r/${restaurantId}/login?role=${roleParam}`;
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(fullUrl)}`;
              const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Hi! Install the ${restaurantName} ${r.role} App on your phone: ${fullUrl}`
              )}`;

              return (
                <div 
                  key={r.name} 
                  className="bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                        {r.role}
                      </span>
                      <Smartphone className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-slate-800">{r.name}</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {/* Expandable QR Code section */}
                    {showQRRole === r.name && (
                      <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl animate-fade-in">
                        <img src={qrCodeUrl} alt={`${r.name} QR`} className="w-32 h-32 object-contain" />
                        <span className="text-[10px] text-slate-400 mt-2">Scan with mobile camera</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyLink(r.path, r.name)}
                        className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        {copiedRole === r.name ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 rounded-xl font-bold text-xs text-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        title="Share link on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </a>
                    </div>

                    <div className="flex border-t border-slate-200/60 pt-2 text-xs">
                      <button
                        onClick={() => setShowQRRole(showQRRole === r.name ? null : r.name)}
                        className="flex-1 py-1 font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 transition-all"
                      >
                        {showQRRole === r.name ? 'Hide QR' : 'Show QR'}
                      </button>
                      
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1 font-semibold text-indigo-650 hover:text-indigo-700 flex items-center justify-center gap-1 transition-all"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
