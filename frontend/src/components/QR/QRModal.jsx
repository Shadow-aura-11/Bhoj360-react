import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Printer, RefreshCw } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmModal from '../shared/ConfirmModal';

export default function QRModal({ isOpen, onClose, table, restaurantId }) {
  const [qrCode, setQrCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const api = createApi(restaurantId);

  const fetchQR = async () => {
    if (!table) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/tables/${table.id}/qr`);
      setQrCode(data.qr); // base64 string
      setQrUrl(data.url); // url string
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && table) {
      fetchQR();
    }
  }, [table, isOpen]);

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success('QR URL copied to clipboard');
  };

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `table-${table.number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      await api.post(`/tables/${table.id}/qr/regenerate`);
      toast.success('QR Code regenerated successfully');
      fetchQR();
    } catch (err) {
      console.error(err);
      toast.error('Failed to regenerate QR code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !table) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-slide-up flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-bold font-display text-slate-100 mb-1">
            Table {table.number} QR Code
          </h3>
          <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-850 rounded border border-slate-850">
            Section: {table.section}
          </span>

          {/* QR Code Container */}
          <div className="my-6 p-4 bg-white rounded-2xl shadow-inner relative flex items-center justify-center min-w-[200px] min-h-[200px]">
            {loading ? (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : null}
            {qrCode ? (
              <img src={qrCode} alt={`Table ${table.number} QR`} className="w-[180px] h-[180px]" />
            ) : (
              <div className="text-slate-400 text-xs">Error loading QR</div>
            )}
          </div>

          {/* URL text */}
          <div className="w-full flex items-center justify-between gap-2 p-2 bg-slate-950/50 rounded-xl border border-slate-800/80 mb-6 text-xs text-slate-400 font-mono">
            <span className="truncate flex-1 text-left select-all px-2">{qrUrl}</span>
            <button
              onClick={copyUrl}
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleDownload}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
            >
              <Printer className="w-3.5 h-3.5" />
              Print QR
            </button>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full py-2.5 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/20 hover:border-rose-500/40 rounded-xl text-xs font-semibold text-rose-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Token
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRegenerate}
        title="Regenerate QR Token?"
        message="This will immediately invalidate the existing QR code. Any customer currently looking at the old QR page will not be able to place orders anymore."
        confirmText="Yes, Regenerate"
        variant="danger"
      />
    </>
  );
}
