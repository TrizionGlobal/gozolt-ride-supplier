'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { FleetLocationData } from '@/types';
import { mockFleetLocations } from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

export function useFleetTracking() {
  const [locations, setLocations] = useState<FleetLocationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // DevBypass: use mock data with simulated movement
    if (isDevBypassed()) {
      setLocations(mockFleetLocations);
      setIsConnected(true);

      const interval = setInterval(() => {
        setLocations((prev) =>
          prev.map((loc) => ({
            ...loc,
            lat: loc.lat + (Math.random() - 0.5) * 0.001,
            lng: loc.lng + (Math.random() - 0.5) * 0.001,
            speed: Math.random() > 0.5 ? Math.round(Math.random() * 60) : null,
          })),
        );
      }, 5000);

      return () => clearInterval(interval);
    }

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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
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
