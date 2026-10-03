import React from 'react';
import { KehadiranPembayaran, Pertandingan, CourtState, UserRole } from '../types';

interface MatchViewProps {
  userRole: UserRole | null;
  kehadiranList: KehadiranPembayaran[];
  pertandinganList: Pertandingan[];
  jumlahLapangan: number;
  courtStates: Record<number, CourtState>;
  onToggleAbsensi: (name: string) => void;
  onHapusPemain: (name: string) => void;
  onTambahLapangan: () => void;
  onKurangiLapangan: () => void;
  onUpdateCourtSlot: (courtNum: number, slot: 'ta1' | 'ta2' | 'tb1' | 'tb2', val: string) => void;
  onUpdateCourtScore: (courtNum: number, field: 'skorA' | 'skorB', val: number) => void;
  onUpdateCourtCock: (courtNum: number, count: number) => void;
  onToggleBebanCock: (courtNum: number, playerName: string) => void;
  onToggleAllBebanCock: (courtNum: number, players: string[]) => void;
  onMulaiMatchTimer: (courtNum: number) => void;
  onSelesaiMatch: (courtNum: number) => void;
  onAutoDraft: (courtNum: number) => void;
  onOpenEditMatch: (match: Pertandingan) => void;
  onDeleteMatch: (id: string) => void;
  getGrade: (name: string) => number;
}

