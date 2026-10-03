import React, { useState } from 'react';
import { KlasemenKumulatif, ArsipSesiHarian } from '../types';

interface CumulativeViewProps {
  kumulatifList: KlasemenKumulatif[];
  arsipSesiList: ArsipSesiHarian[];
}

export const CumulativeView: React.FC<CumulativeViewProps> = ({
  kumulatifList,
  arsipSesiList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedKumulatif = [...kumulatifList].sort((a, b) => {
    if (Number(b.total_poin) !== Number(a.total_poin)) return Number(b.total_poin) - Number(a.total_poin);
    if (Number(b.total_selisih_poin) !== Number(a.total_selisih_poin)) return Number(b.total_selisih_poin) - Number(a.total_selisih_poin);
    return a.nama_pemain.localeCompare(b.nama_pemain);
  }).filter(k => k.nama_pemain.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#B2DCE5] pb-3 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#013A40] flex items-center gap-2 font-sporty uppercase italic">
            <span className="text-2xl text-[#F8B700]">📊</span>
            <span>Klasemen All Kumulatif</span>
          </h2>
          <p className="text-xs text-[#013A40]/70 mt-1">
            Data ini memuat rangkuman kehadiran dan performa pemain yang diarsipkan secara permanen di sheet <b>Klasemen_Kumulatif</b>.
          </p>
        </div>

        <div className="w-64">
          <input
            type="text"
            placeholder="🔍 Cari nama pemain..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card text-xs font-bold text-[#013A40] focus:outline-hidden bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* TABEL KLASEMEN KUMULATIF */}
      <div className="overflow-x-auto border-2 border-[#038C8C]/30 shape-cyber-card shadow-sm bg-white">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-[#013A40] text-[#F2F2F2] uppercase font-black text-[11px] border-b-2 border-[#038C8C]/50 font-tech tracking-wider">
              <th className="py-3 px-2 w-12">Pos</th>
              <th className="py-3 px-3 text-left w-44">Pemain</th>
              <th className="py-3 px-3 text-left w-28">Hadir</th>
              <th className="py-3 px-2 w-14">Mp</th>
              <th className="py-3 px-2 w-14 text-[#F8B700]">M</th>
              <th className="py-3 px-2 w-14 text-red-300">K</th>
              <th className="py-3 px-2 w-14 text-[#B2DCE5]">PM</th>
              <th className="py-3 px-2 w-14 text-slate-300">PK</th>
              <th className="py-3 px-2 w-14 text-[#B2DCE5]">SP</th>
              <th className="py-3 px-2 w-20 text-[#F8B700]">Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#B2DCE5]/40 font-medium">
            {sortedKumulatif.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-[#013A40]/50 italic">
                  Belum ada data klasemen kumulatif. Selesaikan sesi mabar terlebih dahulu.
                </td>
              </tr>
            ) : (
              sortedKumulatif.map((k, idx) => {
                const spVal = Number(k.total_selisih_poin) || 0;
                const spStr = (spVal > 0 ? '+' : '') + spVal;

                return (
                  <tr key={k.nama_pemain} className="hover:bg-[#B2DCE5]/15 transition">
                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 shape-cyber-card font-black text-xs ${
                          idx === 0
                            ? 'bg-[#F8B700] text-[#013A40] shadow-[0_0_8px_rgba(248,183,0,0.6)]'
                            : idx === 1
                            ? 'bg-[#B2DCE5] text-[#013A40]'
                            : idx === 2
                            ? 'bg-[#038C8C] text-white'
                            : 'bg-[#F2F2F2] text-[#013A40]/70'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-left font-black text-[#013A40] uppercase tracking-wide">{k.nama_pemain}</td>
                    <td className="py-2.5 px-3 text-left font-bold text-[#038C8C]">{k.total_hadir || 0} Sesi</td>
                    <td className="py-2.5 px-2 font-black text-[#013A40]">{k.total_main || 0}</td>
                    <td className="py-2.5 px-2 font-black text-[#038C8C]">{k.total_menang || 0}</td>
                    <td className="py-2.5 px-2 font-black text-red-500">{k.total_kalah || 0}</td>
                    <td className="py-2.5 px-2 font-bold text-[#038C8C]">{k.total_poin_menang || 0}</td>
                    <td className="py-2.5 px-2 font-bold text-red-500">{k.total_poin_kalah || 0}</td>
                    <td className="py-2.5 px-2 font-black text-[#013A40]">{spStr}</td>
                    <td className="py-2.5 px-2 font-black text-[#038C8C] text-sm tabular-nums">{k.total_poin || 0}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ARSIP RIWAYAT SESI */}
      <div className="border-t border-[#B2DCE5] pt-5">
        <h3 className="text-base font-black text-[#013A40] mb-3 flex items-center gap-2 font-tech">
          <span className="text-lg text-[#038C8C]">📅</span>
          <span>ARSIP RIWAYAT SESI HARIAN</span>
        </h3>

        <div className="overflow-x-auto border-2 border-[#038C8C]/30 shape-cyber-card shadow-sm bg-white">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-[#013A40] text-[#F2F2F2] font-black text-[11px] border-b-2 border-[#038C8C]/50 uppercase font-tech tracking-wider">
                <th className="py-3 px-3 text-left">Waktu Arsip</th>
                <th className="py-3 px-3">Total Pertandingan</th>
                <th className="py-3 px-3 text-[#B2DCE5]">Jumlah Pemain Hadir</th>
                <th className="py-3 px-3">Rata-rata Waktu Main</th>
                <th className="py-3 px-3 text-[#F8B700]">Total Kas Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B2DCE5]/40 font-medium">
              {arsipSesiList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-[#013A40]/50 italic">
                    Belum ada riwayat sesi mabar yang diarsipkan.
                  </td>
                </tr>
              ) : (
                arsipSesiList.map(a => (
                  <tr key={a.arsip_id} className="hover:bg-[#B2DCE5]/15 transition">
                    <td className="py-2.5 px-3 text-left font-bold text-[#013A40]">📅 {a.waktu_arsip}</td>
                    <td className="py-2.5 px-3 font-bold text-[#038C8C]">{a.total_pertandingan} Pertandingan</td>
                    <td className="py-2.5 px-3 font-bold text-[#013A40]">{a.jumlah_pemain_hadir} Orang</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#F8B700]">⏱️ {a.rata_rata_waktu_main}</td>
                    <td className="py-2.5 px-3 font-black text-[#038C8C]">
                      Rp {(Number(a.total_kas_masuk) || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
