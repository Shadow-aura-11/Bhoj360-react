import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Grid, List, Edit, Trash2, QrCode, Download, RefreshCw, X, ShoppingBag, Calendar } from 'lucide-react';
import { createApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import { useTables } from '../../hooks/useTables';
import DashboardShell from '../../components/Layout/DashboardShell';
import FloorPlan from '../../components/Tables/FloorPlan';
import TableModal from '../../components/Tables/TableModal';
import QRModal from '../../components/QR/QRModal';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function TablesManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const { socket } = useSocket(restaurantId);
  const { tables, loading, refreshTables } = useTables(restaurantId, socket);

  const [viewMode, setViewMode] = useState('floor'); // 'floor' | 'list'
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [qrTable, setQrTable] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [confirmDeleteTable, setConfirmDeleteTable] = useState(null);
  const [zipping, setZipping] = useState(false);

  // Extract unique sections
  const existingSections = Array.from(new Set(tables.map((t) => t.section).filter(Boolean)));

  const handleTableClick = (table) => {
    setSelectedTable(selectedTable?.id === table.id ? null : table);
  };

  const handleAddOrEditSubmit = async (formData) => {
    try {
      if (formData.bulk) {
        // Bulk creation
        await api.post('/tables/bulk', { tables: formData.tables });
        toast.success(`Successfully created ${formData.tables.length} tables`);
      } else if (editTable) {
        // Edit single
        await api.put(`/tables/${editTable.id}`, formData);
        toast.success(`Table ${formData.number} updated`);
      } else {
        // Add single
        await api.post('/tables', formData);
        toast.success(`Table ${formData.number} created`);
      }
      refreshTables();
      setEditTable(null);
    } catch (err) {
      console.error(err);
      const errMessage = err.response?.data?.error || 'Failed to save table';
      toast.error(errMessage);
    }
  };

  const handleDeleteTable = async () => {
    if (!confirmDeleteTable) return;
    try {
      await api.delete(`/tables/${confirmDeleteTable.id}`);
      toast.success(`Table ${confirmDeleteTable.number} deleted successfully`);
      setSelectedTable(null);
      refreshTables();
    } catch (err) {
      console.error(err);
      const errMessage = err.response?.data?.error || 'Failed to delete table';
      toast.error(errMessage);
    } finally {
      setConfirmDeleteTable(null);
    }
  };

  const downloadAllQRs = async () => {
    try {
      setZipping(true);
      const zip = new JSZip();
      
      const qrPromises = tables.map(async (table) => {
        try {
          const { data } = await api.get(`/tables/${table.id}/qr`);
          const base64Data = data.qr.replace(/^data:image\/png;base64,/, "");
          zip.file(`table-${table.number}-qr.png`, base64Data, { base64: true });
        } catch (err) {
          console.error(`Failed to get QR for table ${table.number}`, err);
        }
      });

      await Promise.all(qrPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `restaurant-${restaurantId}-qrs.zip`);
      toast.success('ZIP of all QR codes downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export ZIP file');
    } finally {
      setZipping(false);
    }
  };

  return (
    <DashboardShell title="Tables Manager" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        {/* Top Header Control bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          {/* Toggle buttons */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl">
            <button
              onClick={() => {
                setViewMode('floor');
                setSelectedTable(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'floor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Floor Plan</span>
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedTable(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table List</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadAllQRs}
              disabled={tables.length === 0 || zipping}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{zipping ? 'Exporting ZIP...' : 'Export All QRs'}</span>
            </button>
            <button
              onClick={() => {
                setEditTable(null);
                setTableModalOpen(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* View Layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Visual/Listing area */}
          <div className={`${selectedTable ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all`}>
            {loading ? (
              <div className="skeleton h-80 rounded-3xl" />
            ) : viewMode === 'floor' ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <FloorPlan
                  tables={tables}
                  onTableClick={handleTableClick}
                  onTableDoubleClick={(table) => {
                    setEditTable(table);
                    setTableModalOpen(true);
                  }}
                  selectedTableId={selectedTable?.id}
                />
              </div>
            ) : (
              /* List Table View */
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-650">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-mono uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-4 pl-6">Number</th>
                        <th className="p-4">Section</th>
                        <th className="p-4">Capacity</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tables.map((table) => (
                        <tr key={table.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-mono font-bold text-slate-800">{table.number}</td>
                          <td className="p-4 text-slate-700 font-semibold">{table.section}</td>
                          <td className="p-4">👥 {table.capacity} guests</td>
                          <td className="p-4">
                            <StatusBadge status={table.status} size="sm" />
                          </td>
                          <td className="p-4 text-right pr-6 space-x-1">
                            <button
                              onClick={() => {
                                setQrTable(table);
                                setQrModalOpen(true);
                              }}
                              className="p-2 hover:bg-slate-105 rounded-xl text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
                              title="QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditTable(table);
                                setTableModalOpen(true);
                              }}
                              className="p-2 hover:bg-slate-105 rounded-xl text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
                              title="Edit Table"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteTable(table)}
                              disabled={table.status !== 'available' && table.status !== 'inactive' && table.status !== 'reserved'}
                              className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-500/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                              title="Delete Table"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Detail: Opened on Table Click in Floor Plan */}
          {selectedTable && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-slide-up flex-shrink-0">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-display font-black text-2xl text-slate-800">Table {selectedTable.number}</h3>
                  <span className="text-[10px] text-slate-450 font-mono mt-0.5 block uppercase">Section: {selectedTable.section}</span>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-1 text-slate-450 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table Details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Status</span>
                  <StatusBadge status={selectedTable.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500">Max Capacity</span>
                    <span className="text-slate-700 font-bold block mt-0.5">👥 {selectedTable.capacity} guests</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Service Active</span>
                    <span className="text-slate-700 font-bold block mt-0.5">{selectedTable.active ? 'Active' : 'Disabled'}</span>
                  </div>
                </div>

                {/* Quick actions for selected table */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setQrTable(selectedTable);
                      setQrModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 shadow-sm"
                  >
                    <QrCode className="w-4.5 h-4.5" />
                    <span>View Table QR Code</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setEditTable(selectedTable);
                        setTableModalOpen(true);
                      }}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Table</span>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteTable(selectedTable)}
                      disabled={selectedTable.status !== 'available' && selectedTable.status !== 'inactive' && selectedTable.status !== 'reserved'}
                      className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Table</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit modal */}
      <TableModal
        isOpen={tableModalOpen}
        onClose={() => {
          setTableModalOpen(false);
          setEditTable(null);
        }}
        onSubmit={handleAddOrEditSubmit}
        table={editTable}
        existingSections={existingSections}
      />

      {/* QR Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setQrTable(null);
        }}
        table={qrTable}
        restaurantId={restaurantId}
      />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!confirmDeleteTable}
        onClose={() => setConfirmDeleteTable(null)}
        onConfirm={handleDeleteTable}
        title="Delete Table Instance?"
        message={`Are you sure you want to remove Table ${confirmDeleteTable?.number}? This action is permanent and will invalidate any QR codes printed for this table.`}
        confirmText="Yes, Delete Table"
        variant="danger"
      />
    </DashboardShell>
  );
}
