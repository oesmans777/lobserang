import React, { useState } from 'react';
import { KehadiranPembayaran, KlasemenKumulatif, Pertandingan } from '../types';
import { loadScript } from '../utils/dynamicLoader';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  kehadiranList: KehadiranPembayaran[];
  pertandinganList: Pertandingan[];
  kumulatifList: KlasemenKumulatif[];
}

declare const XLSX: any;

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  isOpen,
  onClose,
  kehadiranList,
  pertandinganList: _pertandinganList,
  kumulatifList,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const ensureXlsx = async () => {
    if (typeof XLSX !== 'undefined') return true;
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.min.js');
      return typeof XLSX !== 'undefined';
    } catch {
      return false;
    }
  };

  const downloadCsv = (filename: string, rows: any[][]) => {
    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportHariIni = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const rows: any[][] = [
      ["REKAP AKTIVITAS, KAS & SHUTTLECOCK MABAR BADMINTON LOB SERANG 2"],
      ["Tanggal Sesi: " + todayStr],
      [],
      [
        "No", "Nama Pemain", "Status Kehadiran", "Jam Datang", "Biaya Lapangan (Rp)",
        "Biaya Cock Dasar (Rp)", "Cock Tambahan (Pcs)", "Subtotal Cock Extra (Rp)",
        "Total Biaya Cock (Rp)", "Total Tagihan (Rp)", "Status Bayar", "Metode Bayar", "Nominal Dibayar (Rp)"
      ]
    ];

    let totalKas = 0;
    let totalExtraCock = 0;

    kehadiranList.forEach((k, idx) => {
      const bLap = Number(k.biaya_lapangan_per_pemain) || 10000;
      const bCock = Number(k.biaya_shuttlecock_per_pemain) || 3000;
      const qtyExtra = Number(k.jumlah_shuttlecock_tambahan) || 0;
      const subExtra = qtyExtra * (Number(k.biaya_shuttlecock_tambahan) || 3000);
      const totCock = bCock + subExtra;
      const tagihan = Number(k.total_tagihan) || (bLap + totCock);
      const dibayar = Number(k.nominal_dibayar) || 0;

      totalExtraCock += qtyExtra;
      if (k.status_pembayaran !== 'Belum Bayar' && k.metode_pembayaran !== 'Sponsor') {
        totalKas += dibayar;
      }

      rows.push([
        idx + 1,
        k.nama_pemain,
        k.status_hadir ? "HADIR" : "ABSEN",
        k.jam_kedatangan || "-",
        bLap,
        bCock,
        qtyExtra,
        subExtra,
        totCock,
        tagihan,
        k.status_pembayaran,
        k.metode_pembayaran,
        dibayar
      ]);
    });

    rows.push([]);
    rows.push(["TOTAL KAS MASUK", totalKas, "", "", "", "", "TOTAL COCK TAMBAHAN", totalExtraCock]);

    const hasXlsx = await ensureXlsx();
    if (hasXlsx) {
      try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Rekap Harian");
        XLSX.writeFile(wb, `LobSerang_Rekap_Harian_${Date.now()}.xlsx`);
        setIsExporting(false);
        onClose();
        return;
      } catch (err: any) {
        console.warn('XLSX failed, falling back to CSV', err);
      }
    }

    // Fallback to CSV
    downloadCsv(`LobSerang_Rekap_Harian_${Date.now()}.csv`, rows);
    setIsExporting(false);
    onClose();
  };

  const exportKumulatif = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const rows: any[][] = [
      ["KLASEMEN ALL KUMULATIF & STATISTIK BADMINTON LOB SERANG 2"],
      ["Data Akumulasi s/d: " + todayStr],
      [],
      ["Pos", "Nama Pemain", "Total Hadir (Sesi)", "Total Main (MP)", "Menang (M)", "Kalah (K)", "Poin Menang (PM)", "Poin Kalah (PK)", "Selisih Poin (SP)", "Total Poin"]
    ];

    const sorted = [...kumulatifList].sort((a, b) => (Number(b.total_poin) || 0) - (Number(a.total_poin) || 0));

    sorted.forEach((k, idx) => {
      const sp = Number(k.total_selisih_poin) || 0;
      rows.push([
        idx + 1,
        k.nama_pemain,
        `${k.total_hadir || 0} Sesi`,
        k.total_main || 0,
        k.total_menang || 0,
        k.total_kalah || 0,
        k.total_poin_menang || 0,
        k.total_poin_kalah || 0,
        sp > 0 ? `+${sp}` : sp,
        k.total_poin || 0
      ]);
    });

    const hasXlsx = await ensureXlsx();
    if (hasXlsx) {
      try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Kumulatif");
        XLSX.writeFile(wb, `LobSerang_All_Kumulatif_${Date.now()}.xlsx`);
        setIsExporting(false);
        onClose();
        return;
      } catch (err: any) {
        console.warn('XLSX export failed, falling back to CSV', err);
      }
    }

    // Fallback to CSV
    downloadCsv(`LobSerang_All_Kumulatif_${Date.now()}.csv`, rows);
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] border-2 border-[#038C8C]/50 shape-cyber-card max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 shape-cyber-card bg-linear-to-br from-[#038C8C] to-[#013A40] text-white text-2xl flex items-center justify-center mx-auto shadow-md border border-[#B2DCE5]/40">
          <span className="drop-shadow-[0_0_8px_#F8B700]">📊</span>
        </div>
        <h3 className="text-base font-black text-[#013A40] uppercase font-tech tracking-wider flex items-center justify-center gap-2">
          <span>Unduh Laporan Spreadsheet (.xlsx / .csv)</span>
        </h3>
        <p className="text-xs text-[#013A40]/70 font-medium">
          Pilih data yang ingin Anda unduh ke format Excel spreadsheet:
        </p>

        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="space-y-2.5">
          <button
            onClick={exportHariIni}
            disabled={isExporting}
            className="w-full p-3.5 shape-cyber-card border border-[#038C8C]/40 bg-white hover:bg-[#B2DCE5]/20 text-left cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-sm text-[#013A40] mb-0.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#038C8C]"></span>
              <span>Rekap Aktivitas, Kas & Shuttlecock Hari Ini</span>
            </h4>
            <p className="text-xs text-[#013A40]/70">
              Rincian biaya lapangan, shuttlecock dasar, shuttlecock tambahan, kas tunai/QRIS, serta data pemain.
            </p>
          </button>

          <button
            onClick={exportKumulatif}
            disabled={isExporting}
            className="w-full p-3.5 shape-cyber-card border border-[#038C8C]/40 bg-white hover:bg-[#B2DCE5]/20 text-left cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-sm text-[#013A40] mb-0.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8B700]"></span>
              <span>Rekap All Kumulatif Seluruh Sesi</span>
            </h4>
            <p className="text-xs text-[#013A40]/70">
              Akumulasi performa all-time seluruh sesi mabar, ranking poin, dan riwayat kehadiran.
            </p>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#B2DCE5]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-[#013A40] shape-cyber-card font-bold text-xs cursor-pointer border border-[#B2DCE5] transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
