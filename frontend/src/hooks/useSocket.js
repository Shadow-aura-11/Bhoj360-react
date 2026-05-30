import { useState, useEffect, useRef } from 'react';
import { createSocket } from '../api/client';

export function useSocket(restaurantId) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!restaurantId) return;
    const socket = createSocket(restaurantId);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  return { socket: socketRef.current, isConnected };
}
