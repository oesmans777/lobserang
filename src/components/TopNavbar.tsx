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
    <header className="bg-[#F2F2F2]/95 backdrop-blur-md h-16 px-3 sm:px-6 flex items-center justify-between border-b border-[#B2DCE5]/80 shadow-xs z-30 sticky top-0">
      {/* LEFT: MENU TOGGLE & BRAND */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="h-10 px-3 sm:px-3.5 bg-[#013A40] hover:bg-[#038C8C] text-[#F2F2F2] shape-cyber-card cursor-pointer font-extrabold text-xs flex items-center gap-2 transition duration-150 shadow-sm border border-[#038C8C]/40"
          title="Buka / Tutup Sidebar"
        >
          <span className="text-sm">☰</span>
          <span className="hidden sm:inline font-tech tracking-wider">MENU</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-sporty font-black text-lg md:text-xl text-[#013A40] tracking-wider uppercase italic drop-shadow-xs">
            LOB <span className="text-[#038C8C]">SERANG</span>
          </span>
          <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest text-[#013A40] bg-[#B2DCE5]/60 px-2 py-0.5 shape-cyber-pill border border-[#038C8C]/30">
            SYSTEM 2.0
          </span>
        </div>

        {/* Sync Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 shape-cyber-card text-[11px] font-bold border select-none transition ${
            syncStatus === 'syncing'
              ? 'bg-[#F8B700]/15 text-[#013A40] border-[#F8B700]'
              : syncStatus === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-[#B2DCE5]/30 text-[#013A40] border-[#038C8C]/40'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-[#F8B700] animate-ping' : syncStatus === 'error' ? 'bg-red-500' : 'bg-[#038C8C]'}`}></span>
          <span className="tracking-wide">
            {syncStatus === 'syncing'
              ? 'Menyimpan...'
              : syncStatus === 'error'
              ? 'Gagal Sinkron'
              : 'Sheets Tersinkron'}
          </span>
        </div>
      </div>

      {/* CENTER: LIVE MATCH METRICS (DESKTOP) */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 shape-cyber-card border border-[#B2DCE5] shadow-2xs">
          <span className="text-[#013A40]/70 font-bold text-[10px] uppercase tracking-wider">Hadir</span>
          <span className="font-mono font-black text-[#038C8C] text-base tabular-nums">
            {String(totalHadir).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 shape-cyber-card border border-[#B2DCE5] shadow-2xs">
          <span className="text-[#013A40]/70 font-bold text-[10px] uppercase tracking-wider">Match</span>
          <span className="font-mono font-black text-[#013A40] text-base tabular-nums">
            {String(totalMatch).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 shape-cyber-card border border-[#B2DCE5] shadow-2xs">
          <span className="text-[#013A40]/70 font-bold text-[10px] uppercase tracking-wider">Rata-rata</span>
          <span className="font-mono font-black text-[#F8B700] text-base tabular-nums drop-shadow-xs">
            {avgDurasi}
          </span>
        </div>
      </div>

      {/* RIGHT: ACTIONS & TOOLS DROPDOWN */}
      <div className="flex items-center gap-2">
        {userRole === 'admin' && (
          <div className="dropdown-container relative inline-block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-10 px-3.5 bg-linear-to-r from-[#013A40] to-[#038C8C] hover:from-[#038C8C] hover:to-[#013A40] text-[#F2F2F2] border border-[#B2DCE5]/40 shape-cyber-card font-extrabold text-xs cursor-pointer flex items-center gap-2 transition shadow-sm"
            >
              <span className="text-[#F8B700]">⚙️</span>
              <span className="hidden sm:inline tracking-wide font-tech text-xs">ALAT & EKSPOR</span>
              <span className="text-[#F8B700] text-[10px]">▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white min-w-64 shadow-2xl rounded-2xl border-2 border-[#038C8C]/30 z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#038C8C] border-b border-[#B2DCE5]/50 bg-[#B2DCE5]/15">
                  Ekspor & Unduhan
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenExportGambar(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#013A40] hover:bg-[#B2DCE5]/30 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span className="text-base">🖼️</span>
                  <span>Unduh Klasemen (Poster JPG)</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenExportExcel(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#013A40] hover:bg-[#B2DCE5]/30 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span className="text-base">📊</span>
                  <span>Unduh Laporan Excel (.xlsx / .csv)</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenImport(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#013A40] hover:bg-[#B2DCE5]/30 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span className="text-base">📥</span>
                  <span>Impor Database Spreadsheet</span>
                </button>

                <div className="h-px bg-[#B2DCE5] my-1"></div>
                <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#038C8C] bg-[#B2DCE5]/15">
                  Manajemen Sesi
                </div>

                <button
                  onClick={() => { setDropdownOpen(false); onOpenSelesai(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-black text-[#038C8C] hover:bg-[#038C8C]/10 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span className="text-base">🏁</span>
                  <span>Selesai & Arsipkan Sesi</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenReset(); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition"
                >
                  <span className="text-base">🔄</span>
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
