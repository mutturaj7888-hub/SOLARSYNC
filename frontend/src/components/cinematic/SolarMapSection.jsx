import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Maximize2, Sun, Shield, ExternalLink, Globe } from 'lucide-react';
import { getNearbyInstallations } from '../../services/api';

export default function SolarMapSection({ onOpenFullMap }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [installations, setInstallations] = useState([]);
  const [activeAsset, setActiveAsset] = useState(null);

  // Load real backend installations
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getNearbyInstallations(12.9716, 77.5946, 25);
        setInstallations(data);
        if (data.length > 0) setActiveAsset(data[0]);
      } catch (e) {
        console.warn("Landing map fetch fallback:", e);
      }
    };
    fetchAssets();
  }, []);

  // Initialize embedded Leaflet map
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

    let map = null;
    try {
      map = L.map(container, {
        center: [12.9716, 77.5946],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false, // Prevent page scroll interception
      });
      mapInstanceRef.current = map;
    } catch (err) {
      console.error("Landing map init error:", err);
      return;
    }

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Invalidate size once rendered
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);

    return () => {
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

  // Add markers when installations arrive
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || installations.length === 0) return;

    installations.forEach((inst) => {
      const color = inst.operational_status === 'operational' ? '#10B981' : '#F59E0B';
      const customIcon = L.divIcon({
        className: 'landing-solar-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 12px ${color}80;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/><path d="M20 12h2"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inst.latitude, inst.longitude], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setActiveAsset(inst);
        map.panTo([inst.latitude, inst.longitude]);
      });
    });
  }, [installations]);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '6rem 2rem',
      position: 'relative',
      zIndex: 10,
      maxWidth: '1280px',
      margin: '0 auto',
      color: '#F9FAFB'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38BDF8',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            <Globe size={14} />
            PostGIS Geospatial Discovery
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            margin: 0,
            background: 'linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Interactive Solar Asset Explorer
          </h2>
        </div>

        <button
          onClick={onOpenFullMap}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
        >
          <Maximize2 size={16} />
          Open Fullscreen Map View
          <ExternalLink size={15} />
        </button>
      </div>

      {/* Interactive Map Showcase Window */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)',
        gap: '1.5rem',
        background: 'rgba(11, 20, 38, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '1.25rem',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Leaflet Canvas */}
        <div 
          ref={mapContainerRef}
          style={{
            minHeight: '440px',
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0F172A'
          }}
        />

        {/* Real-time Asset Details Sidebar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.725rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                Asset Telemetry
              </span>
              <span style={{
                fontSize: '0.725rem',
                fontFamily: 'var(--font-mono)',
                color: activeAsset?.operational_status === 'operational' ? '#34D399' : '#FBBF24',
                background: activeAsset?.operational_status === 'operational' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid currentColor',
                fontWeight: 600
              }}>
                {activeAsset?.operational_status?.toUpperCase() || 'OPERATIONAL'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F9FAFB', marginBottom: '0.4rem' }}>
              {activeAsset?.name || 'Solar Installation'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {activeAsset?.address || 'Bengaluru Urban Grid, Karnataka'}
            </p>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.675rem', color: '#6B7280' }}>Capacity</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                  {activeAsset?.capacity_kw || 24.5} kWp
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.675rem', color: '#6B7280' }}>Coordinates</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E2E8F0', fontFamily: 'var(--font-mono)' }}>
                  {activeAsset?.latitude?.toFixed(4)}, {activeAsset?.longitude?.toFixed(4)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.775rem', color: '#9CA3AF', lineHeight: 1.5 }}>
              <strong style={{ color: '#E2E8F0' }}>Live Maintenance Status:</strong> Routine inspection logged. Inverters operating in peak efficiency parameters.
            </div>
          </div>

          <button
            onClick={onOpenFullMap}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            Filter by Radius (5 - 50 km)
            <Navigation size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

