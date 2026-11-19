import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Plus,
  Search,
  Filter,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Cpu,
  Layers,
  X,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { getInstallations, createInstallation, deleteInstallation } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AssetsView({ onNavigateToMap, onReportFault }) {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const CITY_COORDINATES = {
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'mysuru': { lat: 12.2958, lng: 76.6394 },
    'mysore': { lat: 12.2958, lng: 76.6394 },
    'hubballi': { lat: 15.3647, lng: 75.1240 },
    'hubli': { lat: 15.3647, lng: 75.1240 },
    'dharwad': { lat: 15.4589, lng: 75.0078 },
    'mangaluru': { lat: 12.9141, lng: 74.8560 },
    'mangalore': { lat: 12.9141, lng: 74.8560 },
    'belagavi': { lat: 15.8497, lng: 74.4977 },
    'belgaum': { lat: 15.8497, lng: 74.4977 },
    'tumakuru': { lat: 13.3409, lng: 77.1010 },
    'shivamogga': { lat: 13.9299, lng: 75.5681 },
    'kalaburagi': { lat: 17.3297, lng: 76.8343 },
    'davanagere': { lat: 14.4644, lng: 75.9218 },
    'ballari': { lat: 15.1394, lng: 76.9214 },
    'udupi': { lat: 13.3409, lng: 74.7421 },
    'hassan': { lat: 13.0072, lng: 76.0962 },
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
    capacity_kw: 25.0,
    installation_type: 'rooftop_residential',
    inverter_mfr: 'Sungrow',
    inverter_model: 'SG50CX 50kW',
    panel_mfr: 'Canadian Solar',
    panel_model: 'HiKu6 540W Mono',
  });

  const autoDetectLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(pos.coords.latitude.toFixed(4)),
            longitude: parseFloat(pos.coords.longitude.toFixed(4))
          }));
          setDetectingGps(false);
        },
        () => {
          setDetectingGps(false);
        },
        { timeout: 8000 }
      );
    }
  };

  const handleCityChange = (cityVal) => {
    const key = cityVal.trim().toLowerCase();
    if (CITY_COORDINATES[key]) {
      setFormData(prev => ({
        ...prev,
        city: cityVal,
        latitude: CITY_COORDINATES[key].lat,
        longitude: CITY_COORDINATES[key].lng
      }));
    } else {
      setFormData(prev => ({ ...prev, city: cityVal }));
    }
  };

  useEffect(() => {
    if (showModal) {
      autoDetectLocation();
    }
  }, [showModal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInstallations();
      setInstallations(data);
    } catch (err) {
      console.warn("Error loading installations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this solar asset?")) return;
    try {
      await deleteInstallation(id);
      loadData();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        capacity_kw: parseFloat(formData.capacity_kw),
        installation_type: formData.installation_type,
        operational_status: 'operational',
        equipment: [
          {
            equipment_type: 'inverter',
            manufacturer: formData.inverter_mfr,
            model_number: formData.inverter_model,
            capacity_rating: `${formData.capacity_kw} kW`,
            status: 'operational'
          },
          {
            equipment_type: 'solar_panel',
            manufacturer: formData.panel_mfr,
            model_number: formData.panel_model,
            capacity_rating: '540 W',
            status: 'operational'
          }
        ]
      };
      await createInstallation(payload);
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  // Filtered items
  const filtered = installations.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || inst.installation_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inst.operational_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Solar Asset Inventory
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Centralized registry of rooftop solar arrays, inverter telemetry, and technical equipment specs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateToMap ? onNavigateToMap() : navigate('/map')}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <MapPin size={14} color="#10B981" />
            Solar Fleet Map
          </button>
          <button
            onClick={() => navigate('/faults')}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <AlertTriangle size={14} color="#F59E0B" />
            Reported Incidents
          </button>
          <button
            onClick={() => navigate('/maintenance')}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <Wrench size={14} color="#38BDF8" />
            Work Orders
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <BarChart3 size={14} color="#A78BFA" />
            Analytics
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} />
            Register Solar Asset
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by asset name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Installation Types</option>
          <option value="rooftop_residential">Rooftop Residential</option>
          <option value="rooftop_commercial">Rooftop Commercial</option>
          <option value="solar_carport">Solar Carport</option>
          <option value="ground_mounted">Ground Mounted</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Operational Statuses</option>
          <option value="operational">Operational</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="degraded">Degraded</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Asset Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading registered solar installations...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          No solar installations match the current filters.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filtered.map((inst) => (
            <div
              key={inst.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: inst.operational_status === 'operational' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: inst.operational_status === 'operational' ? 'var(--emerald-400)' : 'var(--amber-400)',
                    textTransform: 'uppercase'
                  }}>
                    {inst.operational_status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                    {inst.capacity_kw} kWp
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  {inst.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} color="var(--sky-400)" />
                  {inst.address}, {inst.city}
                </p>

                {/* Equipment specs list */}
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1rem',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <Cpu size={13} color="var(--emerald-400)" />
                    <span>Inverter: {inst.equipment?.[0]?.model_number || 'Sungrow SG50CX'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <Layers size={13} color="var(--sky-400)" />
                    <span>Panels: {inst.equipment?.[1]?.model_number || '540W Monocrystalline PV'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <button
                  onClick={() => onReportFault && onReportFault(inst)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.775rem', justifyContent: 'center' }}
                >
                  <AlertTriangle size={14} color="var(--amber-400)" />
                  Report Fault
                </button>
                <button
                  onClick={() => onNavigateToMap && onNavigateToMap(inst)}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.775rem' }}
                  title="View on Map"
                >
                  <MapPin size={14} color="var(--emerald-400)" />
                </button>
                {(userRole === 'distributor' || userRole === 'admin') && (
                  <button
                    onClick={() => handleDelete(inst.id)}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      color: 'var(--rose-500)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                    title="Delete Asset"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Asset Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            maxWidth: '560px',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sun size={20} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Register Rooftop Solar Installation</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Asset Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Indiranagar Solar Residency"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Capacity (kWp)</label>
                  <input
                    type="number" step="0.1" required
                    value={formData.capacity_kw}
                    onChange={(e) => setFormData({ ...formData, capacity_kw: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Type</label>
                  <select
                    value={formData.installation_type}
                    onChange={(e) => setFormData({ ...formData, installation_type: e.target.value })}
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
                  type="text" required
                  placeholder="e.g. 56 Lavelle Road"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>City</label>
                  <input
                    type="text" required
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>State</label>
                  <input
                    type="text" required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
              </div>

              {/* Auto-detected GPS Coordinates (No manual lat/long entry) */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--emerald-400)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                      Rooftop Location (Auto-detected GPS)
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {formData.latitude}° N, {formData.longitude}° E ({formData.city})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={autoDetectLocation}
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem' }}
                  title="Fetch current device GPS location"
                >
                  <Sparkles size={12} color="#10B981" />
                  {detectingGps ? "Detecting GPS..." : "Refresh GPS"}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Inverter Model</label>
                  <input
                    type="text"
                    value={formData.inverter_model}
                    onChange={(e) => setFormData({ ...formData, inverter_model: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Panel Model</label>
                  <input
                    type="text"
                    value={formData.panel_model}
                    onChange={(e) => setFormData({ ...formData, panel_model: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Register Asset
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
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

