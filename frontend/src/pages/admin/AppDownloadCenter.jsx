import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Smartphone, Download, ExternalLink, CheckCircle, Loader2,
  AlertCircle, Copy, Check, QrCode, Share2, RefreshCw,
  Info, ChevronDown, ChevronUp, X, Zap
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import { useAppGenerator } from '../../hooks/useAppGenerator';
import toast from 'react-hot-toast';

/* ─────────── Role config ─────────── */
const ROLES = [
  {
    id: 'admin',
    label: 'Admin Portal',
    shortLabel: 'Admin',
    desc: 'Full control: settings, staff, analytics, menu management.',
    icon: '🛡️',
    color: '#d97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    ring: 'ring-amber-400',
  },
  {
    id: 'waiter',
    label: 'Waiter App',
    shortLabel: 'Waiter',
    desc: 'Table orders, kitchen sending, KOT printing, and bill settlement.',
    icon: '🍽️',
    color: '#4f46e5',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ring: 'ring-indigo-400',
  },
  {
    id: 'counter',
    label: 'Kitchen Display',
    shortLabel: 'Kitchen',
    desc: 'Real-time KDS tickets, voice alerts, and preparation tracking.',
    icon: '👨‍🍳',
    color: '#be123c',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    ring: 'ring-rose-400',
  },
  {
    id: 'cashier',
    label: 'Cashier Terminal',
    shortLabel: 'Cashier',
    desc: 'Settle payments, print bills, and manage daily POS sessions.',
    icon: '💳',
    color: '#7c3aed',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    ring: 'ring-violet-400',
  },
];

