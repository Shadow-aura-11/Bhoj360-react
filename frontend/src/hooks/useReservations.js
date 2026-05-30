import { useState, useEffect, useCallback } from 'react';
import { createApi } from '../api/client';
import toast from 'react-hot-toast';

export function useReservations(restaurantId, socket, date = '') {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = createApi(restaurantId);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (date) params.date = date;
      const { data } = await api.get('/reservations', { params });
      setReservations(data);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, date]);

  useEffect(() => {
    if (restaurantId) {
      fetchReservations();
    }
  }, [restaurantId, fetchReservations]);

  useEffect(() => {
    if (!socket) return;

    const handleReservationNew = (data) => {
      const res = data.reservation || data;
      setReservations((prev) => {
        if (prev.some((r) => r.id === res.id)) return prev;
        return [...prev, res].sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
      });
      toast.success(`New reservation for ${res.customer_name} at ${res.reservation_time}`);
    };

    const handleReservationUpdated = (data) => {
      const res = data.reservation || data;
      const reservationId = res.id || data.reservationId;
      const status = res.status || data.status;
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
      );
    };

    const handleReservationCancelled = (data) => {
      const reservationId = data.reservationId || data.id;
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r))
      );
      toast.error(`Reservation cancelled`);
    };

    const handleReservationReminder = (data) => {
      const reservation = data.reservation || data;
      toast(`Reminder: Reservation for ${reservation.customer_name} (Table ${reservation.table_number}) is at ${reservation.reservation_time}!`, {
        icon: '⏰',
        duration: 6000,
        style: {
          background: '#3b82f6',
          color: '#ffffff',
        }
      });
    };

    socket.on('reservation:new', handleReservationNew);
    socket.on('reservation:updated', handleReservationUpdated);
    socket.on('reservation:cancelled', handleReservationCancelled);
    socket.on('reservation:reminder', handleReservationReminder);

    return () => {
      socket.off('reservation:new', handleReservationNew);
      socket.off('reservation:updated', handleReservationUpdated);
      socket.off('reservation:cancelled', handleReservationCancelled);
      socket.off('reservation:reminder', handleReservationReminder);
    };
  }, [socket]);

  return { reservations, loading, refreshReservations: fetchReservations };
}
