import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const sizeConfigs = {
  small: {
    cardClass: 'p-4 max-w-[200px] min-h-[250px]',
    imgSize: 'w-[120px] h-[120px] print:w-[100px] print:h-[100px]',
    titleClass: 'text-lg',
    subClass: 'text-[8.5px]',
    gridClass: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-w-6xl',
    printGridCols: '4'
  },
  medium: {
    cardClass: 'p-6 max-w-[280px] min-h-[360px]',
    imgSize: 'w-[180px] h-[180px] print:w-[160px] print:h-[160px]',
    titleClass: 'text-2xl',
    subClass: 'text-[10px]',
    gridClass: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl',
    printGridCols: '3'
  },
  large: {
    cardClass: 'p-8 max-w-[360px] min-h-[460px]',
    imgSize: 'w-[240px] h-[240px] print:w-[220px] print:h-[220px]',
    titleClass: 'text-3xl',
    subClass: 'text-xs',
    gridClass: 'grid-cols-1 sm:grid-cols-2 max-w-4xl',
    printGridCols: '2'
  }
};

export default function QRPrintPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const api = createApi(restaurantId);
  const [tables, setTables] = useState([]);
  const [qrs, setQrs] = useState({});
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [qrSize, setQrSize] = useState('medium'); // 'small' | 'medium' | 'large'
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/tables');
        setTables(data);
        setSelectedTableIds(data.map((table) => table.id));
        
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
      const tablesToDownload = tables.filter(t => selectedTableIds.includes(t.id));
      if (tablesToDownload.length === 0) {
        toast.error('No tables selected to download!');
        return;
      }
      setZipping(true);
      const zip = new JSZip();
      
      tablesToDownload.forEach((table) => {
        const qrObj = qrs[table.id];
        if (qrObj && qrObj.qr) {
          // Remove the data uri prefix: "data:image/png;base64,"
          const base64Data = qrObj.qr.replace(/^data:image\/png;base64,/, "");
          zip.file(`table-${table.number}-qr.png`, base64Data, { base64: true });
        }
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `restaurant-${restaurantId}-selected-tables-qrs.zip`);
      toast.success(`${tablesToDownload.length} QR Codes packaged and downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ZIP archive');
    } finally {
      setZipping(false);
    }
  };

  const cfg = sizeConfigs[qrSize];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-body">
      {/* Dynamic Style Override for Print Grid columns */}
      <style>{`
        @media print {
          .print-grid {
            grid-template-columns: repeat(${cfg.printGridCols}, 1fr) !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>

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
            {!loading && tables.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTableIds(tables.map(t => t.id))}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                  >
                    Select All ({tables.length})
                  </button>
                  <button
                    onClick={() => setSelectedTableIds([])}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-300 transition-colors uppercase tracking-wider bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/30"
                  >
                    Deselect All
                  </button>
                </div>
                
                <div className="w-px h-4 bg-slate-800 hidden sm:block" />

                {/* Sizing Controller */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span className="text-[9px] text-slate-500 font-bold uppercase px-2">Size:</span>
                  {['small', 'medium', 'large'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setQrSize(sz)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                        qrSize === sz
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-slate-550 font-semibold font-sans">
                  Selected: <strong className="text-slate-300">{selectedTableIds.length}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAllZip}
            disabled={loading || zipping || selectedTableIds.length === 0}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-sm font-semibold border border-slate-700/50 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{zipping ? 'Packaging ZIP...' : `Download ZIP (${selectedTableIds.length})`}</span>
          </button>
          
          <button
            onClick={handlePrint}
            disabled={loading || selectedTableIds.length === 0}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Cards ({selectedTableIds.length})</span>
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
        <div className={`print-grid grid gap-6 mx-auto ${cfg.gridClass}`}>
          {tables.map((table) => {
            const qrObj = qrs[table.id];
            const isSelected = selectedTableIds.includes(table.id);
            return (
              <div
                key={table.id}
                onClick={() => {
                  setSelectedTableIds(prev =>
                    prev.includes(table.id)
                      ? prev.filter(id => id !== table.id)
                      : [...prev, table.id]
                  );
                }}
                className={`bg-white border border-slate-205 rounded-2xl mx-auto w-full flex flex-col items-center text-center text-slate-950 shadow-md break-inside-avoid print:shadow-none print:border-slate-300 cursor-pointer transition-all relative select-none ${cfg.cardClass} ${
                  !isSelected 
                    ? 'no-print opacity-30 bg-slate-900/10 border-dashed border-slate-700 hover:opacity-55' 
                    : 'hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5'
                }`}
              >
                {/* On-screen checkbox */}
                <div className="absolute top-3 right-3 no-print">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                  />
                </div>

                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  ORDER FROM YOUR TABLE
                </span>
                
                <h2 className={`${cfg.titleClass} font-black font-display tracking-tight text-slate-900 mb-4`}>
                  TABLE {table.number}
                </h2>
                
                {/* QR Code */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 flex items-center justify-center">
                  {qrObj && qrObj.qr ? (
                    <img
                      src={qrObj.qr}
                      alt={`Table ${table.number} QR`}
                      className={`${cfg.imgSize}`}
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-xs bg-slate-100 rounded">
                      No QR
                    </div>
                  )}
                </div>

                <div className={`${cfg.subClass} font-semibold text-slate-400 uppercase mb-2`}>
                  Scan QR code with your phone
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
