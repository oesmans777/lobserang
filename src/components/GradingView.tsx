import React, { useState } from 'react';
import { GradingPemain, GradingConfig, KehadiranPembayaran, Pertandingan, UserRole } from '../types';

interface GradingViewProps {
  userRole: UserRole | null;
  gradingList: GradingPemain[];
  configGrading: GradingConfig[];
  kehadiranList: KehadiranPembayaran[];
  pertandinganList: Pertandingan[];
  onUpdateGrading: (nama: string, score: number) => void;
  onUpdateConfigGrading: (newConfigs: GradingConfig[]) => void;
  onApplyAllRecommendations: () => void;
}

export const GradingView: React.FC<GradingViewProps> = ({
  userRole,
  gradingList,
  configGrading,
  kehadiranList,
  pertandinganList,
  onUpdateGrading,
  onUpdateConfigGrading,
  onApplyAllRecommendations
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [filterLevel, setFilterLevel] = useState('semua');
  const [tempConfigs, setTempConfigs] = useState<GradingConfig[]>(configGrading);

  // Kalkulasi rekomendasi grading berdasarkan laga sesi aktif
  const getRecommendation = (nama: string) => {
    let main = 0, menang = 0, sp = 0;
    pertandinganList.forEach(m => {
      const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean);
      const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean);
      const sA = Number(m.skor_tim_a) || 0, sB = Number(m.skor_tim_b) || 0;

      if (pA.includes(nama)) {
        main++;
        if (sA > sB) menang++;
        sp += (sA - sB);
      } else if (pB.includes(nama)) {
        main++;
        if (sB > sA) menang++;
        sp += (sB - sA);
      }
    });

    const curr = gradingList.find(x => x.nama_pemain === nama)?.nilai_grading || 5.0;
    if (main === 0) return curr;

    const winRate = menang / main;
    const avgSP = sp / main;
    let adj = 0;

    if (winRate > 0.55 || (winRate >= 0.5 && avgSP > 1.5)) adj = 0.2;
    else if (winRate < 0.45 || (winRate <= 0.5 && avgSP < -1.5)) adj = -0.2;

    const rec = Math.max(0, Math.min(10, curr + adj));
    return Number(rec.toFixed(1));
  };

  const getKategoriBadge = (nilai: number) => {
    const v = Number(nilai) || 0;
    const colors = [
      { bg: 'bg-red-500/15', text: 'text-red-700', border: 'border-red-300' },
      { bg: 'bg-[#B2DCE5]/40', text: 'text-[#013A40]', border: 'border-[#038C8C]/30' },
      { bg: 'bg-[#038C8C]/20', text: 'text-[#038C8C]', border: 'border-[#038C8C]/40' },
      { bg: 'bg-[#013A40]/15', text: 'text-[#013A40]', border: 'border-[#013A40]/30' },
      { bg: 'bg-[#F8B700]/20', text: 'text-[#013A40]', border: 'border-[#F8B700]' }
    ];

    let foundIdx = configGrading.length - 1;
    for (let i = 0; i < configGrading.length; i++) {
      if (v >= configGrading[i].min && v <= configGrading[i].max) {
        foundIdx = i;
        break;
      }
    }

    const c = colors[foundIdx] || colors[0];
    const name = configGrading[foundIdx] ? configGrading[foundIdx].nama : 'UNKNOWN';
    return (
      <span className={`px-2.5 py-1 shape-cyber-pill text-[10px] font-black border ${c.bg} ${c.text} ${c.border}`}>
        {name}
      </span>
    );
  };

  // Cari siapa saja yang punya rekomendasi naik/turun kelas
  const smartNotifications = gradingList
    .map(p => {
      const rec = getRecommendation(p.nama_pemain);
      const diff = Number((rec - p.nilai_grading).toFixed(1));
      return { nama: p.nama_pemain, curr: p.nilai_grading, rec, diff };
    })
    .filter(n => Math.abs(n.diff) >= 0.1);

  const filteredList = gradingList.filter(p => {
    if (filterLevel === 'semua') return true;
    const idx = Number(filterLevel);
    const cfg = configGrading[idx];
    if (!cfg) return true;
    return p.nilai_grading >= cfg.min && p.nilai_grading <= cfg.max;
  }).sort((a,b) => a.nama_pemain.localeCompare(b.nama_pemain));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#B2DCE5] pb-3">
        <h2 className="text-xl font-black text-[#013A40] flex items-center gap-2 font-sporty uppercase italic">
          <span className="text-2xl text-[#F8B700]">⭐</span>
          <span>Grading & Kualitas Pemain Database</span>
        </h2>
      </div>

      {/* NOTIFIKASI CERDAS REKOMENDASI PENYESUAIAN KELAS */}
      {smartNotifications.length > 0 && (
        <div className="bg-white border-2 border-[#038C8C]/40 shape-cyber-card p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#013A40] uppercase tracking-wide font-tech">
              <span className="text-base text-[#F8B700]">⚡</span>
              <span>Rekomendasi Penyesuaian Kelas Mabar Otomatis</span>
              <span className="bg-[#B2DCE5]/40 text-[#013A40] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#038C8C]/30">
                {smartNotifications.length} Pemain
              </span>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={onApplyAllRecommendations}
                className="text-xs font-black bg-linear-to-r from-[#013A40] to-[#038C8C] hover:from-[#038C8C] hover:to-[#013A40] text-white px-3.5 py-1.5 shape-cyber-card shadow-xs transition cursor-pointer border border-[#B2DCE5]/40"
              >
                ⚡ Terapkan Semua
              </button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {smartNotifications.map(item => (
              <div
                key={item.nama}
                className="flex items-center justify-between p-2.5 bg-[#F2F2F2] border border-[#B2DCE5] shape-cyber-card text-xs"
              >
                <div className="font-bold text-[#013A40]">
                  <span className={item.diff > 0 ? 'text-[#038C8C] font-black' : 'text-red-500 font-black'}>
                    {item.diff > 0 ? '▲' : '▼'}
                  </span>{' '}
                  <b>{item.nama}</b> ({item.curr.toFixed(1)} →{' '}
                  <span className="font-black text-[#038C8C]">{item.rec.toFixed(1)}</span>)
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => onUpdateGrading(item.nama, item.rec)}
                    className="text-[11px] font-black px-3 py-1 bg-[#F8B700] hover:bg-[#e0a500] text-[#013A40] rounded-md cursor-pointer shadow-2xs transition"
                  >
                    Set {item.rec.toFixed(1)}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PENGATURAN RANGE KATEGORI LEVEL */}
      <div className="bg-white border-2 border-[#038C8C]/30 shape-cyber-card overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-3.5 bg-linear-to-r from-[#013A40] to-[#00272B] text-white font-black text-xs cursor-pointer hover:bg-[#013A40] transition font-tech tracking-wider uppercase"
        >
          <span className="flex items-center gap-2">
            <span className="text-[#F8B700]">⚙️</span>
            <span>Pengaturan Nama & Range Kategori Level</span>
          </span>
          <span className="text-[#F8B700]">{showConfig ? '➖' : '➕'}</span>
        </button>

        {showConfig && (
          <div className="p-4 space-y-3 bg-white border-t border-blue-100">
            <div className="space-y-2">
              {tempConfigs.map((cfg, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_70px_20px_70px] gap-2 items-center text-xs">
                  <input
                    type="text"
                    value={cfg.nama}
                    onChange={e => {
                      const updated = [...tempConfigs];
                      updated[idx].nama = e.target.value;
                      setTempConfigs(updated);
                    }}
                    className="p-1.5 border border-slate-300 rounded-md font-bold text-slate-800"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={cfg.min}
                    onChange={e => {
                      const updated = [...tempConfigs];
                      updated[idx].min = Number(e.target.value);
                      setTempConfigs(updated);
                    }}
                    className="p-1.5 border border-slate-300 rounded-md text-center font-bold"
                  />
                  <span className="text-center font-bold">-</span>
                  <input
                    type="number"
                    step="0.1"
                    value={cfg.max}
                    onChange={e => {
                      const updated = [...tempConfigs];
                      updated[idx].max = Number(e.target.value);
                      setTempConfigs(updated);
                    }}
                    className="p-1.5 border border-slate-300 rounded-md text-center font-bold"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => onUpdateConfigGrading(tempConfigs)}
              className="w-full py-2 bg-[#038C8C] hover:bg-[#013A40] text-white shape-cyber-card font-black text-xs cursor-pointer transition shadow-2xs border border-[#B2DCE5]/40"
            >
              💾 Simpan & Terapkan Kategori
            </button>
          </div>
        )}
      </div>

      {/* FILTER & HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#013A40] uppercase font-tech tracking-wider">Filter Level:</span>
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="p-1.5 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card text-xs font-bold text-[#013A40] cursor-pointer focus:outline-hidden"
          >
            <option value="semua">📋 Semua Level</option>
            {configGrading.map((c, idx) => (
              <option key={idx} value={String(idx)}>
                🎯 {c.nama}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onApplyAllRecommendations}
          className="text-xs font-black bg-linear-to-r from-[#013A40] to-[#038C8C] hover:from-[#038C8C] hover:to-[#013A40] text-white px-3.5 py-1.5 shape-cyber-card shadow-xs transition cursor-pointer border border-[#B2DCE5]/40"
        >
          ⚡ Terapkan Semua Rekomendasi
        </button>
      </div>

      {/* TABEL PEMAIN */}
      <div className="overflow-x-auto border-2 border-[#038C8C]/30 shape-cyber-card shadow-xs bg-white">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-[#013A40] text-[#F2F2F2] uppercase font-black text-[11px] border-b-2 border-[#038C8C]/50 font-tech tracking-wider">
              <th className="py-3 px-2 w-12">Pos</th>
              <th className="py-3 px-3 text-left w-48">Nama Anggota</th>
              <th className="py-3 px-3 w-36">Grading Skor</th>
              <th className="py-3 px-3 w-40">Rekomendasi</th>
              <th className="py-3 px-3 w-40">Kategori Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#B2DCE5]/40 font-medium">
            {filteredList.map((p, idx) => {
              const rec = getRecommendation(p.nama_pemain);
              const diff = Number((rec - p.nilai_grading).toFixed(1));

              return (
                <tr key={p.nama_pemain} className="hover:bg-[#B2DCE5]/15 transition">
                  <td className="py-2.5 px-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 shape-cyber-card font-black text-xs bg-[#F2F2F2] text-[#013A40] border border-[#B2DCE5]">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-left font-black text-[#013A40] uppercase tracking-wide">{p.nama_pemain}</td>
                  <td className="py-2.5 px-3">
                    {userRole === 'admin' ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={p.nilai_grading}
                        onChange={e => onUpdateGrading(p.nama_pemain, Number(e.target.value))}
                        className="w-16 p-1 text-center font-mono font-black text-[#038C8C] border border-[#B2DCE5] focus:border-[#038C8C] rounded-lg bg-[#F2F2F2] focus:outline-hidden"
                      />
                    ) : (
                      <span className="font-mono font-black text-[#038C8C] text-sm">{p.nilai_grading.toFixed(1)}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {Math.abs(diff) >= 0.1 ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-black text-xs ${diff > 0 ? 'text-[#038C8C]' : 'text-red-500'}`}>
                          {diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}
                        </span>
                        <span className="bg-[#B2DCE5]/40 text-[#013A40] font-black px-2 py-0.5 rounded-md text-[11px] border border-[#038C8C]/30">
                          ⚡ {rec.toFixed(1)}
                        </span>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => onUpdateGrading(p.nama_pemain, rec)}
                            className="bg-[#F8B700] hover:bg-[#e0a500] text-[#013A40] font-black text-[10px] px-2 py-0.5 rounded-md cursor-pointer shadow-2xs transition"
                          >
                            Set
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#013A40]/40 font-semibold text-xs">Akurat</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">{getKategoriBadge(p.nilai_grading)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
