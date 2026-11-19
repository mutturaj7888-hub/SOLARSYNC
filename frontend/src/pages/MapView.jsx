import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  Layers, 
  Sun, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair, 
  Plus, 
  Info, 
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNearbyInstallations, getInstallations, createInstallation } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function MapView({ onReportFault }) {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  
  // Geolocation state (default: Bengaluru Hub 12.9716, 77.5946)
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(15);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Map Style state: 'streets' (default OpenStreetMap) | 'satellite' (Mapbox HD)
  const [mapStyle, setMapStyle] = useState('streets');

  // Installations data
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  
  // Search state (Nominatim geocoding)
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Pin drop / Register mode
  const [pinDropMode, setPinDropMode] = useState(false);
  const pinDropModeRef = useRef(false);
  pinDropModeRef.current = pinDropMode;

  const [droppedPin, setDroppedPin] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newInstForm, setNewInstForm] = useState({
    name: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacity_kw: 15.0,
    installation_type: 'rooftop_residential',
    inverter: 'Sungrow SG10KTL',
    panels: 'Canadian Solar 540W'
  });

  // Map DOM reference
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);

  // Request browser geolocation
  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setHasLocationPermission(true);
        setGeoLocating(false);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([coords.lat, coords.lng], 14);
          leafletMapRef.current.invalidateSize();
        }
      },
      (err) => {
        console.warn("Location permission denied or unavailable:", err.message);
        setGeoLocating(false);
        setHasLocationPermission(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Fetch installations within radius
  const fetchInstallations = async () => {
    setLoading(true);
    try {
      const data = await getNearbyInstallations(
        userLocation.lat,
        userLocation.lng,
        radiusKm,
        statusFilter
      );
      setInstallations(data);
    } catch (e) {
      console.warn("Could not load nearby, fallback to all:", e);
      try {
        const fallback = await getInstallations({ status: statusFilter });
        setInstallations(fallback);
      } catch (err) {
        setInstallations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tile layer configuration helper
  const getTileConfig = (style) => {
    switch (style) {
      case 'satellite':
        return {
          url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
          options: {
            attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 22,
            tileSize: 256,
            zoomOffset: 0,
          }
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          options: {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 20,
            subdomains: 'abcd',
          }
        };
      case 'streets':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        };
    }
  };

  const setupTileLayer = (mapInstance, style) => {
    if (!mapInstance) return;
    if (tileLayerRef.current) {
      try {
        mapInstance.removeLayer(tileLayerRef.current);
      } catch (e) {}
      tileLayerRef.current = null;
    }

    const { url, options } = getTileConfig(style);
    const layer = L.tileLayer(url, options);

    layer.on('tileerror', () => {
      console.warn(`Tile error on style [${style}], falling back to OpenStreetMap`);
      if (style !== 'streets') {
        setMapStyle('streets');
      }
    });

    layer.addTo(mapInstance);
    tileLayerRef.current = layer;

    try {
      layer.bringToBack();
    } catch (e) {}
  };

  // Initialize Leaflet Map once on mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.off();
        leafletMapRef.current.remove();
      } catch (e) {}
      leafletMapRef.current = null;
    }
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    let map = null;
    try {
      map = L.map(container, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true,
        maxZoom: 22,
      });
      leafletMapRef.current = map;
    } catch (err) {
      console.error("Leaflet init error:", err);
      return;
    }

    // Set up base tile layer immediately on creation
    setupTileLayer(map, mapStyle);

    markersLayerRef.current = L.layerGroup().addTo(map);

    const handleResize = () => {
      if (map) map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 150);

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 500);

    // Click handler for pin dropping / registration
    map.on('click', (e) => {
      if (pinDropModeRef.current) {
        setDroppedPin({ lat: e.latlng.lat, lng: e.latlng.lng });
        setShowRegisterModal(true);
      }
    });

    requestCurrentLocation();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.off();
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
      }
      if (container && container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, []);

  // Update Map Tile Layer when mapStyle changes
  useEffect(() => {
    if (leafletMapRef.current) {
      setupTileLayer(leafletMapRef.current, mapStyle);
    }
  }, [mapStyle]);

  // Invalidate map size whenever tab or layout adjusts
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
      }, 200);
    }
  }, [installations]);

  // Update installations when location, radius, or status changes
  useEffect(() => {
    fetchInstallations();
  }, [userLocation, radiusKm, statusFilter]);

  // Render markers and radius circle on Leaflet Map
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Update user marker & pulse radius
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (radiusCircleRef.current) map.removeLayer(radiusCircleRef.current);

    const userIcon = L.divIcon({
      className: 'user-geo-pin',
      html: `
        <div style="position: relative; width: 32px; height: 32px;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.45); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 7px; left: 7px; width: 18px; height: 18px; background: #3B82F6; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 16px rgba(59,130,246,1);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup("<div style='font-family:sans-serif;'><b>Your Search Location</b><br/>Searching registered solar assets around here.</div>")
      .addTo(map);

    radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      radius: radiusKm * 1000,
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '5, 8'
    }).addTo(map);

    // Render Solar Installation Markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      installations.forEach((inst) => {
        const isSelected = selectedInst?.id === inst.id;
        const color = inst.operational_status === 'operational' 
          ? '#10B981' 
          : inst.operational_status === 'under_maintenance' 
          ? '#F59E0B' 
          : '#64748B';

        const customIcon = L.divIcon({
          className: 'solar-asset-marker',
          html: `
            <div style="
              width: ${isSelected ? '40px' : '34px'};
              height: ${isSelected ? '40px' : '34px'};
              background: ${color};
              border: 2.5px solid #FFFFFF;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 10px ${color}80;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              cursor: pointer;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([inst.latitude, inst.longitude], { icon: customIcon });
        marker.on('click', () => {
          setSelectedInst(inst);
          map.panTo([inst.latitude, inst.longitude]);
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; min-width: 190px;">
            <b style="font-size: 14px; color: #0F172A;">${inst.name}</b><br/>
            <span style="color: #64748B;">${inst.address}, ${inst.city}</span><br/>
            <div style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
              <span style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1E293B;">${inst.capacity_kw} kW</span>
              <span style="color: ${color}; font-weight: 700;">${inst.operational_status.toUpperCase()}</span>
            </div>
          </div>
        `);
        markersLayerRef.current.addLayer(marker);
      });
    }
  }, [installations, userLocation, radiusKm, selectedInst]);

  // Nominatim Search for City / Locality
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newCoords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
        setUserLocation(newCoords);
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([newCoords.lat, newCoords.lng], 14);
          leafletMapRef.current.invalidateSize();
        }
      } else {
        alert("Location not found. Try entering city name or postal code.");
      }
    } catch (err) {
      console.warn("Geocoding failed:", err);
    } finally {
      setSearching(false);
    }
  };

  // Submit Pin Drop Installation
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!droppedPin) return;

    try {
      const payload = {
        name: newInstForm.name || 'New Rooftop System',
        address: newInstForm.address || 'User Specified Coordinate',
        city: newInstForm.city,
        state: newInstForm.state,
        latitude: droppedPin.lat,
        longitude: droppedPin.lng,
        capacity_kw: parseFloat(newInstForm.capacity_kw) || 10.0,
        installation_type: newInstForm.installation_type,
        operational_status: 'operational',
        equipment: [
          {
            equipment_type: 'inverter',
            manufacturer: newInstForm.inverter.split(' ')[0] || 'Sungrow',
            model_number: newInstForm.inverter,
            capacity_rating: `${newInstForm.capacity_kw} kW`,
            status: 'operational'
          },
          {
            equipment_type: 'solar_panel',
            manufacturer: newInstForm.panels.split(' ')[0] || 'Canadian Solar',
            model_number: newInstForm.panels,
            capacity_rating: '540 W',
            status: 'operational'
          }
        ]
      };

      await createInstallation(payload);
      setShowRegisterModal(false);
      setPinDropMode(false);
      setDroppedPin(null);
      fetchInstallations();
      alert("Solar Installation Registered Successfully on PostGIS database!");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 120px)' }}>
      {/* Top Map Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        background: 'var(--bg-card)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Search City / Area Form */}
        <form onSubmit={handleSearchLocation} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search city or locality (e.g. Koramangala, Indiranagar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={searching}
            className="btn-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            {searching ? 'Locating...' : 'Search'}
          </button>
        </form>

        {/* Find Near Me Button */}
        <button 
          onClick={requestCurrentLocation}
          disabled={geoLocating}
          className="btn-primary"
          style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          title="Use browser Geolocation API"
        >
          <Crosshair size={16} className={geoLocating ? "animate-spin" : ""} />
          {geoLocating ? "Locating..." : "Find Near Me"}
        </button>

        {/* Interactive Layer Switcher (OpenStreetMap / Satellite HD) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setMapStyle('streets')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mapStyle === 'streets' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
              color: mapStyle === 'streets' ? '#FFF' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Globe size={13} />
            Streets (OSM)
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mapStyle === 'satellite' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
              color: mapStyle === 'satellite' ? '#FFF' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Satellite HD
          </button>
        </div>

        {/* Distance Radius Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Radius:</span>
          {[5, 10, 25, 50].map((km) => (
            <button
              key={km}
              onClick={() => setRadiusKm(km)}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: radiusKm === km ? 'var(--emerald-500)' : 'var(--border-subtle)',
                background: radiusKm === km ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: radiusKm === km ? 'var(--emerald-400)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {km}km
            </button>
          ))}
        </div>

        {/* Click to Pin / Register Mode Toggle */}
        <button
          onClick={() => {
            setPinDropMode(!pinDropMode);
            if (!pinDropMode) {
              alert("Click anywhere on the map to drop a pin and register a new solar installation at that coordinate!");
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid',
            borderColor: pinDropMode ? 'var(--amber-400)' : 'var(--border-subtle)',
            background: pinDropMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: pinDropMode ? 'var(--amber-400)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <MapPin size={15} />
          {pinDropMode ? 'Click Map to Pin' : '+ Register on Map'}
        </button>

        {/* Quick Nav Cluster */}
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => navigate('/faults')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
          >
            <AlertTriangle size={13} color="#F59E0B" />
            Requests
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/maintenance')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Wrench size={13} color="#38BDF8" />
            {userRole === 'installation_owner' ? 'Track Repairs' : 'Dispatch'}
          </button>
        </div>
      </div>

      {/* Main Map View Area with Side List Drawer */}
      <div style={{ display: 'flex', flex: 1, gap: '1.25rem', minHeight: '520px', position: 'relative' }}>
        {/* Leaflet Map Canvas */}
        <div 
          ref={mapContainerRef} 
          className="solarsync-map-canvas"
          style={{ 
            flex: 1, 
            height: '100%', 
            minHeight: '520px',
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid var(--border-subtle)', 
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
            background: '#111827'
          }} 
        />

        {/* Side Panel: Installations List & Selected Details Drawer */}
        <div style={{
          width: '380px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 20
        }}>
          {selectedInst ? (
            /* Selected Installation Deep-Dive Drawer */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: selectedInst.operational_status === 'operational' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: selectedInst.operational_status === 'operational' ? 'var(--emerald-400)' : 'var(--amber-400)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {selectedInst.operational_status.replace('_', ' ')}
                </span>
                <button 
                  onClick={() => setSelectedInst(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                {selectedInst.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {selectedInst.address}, {selectedInst.city}, {selectedInst.state}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CAPACITY</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                    {selectedInst.capacity_kw} kWp
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DISTANCE</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--sky-400)' }}>
                    {selectedInst.distance_km != null ? `${selectedInst.distance_km} km` : 'Near'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Equipment Specs
                </div>
                {selectedInst.equipment && selectedInst.equipment.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedInst.equipment.map((eq, i) => (
                      <div key={i} style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.775rem'
                      }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {eq.equipment_type.toUpperCase()}: {eq.manufacturer}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>{eq.model_number} ({eq.capacity_rating || 'N/A'})</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Sungrow SG50CX Inverter • 540W Monocrystalline PV
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.25rem' }}>
                Coordinates: {selectedInst.latitude.toFixed(4)}, {selectedInst.longitude.toFixed(4)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    if (onReportFault) onReportFault(selectedInst);
                    else alert(`Reporting fault on ${selectedInst.name}`);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <AlertTriangle size={16} />
                  Report Fault on this Site
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => navigate('/maintenance')}
                    className="btn-secondary"
                    style={{ justifyContent: 'center', padding: '0.45rem', fontSize: '0.75rem' }}
                  >
                    <Wrench size={13} color="#38BDF8" />
                    Work Orders
                  </button>
                  <button
                    onClick={() => navigate('/assets')}
                    className="btn-secondary"
                    style={{ justifyContent: 'center', padding: '0.45rem', fontSize: '0.75rem' }}
                  >
                    <Layers size={13} color="#10B981" />
                    Asset Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Nearby Fleet List */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Nearby Fleet ({installations.length})
                </h4>
                <span style={{ fontSize: '0.725rem', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
                  Within {radiusKm} km
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Scanning PostGIS database...
                </div>
              ) : installations.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No solar installations found in this radius. Expand radius or click "+ Register on Map".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {installations.map((inst) => (
                    <div
                      key={inst.id}
                      onClick={() => {
                        setSelectedInst(inst);
                        if (leafletMapRef.current) {
                          leafletMapRef.current.setView([inst.latitude, inst.longitude], 15);
                        }
                      }}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inst.name}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: inst.operational_status === 'operational' ? 'var(--emerald-400)' : 'var(--amber-400)'
                        }}>
                          {inst.capacity_kw} kW
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{inst.city}</span>
                        {inst.distance_km != null && (
                          <span style={{ color: 'var(--sky-400)', fontWeight: 600 }}>{inst.distance_km} km away</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register Installation at Clicked Coordinates */}
      {showRegisterModal && droppedPin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sun size={20} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Register Solar Installation</h3>
              </div>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Installation Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Green Roof Residency Array"
                  value={newInstForm.name}
                  onChange={(e) => setNewInstForm({...newInstForm, name: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Capacity (kWp)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    required
                    value={newInstForm.capacity_kw}
                    onChange={(e) => setNewInstForm({...newInstForm, capacity_kw: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Installation Type</label>
                  <select 
                    value={newInstForm.installation_type}
                    onChange={(e) => setNewInstForm({...newInstForm, installation_type: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  >
                    <option value="rooftop_residential">Rooftop Residential</option>
                    <option value="rooftop_commercial">Rooftop Commercial</option>
                    <option value="solar_carport">Solar Carport</option>
                    <option value="ground_mounted">Ground Mounted</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Street Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 104 Outer Ring Road"
                  value={newInstForm.address}
                  onChange={(e) => setNewInstForm({...newInstForm, address: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.775rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--emerald-400)'
              }}>
                📍 Lat: {droppedPin.lat.toFixed(6)} • Lon: {droppedPin.lng.toFixed(6)}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Installation
                </button>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
