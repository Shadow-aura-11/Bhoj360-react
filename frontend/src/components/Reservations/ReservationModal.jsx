import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Phone, Mail, HelpCircle, Check } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function ReservationModal({
  isOpen,
  onClose,
  onSubmit,
  reservation = null,
  restaurantId,
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    party_size: 2,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '19:00',
    duration_minutes: 90,
    table_id: '',
    table_number: '',
    notes: '',
  });

  const [availableTables, setAvailableTables] = useState([]);
  const [searching, setSearching] = useState(false);
  const api = createApi(restaurantId);

  useEffect(() => {
    if (reservation) {
      setFormData({
        customer_name: reservation.customer_name || '',
        customer_phone: reservation.customer_phone || '',
        customer_email: reservation.customer_email || '',
        party_size: reservation.party_size || 2,
        reservation_date: reservation.reservation_date || '',
        reservation_time: reservation.reservation_time || '',
        duration_minutes: reservation.duration_minutes || 90,
        table_id: reservation.table_id || '',
        table_number: reservation.table_number || '',
        notes: reservation.notes || '',
      });
      // pre-fill the selected table as part of available tables list just in case
      if (reservation.table_id) {
        setAvailableTables([{ id: reservation.table_id, number: reservation.table_number, capacity: reservation.party_size }]);
      }
    } else {
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        party_size: 2,
        reservation_date: new Date().toISOString().split('T')[0],
        reservation_time: '19:00',
        duration_minutes: 90,
        table_id: '',
        table_number: '',
        notes: '',
      });
      setAvailableTables([]);
    }
  }, [reservation, isOpen]);

  const findAvailableTables = async () => {
    if (!formData.reservation_date || !formData.reservation_time) {
      toast.error('Please select date and time first');
      return;
    }
    try {
      setSearching(true);
      const { data } = await api.get('/reservations/availability', {
        params: {
          date: formData.reservation_date,
          time: formData.reservation_time,
          party_size: formData.party_size,
        },
      });
      setAvailableTables(data);
      if (data.length === 0) {
        toast.error('No tables available for this party size and time');
      } else {
        toast.success(`Found ${data.length} available tables!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to search available tables');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTable = (table) => {
    setFormData(prev => ({
      ...prev,
      table_id: table.id,
      table_number: table.number,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name) {
      toast.error('Customer name is required');
      return;
    }
    if (!formData.table_id) {
      toast.error('Please select a table');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            {reservation ? `Edit Reservation` : 'Add Reservation'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="e.g. Aman Gupta"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="e.g. aman@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Party Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Party Size</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.party_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, party_size: parseInt(e.target.value) || 1 }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  required
                  value={formData.reservation_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservation_date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  required
                  value={formData.reservation_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservation_time: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={90}>1.5 Hours</option>
                <option value={120}>2 Hours</option>
                <option value={180}>3 Hours</option>
              </select>
            </div>

            {/* Find Tables Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={findAvailableTables}
                disabled={searching}
                className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 h-[46px]"
              >
                {searching ? 'Searching...' : 'Find Available Tables'}
              </button>
            </div>
          </div>

          {/* Available Tables List */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Table * {formData.table_number && `(Selected: ${formData.table_number})`}
            </label>
            {availableTables.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableTables.map((table) => {
                  const isSelected = formData.table_id === table.id;
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => handleSelectTable(table)}
                      className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700/65 text-slate-300'
                      }`}
                    >
                      <span className="font-mono text-sm font-bold">{table.number}</span>
                      <span className="text-[10px] text-slate-400">Cap: {table.capacity}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                Click "Find Available Tables" to see available tables.
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Special Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Window seat preferred, allergy warnings, anniversary cake etc."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg ring-4 ring-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
