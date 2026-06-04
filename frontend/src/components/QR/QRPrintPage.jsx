import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function QRPrintPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const api = createApi(restaurantId);
  const [tables, setTables] = useState([]);
  const [qrs, setQrs] = useState({});
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/tables');
        setTables(data);
        
        // Fetch all QR codes in parallel
        const origin = window.location.origin + window.location.pathname.split('/r/')[0];
        const qrPromises = data.map(async (table) => {
          try {
            const qrRes = await api.get(`/tables/${table.id}/qr`, { params: { origin } });
            return { id: table.id, qr: qrRes.data.qr, url: qrRes.data.url };
          } catch {
            return { id: table.id, qr: '', url: '' };
          }
        });
        
        const qrResults = await Promise.all(qrPromises);
        const qrMap = qrResults.reduce((acc, result) => {
          acc[result.id] = result;
          return acc;
        }, {});
        
        setQrs(qrMap);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tables and QR codes');
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) loadTables();
  }, [restaurantId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAllZip = async () => {
    try {
      setZipping(true);
      const zip = new JSZip();
      
      tables.forEach((table) => {
        const qrObj = qrs[table.id];
        if (qrObj && qrObj.qr) {
          // Remove the data uri prefix: "data:image/png;base64,"
          const base64Data = qrObj.qr.replace(/^data:image\/png;base64,/, "");
          zip.file(`table-${table.number}-qr.png`, base64Data, { base64: true });
        }
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `restaurant-${restaurantId}-tables-qrs.zip`);
      toast.success('All QR Codes packaged and downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ZIP archive');
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-body">
      {/* Top Header Control - Hidden in Print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-100">Print Table QR Codes</h1>
            <p className="text-xs text-slate-400 mt-0.5">Generate printable layouts for customer ordering tables</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAllZip}
            disabled={loading || zipping}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-sm font-semibold border border-slate-700/50 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{zipping ? 'Packaging ZIP...' : 'Download ZIP'}</span>
          </button>
          
          <button
            onClick={handlePrint}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Cards</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm">Loading tables and rendering QR codes...</p>
        </div>
      ) : (
        /* Print Layout Grid */
        <div className="print-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tables.map((table) => {
            const qrObj = qrs[table.id];
            return (
              <div
                key={table.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center text-slate-950 shadow-md break-inside-avoid print:shadow-none print:border-slate-300"
              >
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  ORDER FROM YOUR TABLE
                </span>
                
                <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 mb-4">
                  TABLE {table.number}
                </h2>
                
                {/* QR Code */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 flex items-center justify-center">
                  {qrObj && qrObj.qr ? (
                    <img
                      src={qrObj.qr}
                      alt={`Table ${table.number} QR`}
                      className="w-[180px] h-[180px] print:w-[160px] print:h-[160px]"
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-xs bg-slate-100 rounded">
                      No QR
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2">
                  Scan QR code with your phone
                </div>
                
                <div className="w-full h-px bg-slate-200/80 mb-3" />
                
                <span className="text-[9px] font-mono text-slate-400 truncate max-w-full px-2 select-all">
                  {qrObj ? qrObj.url : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
