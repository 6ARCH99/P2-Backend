import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import ApiStatusBanner from '../components/ApiStatusBanner.jsx';

const Leaderboard = () => {
  const [list, setList] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!localStorage.getItem('suarabumi_token')) {
      setLoading(false);
      setError('Belum login dengan API. Gunakan halaman Masuk.');
      setList([]);
      setBadgeProgress(null);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([api.getLeaderboard(10), api.getBadges()])
      .then(([lb, b]) => {
        setList(lb.data.list ?? []);
        setBadgeProgress(b.data.progress ?? null);
        setError('');
      })
      .catch((err) => {
        setList([]);
        setBadgeProgress(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const top3 = useMemo(() => {
    const arr = [...list].filter((x) => x.rank <= 3).sort((a, b) => a.rank - b.rank);
    return arr.slice(0, 3);
  }, [list]);

  const rank4to10 = useMemo(() => {
    return [...list].filter((x) => x.rank >= 4 && x.rank <= 10).sort((a, b) => a.rank - b.rank);
  }, [list]);

  const formatPoints = (n) => (n != null ? Number(n).toLocaleString('id-ID') : '—');

  return (
    <div className="min-h-screen bg-[#F9F7F2] px-6 md:px-20 py-10 font-sans text-[#1A2E35]">
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 font-heading">
          Leaderboard <span className="text-2xl">🏆</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Lihat peringkat pengguna terbaik dan raih posisi teratas!</p>
        <ApiStatusBanner error={error} loading={loading} />
        {error && !loading && (
          <button
            type="button"
            onClick={load}
            className="mt-2 text-xs font-bold text-[#1A2E35] underline hover:no-underline"
          >
            Coba muat ulang
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="flex gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Wilayah:</span>
          <select className="bg-[#1A3022] text-white text-xs font-bold py-2 px-4 rounded-full appearance-none cursor-pointer">
            <option>PROVINSI</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Periode:</span>
          <select className="bg-[#1A3022] text-white text-xs font-bold py-2 px-4 rounded-full appearance-none cursor-pointer">
            <option>MINGGU INI</option>
          </select>
        </div>
      </div>

      {/* Collection Progress Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-10 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#1A3022] text-sm">Collection Progress</h3>
          <p className="text-[10px] text-gray-400">Terus kumpulkan badge!</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-[#1A3022]">
            {badgeProgress ? `${badgeProgress.earnedCount}/${badgeProgress.totalCount}` : '—'}
          </span>
          <p className="text-[10px] text-gray-400 font-bold uppercase">
            {badgeProgress ? `${badgeProgress.percent}% Complete` : '—'}
          </p>
        </div>
      </div>

      {/* Top Champions Podium */}
      <div className="relative bg-[#FFF9ED] rounded-[32px] border border-[#F2E8D5] p-10 mb-12">
        <div className="text-center mb-10">
          <span className="text-[#D99A29] font-bold text-sm flex items-center justify-center gap-2 font-heading">
            🏆 Top Champions 🏆
          </span>
        </div>
        
        <div className="flex justify-center items-end gap-4 md:gap-12">
          {/* Rank 2 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[#C0C0C0] rounded-full flex items-center justify-center text-white font-bold mb-4 border-4 border-white shadow-sm">2</div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center w-32 md:w-40 shadow-sm">
              <p className="font-bold text-xs mb-1">{top3[1]?.name ?? '—'}</p>
              <p className="text-lg font-black text-[#1A3022]">{formatPoints(top3[1]?.points)}</p>
              <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-tighter">poin</p>
              <p className="text-[10px] font-bold text-orange-500">🔥 Aktif {top3[1]?.activeDays ?? '—'} hari</p>
            </div>
          </div>

          {/* Rank 1 (Podium Tengah) */}
          <div className="flex flex-col items-center -translate-y-6">
            <span className="text-2xl mb-1">👑</span>
            <div className="w-16 h-16 bg-[#D99A29] rounded-full flex items-center justify-center text-white font-bold mb-4 border-4 border-white shadow-md text-xl">1</div>
            <div className="bg-white p-8 rounded-2xl border-2 border-[#D99A29] text-center w-36 md:w-48 shadow-lg relative">
              <p className="font-bold text-sm mb-1">{top3[0]?.name ?? '—'}</p>
              <p className="text-2xl font-black text-[#1A3022]">{formatPoints(top3[0]?.points)}</p>
              <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-tighter">poin</p>
              <p className="text-xs font-bold text-orange-500">🔥 Aktif {top3[0]?.activeDays ?? '—'} hari</p>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[#CD7F32] rounded-full flex items-center justify-center text-white font-bold mb-4 border-4 border-white shadow-sm">3</div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center w-32 md:w-40 shadow-sm">
              <p className="font-bold text-xs mb-1">{top3[2]?.name ?? '—'}</p>
              <p className="text-lg font-black text-[#1A3022]">{formatPoints(top3[2]?.points)}</p>
              <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-tighter">poin</p>
              <p className="text-[10px] font-bold text-orange-500">🔥 Aktif {top3[2]?.activeDays ?? '—'} hari</p>
            </div>
          </div>
        </div>
      </div>

      {/* List Peringkat 4-10 */}
      <div className="space-y-3">
        <h4 className="font-bold text-[#1A3022] mb-4 font-heading">Peringkat 4-10</h4>
        {rank4to10.map((item) => (
          <div 
            key={item.userId} 
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              item.isUser 
                ? 'bg-[#FFF9E7] border-orange-200 shadow-sm scale-[1.01]' 
                : 'bg-white border-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-5">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 text-xs font-bold">
                {item.rank}
              </span>
              <div>
                <p className="text-sm font-bold text-[#1A3022]">
                  {item.name} {item.isUser && <span className="text-[10px] text-orange-400 ml-1">(You)</span>}
                </p>
                <p className="text-[10px] font-bold text-orange-500">🔥 Aktif {item.activeDays ?? '—'} hari</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-green-500 text-[10px]">📈</span>
               <span className="font-black text-[#1A3022]">{formatPoints(item.points)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
