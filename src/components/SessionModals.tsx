import React, { useState } from 'react';
import { Pertandingan, KehadiranPembayaran } from '../types';

// ==========================================
// MODAL SELESAI SESI
// ==========================================
interface SelesaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SelesaiModal: React.FC<SelesaiModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] border-2 border-[#038C8C]/50 shape-cyber-card max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 shape-cyber-card bg-linear-to-br from-[#038C8C] to-[#013A40] text-white text-2xl flex items-center justify-center mx-auto shadow-md border border-[#B2DCE5]/40">
          <span className="drop-shadow-[0_0_8px_#F8B700]">🏁</span>
        </div>
        <h3 className="text-base font-black text-[#013A40] uppercase font-tech tracking-wider">
          Selesai Sesi Mabar Hari Ini?
        </h3>
        <p className="text-xs text-[#013A40]/70 leading-relaxed font-medium">
          Klasemen harian, status kehadiran, dan rincian kas akan diarsipkan ke sheet <b>Arsip_Sesi_Harian</b> serta diakumulasikan ke <b>Klasemen_Kumulatif</b>. Sesi baru akan dibuka bersih.
        </p>

        <div className="flex gap-2.5 justify-center pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-[#013A40] shape-cyber-card font-bold text-xs cursor-pointer border border-[#B2DCE5] transition"
          >
            Batal
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 bg-linear-to-r from-[#013A40] to-[#038C8C] hover:from-[#038C8C] hover:to-[#013A40] text-white shape-cyber-card font-black text-xs cursor-pointer shadow-md border border-[#B2DCE5]/40 transition"
          >
            Ya, Akumulasikan Sesi
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODAL RESET SISTEM
// ==========================================
interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (type: 'hari-ini' | 'kumulatif' | 'grading') => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onReset }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] border-2 border-red-500/40 shape-cyber-card max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 shape-cyber-card bg-red-600 text-white text-2xl flex items-center justify-center mx-auto shadow-md border border-red-300">
          🔄
        </div>
        <h3 className="text-base font-black text-[#013A40] uppercase font-tech tracking-wider">Opsi Reset Data</h3>
        <p className="text-xs text-[#013A40]/70 font-medium">
          Pilih jenis data yang ingin Anda bersihkan dari sistem:
        </p>

        <div className="space-y-2 text-left">
          <button
            onClick={() => { onReset('hari-ini'); onClose(); }}
            className="w-full p-3 bg-white hover:bg-[#F8B700]/10 border border-[#F8B700] shape-cyber-card cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-xs text-[#013A40] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8B700]"></span>
              <span>Reset Data Hari Ini Saja</span>
            </h4>
            <p className="text-[11px] text-[#013A40]/70 mt-0.5">Membersihkan registrasi nama, absensi, dan match sesi ini.</p>
          </button>

          <button
            onClick={() => { onReset('kumulatif'); onClose(); }}
            className="w-full p-3 bg-white hover:bg-red-50 border border-red-300 shape-cyber-card cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-xs text-red-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Reset Data Kumulatif</span>
            </h4>
            <p className="text-[11px] text-red-600/70 mt-0.5">Menghapus seluruh klasemen kumulatif & arsip sesi lampau.</p>
          </button>

          <button
            onClick={() => { onReset('grading'); onClose(); }}
            className="w-full p-3 bg-white hover:bg-red-50 border border-red-400 shape-cyber-card cursor-pointer transition shadow-2xs group"
          >
            <h4 className="font-black text-xs text-red-800 flex items-center gap-1.5">
              <span className="text-sm">⭐</span>
              <span>Reset Database Grading</span>
            </h4>
            <p className="text-[11px] text-red-700/70 mt-0.5">Mengosongkan daftar grading skor pemain.</p>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#B2DCE5]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-[#013A40] shape-cyber-card font-bold text-xs cursor-pointer border border-[#B2DCE5] transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODAL EDIT MATCH
