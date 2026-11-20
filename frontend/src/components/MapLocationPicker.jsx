import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search } from 'lucide-react';

export default function MapLocationPicker({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationSelect,
  height = '280px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: initialLat, lng: initialLng });
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const QUICK_CITIES = [
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { name: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { name: 'Mangaluru', lat: 12.9141, lng: 74.8560 },
    { name: 'Belagavi', lat: 15.8497, lng: 74.4977 }
  ];

  const updatePosition = (lat, lng, cityName = null) => {
    const formattedLat = parseFloat(lat.toFixed(5));
    const formattedLng = parseFloat(lng.toFixed(5));
    setSelectedCoords({ lat: formattedLat, lng: formattedLng });
    if (markerRef.current) {
      markerRef.current.setLatLng([formattedLat, formattedLng]);
    }
    if (onLocationSelect) {
      onLocationSelect(formattedLat, formattedLng, cityName);
    }
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-solar-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(16, 185, 129, 0.35); border-radius: 50%;"></div>
          <div style="position: relative; width: 26px; height: 26px; background: #10B981; border: 2.5px solid #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      updatePosition(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      updatePosition(e.latlng.lat, e.latlng.lng);
    });

    const timer = setTimeout(() => {
      if (map) map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (container && container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Karnataka, India')}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        updatePosition(lat, lng, searchQuery);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          mapInstanceRef.current.invalidateSize();
        }
      } else {
        alert("Location not found. Try searching a major locality or city name.");
      }
    } catch (err) {
      console.warn("Geocoding failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleCityQuickSelect = (city) => {
    updatePosition(city.lat, city.lng, city.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([city.lat, city.lng], 14);
      mapInstanceRef.current.invalidateSize();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
      {/* Search & Quick City Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flex: '1 1 200px' }}>
          <input
            type="text"
            placeholder="Search city/area (e.g. Indiranagar, Mysuru)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
            style={{
              flex: 1,
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: '#1F2937',
              border: '1px solid var(--border-subtle)',
              color: '#FFF',
              fontSize: '0.75rem'
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Search size={12} />
            {searching ? '...' : 'Search'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {QUICK_CITIES.map(c => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleCityQuickSelect(c)}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: height,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      />

      {/* Coordinates readout and instruction */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        padding: '0.45rem 0.75rem',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        color: 'var(--emerald-400)',
        flexWrap: 'wrap',
        gap: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={14} />
          <span><b>Pinned Location:</b> {selectedCoords.lat}° N, {selectedCoords.lng}° E</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Click map or drag pin to adjust rooftop</span>
      </div>
    </div>
  );
}
