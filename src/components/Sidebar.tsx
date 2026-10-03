import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  userRole: UserRole | null;
  isOpen: boolean;
  onSelectTab: (tab: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  userRole,
  isOpen,
  onSelectTab,
  onToggleSidebar,
  onLogout
}) => {
  const menuItems = [
    { id: 'page-input', label: 'Registrasi Pemain', icon: '📝', adminOnly: true, desc: 'Input nama WhatsApp & biaya' },
    { id: 'page-match', label: 'Klasemen & Match', icon: '🏸', adminOnly: false, desc: 'Papan skor live & liga harian' },
    { id: 'page-rekap', label: 'Rekap Kas & Cock', icon: '💰', adminOnly: true, desc: 'Audit pembayaran & shuttlecock' },
    { id: 'page-allmatch', label: 'Klasemen All Kumulatif', icon: '📊', adminOnly: false, desc: 'Ranking all-time & arsip' },
    { id: 'page-news', label: 'News & Update', icon: '📰', adminOnly: false, desc: 'Papan mading & info mabar' },
    { id: 'page-grading', label: 'Grading Database', icon: '⭐', adminOnly: true, desc: 'Level & kualitas pemain' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-72 bg-[#013A40] text-[#F2F2F2] flex flex-col transition-transform duration-300 ease-in-out z-50 border-r border-[#038C8C]/30 shadow-2xl fixed inset-y-0 left-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-72'
        }`}
      >
        {/* SIDEBAR HEADER: SPORTY & FUTURISTIC LOB SERANG */}
        <div className="p-5 border-b border-[#038C8C]/25 bg-linear-to-b from-[#013A40] to-[#00272B] relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#038C8C]/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shape-cyber-card bg-linear-to-br from-[#038C8C] to-[#013A40] p-0.5 border border-[#B2DCE5]/40 shadow-lg shadow-[#038C8C]/30 flex items-center justify-center text-xl">
                <span className="drop-shadow-[0_0_8px_rgba(248,183,0,0.6)]">🏸</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-sporty text-xl font-black tracking-wider text-[#F2F2F2] uppercase italic leading-none drop-shadow-sm">
                    LOB SERANG
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#F8B700] shadow-[0_0_6px_#F8B700] animate-pulse"></span>
                </div>
                <span className="text-[10px] font-bold text-[#B2DCE5] tracking-widest uppercase block mt-1">
                  Badminton System 2.0
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden w-8 h-8 rounded-lg bg-[#00272B] border border-[#038C8C]/40 text-[#B2DCE5] hover:text-[#F8B700] flex items-center justify-center cursor-pointer text-sm transition"
              aria-label="Tutup Menu"
            >
              ✕
            </button>
          </div>

          {/* User Role Badge */}
          <div className="mt-4 pt-3 border-t border-[#038C8C]/20 flex items-center justify-between text-xs relative z-10">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${userRole === 'admin' ? 'bg-[#F8B700] shadow-[0_0_8px_#F8B700] animate-pulse' : 'bg-[#B2DCE5]'}`}></span>
              <span className="font-semibold text-[#F2F2F2] text-[11px] tracking-wide">
                {userRole === 'admin' ? 'Admin Access' : 'Member (Mode Baca)'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-black bg-[#038C8C]/30 text-[#B2DCE5] px-2 py-0.5 rounded-md border border-[#038C8C]/40">
              PRO
            </span>
          </div>
        </div>

        {/* MENU NAVIGATION */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1.5">
          <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[#B2DCE5]/60">
            Menu Operasional
          </div>

          {menuItems.map(item => {
            if (item.adminOnly && userRole !== 'admin') return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 768) {
                    onToggleSidebar();
                  }
                }}
                className={`w-full p-2.5 shape-cyber-card cursor-pointer flex items-center gap-3 text-left transition-all duration-150 select-none group min-h-[46px] border ${
                  isActive
                    ? 'bg-linear-to-r from-[#038C8C] to-[#013A40] text-white border-[#B2DCE5]/50 shadow-md shadow-[#038C8C]/30'
                    : 'text-[#F2F2F2]/75 hover:bg-[#038C8C]/20 hover:text-white border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${
                    isActive
                      ? 'bg-[#F8B700] text-[#013A40] font-black shadow-[0_0_10px_rgba(248,183,0,0.5)]'
                      : 'bg-[#00272B] text-[#B2DCE5] group-hover:bg-[#038C8C]/40 group-hover:text-white'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-extrabold truncate ${isActive ? 'text-[#F8B700]' : 'text-[#F2F2F2]'}`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-[#B2DCE5]' : 'text-[#B2DCE5]/60'}`}>
                    {item.desc}
                  </div>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#F8B700] shadow-[0_0_8px_#F8B700]"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER: WATERMARK created by : TAHESQUAT Badminton System 2.0 */}
        <div className="p-4 border-t border-[#038C8C]/25 bg-[#00272B]">
          <button
            onClick={onLogout}
            className="w-full bg-[#013A40] hover:bg-red-950/60 text-[#F2F2F2] hover:text-red-300 border border-[#038C8C]/40 hover:border-red-500/50 p-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 min-h-[42px]"
          >
            <span>🚪</span>
            <span>Keluar Akun ({userRole === 'admin' ? 'Admin' : 'Member'})</span>
          </button>

          <div className="mt-3.5 text-center">
            <p className="text-[10px] font-semibold text-[#B2DCE5]/80 tracking-wider">
              created by : TAHESQUAT Badminton System 2.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
