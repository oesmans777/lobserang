import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  userRole: UserRole | null;
  isOpen: boolean;
  onSelectTab: (tab: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onOpenGasCode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  userRole,
  isOpen,
  onSelectTab,
  onToggleSidebar,
  onLogout,
  onOpenGasCode
}) => {
  const menuItems = [
    { id: 'page-input', label: 'Registrasi Pemain', icon: '📝', adminOnly: true, desc: 'Input nama WhatsApp & biaya' },
    { id: 'page-match', label: 'Klasemen & Match', icon: '🏆', adminOnly: false, desc: 'Papan skor live & liga harian' },
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
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-72 bg-slate-950 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out z-50 border-r border-slate-800 shadow-2xl fixed inset-y-0 left-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-72'
        }`}
      >
        {/* SIDEBAR HEADER: SPORTY & FUTURISTIC LOB SERANG */}
        <div className="p-5 border-b border-slate-800/80 bg-linear-to-b from-slate-900 to-slate-950 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 text-white font-sporty font-black">
                🏸
              </div>
              <div>
                <h1 className="font-sporty text-xl font-extrabold tracking-wider text-white uppercase italic leading-none drop-shadow-sm">
                  LOB SERANG
                </h1>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block mt-1">
                  Badminton System 2.0
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-sm"
              aria-label="Tutup Menu"
            >
              ✕
            </button>
          </div>

          {/* User Role Badge */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${userRole === 'admin' ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`}></span>
              <span className="font-semibold text-slate-300 text-[11px]">
                {userRole === 'admin' ? 'Admin Access' : 'Member (Mode Baca)'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              v2.0
            </span>
          </div>
        </div>

        {/* MENU NAVIGATION */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1.5">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu Utama
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
                className={`w-full p-2.5 rounded-xl cursor-pointer flex items-center gap-3 text-left transition-all select-none group min-h-[46px] ${
                  isActive
                    ? 'bg-linear-to-r from-emerald-500/20 to-teal-500/10 text-white border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${
                    isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 group-hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
            );
          })}

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Pengembang & Script
          </div>

          <button
            onClick={() => {
              onOpenGasCode();
              if (window.innerWidth < 768) onToggleSidebar();
            }}
            className="w-full p-2.5 rounded-xl cursor-pointer flex items-center gap-3 text-left transition text-slate-300 hover:bg-slate-900 hover:text-white border border-indigo-900/40 bg-indigo-950/20 group min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-sm font-bold">
              📁
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-indigo-200 truncate">File GAS & Panduan</div>
              <div className="text-[10px] text-indigo-400/80 truncate">Deploy ke Google Sheets</div>
            </div>
          </button>
        </nav>

        {/* SIDEBAR FOOTER: WATERMARK created by : TAHESQUAT Badminton System 2.0 */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <button
            onClick={onLogout}
            className="w-full bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-900/50 p-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 min-h-[42px]"
          >
            <span>🚪</span>
            <span>Keluar Akun ({userRole === 'admin' ? 'Admin' : 'Member'})</span>
          </button>

          <div className="mt-3.5 text-center">
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
              created by : TAHESQUAT Badminton System 2.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
