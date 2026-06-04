import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Smartphone, Copy, Share2, Check, QrCode, X, Download,
  MessageSquare, Mail, ExternalLink, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

const ROLES = [
  {
    name: 'Admin Dashboard',
    role: 'admin',
    roleParam: 'admin',
    path: (rid) => `/r/${rid}/admin`,
    desc: 'Full control over settings, staff, reports, and menus.',
    color: '#f59e0b',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: '🛡️',
  },
  {
    name: 'Waiter App',
    role: 'waiter',
    roleParam: 'waiter',
    path: (rid) => `/r/${rid}/waiter`,
    desc: 'Table order management, kitchen sending, and billing.',
    color: '#6366f1',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    icon: '🍽️',
  },
  {
    name: 'Kitchen Display (KDS)',
    role: 'counter',
    roleParam: 'counter',
    path: (rid) => `/r/${rid}/counter`,
    desc: 'Real-time order ticket display and status preparation.',
    color: '#10b981',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: '👨‍🍳',
  },
  {
    name: 'Cashier Terminal (POS)',
    role: 'cashier',
    roleParam: 'cashier',
    path: (rid) => `/r/${rid}/cashier`,
    desc: 'Settle payments, print bills, and process daily sales.',
    color: '#8b5cf6',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800',
    icon: '💳',
  },
];

