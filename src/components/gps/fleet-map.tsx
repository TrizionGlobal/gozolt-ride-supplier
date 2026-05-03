'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FleetLocationData } from '@/types';
import { mockRoutePolyline } from '@/lib/mock-data';

// Fix Leaflet default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const markerColors = ['#EF4444', '#22C55E', '#FACC15', '#3B82F6', '#A855F7', '#F97316'];

function createVehicleIcon(plateNumber: string, index: number) {
  const color = markerColors[index % markerColors.length];
  return L.divIcon({
    className: '',
    html: `<div style="background:${color}; color:${color === '#FACC15' ? '#000' : '#fff'}; padding:5px 14px; border-radius:999px; font-size:12px; font-weight:600; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:inline-block;">${plateNumber}</div>`,
    iconSize: [0, 0],
    iconAnchor: [50, 15],
  });
}

// Map resize handler
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

interface FleetMapProps {
  locations: FleetLocationData[];
  selectedDriverId: string | null;
  onMarkerClick: (driverId: string) => void;
}

export default function FleetMap({ locations, selectedDriverId, onMarkerClick }: FleetMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Center on selected driver
  useEffect(() => {
    if (selectedDriverId && mapRef.current) {
      const loc = locations.find((l) => l.driverId === selectedDriverId);
      if (loc) {
        mapRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 0.5 });
      }
    }
  }, [selectedDriverId, locations]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        center={[35.9375, 14.3754]}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
        ref={mapRef}
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route polyline */}
        <Polyline
          positions={mockRoutePolyline}
          pathOptions={{ color: '#EF4444', weight: 3, dashArray: '8, 8', opacity: 0.7 }}
        />

        {/* Vehicle markers */}
        {locations.map((loc, i) => (
          <Marker
            key={loc.driverId}
            position={[loc.lat, loc.lng]}
            icon={createVehicleIcon(loc.vehicle?.plateNumber || '???', i)}
            eventHandlers={{
              click: () => onMarkerClick(loc.driverId),
            }}
          >
            <Popup>
              <div style={{ color: '#000', minWidth: 140 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>{loc.driverName}</p>
                <p style={{ fontSize: 12, margin: '2px 0' }}>{loc.vehicle?.plateNumber} — {loc.vehicle?.make} {loc.vehicle?.model}</p>
                <p style={{ fontSize: 12, margin: '2px 0' }}>Speed: {loc.speed != null ? `${loc.speed} km/h` : 'Stationary'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map overlay text */}
      <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Malta Fleet Map
        </h2>
        <p className="text-sm text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Real-time vehicle Positions
        </p>
      </div>

      {/* Vehicle pills at bottom */}
      <div className="absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 gap-3">
        {locations.map((loc, i) => {
          const color = markerColors[i % markerColors.length];
          return (
            <button
              key={loc.driverId}
              onClick={() => onMarkerClick(loc.driverId)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-transform hover:scale-105"
              style={{
                backgroundColor: color,
                color: color === '#FACC15' ? '#000' : '#fff',
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color === '#FACC15' ? '#000' : 'rgba(255,255,255,0.6)' }}
              />
              {loc.vehicle?.plateNumber || '???'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
