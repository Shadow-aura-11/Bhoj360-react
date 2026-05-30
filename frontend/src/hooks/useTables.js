import { useState, useEffect, useCallback } from 'react';
import { createApi } from '../api/client';
import toast from 'react-hot-toast';

export function useTables(restaurantId, socket) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = createApi(restaurantId);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tables');
      setTables(data);
    } catch (err) {
      console.error('Failed to fetch tables', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId, fetchTables]);

  useEffect(() => {
    if (!socket) return;

    const handleTableAdded = (table) => {
      setTables((prev) => {
        if (prev.some((t) => t.id === table.id)) return prev;
        return [...prev, table];
      });
      toast.success(`Table ${table.number} added`);
    };

    const handleTableUpdated = (table) => {
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, ...table } : t))
      );
    };

    const handleTableDeleted = ({ tableId, tableNumber }) => {
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      toast.error(`Table ${tableNumber} removed`);
    };

    const handleStatusChanged = ({ tableId, status }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
    };

    const handleSnapshot = (snapshot) => {
      if (snapshot && snapshot.tables) {
        setTables(snapshot.tables);
      }
    };

    socket.on('table:added', handleTableAdded);
    socket.on('table:updated', handleTableUpdated);
    socket.on('table:deleted', handleTableDeleted);
    socket.on('table:statusChanged', handleStatusChanged);
    socket.on('snapshot', handleSnapshot);

    return () => {
      socket.off('table:added', handleTableAdded);
      socket.off('table:updated', handleTableUpdated);
      socket.off('table:deleted', handleTableDeleted);
      socket.off('table:statusChanged', handleStatusChanged);
      socket.off('snapshot', handleSnapshot);
    };
  }, [socket]);

  return { tables, loading, refreshTables: fetchTables };
}
