import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'lobserangmlg') {
      setErrorMsg('');
      onLoginSuccess('admin');
    } else {
      setErrorMsg('Password Admin salah! (Gunakan: lobserangmlg)');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#013A40]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] p-8 shape-cyber-card shadow-2xl max-w-sm w-full text-center border-2 border-[#038C8C]/40 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Futuristic Accent Corner Light */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#F8B700]/15 rounded-full blur-xl pointer-events-none -mr-6 -mt-6"></div>

        {/* ICON BADGE */}
        <div className="w-16 h-16 shape-cyber-card bg-linear-to-br from-[#038C8C] to-[#013A40] text-white flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-[#038C8C]/30 border border-[#B2DCE5]/50">
          <span className="drop-shadow-[0_0_10px_rgba(248,183,0,0.6)]">🏸</span>
        </div>

        {/* REVISED SPORTY TITLE */}
        <h1 className="font-sporty text-3xl font-black text-[#013A40] tracking-wider uppercase italic drop-shadow-xs">
          LOB <span className="text-[#038C8C]">SERANG</span>
        </h1>
        <p className="text-xs font-bold text-[#038C8C] mt-1 mb-6 tracking-wide">
          Sistem Manajemen Mabar Badminton TaheSquat
        </p>

        {!showAdminInput ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowAdminInput(true)}
              className="w-full py-3.5 px-4 bg-linear-to-r from-[#013A40] to-[#038C8C] hover:from-[#038C8C] hover:to-[#013A40] text-[#F2F2F2] shape-cyber-card font-extrabold text-sm cursor-pointer shadow-md transition flex items-center justify-center gap-2.5 min-h-[46px] border border-[#B2DCE5]/30 group"
            >
              <span className="text-[#F8B700] group-hover:scale-110 transition-transform">🔑</span>
              <span className="tracking-wide">Masuk sebagai Admin</span>
            </button>
            <button
              onClick={() => onLoginSuccess('member')}
              className="w-full py-3.5 px-4 bg-[#B2DCE5]/40 hover:bg-[#B2DCE5]/70 text-[#013A40] border border-[#038C8C]/40 shape-cyber-card font-extrabold text-sm cursor-pointer transition flex items-center justify-center gap-2.5 min-h-[46px]"
            >
              <span>👁️</span>
              <span className="tracking-wide">Masuk sebagai Member (Mode Baca)</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="text-left space-y-3.5">
            <div>
              <label className="text-xs font-black text-[#013A40] block mb-1 uppercase tracking-wider">PASSWORD ADMIN</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                autoFocus
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#B2DCE5] focus:border-[#038C8C] rounded-xl text-sm font-bold text-[#013A40] focus:outline-hidden transition"
              />
              {errorMsg && <p className="text-xs text-red-600 font-bold mt-1.5">{errorMsg}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#038C8C] hover:bg-[#013A40] text-white shape-cyber-card font-extrabold text-sm cursor-pointer transition shadow-md border border-[#B2DCE5]/40"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdminInput(false);
                  setPassword('');
                  setErrorMsg('');
                }}
                className="px-4 py-3 bg-[#B2DCE5]/40 hover:bg-[#B2DCE5]/70 text-[#013A40] shape-cyber-card font-bold text-sm cursor-pointer transition border border-[#038C8C]/30"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* WATERMARK created by : TAHESQUAT Badminton System 2.0 */}
        <div className="mt-8 pt-4 border-t border-[#B2DCE5]">
          <p className="text-[11px] font-bold text-[#038C8C] tracking-wider">
            created by : TAHESQUAT Badminton System 2.0
          </p>
        </div>
      </div>
    </div>
  );
};