function QRModal({ role, restaurantName, restaurantId, onClose }) {
  const roleParam = role.roleParam;
  const fullUrl = `${window.location.origin}/r/${restaurantId}/login?role=${roleParam}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=20&data=${encodeURIComponent(fullUrl)}`;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMsg = encodeURIComponent(
    `Hi! Please install the *${restaurantName} ${role.name}* app on your phone:\n👉 ${fullUrl}\n\nOpen this link in Chrome and tap "Install App" or "Add to Home Screen".`
  );
  const smsMsg = encodeURIComponent(`Install ${restaurantName} ${role.name}: ${fullUrl}`);
  const emailSubject = encodeURIComponent(`Install ${restaurantName} ${role.name} App`);
  const emailBody = encodeURIComponent(`Hi,\n\nPlease install the ${restaurantName} ${role.name} app:\n${fullUrl}\n\nOpen this link in Chrome and tap "Install App" when prompted.\n\nThanks`);

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{role.icon}</span>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">{role.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Scan QR or share the link below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center py-6 px-6 bg-slate-50">
          <div className="w-52 h-52 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center overflow-hidden p-2">
            <img src={qrUrl} alt={`${role.name} QR Code`} className="w-full h-full object-contain" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-mono">Scan with phone camera to open install page</p>
        </div>

        {/* Link */}
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-slate-500 font-mono truncate flex-1">{fullUrl}</span>
            <button
              onClick={copyLink}
              className="shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Share options */}
        <div className="px-6 pb-6 pt-3">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2.5">Share via</p>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              <span className="text-xl">💬</span>
              <span className="text-[10px] font-bold text-emerald-700">WhatsApp</span>
            </a>
            <a
              href={`sms:?body=${smsMsg}`}
              className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700">SMS</span>
            </a>
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Mail className="w-5 h-5 text-slate-600" />
              <span className="text-[10px] font-bold text-slate-700">Email</span>
            </a>
          </div>
        </div>

        {/* Install instructions */}
        <div className="mx-6 mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-indigo-700 mb-1">Staff Install Instructions</p>
              <ol className="text-[10px] text-indigo-600 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Open the link on a mobile device in Chrome/Safari</li>
                <li>Tap <strong>"Install App"</strong> on the screen that appears</li>
                <li>If no button shows: tap browser menu → <strong>"Add to Home Screen"</strong></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, restaurantName, restaurantId }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fullUrl = `${window.location.origin}/r/${restaurantId}/login?role=${role.roleParam}`;
  const qrThumbUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=10&data=${encodeURIComponent(fullUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success(`${role.name} link copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMsg = encodeURIComponent(
    `Hi! Please install the *${restaurantName} ${role.name}* app on your phone:\n👉 ${fullUrl}`
  );

  return (
    <>
      <div className={`bg-white border ${role.border} rounded-3xl p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group`}>
        <div>
          {/* Role header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center text-lg shadow-sm`}>
              {role.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${role.badge}`}>
              {role.role}
            </span>
          </div>

          <h4 className="font-display font-bold text-sm text-slate-800 mb-1">{role.name}</h4>
          <p className="text-slate-500 text-xs leading-relaxed">{role.desc}</p>
        </div>

        {/* Inline mini QR preview */}
        {showQR && (
          <div className="mt-4 flex flex-col items-center bg-slate-50 border border-slate-200 rounded-2xl p-3 animate-fade-in">
            <img src={qrThumbUrl} alt={`${role.name} QR`} className="w-28 h-28 object-contain" />
            <span className="text-[10px] text-slate-400 mt-1.5">Scan to open install page</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          {/* Primary: Share / Sharing Center */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: role.color }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share & Install</span>
          </button>

          {/* Secondary row: Copy + QR toggle */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">Copied!</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" /><span>Copy Link</span></>
              )}
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-xs text-slate-600 flex items-center justify-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              {showQR ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-bold text-xs text-emerald-700 flex items-center justify-center transition-colors"
              title="Share on WhatsApp"
            >
              💬
            </a>
          </div>

          {/* Open link */}
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open Install Page
          </a>

          {/* Download App button */}
          <button
            onClick={() => navigate(`/r/${restaurantId}/admin/app-downloads`, { state: { role: role.role } })}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-white text-xs font-bold rounded-xl transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: role.color }}
          >
            <Download className="w-3.5 h-3.5" />
            Download Mobile App
          </button>
        </div>
      </div>

      {showModal && (
        <QRModal
          role={role}
          restaurantName={restaurantName}
          restaurantId={restaurantId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default function StaffMobileApps() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [restaurantName, setRestaurantName] = useState('Restaurant');

  useEffect(() => {
    const fetchRestName = async () => {
      try {
        const { data: config } = await api.get('/settings/config').catch(() => ({ data: null }));
        if (config?.name) {
          setRestaurantName(config.name);
        } else {
          const session = JSON.parse(sessionStorage.getItem('session') || '{}');
          if (session.name) setRestaurantName(session.name);
        }
      } catch {
        const session = JSON.parse(sessionStorage.getItem('session') || '{}');
        if (session.name) setRestaurantName(session.name);
      }
    };
    if (restaurantId) fetchRestName();
  }, [restaurantId]);

  return (
    <DashboardShell title="Staff Mobile Apps" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Smartphone className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800">
                Staff Mobile Apps — Sharing Center
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xl">
                Share role-specific install links with your staff. They scan the QR code or open the link on their phone, tap <strong>"Install App"</strong>, and the app is saved to their home screen — no App Store needed.
              </p>
            </div>
          </div>

          {/* How it works strip */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { step: '1', label: 'Share link or QR', icon: '📤' },
              { step: '2', label: 'Staff opens in Chrome', icon: '🌐' },
              { step: '3', label: 'Taps "Install App"', icon: '📲' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl mb-1">{s.icon}</span>
                <span className="text-[10px] font-bold text-slate-600">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {ROLES.map((role) => (
            <RoleCard
              key={role.role}
              role={role}
              restaurantName={restaurantName}
              restaurantId={restaurantId}
            />
          ))}
        </div>

        {/* PWA Info Footer */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-1">About PWA Staff Apps</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                These are <strong>Progressive Web Apps (PWA)</strong> — they install from the browser directly to the home screen on any device (Android, iPhone, tablet, or Windows). 
                No App Store approval needed. Apps update automatically when you deploy changes.
                Each role gets its own app with a persistent login that stays active on the device.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['✓ Works on Android & iPhone', '✓ No App Store needed', '✓ Auto-updates with deployments', '✓ Persistent staff login', '✓ Offline-capable'].map((f) => (
                  <span key={f} className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
