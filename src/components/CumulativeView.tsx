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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            📊 Klasemen All Kumulatif
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data ini memuat rangkuman kehadiran dan performa pemain yang diarsipkan secara permanen di sheet <b>Klasemen_Kumulatif</b>.
          </p>
        </div>

        <div className="w-56">
          <input
            type="text"
            placeholder="Cari nama pemain..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-cyan-500"
          />
        </div>
      </div>

      {/* TABEL KLASEMEN KUMULATIF */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b-2 border-slate-200">
              <th className="py-2.5 px-2 w-12">Pos</th>
              <th className="py-2.5 px-3 text-left w-44">Pemain</th>
              <th className="py-2.5 px-3 text-left w-28">Hadir</th>
              <th className="py-2.5 px-2 w-14">Mp</th>
              <th className="py-2.5 px-2 w-14 text-emerald-600">M</th>
              <th className="py-2.5 px-2 w-14 text-red-600">K</th>
              <th className="py-2.5 px-2 w-14 text-emerald-600">PM</th>
              <th className="py-2.5 px-2 w-14 text-red-600">PK</th>
              <th className="py-2.5 px-2 w-14 text-purple-600">SP</th>
              <th className="py-2.5 px-2 w-20 text-blue-600">Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedKumulatif.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-slate-400 italic">
                  Belum ada data klasemen kumulatif. Selesaikan sesi mabar terlebih dahulu.
                </td>
              </tr>
            ) : (
              sortedKumulatif.map((k, idx) => {
                const spVal = Number(k.total_selisih_poin) || 0;
                const spStr = (spVal > 0 ? '+' : '') + spVal;

                return (
                  <tr key={k.nama_pemain} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-2">
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
                    <td className="py-2.5 px-3 text-left font-bold text-slate-800 uppercase">{k.nama_pemain}</td>
                    <td className="py-2.5 px-3 text-left font-bold text-emerald-600">{k.total_hadir || 0} Sesi</td>
                    <td className="py-2.5 px-2 font-bold">{k.total_main || 0}</td>
                    <td className="py-2.5 px-2 font-bold text-emerald-600">{k.total_menang || 0}</td>
                    <td className="py-2.5 px-2 font-bold text-red-600">{k.total_kalah || 0}</td>
                    <td className="py-2.5 px-2 font-semibold text-emerald-600">{k.total_poin_menang || 0}</td>
                    <td className="py-2.5 px-2 font-semibold text-red-600">{k.total_poin_kalah || 0}</td>
                    <td className="py-2.5 px-2 font-bold text-purple-600">{spStr}</td>
                    <td className="py-2.5 px-2 font-black text-blue-600 text-sm">{k.total_poin || 0}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ARSIP RIWAYAT SESI */}
      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          📅 Arsip Riwayat Sesi Harian
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold text-[11px] border-b-2 border-slate-200">
                <th className="py-2.5 px-3 text-left">Waktu Arsip</th>
                <th className="py-2.5 px-3">Total Pertandingan</th>
                <th className="py-2.5 px-3 text-emerald-600">Jumlah Pemain Hadir</th>
                <th className="py-2.5 px-3">Rata-rata Waktu Main</th>
                <th className="py-2.5 px-3 text-emerald-700">Total Kas Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arsipSesiList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-slate-400 italic">
                    Belum ada riwayat sesi mabar yang diarsipkan.
                  </td>
                </tr>
              ) : (
                arsipSesiList.map(a => (
                  <tr key={a.arsip_id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-left font-semibold text-slate-700">📅 {a.waktu_arsip}</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">{a.total_pertandingan} Pertandingan</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">{a.jumlah_pemain_hadir} Orang</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-orange-600">⏱️ {a.rata_rata_waktu_main}</td>
                    <td className="py-2.5 px-3 font-black text-emerald-700">
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
