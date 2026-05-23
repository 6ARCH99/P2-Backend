import React, { useCallback, useEffect, useState } from 'react';
import { Search, Navigation2, Filter, MapPin } from 'lucide-react';
import { api } from '../services/api';

const MATERIALS = [
  { id: 'all', label: 'Semua', api: '' },
  { id: 'plastic', label: 'Plastik', api: 'plastik' },
  { id: 'paper', label: 'Kertas', api: 'kertas' },
  { id: 'metal', label: 'Logam', api: 'logam' },
  { id: 'glass', label: 'Kaca', api: 'kaca' },
  { id: 'electronic', label: 'Elektronik', api: 'elektronik' },
];

function materialLabel(m) {
  const map = { plastik: 'Plastik', kertas: 'Kertas', logam: 'Logam', kaca: 'Kaca', elektronik: 'Elektronik' };
  return map[String(m).toLowerCase()] || m;
}

const DropPointPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [viewMode, setViewMode] = useState('daftar');
  const [dropPoints, setDropPoints] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const mat = MATERIALS.find((m) => m.label === activeFilter);
      const res = await api.getDropPoints({
        q: searchTerm.trim() || undefined,
        material: mat?.api || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setDropPoints(res.data || []);
    } catch (err) {
      setError(err.message);
      setDropPoints([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilter, coords]);

  useEffect(() => {
    const t = setTimeout(fetchPoints, 300);
    return () => clearTimeout(t);
  }, [fetchPoints]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolokasi tidak didukung browser ini.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError('Izin lokasi ditolak.')
    );
  };

  const nearest = dropPoints[0];
  const mapsUrl = (dp) =>
    `https://www.google.com/maps/dir/?api=1&destination=${dp.lat},${dp.lng}`;

  return (
    <div className="app-page text-left">
      <div className="app-page-inner max-w-7xl">
        <div className="app-page-header">
          <h1 className="font-display text-[2.25rem] font-semibold text-[#1A3022] tracking-tight leading-tight mb-2">
            Drop Point Finder
          </h1>
          <p className="font-sans text-sm font-normal text-gray-500">
            Temukan titik pengumpulan sampah terdekat dari lokasimu dengan mudah.
          </p>
        </div>

        {error && (
          <p className="mb-4 font-sans text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, alamat, atau wilayah..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-[#1A3022]/10 font-sans text-sm font-normal text-[#1A3022] placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="bg-[#1A3022] text-white px-8 py-4 rounded-2xl font-sans text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#2d4a37] shrink-0"
          >
            <Navigation2 className="w-5 h-5" strokeWidth={2.5} />
            Lokasi Saat Ini
          </button>
        </div>

        <div className="mb-8">
          <p className="font-sans text-xs font-semibold text-[#1A3022] mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2D6A4F]" strokeWidth={2.5} />
            Filter Berdasarkan Material:
          </p>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveFilter(m.label)}
                className={`px-5 py-2.5 rounded-full font-sans text-sm font-semibold border transition-all ${
                  activeFilter === m.label
                    ? 'bg-[#1A3022] text-white border-[#1A3022]'
                    : 'bg-white text-[#1A3022] border-gray-200 hover:border-gray-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-[2]">
            <div className="flex justify-between items-center mb-6">
              <p className="font-sans text-sm font-normal text-gray-500">
                {loading ? 'Memuat…' : `${dropPoints.length} Drop Point ditemukan`}
              </p>
              <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('daftar')}
                  className={`px-4 py-2 rounded-lg font-sans text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    viewMode === 'daftar' ? 'bg-[#1A3022] text-white' : 'text-gray-500'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Daftar
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('peta')}
                  className={`px-4 py-2 rounded-lg font-sans text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    viewMode === 'peta' ? 'bg-[#1A3022] text-white' : 'text-gray-500'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Peta
                </button>
              </div>
            </div>

            {viewMode === 'daftar' ? (
              <div className="space-y-4">
                {dropPoints.map((dp) => (
                  <div key={dp.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-semibold text-[#1A3022]">{dp.name}</h3>
                          <span
                            className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded ${
                              dp.isOpen ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
                            }`}
                          >
                            {dp.isOpen ? 'Buka' : 'Tutup'}
                          </span>
                        </div>
                        <p className="font-sans text-xs font-normal text-gray-500">{dp.address}</p>
                      </div>
                      <p className="font-sans text-sm font-semibold text-[#EBA332]">
                        ⭐ {dp.rating}{' '}
                        <span className="text-gray-400 font-normal">({dp.reviewCount})</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="font-sans text-[10px] font-bold uppercase text-gray-400 mb-1">Jarak</p>
                        <p className="font-sans text-sm font-semibold text-[#1A3022]">
                          {dp.distanceKm != null ? `${dp.distanceKm} km` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] font-bold uppercase text-gray-400 mb-1">Jam Buka</p>
                        <p className="font-sans text-sm font-semibold text-[#1A3022]">
                          {dp.openTime} - {dp.closeTime}
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] font-bold uppercase text-gray-400 mb-1">Telepon</p>
                        <p className="font-sans text-sm font-semibold text-[#1A3022]">{dp.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="font-sans text-[10px] font-bold uppercase text-gray-400 mb-2">
                          Material yang Diterima:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(dp.materials || []).map((mat, i) => (
                            <span
                              key={i}
                              className="font-sans text-[10px] font-semibold bg-[#F5F5F0] text-[#1A3022] px-3 py-1 rounded-full"
                            >
                              {materialLabel(mat)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <a
                        href={mapsUrl(dp)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-xs font-semibold bg-[#1A3022] text-white px-5 py-2.5 rounded-xl shrink-0"
                      >
                        Lihat Petunjuk Arah
                      </a>
                    </div>
                  </div>
                ))}
                {!loading && dropPoints.length === 0 && (
                  <p className="font-sans text-sm text-gray-400 text-center py-16">Data tidak ditemukan.</p>
                )}
              </div>
            ) : (
              <div className="w-full h-[500px] bg-[#E8E8E0] rounded-[24px] border border-gray-200 flex flex-col items-center justify-center gap-3 p-6">
                <MapPin className="w-12 h-12 text-[#1A3022]/40" strokeWidth={1.5} />
                <p className="font-display text-xl font-semibold text-[#1A3022]">Peta Interaktif</p>
                <p className="font-sans text-sm text-gray-500">Lihat lokasi drop point di sekitarmu</p>
              </div>
            )}
          </div>

          {nearest && viewMode === 'daftar' && (
            <div className="flex-1">
              <div className="bg-[#68A67D] rounded-[24px] p-8 text-white sticky top-24">
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">
                  Terdekat dari Kamu
                </p>
                <h2 className="font-display text-2xl font-semibold mb-6">{nearest.name}</h2>
                <div className="space-y-4 mb-8 font-sans text-sm font-medium">
                  <p>🕒 {nearest.openTime} - {nearest.closeTime}</p>
                  {nearest.distanceKm != null && <p>📍 {nearest.distanceKm} km dari lokasimu</p>}
                  <p className="leading-relaxed opacity-95">{nearest.address}</p>
                </div>
                <a
                  href={mapsUrl(nearest)}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-[#1A3022] text-white py-4 rounded-2xl font-sans text-sm font-semibold"
                >
                  Petunjuk Arah
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropPointPage;