/* ─────────── iOS Step-by-step guide ─────────── */
function IOSGuide({ role, restaurantName, restaurantId }) {
  const url = `${window.location.origin}/r/${restaurantId}/login?role=${role.id}`;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Install link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className={`p-4 rounded-2xl border ${role.bg} ${role.border}`}>
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: role.color }} />
          <div>
            <p className="text-xs font-bold text-slate-700 mb-0.5">iPhone / iPad Install Method</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Apple doesn't allow direct APK downloads. Use Safari's "Add to Home Screen" — the app looks and works exactly like a native app with its own icon on your home screen.
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          {[
            { step: '1', icon: '📱', title: 'Open the install link in Safari', detail: 'Must use Safari — Chrome/Firefox on iOS can\'t install apps to Home Screen.' },
            { step: '2', icon: '📤', title: 'Tap the Share button', detail: 'The Share button is the square with an upward arrow at the bottom of Safari.' },
            { step: '3', icon: '➕', title: 'Tap "Add to Home Screen"', detail: 'Scroll down in the share sheet until you see "Add to Home Screen" and tap it.' },
            { step: '4', icon: '✅', title: 'Confirm and tap "Add"', detail: 'Edit the name if you want, then tap "Add" at the top right corner.' },
          ].map((s) => (
            <li key={s.step} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm"
                style={{ backgroundColor: role.color }}
              >
                {s.step}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  <span className="mr-1">{s.icon}</span>{s.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Install link to copy/share */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Install Link</p>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <span className="text-[11px] text-slate-500 font-mono truncate flex-1">{url}</span>
          <button
            onClick={copyLink}
            className="shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Install ${restaurantName} ${role.label} on your iPhone:\n${url}\n\n1. Open link in Safari\n2. Tap Share → Add to Home Screen`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-[11px] font-bold text-emerald-700 transition-colors"
          >
            💬 Send via WhatsApp
          </a>
          <a
            href={`sms:?body=${encodeURIComponent(`Install ${restaurantName} ${role.label}: ${url}`)}`}
            className="flex items-center justify-center gap-2 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl text-[11px] font-bold text-blue-700 transition-colors"
          >
            📩 Send via SMS
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Android generator panel ─────────── */
function AndroidPanel({ role, restaurantName, restaurantId, logoUrl }) {
  const { status, progress, error, generateAndroidAPK, openPWABuilder, reset } = useAppGenerator();
  const baseUrl = window.location.origin;

  const handleGenerate = () => {
    generateAndroidAPK({
      restaurantId,
      restaurantName,
      role: role.id,
      roleLabel: role.label,
      themeColor: role.color,
      iconUrl: logoUrl,
      baseUrl,
    });
  };

  if (status === 'success') {
    return (
      <div className={`flex flex-col items-center text-center p-6 rounded-2xl border ${role.bg} ${role.border}`}>
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="font-bold text-slate-800 mb-1">APK Downloaded!</h4>
        <p className="text-xs text-slate-500 mb-5 max-w-xs leading-relaxed">
          A <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">.zip</code> file was saved to your downloads folder.
          Extract it and install the <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">.apk</code> on any Android device.
        </p>
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-left w-full max-w-xs mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">How to install the APK</p>
          <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Transfer the <strong>.apk</strong> file to the Android device</li>
            <li>Open it — Android may ask to "Allow from this source"</li>
            <li>Tap <strong>Install</strong> and wait for completion</li>
            <li>Find the app icon on the home screen</li>
          </ol>
        </div>
        <button onClick={reset} className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Generate Again
        </button>
      </div>
    );
  }

  if (status === 'fallback') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-2.5 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Auto-generation unavailable</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                {error || 'The build server is temporarily unavailable.'} Use the PWABuilder website instead — it takes just 2 clicks.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alternative — 2-Step Manual Build</p>
          <ol className="space-y-3">
            {[
              { n: '1', text: 'Click the button below to open PWABuilder with your app URL pre-loaded' },
              { n: '2', text: 'Click "Package for Stores" → "Android" → "Download Package"' },
            ].map((s) => (
              <li key={s.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{s.n}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>

          <button
            onClick={() => openPWABuilder({ role: role.id, restaurantId, baseUrl })}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:opacity-90 hover:-translate-y-0.5"
            style={{ backgroundColor: role.color }}
          >
            <ExternalLink className="w-4 h-4" />
            Open in PWABuilder.com
          </button>
          <button
            onClick={reset}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Try auto-generate again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className={`flex flex-col items-center text-center p-8 rounded-2xl border ${role.bg} ${role.border}`}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md"
          style={{ backgroundColor: role.color }}
        >
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h4 className="font-bold text-slate-800 mb-2">Building Android App…</h4>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed max-w-xs">
          {progress || 'Connecting to build server…'}
        </p>
        <div className="w-full max-w-xs bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse"
            style={{ backgroundColor: role.color, width: '60%' }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-3">This usually takes 30–60 seconds.</p>
      </div>
    );
  }

  // Idle state
  return (
    <div className="space-y-5">
      {/* App info card */}
      <div className={`p-4 rounded-2xl border ${role.bg} ${role.border}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{role.icon}</div>
          <div>
            <p className="text-xs font-bold text-slate-700">{restaurantName} {role.label}</p>
            <p className="text-[11px] text-slate-500">Package: com.bhoj360.{restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0,12)}.{role.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Trusted Web Activity</div>
          <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Android 7.0+</div>
          <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Signed APK included</div>
          <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> No Play Store needed</div>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        className="w-full py-4 px-6 flex items-center justify-center gap-2.5 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        style={{ backgroundColor: role.color }}
      >
        <Download className="w-5 h-5" />
        Generate &amp; Download Android APK
      </button>

      {/* Fallback open in PWABuilder */}
      <button
        onClick={() => openPWABuilder({ role: role.id, restaurantId, baseUrl })}
        className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Open in PWABuilder.com (manual)
      </button>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Downloads a <strong>.zip</strong> containing a signed <strong>.apk</strong> (sideload) and <strong>.aab</strong> (Play Store). No account needed for sideloading.
      </p>
    </div>
  );
}

/* ─────────── QR Share panel ─────────── */
function QRPanel({ role, restaurantName, restaurantId }) {
  const url = `${window.location.origin}/r/${restaurantId}/login?role=${role.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=16&data=${encodeURIComponent(url)}`;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const waMsg = encodeURIComponent(`Install ${restaurantName} ${role.label} on your phone:\n👉 ${url}\n\nOpen in Chrome → tap "Install App"`);
  const emailBody = encodeURIComponent(`Hi,\n\nPlease install the ${restaurantName} ${role.label} app on your phone:\n${url}\n\nOpen this link in Chrome and tap "Install App" when prompted.\n\nThanks`);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center py-4">
        <div className="w-52 h-52 bg-white rounded-2xl border border-slate-200 shadow-md flex items-center justify-center overflow-hidden p-2">
          <img src={qrUrl} alt={`${role.label} QR Code`} className="w-full h-full object-contain" />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-mono">Scan to open install page on mobile</p>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
        <span className="text-[11px] text-slate-500 font-mono truncate flex-1">{url}</span>
        <button onClick={copyLink} className="shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <a href={`https://api.whatsapp.com/send?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 p-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors">
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-bold text-emerald-700">WhatsApp</span>
        </a>
        <a href={`sms:?body=${encodeURIComponent(`Install ${restaurantName} ${role.label}: ${url}`)}`}
          className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-colors">
          <span className="text-xl">📩</span>
          <span className="text-[10px] font-bold text-blue-700">SMS</span>
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(`Install ${restaurantName} ${role.label}`)}&body=${emailBody}`}
          className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">
          <span className="text-xl">📧</span>
          <span className="text-[10px] font-bold text-slate-700">Email</span>
        </a>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function AppDownloadCenter() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedRole, setSelectedRole] = useState('waiter');
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios' | 'share'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/settings/config').catch(() => ({ data: null }));
        if (data?.name) setRestaurantName(data.name);
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch {
        const s = JSON.parse(sessionStorage.getItem('session') || '{}');
        if (s.name) setRestaurantName(s.name);
      }
    };
    if (restaurantId) load();
  }, [restaurantId]);

  const role = ROLES.find(r => r.id === selectedRole);

  const tabs = [
    { id: 'android', label: 'Android APK', icon: '🤖' },
    { id: 'ios', label: 'iPhone / iPad', icon: '🍎' },
    { id: 'share', label: 'Share & QR', icon: '📤' },
  ];

  return (
    <DashboardShell title="App Download Center" restaurantId={restaurantId} role="admin">
      <div className="space-y-6 max-w-5xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg leading-tight">App Download Center</h2>
                <p className="text-indigo-300 text-xs">Generate installable mobile apps for your staff — no App Store needed</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {['✓ Android APK download', '✓ iOS home screen shortcut', '✓ Role-specific app per device', '✓ Auto-branded with restaurant name'].map(f => (
                <span key={f} className="text-[10px] bg-white/10 border border-white/20 px-2.5 py-1 rounded-full font-semibold">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Role selector */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Select Role</p>
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedRole(r.id); setActiveTab('android'); }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedRole === r.id
                    ? `border-2 shadow-md ${r.bg} ${r.border}`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{r.icon}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${selectedRole === r.id ? 'text-slate-800' : 'text-slate-600'}`}>{r.label}</p>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5 truncate">{r.desc}</p>
                </div>
                {selectedRole === r.id && (
                  <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                )}
              </button>
            ))}
          </div>

          {/* Right: Action panels */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Tab header */}
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-4 text-xs font-bold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-current'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                  style={activeTab === tab.id ? { color: role.color } : {}}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab body */}
            <div className="p-6">
              {/* Role pill */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">{role.icon}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${role.badge}`}
                >
                  {role.label}
                </span>
                <span className="text-xs text-slate-400">· {restaurantName}</span>
              </div>

              {activeTab === 'android' && (
                <AndroidPanel
                  role={role}
                  restaurantName={restaurantName}
                  restaurantId={restaurantId}
                  logoUrl={logoUrl}
                />
              )}
              {activeTab === 'ios' && (
                <IOSGuide role={role} restaurantName={restaurantName} restaurantId={restaurantId} />
              )}
              {activeTab === 'share' && (
                <QRPanel role={role} restaurantName={restaurantName} restaurantId={restaurantId} />
              )}
            </div>
          </div>
        </div>

        {/* All roles quick-access grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Access — All Role Install Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {ROLES.map((r) => {
              const url = `${window.location.origin}/r/${restaurantId}/login?role=${r.id}`;
              const qrThumb = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&margin=6&data=${encodeURIComponent(url)}`;
              return (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${r.bg} ${r.border}`}>
                  <img src={qrThumb} alt="" className="w-14 h-14 rounded-xl border border-white shadow-sm flex-shrink-0 bg-white" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700">{r.label}</p>
                    <button
                      onClick={() => { setSelectedRole(r.id); setActiveTab('android'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-[10px] font-semibold mt-1 hover:underline"
                      style={{ color: r.color }}
                    >
                      Download APK →
                    </button>
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
