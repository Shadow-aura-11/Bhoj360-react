import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, List, Grid, Plus, ChevronLeft, ChevronRight, Check, X, Ban, Edit, Trash2 } from 'lucide-react';
import { createApi } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';
import { useTables } from '../../hooks/useTables';
import { useReservations } from '../../hooks/useReservations';
import DashboardShell from '../../components/Layout/DashboardShell';
import ReservationTimeline from '../../components/Reservations/ReservationTimeline';
import ReservationModal from '../../components/Reservations/ReservationModal';
import StatusBadge from '../../components/shared/StatusBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';
import { format, addDays, subDays, parseISO } from 'date-fns';

export default function ReservationsManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const { socket } = useSocket(restaurantId);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  const { tables } = useTables(restaurantId, socket);
  const { reservations, loading, refreshReservations } = useReservations(restaurantId, socket, formattedDate);

  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'list'
  const [resModalOpen, setResModalOpen] = useState(false);
  const [editReservation, setEditReservation] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [confirmCancelRes, setConfirmCancelRes] = useState(null);

  const handlePrevDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleReservationClick = (res) => {
    setSelectedReservation(selectedReservation?.id === res.id ? null : res);
  };

  const handleAddOrEditSubmit = async (formData) => {
    try {
      if (editReservation) {
        await api.put(`/reservations/${editReservation.id}`, formData);
        toast.success('Reservation updated successfully');
      } else {
        await api.post('/reservations', formData);
        toast.success('Reservation created successfully');
      }
      refreshReservations();
      setEditReservation(null);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to save reservation';
      toast.error(errMsg);
    }
  };

  const handleSeat = async (res) => {
    try {
      await api.put(`/reservations/${res.id}`, { status: 'seated' });
      toast.success(`Seated customer ${res.customer_name}`);
      setSelectedReservation(null);
      refreshReservations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to seat reservation');
    }
  };

  const handleNoShow = async (res) => {
    try {
      await api.put(`/reservations/${res.id}`, { status: 'no-show' });
      toast.success(`Marked ${res.customer_name} as No-Show`);
      setSelectedReservation(null);
      refreshReservations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update reservation');
    }
  };

  const handleCancelReservation = async () => {
    if (!confirmCancelRes) return;
    try {
      await api.delete(`/reservations/${confirmCancelRes.id}`);
      toast.success(`Reservation for ${confirmCancelRes.customer_name} cancelled`);
      setSelectedReservation(null);
      refreshReservations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel reservation');
    } finally {
      setConfirmCancelRes(null);
    }
  };

  return (
    <DashboardShell title="Reservations" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">
        {/* Upper Header Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          
          {/* Date Picker Bar */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 font-mono">
              {format(selectedDate, 'EEE, MMM d, yyyy')}
            </span>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl">
              <button
                onClick={() => {
                  setViewMode('timeline');
                  setSelectedReservation(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedReservation(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Guest List</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditReservation(null);
                setResModalOpen(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Book Table</span>
            </button>
          </div>
        </div>

        {/* Workspace body layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Timeline / List Panel */}
          <div className={`${selectedReservation ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all`}>
            {loading ? (
              <div className="skeleton h-80 rounded-3xl" />
            ) : viewMode === 'timeline' ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <ReservationTimeline
                  reservations={reservations}
                  tables={tables}
                  date={selectedDate}
                  onReservationClick={handleReservationClick}
                />
              </div>
            ) : (
              /* List view */
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-650">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-mono uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-4 pl-6">Time</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Table</th>
                        <th className="p-4 text-center">Size</th>
                        <th className="p-4 text-center">Dur.</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reservations.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            No reservations booked for this day.
                          </td>
                        </tr>
                      ) : (
                        reservations.map((res) => (
                          <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6 font-mono font-bold text-indigo-600">{res.reservation_time}</td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800">{res.customer_name}</div>
                              <div className="text-xs text-slate-550 font-mono mt-0.5">{res.customer_phone || 'no phone'}</div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded">
                                Table {res.table_number || res.table_id}
                              </span>
                            </td>
                            <td className="p-4 text-center">👥 {res.party_size}</td>
                            <td className="p-4 text-center text-slate-500 text-xs">{res.duration_minutes}m</td>
                            <td className="p-4">
                              <StatusBadge status={res.status} size="sm" />
                            </td>
                            <td className="p-4 text-right pr-6 space-x-1.5">
                              {res.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => handleSeat(res)}
                                    className="p-1.5 hover:bg-green-500/10 text-slate-450 hover:text-green-600 border border-slate-200 hover:border-green-500/20 rounded-lg transition-colors"
                                    title="Seat Guest"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleNoShow(res)}
                                    className="p-1.5 hover:bg-rose-500/10 text-slate-450 hover:text-rose-600 border border-slate-200 hover:border-rose-500/20 rounded-lg transition-colors"
                                    title="No Show"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setEditReservation(res);
                                  setResModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
                                title="Edit Booking"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {res.status !== 'cancelled' && (
                                <button
                                  onClick={() => setConfirmCancelRes(res)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-slate-300 transition-colors"
                                  title="Cancel Booking"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Reservation Detail sidebar popover */}
          {selectedReservation && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-display font-black text-xl text-slate-800">{selectedReservation.customer_name}</h3>
                  <span className="text-[10px] text-slate-450 font-mono mt-0.5 block uppercase">Booking ID: #{selectedReservation.id}</span>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-1 text-slate-450 hover:text-slate-705 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Status</span>
                  <StatusBadge status={selectedReservation.status} />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seating Assign</span>
                    <span className="text-slate-700 font-semibold">Table {selectedReservation.table_number || selectedReservation.table_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Time</span>
                    <span className="text-indigo-600 font-mono font-semibold">{selectedReservation.reservation_time} ({selectedReservation.duration_minutes}m)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Party Size</span>
                    <span className="text-slate-700 font-semibold">👥 {selectedReservation.party_size} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Contact</span>
                    <span className="text-slate-750 font-mono">{selectedReservation.customer_phone || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Contact</span>
                    <span className="text-slate-700">{selectedReservation.customer_email || 'None'}</span>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
                    Notes: "{selectedReservation.notes}"
                  </div>
                )}

                {/* Operations quick buttons */}
                {selectedReservation.status === 'confirmed' && (
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleSeat(selectedReservation)}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Seat Guest Now</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleNoShow(selectedReservation)}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-205 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                      >
                        <X className="w-4 h-4 text-rose-600" />
                        <span>No-Show</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditReservation(selectedReservation);
                          setResModalOpen(true);
                        }}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-205 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                      >
                        <Edit className="w-4 h-4 text-indigo-650" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reservation booking modal */}
      <ReservationModal
        isOpen={resModalOpen}
        onClose={() => {
          setResModalOpen(false);
          setEditReservation(null);
        }}
        onSubmit={handleAddOrEditSubmit}
        reservation={editReservation}
        restaurantId={restaurantId}
      />

      {/* Cancellation confirm */}
      <ConfirmModal
        isOpen={!!confirmCancelRes}
        onClose={() => setConfirmCancelRes(null)}
        onConfirm={handleCancelReservation}
        title="Cancel Reservation?"
        message={`Are you sure you want to cancel the reservation for ${confirmCancelRes?.customer_name} scheduled at ${confirmCancelRes?.reservation_time}?`}
        confirmText="Yes, Cancel Booking"
        variant="danger"
      />
    </DashboardShell>
  );
}