export const MatchView: React.FC<MatchViewProps> = ({
  userRole,
  kehadiranList,
  pertandinganList,
  jumlahLapangan,
  courtStates,
  onToggleAbsensi,
  onHapusPemain,
  onTambahLapangan,
  onKurangiLapangan,
  onUpdateCourtSlot,
  onUpdateCourtScore,
  onUpdateCourtCock,
  onToggleBebanCock,
  onToggleAllBebanCock,
  onMulaiMatchTimer,
  onSelesaiMatch,
  onAutoDraft,
  onOpenEditMatch,
  onDeleteMatch,
  getGrade
}) => {
  // Hitung statistik harian per pemain
  const playerStatsMap: Record<string, {
    nama: string;
    hadir: boolean;
    jamDatang: string;
    main: number;
    menang: number;
    kalah: number;
    skorMenang: number;
    skorKalah: number;
    selisihSkor: number;
    poin: number;
    totalDurasiDetik: number;
    form: string[];
  }> = {};

  kehadiranList.forEach(k => {
    playerStatsMap[k.nama_pemain] = {
      nama: k.nama_pemain,
      hadir: k.status_hadir,
      jamDatang: k.jam_kedatangan || '',
      main: 0,
      menang: 0,
      kalah: 0,
      skorMenang: 0,
      skorKalah: 0,
      selisihSkor: 0,
      poin: 0,
      totalDurasiDetik: 0,
      form: []
    };
  });

  pertandinganList.forEach(m => {
    const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean) as string[];
    const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean) as string[];
    const sA = Number(m.skor_tim_a) || 0;
    const sB = Number(m.skor_tim_b) || 0;
    const pemenang = m.pemenang;

    let sec = 0;
    if (m.durasi_menit && m.durasi_menit.includes(':')) {
      const parts = m.durasi_menit.split(':');
      sec = (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
    }

    pA.forEach(name => {
      if (!playerStatsMap[name]) return;
      const st = playerStatsMap[name];
      st.main++;
      st.skorMenang += sA;
      st.skorKalah += sB;
      st.totalDurasiDetik += sec;
      if (pemenang === 'A') { st.menang++; st.poin += 3; st.form.push('M'); }
      else if (pemenang === 'B') { st.kalah++; st.form.push('K'); }
      st.selisihSkor = st.skorMenang - st.skorKalah;
    });

    pB.forEach(name => {
      if (!playerStatsMap[name]) return;
      const st = playerStatsMap[name];
      st.main++;
      st.skorMenang += sB;
      st.skorKalah += sA;
      st.totalDurasiDetik += sec;
      if (pemenang === 'B') { st.menang++; st.poin += 3; st.form.push('M'); }
      else if (pemenang === 'A') { st.kalah++; st.form.push('K'); }
      st.selisihSkor = st.skorMenang - st.skorKalah;
    });
  });

  const sortedStandings = Object.values(playerStatsMap).sort((a, b) => {
    if (b.poin !== a.poin) return b.poin - a.poin;
    if (b.selisihSkor !== a.selisihSkor) return b.selisihSkor - a.selisihSkor;
    if (b.menang !== a.menang) return b.menang - a.menang;
    return a.nama.localeCompare(b.nama);
  });

  const pemainHadir = kehadiranList.filter(k => k.status_hadir);

  // Ambil daftar pemain yang sedang main di semua lapangan
  const playingNow: string[] = [];
  for (let j = 1; j <= jumlahLapangan; j++) {
    const s = courtStates[j];
    if (s) {
      if (s.ta1) playingNow.push(s.ta1);
      if (s.ta2) playingNow.push(s.ta2);
      if (s.tb1) playingNow.push(s.tb1);
      if (s.tb2) playingNow.push(s.tb2);
    }
  }

  const renderCourtCard = (courtNum: number) => {
    const s = courtStates[courtNum] || {
      ta1: '', ta2: '', tb1: '', tb2: '',
      skorA: 0, skorB: 0, berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
    };

    let totalSec = Number(s.accumulatedTime) || 0;
    if (s.berjalan) {
      const st = Number(s.startTime) || Date.now();
      totalSec += Math.floor((Date.now() - st) / 1000);
    }
    const mStr = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const sStr = String(totalSec % 60).padStart(2, '0');

    // Blowout checking
    const gA1 = getGrade(s.ta1), gA2 = getGrade(s.ta2);
    const gB1 = getGrade(s.tb1), gB2 = getGrade(s.tb2);
    const totalA = gA1 + gA2;
    const totalB = gB1 + gB2;
    const selisih = Math.abs(totalA - totalB);

    if (userRole === 'member') {
      return (
        <div key={courtNum} className="bg-white border-2 border-sky-500 rounded-xl shadow-md overflow-hidden flex flex-col">
          <div className="py-2.5 px-4 text-center bg-sky-50 border-b border-sky-100">
            <div className="font-extrabold text-sm text-sky-950 uppercase tracking-wider">LAPANGAN {courtNum}</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              {s.berjalan ? `Status: Bertanding (${mStr}:${sStr})` : 'Status: Belum Mulai'}
            </div>
          </div>

          <div className="relative bg-[#1e5631] border-4 border-white rounded-lg m-3 h-36 flex overflow-hidden shadow-inner">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white -translate-x-1/2 z-10"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2 z-10"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.6)] rounded-md px-2 py-0.5 font-['Orbitron',sans-serif] text-[11px] font-bold text-cyan-400 z-20">
              {mStr}:{sStr}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center z-10 border-r border-dashed border-white/30 p-2">
              <div className="font-['Orbitron',sans-serif] text-2xl font-black text-amber-400 drop-shadow-md mb-1">
                {s.skorA}
              </div>
              {s.ta1 && <div className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 truncate max-w-full">{s.ta1}</div>}
              {s.ta2 && <div className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 truncate max-w-full mt-1">{s.ta2}</div>}
              {!s.ta1 && !s.ta2 && <div className="text-white/50 text-[10px] italic">Kosong</div>}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center z-10 p-2">
              <div className="font-['Orbitron',sans-serif] text-2xl font-black text-amber-400 drop-shadow-md mb-1">
                {s.skorB}
              </div>
              {s.tb1 && <div className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 truncate max-w-full">{s.tb1}</div>}
              {s.tb2 && <div className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 truncate max-w-full mt-1">{s.tb2}</div>}
              {!s.tb1 && !s.tb2 && <div className="text-white/50 text-[10px] italic">Kosong</div>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={courtNum} className="bg-white border-2 border-sky-500 rounded-xl shadow-md overflow-hidden flex flex-col relative">
        {s.berjalan && (
          <div className="absolute top-2.5 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse z-20">
            🔴 LIVE
          </div>
        )}

        <div className="py-2.5 px-4 text-center bg-slate-50 border-b border-slate-200/90">
          <div className="font-sporty font-black text-sm text-slate-900 uppercase tracking-wider italic">
            LAPANGAN {courtNum}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5 font-mono">
            {s.berjalan ? `Status: Bertanding (${mStr}:${sStr})` : 'Status: Belum Mulai'}
          </div>
        </div>

        <div className="p-3.5 flex flex-col gap-3">
          {/* TIM A */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <select
                value={s.ta1}
                onChange={e => onUpdateCourtSlot(courtNum, 'ta1', e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                <option value="">-- Pilih Pemain A1 --</option>
                {pemainHadir.map(p => {
                  if (playingNow.includes(p.nama_pemain) && p.nama_pemain !== s.ta1) return null;
                  return <option key={p.nama_pemain} value={p.nama_pemain}>{p.nama_pemain}</option>;
                })}
              </select>
              <select
                value={s.ta2}
                onChange={e => onUpdateCourtSlot(courtNum, 'ta2', e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                <option value="">-- Pilih Pemain A2 --</option>
                {pemainHadir.map(p => {
                  if (playingNow.includes(p.nama_pemain) && p.nama_pemain !== s.ta2) return null;
                  return <option key={p.nama_pemain} value={p.nama_pemain}>{p.nama_pemain}</option>;
                })}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onUpdateCourtScore(courtNum, 'skorA', Math.max(0, (s.skorA || 0) - 1))}
                className="w-7 h-8 bg-white hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs transition"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                value={s.skorA}
                onChange={e => onUpdateCourtScore(courtNum, 'skorA', Number(e.target.value) || 0)}
                className="w-9 text-center text-xl font-mono font-black p-0.5 bg-transparent border-0 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => onUpdateCourtScore(courtNum, 'skorA', (s.skorA || 0) + 1)}
                className="w-7 h-8 bg-white hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-center font-extrabold text-xs text-slate-400 italic">VS</div>

          {/* TIM B */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <select
                value={s.tb1}
                onChange={e => onUpdateCourtSlot(courtNum, 'tb1', e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                <option value="">-- Pilih Pemain B1 --</option>
                {pemainHadir.map(p => {
                  if (playingNow.includes(p.nama_pemain) && p.nama_pemain !== s.tb1) return null;
                  return <option key={p.nama_pemain} value={p.nama_pemain}>{p.nama_pemain}</option>;
                })}
              </select>
              <select
                value={s.tb2}
                onChange={e => onUpdateCourtSlot(courtNum, 'tb2', e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded-md text-xs font-bold bg-white"
              >
                <option value="">-- Pilih Pemain B2 --</option>
                {pemainHadir.map(p => {
                  if (playingNow.includes(p.nama_pemain) && p.nama_pemain !== s.tb2) return null;
                  return <option key={p.nama_pemain} value={p.nama_pemain}>{p.nama_pemain}</option>;
                })}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onUpdateCourtScore(courtNum, 'skorB', Math.max(0, (s.skorB || 0) - 1))}
                className="w-7 h-8 bg-white hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs transition"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                value={s.skorB}
                onChange={e => onUpdateCourtScore(courtNum, 'skorB', Number(e.target.value) || 0)}
                className="w-9 text-center text-xl font-mono font-black p-0.5 bg-transparent border-0 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => onUpdateCourtScore(courtNum, 'skorB', (s.skorB || 0) + 1)}
                className="w-7 h-8 bg-white hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer shadow-2xs transition"
              >
                +
              </button>
            </div>
          </div>

          {/* KESEIMBANGAN MATCH */}
          {(s.ta1 || s.tb1) && (
            <div className="text-[11px] font-bold text-slate-600 border-t border-dashed border-slate-200 pt-2 flex justify-between items-center">
              <span>Team A: <b>{totalA.toFixed(1)}</b></span>
              <span className={selisih > 1.5 ? 'text-red-500 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                Selisih: {selisih.toFixed(1)}
              </span>
              <span>Team B: <b>{totalB.toFixed(1)}</b></span>
            </div>
          )}

          {selisih > 1.5 && s.ta1 && s.ta2 && s.tb1 && s.tb2 && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800">
              ⚠️ <b>Laga Kurang Seimbang!</b> Selisih grade {selisih.toFixed(1)}.
            </div>
          )}

          {/* INTEGRASI SHUTTLECOCK TAMBAHAN DALAM MATCH_ID */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-900 uppercase flex items-center gap-1">
                🏸 Shuttlecock Tambahan Match:
              </span>
              <div className="flex items-center gap-1.5 bg-white border border-emerald-300 rounded-md px-2 py-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onUpdateCourtCock(courtNum, Math.max(0, (s.cockTambahan || 0) - 1))}
                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-xs text-emerald-950 min-w-5 text-center">
                  {s.cockTambahan || 0} Pcs
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateCourtCock(courtNum, (s.cockTambahan || 0) + 1)}
                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {(s.cockTambahan || 0) > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Bebankan Biaya Ke:</span>
                  <button
                    type="button"
                    onClick={() => onToggleAllBebanCock(courtNum, [s.ta1, s.ta2, s.tb1, s.tb2].filter(Boolean))}
                    className="text-[9px] text-blue-600 font-bold underline cursor-pointer hover:text-blue-800"
                  >
                    Pilih Semua (4 Pemain)
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[s.ta1, s.ta2, s.tb1, s.tb2].filter(Boolean).map(playerName => {
                    const isSelected = (s.bebanCock || []).includes(playerName);
                    return (
                      <button
                        key={playerName}
                        type="button"
                        onClick={() => onToggleBebanCock(courtNum, playerName)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {playerName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => onMulaiMatchTimer(courtNum)}
            className={`min-h-[44px] rounded-xl font-bold text-xs text-white cursor-pointer transition flex items-center justify-center gap-1 shadow-2xs ${
              s.berjalan ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {s.berjalan ? '⏹️ Batal' : '⏱️ Mulai'}
          </button>
          <button
            onClick={() => onAutoDraft(courtNum)}
            className="min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1 shadow-2xs"
          >
            🎲 Auto Draft
          </button>
          <button
            onClick={() => onSelesaiMatch(courtNum)}
            disabled={!s.berjalan}
            className={`min-h-[44px] rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-1 shadow-2xs ${
              s.berjalan
                ? 'bg-sky-600 hover:bg-sky-700 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            💾 Selesai
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🏆 Klasemen Liga & Pertandingan Hari Ini
        </h2>
      </div>

      {/* TABEL KLASEMEN HARIAN */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b-2 border-slate-200">
              <th className="py-2.5 px-2 w-10">Pos</th>
              <th className="py-2.5 px-3 text-left w-36">Pemain</th>
              <th className="py-2.5 px-3 text-left w-36">Status Hadir</th>
              <th className="py-2.5 px-2 w-12">Mp</th>
              <th className="py-2.5 px-2 w-12 text-emerald-600">M</th>
              <th className="py-2.5 px-2 w-12 text-red-600">K</th>
              <th className="py-2.5 px-2 w-12 text-emerald-600">PM</th>
              <th className="py-2.5 px-2 w-12 text-red-600">PK</th>
              <th className="py-2.5 px-2 w-14 text-purple-600">SP</th>
              <th className="py-2.5 px-2 w-16 text-blue-600">Poin</th>
              <th className="py-2.5 px-2 w-20">Rata Waktu</th>
              <th className="py-2.5 px-2">5 Laga (Form)</th>
              {userRole === 'admin' && <th className="py-2.5 px-2 w-10">Del</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedStandings.map((p, idx) => {
              const spStr = (p.selisihSkor > 0 ? '+' : '') + p.selisihSkor;
              const avgSec = p.main > 0 ? Math.floor(p.totalDurasiDetik / p.main) : 0;
              const avgStr = String(Math.floor(avgSec / 60)).padStart(2, '0') + ':' + String(avgSec % 60).padStart(2, '0');

              return (
                <tr key={p.nama} className="hover:bg-slate-50/80 transition">
                  <td className="py-2 px-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-left font-bold text-slate-800">{p.nama}</td>
                  <td className="py-2 px-3 text-left">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => userRole === 'admin' && onToggleAbsensi(p.nama)}
                        disabled={userRole !== 'admin'}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 transition ${
                          p.hadir
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.hadir ? 'bg-white' : 'bg-red-500'}`}></span>
                        {p.hadir ? 'HADIR' : 'ABSEN'}
                      </button>
                      {p.jamDatang && (
                        <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">
                          ⏱️ {p.jamDatang}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 font-bold">{p.main}</td>
                  <td className="py-2 px-2 font-bold text-emerald-600">{p.menang}</td>
                  <td className="py-2 px-2 font-bold text-red-600">{p.kalah}</td>
                  <td className="py-2 px-2 font-semibold text-emerald-600">{p.skorMenang}</td>
                  <td className="py-2 px-2 font-semibold text-red-600">{p.skorKalah}</td>
                  <td className="py-2 px-2 font-bold text-purple-600">{spStr}</td>
                  <td className="py-2 px-2 font-black text-blue-600 text-sm">{p.poin}</td>
                  <td className="py-2 px-2 font-mono font-bold text-slate-600">{avgStr}</td>
                  <td className="py-2 px-2">
                    {p.form.length > 0 ? (
                      <div className="flex gap-1 justify-center">
                        {p.form.slice(-5).map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className={`w-4 h-4 rounded-xs text-[10px] font-bold text-white flex items-center justify-center ${
                              f === 'M' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  {userRole === 'admin' && (
                    <td className="py-2 px-2">
                      <button
                        onClick={() => onHapusPemain(p.nama)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        ❌
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAPAN SKOR LAPANGAN */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          🎚️ Papan Skor Pertandingan
        </h3>
        {userRole === 'admin' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTambahLapangan}
              className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-bold text-sm flex items-center justify-center cursor-pointer"
              title="Tambah Lapangan"
            >
              +
            </button>
            <button
              onClick={onKurangiLapangan}
              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold text-sm flex items-center justify-center cursor-pointer"
              title="Kurangi Lapangan"
            >
              -
            </button>
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 ${jumlahLapangan > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
        {Array.from({ length: jumlahLapangan }).map((_, i) => renderCourtCard(i + 1))}
      </div>

      {/* RIWAYAT MATCH HARIAN */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          📜 Riwayat Hasil Pertandingan Hari Ini
        </h3>

        {pertandinganList.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
            Belum ada pertandingan selesai hari ini.
          </div>
        ) : (
          <div className="space-y-2">
            {pertandinganList.map(m => {
              const timA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean).join(' / ');
              const timB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean).join(' / ');
              return (
                <div
                  key={m.match_id}
                  className="p-3 bg-white border border-slate-200 border-l-4 border-l-sky-500 rounded-lg shadow-2xs flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{timA}</span>
                      <span className="bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                        {m.skor_tim_a} : {m.skor_tim_b}
                      </span>
                      <span>{timB}</span>
                      {Number(m.jumlah_shuttlecock_tambahan) > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                          🏸 +{m.jumlah_shuttlecock_tambahan} Cock
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>⏱️ Durasi: <b>{m.durasi_menit} Menit</b> (Lapangan {m.lapangan})</span>
                      {m.detail_pemain_cock && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          Cock dibebankan ke: <b>{m.detail_pemain_cock}</b>
                        </span>
                      )}
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenEditMatch(m)}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[11px] font-bold cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => onDeleteMatch(m.match_id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer text-sm"
                      >
                        ❌
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
