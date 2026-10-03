import React, { useRef, useState } from 'react';
import { KehadiranPembayaran, KlasemenKumulatif, Pertandingan } from '../types';
import { loadScript } from '../utils/dynamicLoader';

interface PosterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  kehadiranList: KehadiranPembayaran[];
  pertandinganList: Pertandingan[];
  kumulatifList: KlasemenKumulatif[];
}

declare const html2canvas: any;

export const PosterExportModal: React.FC<PosterExportModalProps> = ({
  isOpen,
  onClose,
  kehadiranList,
  pertandinganList,
  kumulatifList,
}) => {
  const [jenis, setJenis] = useState<'hari-ini' | 'kumulatif'>('hari-ini');
  const [isProcessing, setIsProcessing] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Siapkan data klasemen
  let dataList: {
    nama: string;
    hadir: string;
    mp: number;
    m: number;
    k: number;
    pm: number;
    pk: number;
    sp: number;
    poin: number;
  }[] = [];

  if (jenis === 'hari-ini') {
    const map: Record<string, any> = {};
    kehadiranList.forEach(k => {
      map[k.nama_pemain] = {
        nama: k.nama_pemain,
        hadir: k.status_hadir ? 'Hadir' : 'Absen',
        mp: 0, m: 0, k: 0, pm: 0, pk: 0, sp: 0, poin: 0
      };
    });

    pertandinganList.forEach(m => {
      const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter((p): p is string => Boolean(p));
      const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter((p): p is string => Boolean(p));
      const sA = Number(m.skor_tim_a) || 0, sB = Number(m.skor_tim_b) || 0;

      pA.forEach(name => {
        if (!name || !map[name]) return;
        map[name].mp++;
        map[name].pm += sA;
        map[name].pk += sB;
        if (sA > sB) { map[name].m++; map[name].poin += 3; }
        else if (sB > sA) { map[name].k++; }
        map[name].sp = map[name].pm - map[name].pk;
      });

      pB.forEach(name => {
        if (!name || !map[name]) return;
        map[name].mp++;
        map[name].pm += sB;
        map[name].pk += sA;
        if (sB > sA) { map[name].m++; map[name].poin += 3; }
        else if (sA > sB) { map[name].k++; }
        map[name].sp = map[name].pm - map[name].pk;
      });
    });

    dataList = Object.values(map);
  } else {
    dataList = kumulatifList.map(k => ({
      nama: k.nama_pemain,
      hadir: `${k.total_hadir || 0} Sesi`,
      mp: k.total_main || 0,
      m: k.total_menang || 0,
      k: k.total_kalah || 0,
      pm: k.total_poin_menang || 0,
      pk: k.total_poin_kalah || 0,
      sp: k.total_selisih_poin || 0,
      poin: k.total_poin || 0
    }));
  }

  dataList.sort((a, b) => {
    if (b.poin !== a.poin) return b.poin - a.poin;
    if (b.sp !== a.sp) return b.sp - a.sp;
    return a.nama.localeCompare(b.nama);
  });

  const p1 = dataList[0] || { nama: '-', poin: 0, sp: 0 };
  const p2 = dataList[1] || { nama: '-', poin: 0, sp: 0 };
  const p3 = dataList[2] || { nama: '-', poin: 0, sp: 0 };

  const mid = Math.ceil(dataList.length / 2);
  const col1 = dataList.slice(0, mid);
  const col2 = dataList.slice(mid);

  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadImage = async () => {
    if (!posterRef.current) return;
    setDownloadError(null);
    setIsProcessing(true);

    try {
      if (typeof html2canvas === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      }

      posterRef.current.style.display = 'block';

      setTimeout(() => {
        if (typeof html2canvas === 'undefined') {
          if (posterRef.current) posterRef.current.style.display = 'none';
          setIsProcessing(false);
          setDownloadError('Modul pembuat gambar tidak tersedia saat offline.');
          return;
        }

        html2canvas(posterRef.current, { backgroundColor: '#02081f', scale: 2 })
          .then((canvas: any) => {
            const link = document.createElement('a');
            link.download = `LobSerang_${jenis}_${Date.now()}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            if (posterRef.current) posterRef.current.style.display = 'none';
            setIsProcessing(false);
            onClose();
          })
          .catch((err: any) => {
            if (posterRef.current) posterRef.current.style.display = 'none';
            setIsProcessing(false);
            setDownloadError('Gagal membuat gambar: ' + (err?.message || err));
          });
      }, 400);
    } catch (e: any) {
      if (posterRef.current) posterRef.current.style.display = 'none';
      setIsProcessing(false);
      setDownloadError('Gagal memuat pustaka gambar: ' + (e?.message || e));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
          🖼️ Unduh Klasemen (Gambar JPG)
        </h3>
        <p className="text-xs text-slate-500">
          Pilih data klasemen yang ingin diekspor menjadi poster infografis JPG E-Sport resolusi tinggi:
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => setJenis('hari-ini')}
            className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition ${
              jenis === 'hari-ini'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <h4 className="font-extrabold text-sm mb-0.5">🟢 Klasemen Hari Ini (Poster)</h4>
            <p className="text-xs text-slate-500">Ekspor klasemen mabar aktif yang berlangsung hari ini.</p>
          </button>

          <button
            onClick={() => setJenis('kumulatif')}
            className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition ${
              jenis === 'kumulatif'
                ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <h4 className="font-extrabold text-sm mb-0.5">🔵 Klasemen Kumulatif All-Time (Poster)</h4>
            <p className="text-xs text-slate-500">Ekspor visual performa akumulasi seluruh sesi mabar historis.</p>
          </button>
        </div>

        {downloadError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            ⚠️ {downloadError}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleDownloadImage}
            disabled={isProcessing}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-xs flex items-center gap-1.5"
          >
            {isProcessing ? 'Memproses JPG...' : '📥 Unduh Gambar JPG'}
          </button>
        </div>
      </div>

      {/* POSTER CANVAS RENDERER HIDDEN ELEMENT */}
      <div
        ref={posterRef}
        id="print-poster-container"
        style={{ display: 'none', position: 'absolute', left: '-9999px', top: 0, width: '1200px' }}
      >
        <div className="poster-header">
          <div className="poster-logo-text font-sporty">LOB SERANG</div>
          <div className="poster-sub-title">LEADERBOARD FINAL MABAR BADMINTON TAHESQUAT</div>
          <div className="poster-session">
            {jenis === 'hari-ini' ? 'SESI MABAR HARI INI' : 'SESI KUMULATIF ALL-TIME'}
          </div>
          <br />
          <div className="poster-date-badge">
            Updated: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* PODIUM 1 - 2 - 3 */}
        <div className="podium-container">
          <div className="podium-box p-2">
            <div className="podium-rank-badge">2</div>
            <div className="podium-content">
              <div className="pod-name">{p2.nama}</div>
              <div className="pod-pts">{p2.poin} Poin</div>
              <div className="pod-sp">SP {p2.sp > 0 ? `+${p2.sp}` : p2.sp}</div>
            </div>
          </div>

          <div className="podium-box p-1">
            <div className="podium-rank-badge">1</div>
            <div className="podium-content">
              <div className="pod-name">{p1.nama}</div>
              <div className="pod-pts">{p1.poin} Poin</div>
              <div className="pod-sp">SP {p1.sp > 0 ? `+${p1.sp}` : p1.sp}</div>
            </div>
          </div>

          <div className="podium-box p-3">
            <div className="podium-rank-badge">3</div>
            <div className="podium-content">
              <div className="pod-name">{p3.nama}</div>
              <div className="pod-pts">{p3.poin} Poin</div>
              <div className="pod-sp">SP {p3.sp > 0 ? `+${p3.sp}` : p3.sp}</div>
            </div>
          </div>
        </div>

        {/* STATS SUMMARY ROW */}
        <div className="stats-summary-row">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-text"><div>Total Pemain:</div><span>{dataList.length}</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-text"><div>Poin Tertinggi:</div><span>{p1.poin}</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-text">
              <div>Selisih Terbaik:</div>
              <span>{p1.sp > 0 ? `+${p1.sp}` : p1.sp}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏸</div>
            <div className="stat-text"><div>Total Match:</div><span>{pertandinganList.length}</span></div>
          </div>
        </div>

        {/* TABLES 2-COLUMNS */}
        <div className="poster-tables-wrapper">
          <div className="poster-table-col">
            <table className="poster-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th style={{ textAlign: 'left' }}>Pemain</th>
                  <th>Hadir</th>
                  <th>MP</th>
                  <th>M</th>
                  <th>K</th>
                  <th>PM</th>
                  <th>PK</th>
                  <th>SP</th>
                  <th>Poin</th>
                </tr>
              </thead>
              <tbody>
                {col1.map((p, idx) => (
                  <tr key={idx}>
                    <td className="pt-pos">{idx + 1}</td>
                    <td>{p.nama}</td>
                    <td style={{ color: '#10b981' }}>{p.hadir}</td>
                    <td>{p.mp}</td>
                    <td style={{ color: '#10b981' }}>{p.m}</td>
                    <td style={{ color: '#f43f5e' }}>{p.k}</td>
                    <td style={{ color: '#10b981' }}>{p.pm}</td>
                    <td style={{ color: '#f43f5e' }}>{p.pk}</td>
                    <td className={`pt-sp ${p.sp > 0 ? 'plus' : p.sp < 0 ? 'minus' : ''}`}>
                      {p.sp > 0 ? `+${p.sp}` : p.sp}
                    </td>
                    <td className="pt-poin">{p.poin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="poster-table-col">
            <table className="poster-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th style={{ textAlign: 'left' }}>Pemain</th>
                  <th>Hadir</th>
                  <th>MP</th>
                  <th>M</th>
                  <th>K</th>
                  <th>PM</th>
                  <th>PK</th>
                  <th>SP</th>
                  <th>Poin</th>
                </tr>
              </thead>
              <tbody>
                {col2.map((p, idx) => (
                  <tr key={idx}>
                    <td className="pt-pos">{mid + idx + 1}</td>
                    <td>{p.nama}</td>
                    <td style={{ color: '#10b981' }}>{p.hadir}</td>
                    <td>{p.mp}</td>
                    <td style={{ color: '#10b981' }}>{p.m}</td>
                    <td style={{ color: '#f43f5e' }}>{p.k}</td>
                    <td style={{ color: '#10b981' }}>{p.pm}</td>
                    <td style={{ color: '#f43f5e' }}>{p.pk}</td>
                    <td className={`pt-sp ${p.sp > 0 ? 'plus' : p.sp < 0 ? 'minus' : ''}`}>
                      {p.sp > 0 ? `+${p.sp}` : p.sp}
                    </td>
                    <td className="pt-poin">{p.poin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="poster-footer">
          <div>◎ MP = Jumlah Match &nbsp; ◎ M = Menang &nbsp; ◎ K = Kalah &nbsp; ◎ PM = Poin Menang &nbsp; ◎ PK = Poin Kalah &nbsp; ◎ SP = Selisih Poin</div>
          <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, opacity: 0.9, letterSpacing: '0.08em', color: '#10b981' }}>
            created by : TAHESQUAT Badminton System 2.0
          </div>
        </div>
      </div>
    </div>
  );
};
