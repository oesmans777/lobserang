import React from 'react';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  userRole: UserRole | null;
  onSelectTab: (tab: string) => void;
  onToggleSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  userRole,
  onSelectTab,
  onToggleSidebar
}) => {
  const tabs = [
    { id: 'page-input', label: 'Daftar', icon: '📝', adminOnly: true },
    { id: 'page-match', label: 'Match', icon: '🏸', adminOnly: false },
    { id: 'page-rekap', label: 'Kas', icon: '💰', adminOnly: true },
    { id: 'page-allmatch', label: 'Klasemen', icon: '📊', adminOnly: false },
    { id: 'page-news', label: 'Mading', icon: '📰', adminOnly: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 flex items-center justify-around px-1 py-1 shadow-xl pb-[calc(env(safe-area-inset-bottom,0px)+6px)]">
      {tabs.map(tab => {
        if (tab.adminOnly && userRole !== 'admin') return null;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[50px] relative ${
              isActive
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1 w-6 h-0.5 bg-emerald-600 rounded-full"></span>
            )}
            <span className="text-lg leading-none mb-0.5">{tab.icon}</span>
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-black text-emerald-800' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer min-w-[50px]"
        aria-label="Buka menu navigasi"
      >
        <span className="text-lg leading-none mb-0.5">☰</span>
        <span className="text-[10px] font-medium tracking-tight">Menu</span>
      </button>
    </nav>
  );
};