// ==========================================
interface EditMatchModalProps {
  isOpen: boolean;
  match: Pertandingan | null;
  onClose: () => void;
  onSave: (updated: Partial<Pertandingan>) => void;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  isOpen,
  match,
  onClose,
  onSave
}) => {
  if (!isOpen || !match) return null;

  const [timA, setTimA] = useState([match.tim_a_pemain_1, match.tim_a_pemain_2].filter(Boolean).join(' / '));
  const [skorA, setSkorA] = useState(match.skor_tim_a);
  const [timB, setTimB] = useState([match.tim_b_pemain_1, match.tim_b_pemain_2].filter(Boolean).join(' / '));
  const [skorB, setSkorB] = useState(match.skor_tim_b);
  const [durasi, setDurasi] = useState(match.durasi_menit);
  const [cockExtra, setCockExtra] = useState(match.jumlah_shuttlecock_tambahan || 0);
  const [detailPemainCock, setDetailPemainCock] = useState<string[]>(
    match.detail_pemain_cock
      ? match.detail_pemain_cock.split(',').map(s => s.trim()).filter(Boolean)
      : [match.tim_a_pemain_1, match.tim_a_pemain_2, match.tim_b_pemain_1, match.tim_b_pemain_2].filter(Boolean) as string[]
  );

  const allPlayersInMatch = [
    ...timA.split('/').map(x => x.trim().toUpperCase()).filter(Boolean),
    ...timB.split('/').map(x => x.trim().toUpperCase()).filter(Boolean)
  ];

  const togglePlayerCock = (pName: string) => {
    setDetailPemainCock(prev =>
      prev.includes(pName) ? prev.filter(x => x !== pName) : [...prev, pName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const partsA = timA.split('/').map(x => x.trim().toUpperCase());
    const partsB = timB.split('/').map(x => x.trim().toUpperCase());
    onSave({
      match_id: match.match_id,
      tim_a_pemain_1: partsA[0] || '',
      tim_a_pemain_2: partsA[1] || '',
      tim_b_pemain_1: partsB[0] || '',
      tim_b_pemain_2: partsB[1] || '',
      skor_tim_a: skorA,
      skor_tim_b: skorB,
      pemenang: skorA > skorB ? 'A' : (skorB > skorA ? 'B' : 'SERI'),
      durasi_menit: durasi.trim() || '00:00',
      jumlah_shuttlecock_tambahan: cockExtra,
      detail_pemain_cock: detailPemainCock.join(', ')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] border-2 border-[#038C8C]/50 shape-cyber-card max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-black text-[#013A40] border-b border-[#B2DCE5] pb-2 font-tech uppercase tracking-wider flex items-center gap-2">
          <span>✏️</span>
          <span>Edit Pertandingan ({match.match_id})</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">NAMA TIM A (PISAHKAN DENGAN / )</label>
            <input
              type="text"
              value={timA}
              onChange={e => setTimA(e.target.value)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-black text-[#013A40] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">SKOR TIM A</label>
            <input
              type="number"
              min="0"
              value={skorA}
              onChange={e => setSkorA(Number(e.target.value) || 0)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-mono font-black text-[#038C8C] focus:outline-hidden text-base"
              required
            />
          </div>

          <div className="h-px bg-[#B2DCE5]"></div>

          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">NAMA TIM B (PISAHKAN DENGAN / )</label>
            <input
              type="text"
              value={timB}
              onChange={e => setTimB(e.target.value)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-black text-[#013A40] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">SKOR TIM B</label>
            <input
              type="number"
              min="0"
              value={skorB}
              onChange={e => setSkorB(Number(e.target.value) || 0)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-mono font-black text-[#038C8C] focus:outline-hidden text-base"
              required
            />
          </div>

          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">DURASI (MENIT:DETIK)</label>
            <input
              type="text"
              value={durasi}
              onChange={e => setDurasi(e.target.value)}
              placeholder="15:30"
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-black font-mono text-[#013A40] focus:outline-hidden"
            />
          </div>

          {/* INTEGRASI SHUTTLECOCK TAMBAHAN DALAM MATCH_ID */}
          <div className="p-3 bg-white border border-[#B2DCE5] shape-cyber-card space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-[#013A40] block text-[11px] uppercase font-tech">
                🏸 Shuttlecock Tambahan Match Ini
              </label>
              <div className="flex items-center gap-1.5 bg-[#F2F2F2] border border-[#B2DCE5] rounded-md px-2 py-0.5">
                <button
                  type="button"
                  onClick={() => setCockExtra(Math.max(0, cockExtra - 1))}
                  className="w-5 h-5 bg-white hover:bg-[#B2DCE5]/40 text-[#013A40] rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-black text-xs text-[#013A40] min-w-5 text-center">
                  {cockExtra} Pcs
                </span>
                <button
                  type="button"
                  onClick={() => setCockExtra(cockExtra + 1)}
                  className="w-5 h-5 bg-white hover:bg-[#B2DCE5]/40 text-[#013A40] rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {cockExtra > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#013A40]/70">
                  Bebankan Tagihan Cock ke Pemain:
                </div>
                <div className="flex flex-wrap gap-1">
                  {allPlayersInMatch.map(pName => {
                    const isSelected = detailPemainCock.includes(pName);
                    return (
                      <button
                        key={pName}
                        type="button"
                        onClick={() => togglePlayerCock(pName)}
                        className={`text-[10px] font-black px-2 py-0.5 shape-cyber-pill border cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#038C8C] text-white border-[#038C8C] shadow-2xs'
                            : 'bg-white text-[#013A40] border-[#B2DCE5] hover:bg-[#B2DCE5]/40'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {pName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-[#B2DCE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-[#013A40] shape-cyber-card font-bold cursor-pointer border border-[#B2DCE5] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#038C8C] hover:bg-[#013A40] text-white shape-cyber-card font-black cursor-pointer shadow-md transition border border-[#B2DCE5]/40"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// MODAL EDIT PEMAIN
// ==========================================
interface EditPemainModalProps {
  isOpen: boolean;
  pemain: KehadiranPembayaran | null;
  onClose: () => void;
  onSave: (namaBaru: string, biayaLap: number, biayaCock: number) => void;
}

export const EditPemainModal: React.FC<EditPemainModalProps> = ({
  isOpen,
  pemain,
  onClose,
  onSave
}) => {
  if (!isOpen || !pemain) return null;

  const [nama, setNama] = useState(pemain.nama_pemain);
  const [bLap, setBLap] = useState(pemain.biaya_lapangan_per_pemain || 10000);
  const [bCock, setBCock] = useState(pemain.biaya_shuttlecock_per_pemain || 3000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nama.trim().toUpperCase(), bLap, bCock);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#013A40]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#F2F2F2] border-2 border-[#038C8C]/50 shape-cyber-card max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-black text-[#013A40] border-b border-[#B2DCE5] pb-2 font-tech uppercase tracking-wider flex items-center gap-2">
          <span>✏️</span>
          <span>Edit Biaya Anggota Harian</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">NAMA PEMAIN</label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-black text-[#013A40] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">BIAYA LAPANGAN (RP)</label>
            <input
              type="number"
              min="0"
              value={bLap}
              onChange={e => setBLap(Number(e.target.value) || 0)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-black text-[#013A40] focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="font-black text-[#013A40] block mb-1 uppercase text-[10px]">BIAYA SHUTTLECOCK DASAR (RP)</label>
            <input
              type="number"
              min="0"
              value={bCock}
              onChange={e => setBCock(Number(e.target.value) || 0)}
              className="w-full p-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card font-black text-[#013A40] focus:outline-hidden"
              required
            />
          </div>

          <div className="p-2.5 bg-white border-l-4 border-[#F8B700] shape-cyber-card border-y border-r border-[#B2DCE5]">
            <span className="text-[11px] text-[#013A40]/70 block font-medium">Total Tagihan Dasar:</span>
            <b className="text-sm text-[#013A40] font-black">Rp {(bLap + bCock).toLocaleString('id-ID')}</b>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-[#B2DCE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-[#013A40] shape-cyber-card font-bold cursor-pointer border border-[#B2DCE5] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#038C8C] hover:bg-[#013A40] text-white shape-cyber-card font-black cursor-pointer shadow-md transition border border-[#B2DCE5]/40"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
