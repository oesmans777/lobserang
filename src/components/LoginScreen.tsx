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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* ICON BADGE */}
        <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-emerald-500/20">
          🏸
        </div>

        {/* REVISED SPORTY TITLE */}
        <h1 className="font-sporty text-3xl font-black text-slate-900 tracking-wider uppercase italic drop-shadow-xs">
          LOB SERANG
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1 mb-6">
          Sistem Manajemen Mabar Badminton TaheSquat
        </p>

        {!showAdminInput ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowAdminInput(true)}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm cursor-pointer shadow-md transition flex items-center justify-center gap-2 min-h-[46px]"
            >
              <span>🔑</span>
              <span>Masuk sebagai Admin</span>
            </button>
            <button
              onClick={() => onLoginSuccess('member')}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-sm cursor-pointer transition flex items-center justify-center gap-2 min-h-[46px]"
            >
              <span>👁️</span>
              <span>Masuk sebagai Member (Mode Baca)</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="text-left space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">PASSWORD ADMIN</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                autoFocus
                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-emerald-500 transition"
              />
              {errorMsg && <p className="text-xs text-red-500 font-semibold mt-1.5">{errorMsg}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm cursor-pointer transition shadow-xs"
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
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* WATERMARK created by : TAHESQUAT Badminton System 2.0 */}
        <div className="mt-8 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
            created by : TAHESQUAT Badminton System 2.0
          </p>
        </div>
      </div>
    </div>
  );
};
