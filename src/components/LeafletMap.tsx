import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Worker } from '../types';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface LeafletMapProps {
  workers?: Worker[];
  selectedWorker?: Worker | null;
  onWorkerSelect?: (worker: Worker) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  allowLocationPicker?: boolean;
  onLocationSelected?: (lat: number, lng: number, addressText?: string) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  workers = [],
  selectedWorker = null,
  onWorkerSelect,
  center = [12.9716, 77.5946], // Bangalore default
  zoom = 12,
  height = '400px',
  allowLocationPicker = false,
  onLocationSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locPermissionDenied, setLocPermissionDenied] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Free OpenStreetMap standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Handle map clicks for location picker
      if (allowLocationPicker) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelected) {
            onLocationSelected(lat, lng, `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          }
        });
      }
    }

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Detect User Location (Safe, with fallback)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocPermissionDenied(true);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocPermissionDenied(false);
        setLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
        }

        if (allowLocationPicker && onLocationSelected) {
          onLocationSelected(latitude, longitude, 'Current GPS Location');
        }
      },
      (error) => {
        console.warn('Geolocation denied or unavailable:', error.message);
        setLocPermissionDenied(true);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Update Worker Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // User Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `<div style="background-color: #2563EB; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.6);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(userLocation, { icon: userIcon })
        .bindPopup(`<b>Your Detected Location</b>`)
        .addTo(markersGroup);
    }

    // Worker Markers
    workers.forEach((worker) => {
      if (!worker.location?.lat || !worker.location?.lng) return;

      const isSelected = selectedWorker?._id === worker._id;
      const markerHtml = `
        <div style="
          background: ${isSelected ? '#1D4ED8' : '#2563EB'};
          color: white;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          white-space: nowrap;
          cursor: pointer;
        ">
          <span>★ ${worker.rating > 0 ? worker.rating.toFixed(1) : '5.0'}</span>
          <span>${worker.name.split(' ')[0]}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'worker-marker',
        html: markerHtml,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker([worker.location.lat, worker.location.lng], { icon: customIcon });

      const popupContent = `
        <div style="min-width: 180px; padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0; font-weight: 700; font-size: 13px; color: #0F172A;">${worker.name}</h4>
          <p style="margin: 2px 0 6px; font-size: 11px; color: #2563EB; font-weight: 600;">${worker.profession}</p>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            <span>★ ${worker.rating.toFixed(1)} (${worker.totalReviews} reviews)</span> • 
            <span>${worker.experience} yrs exp</span>
          </div>
          <div style="font-size: 10px; background: #F1F5F9; padding: 4px; border-radius: 6px; color: #334155;">
            📍 ${worker.serviceArea || worker.city}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onWorkerSelect) onWorkerSelect(worker);
      });

      marker.addTo(markersGroup);
    });

    // Auto fit bounds if workers exist
    if (workers.length > 0 && !selectedWorker) {
      const validCoords = workers
        .filter((w) => w.location?.lat && w.location?.lng)
        .map((w) => [w.location!.lat, w.location!.lng] as [number, number]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    } else if (selectedWorker?.location?.lat && selectedWorker?.location?.lng) {
      mapInstanceRef.current.flyTo(
        [selectedWorker.location.lat, selectedWorker.location.lng],
        14,
        { duration: 1.2 }
      );
    }
  }, [workers, selectedWorker, userLocation]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Geolocation control overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleDetectLocation}
          disabled={locating}
          title="Detect Current Location"
          className="bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-md text-slate-700 hover:text-blue-600 hover:bg-white transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <Navigation className={`w-4 h-4 ${locating ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">{locating ? 'Locating...' : 'My Location'}</span>
        </button>
      </div>

      {locPermissionDenied && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-amber-50/95 backdrop-blur-xs border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Location permission denied. Showing standard city area; you can also select your area manually.</span>
        </div>
      )}
    </div>
  );
};
