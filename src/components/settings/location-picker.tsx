'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Search } from 'lucide-react';

interface LocationPickerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onChange: (lat: number, lng: number) => void;
}

function PlaceAutocomplete({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void }) {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center bg-[#0A0A0A] border border-[#27272A] rounded-lg px-3 shadow-lg w-11/12 max-w-md h-10">
      <Search className="w-4 h-4 text-[#A1A1AA] mr-2" />
      <input 
        ref={inputRef} 
        type="text"
        placeholder="Search location..."
        className="flex-1 bg-transparent border-none outline-none text-sm text-[#F4F4F5] placeholder-[#A1A1AA]"
      />
    </div>
  );
}

function MapWithAutocomplete({ markerPos, setMarkerPos, onChange, defaultCenter }: any) {
  const map = useMap();
  
  const handleMapClick = useCallback((e: any) => {
    if (e.detail.latLng) {
      setMarkerPos(e.detail.latLng);
      onChange(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  }, [onChange, setMarkerPos]);

  const onPlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMarkerPos({ lat, lng });
      onChange(lat, lng);
      map?.panTo({ lat, lng });
      map?.setZoom(15);
    }
  };

  return (
    <>
      <PlaceAutocomplete onPlaceSelect={onPlaceSelect} />
      <Map
        defaultCenter={markerPos || defaultCenter}
        defaultZoom={markerPos ? 15 : 11}
        mapId="LOCATION_PICKER_MAP"
        onClick={handleMapClick}
        disableDefaultUI={true}
        zoomControl={true}
        gestureHandling="greedy"
      >
        {markerPos && <AdvancedMarker position={markerPos} />}
      </Map>
    </>
  );
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  useEffect(() => {
    if (latitude && longitude && (!markerPos || markerPos.lat !== latitude || markerPos.lng !== longitude)) {
      setMarkerPos({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const defaultCenter = { lat: 35.8989, lng: 14.5146 }; // Malta
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-[300px] w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] flex flex-col items-center justify-center text-[#A1A1AA] p-4 text-center">
        <p className="mb-2">Google Maps API Key not configured.</p>
        <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-[#27272A] relative">
      <APIProvider apiKey={apiKey}>
        <MapWithAutocomplete 
          markerPos={markerPos} 
          setMarkerPos={setMarkerPos} 
          onChange={onChange} 
          defaultCenter={defaultCenter} 
        />
      </APIProvider>
    </div>
  );
}
