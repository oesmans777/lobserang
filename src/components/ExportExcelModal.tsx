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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
          📊 Unduh Laporan Spreadsheet (.xlsx / .csv)
        </h3>
        <p className="text-xs text-slate-500">
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
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-emerald-50 hover:bg-emerald-100/70 text-left cursor-pointer transition shadow-2xs"
          >
            <h4 className="font-extrabold text-sm text-emerald-900 mb-0.5">
              🟢 Rekap Aktivitas, Kas & Shuttlecock Hari Ini
            </h4>
            <p className="text-xs text-emerald-700">
              Rincian biaya lapangan, shuttlecock dasar, shuttlecock tambahan, kas tunai/QRIS, serta data pemain.
            </p>
          </button>

          <button
            onClick={exportKumulatif}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-blue-50 hover:bg-blue-100/70 text-left cursor-pointer transition shadow-2xs"
          >
            <h4 className="font-extrabold text-sm text-blue-900 mb-0.5">
              🔵 Rekap All Kumulatif Seluruh Sesi
            </h4>
            <p className="text-xs text-blue-700">
              Akumulasi performa all-time seluruh sesi mabar, ranking poin, dan riwayat kehadiran.
            </p>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
