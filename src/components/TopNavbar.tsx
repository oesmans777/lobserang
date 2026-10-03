import React from 'react';
import { SyncStatusType, UserRole } from '../types';

interface TopNavbarProps {
  userRole: UserRole | null;
  syncStatus: SyncStatusType;
  totalHadir: number;
  totalMatch: number;
  avgDurasi: string;
  onToggleSidebar: () => void;
  onOpenExportGambar: () => void;
  onOpenExportExcel: () => void;
  onOpenImport: () => void;
  onOpenSelesai: () => void;
  onOpenReset: () => void;
  onOpenGasCode: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  userRole,
  syncStatus,
  totalHadir,
  totalMatch,
  avgDurasi,
  onToggleSidebar,
  onOpenExportGambar,
  onOpenExportExcel,
  onOpenImport,
  onOpenSelesai,
  onOpenReset,
  onOpenGasCode
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <header className="bg-white h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-200/90 shadow-2xs z-30 sticky top-0">
      {/* LEFT: MENU TOGGLE & BRAND */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="h-10 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer font-bold text-xs flex items-center gap-2 transition shadow-xs"
          title="Buka / Tutup Sidebar"
        >
          <span className="text-sm">☰</span>
          <span className="hidden sm:inline">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-sporty font-black text-lg md:text-xl text-slate-900 tracking-wide uppercase italic">
            LOB SERANG
          </span>
          <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            System 2.0
          </span>
        </div>

        {/* Sync Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border select-none transition ${
            syncStatus === 'syncing'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : syncStatus === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : syncStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
          <span>
            {syncStatus === 'syncing'
              ? 'Menyimpan...'
              : syncStatus === 'error'
              ? 'Gagal Sinkron'
              : 'Sheets Tersinkron'}
          </span>
        </div>
      </div>

      {/* CENTER: LIVE MATCH METRICS (DESKTOP) */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wide">Pemain Hadir</span>
          <span className="font-mono font-black text-emerald-600 text-base tabular-nums">
            {String(totalHadir).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wide">Total Match</span>
          <span className="font-mono font-black text-blue-600 text-base tabular-nums">
            {String(totalMatch).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wide">Rata-rata Durasi</span>
          <span className="font-mono font-black text-slate-800 text-base tabular-nums">
            {avgDurasi}
          </span>
        </div>
      </div>

      {/* RIGHT: ACTIONS & TOOLS DROPDOWN */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenGasCode}
          className="hidden sm:flex h-9 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs items-center gap-1.5 transition cursor-pointer"
          title="Lihat Kode Google Apps Script Siap Pakai"
        >
          <span>📁</span>
          <span className="hidden lg:inline">File GAS</span>
        </button>

        {userRole === 'admin' && (
          <div className="dropdown-container relative inline-block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 transition shadow-2xs"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Alat & Ekspor</span>
              <span className="text-[10px]">▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white min-w-64 shadow-xl rounded-2xl border border-slate-200 z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Ekspor & Unduhan
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenExportGambar(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span>🖼️</span>
                  <span>Unduh Klasemen (Poster JPG)</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenExportExcel(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span>📊</span>
                  <span>Unduh Laporan Excel (.xlsx / .csv)</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenImport(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span>📥</span>
                  <span>Impor Database Spreadsheet</span>
                </button>

                <div className="h-px bg-slate-100 my-1"></div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Manajemen Sesi
                </div>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenSelesai(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span>🏁</span>
                  <span>Selesai & Arsipkan Sesi</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenReset(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span>🔄</span>
                  <span>Reset / Bersihkan Data</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
