import { useState, useEffect, useCallback } from 'react';
import { createApi } from '../api/client';
import toast from 'react-hot-toast';

export function useOrders(restaurantId, socket, filters = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = createApi(restaurantId);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.table_id) params.table_id = filters.table_id;
      if (filters.date) params.date = filters.date;

      const { data } = await api.get('/orders', { params });
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, filters.status, filters.table_id, filters.date]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
    }
  }, [restaurantId, fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderNew = (data) => {
      const order = data.order || data;
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      toast.success(`New order #${order.id} for Table ${order.table_number || order.table_id}`);
    };

    const handleOrderUpdated = (data) => {
      const order = data.order || data;
      const orderId = order.id || data.orderId;
      const status = order.status || data.status;
      const tableNumber = order.table_number || order.table_id || data.tableNumber;
      const total = order.total !== undefined ? order.total : data.total;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, ...order, status, ...(total !== undefined ? { total } : {}) }
            : o
        )
      );
      toast.success(`Order #${orderId} (Table ${tableNumber}) updated to ${status}`);
    };

    const handleOrderItemAdded = (data) => {
      const order = data.order || data;
      const orderId = order.id || data.orderId;
      const total = order.total !== undefined ? order.total : data.total;

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            if (order.items) {
              return { ...o, ...order };
            }
            const item = data.item;
            const updatedItems = o.items ? [...o.items] : [];
            if (item && !updatedItems.some((i) => i.id === item.id)) {
              updatedItems.push(item);
            }
            return { ...o, items: updatedItems, total };
          }
          return o;
        })
      );

      if (data.item) {
        toast.success(`Added ${data.item.item_name} to Order #${orderId}`);
      } else {
        toast.success(`Order #${orderId} updated`);
      }
    };

    socket.on('order:new', handleOrderNew);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:itemAdded', handleOrderItemAdded);

    return () => {
      socket.off('order:new', handleOrderNew);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:itemAdded', handleOrderItemAdded);
    };
  }, [socket]);

  return { orders, loading, refreshOrders: fetchOrders };
}
