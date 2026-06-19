'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { FleetLocationData } from '@/types';


interface UseFleetTrackingOptions {
  onRefresh?: () => void;
}

export function useFleetTracking(options?: UseFleetTrackingOptions) {
  const [locations, setLocations] = useState<FleetLocationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Use a ref for the callback so it doesn't trigger effect re-runs
  const onRefreshRef = useRef(options?.onRefresh);
  useEffect(() => {
    onRefreshRef.current = options?.onRefresh;
  }, [options?.onRefresh]);

  useEffect(() => {
    // Real WebSocket connection
    const token =
      typeof window !== 'undefined'
        ? document.cookie
            .split('; ')
            .find((c) => c.startsWith('gozolt-supplier-access-token='))
            ?.split('=')[1]
        : null;

    if (!token) {
      setError('No authentication token');
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const socket = io(`${API_URL}/supplier`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('connected', (data: { message: string }) => {
      console.log('Supplier WS:', data.message);
    });

    socket.on('supplier:vehicle:location', (data: FleetLocationData[]) => {
      setLocations(data);
    });

    socket.on('supplier:refresh', () => {
      console.log('Supplier WS: Refresh requested by server');
      if (onRefreshRef.current) {
        onRefreshRef.current();
      }
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const refreshFleet = useCallback(() => {
    socketRef.current?.emit('supplier:fleet:refresh');
  }, []);

  return { locations, isConnected, error, refreshFleet };
}
