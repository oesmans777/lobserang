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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
          🏁
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Selesai Sesi Mabar Hari Ini?
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Klasemen harian, status kehadiran, dan rincian kas akan diarsipkan ke sheet <b>Arsip_Sesi_Harian</b> serta diakumulasikan ke <b>Klasemen_Kumulatif</b>. Sesi baru akan dibuka bersih.
        </p>

        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 text-2xl flex items-center justify-center mx-auto">
          🔄
        </div>
        <h3 className="text-base font-bold text-slate-800">Opsi Reset Data</h3>
        <p className="text-xs text-slate-500">
          Pilih jenis data yang ingin Anda bersihkan dari sistem:
        </p>

        <div className="space-y-2 text-left">
          <button
            onClick={() => { onReset('hari-ini'); onClose(); }}
            className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer transition"
          >
            <h4 className="font-extrabold text-xs text-amber-900">🟠 Reset Data Hari Ini Saja</h4>
            <p className="text-[11px] text-amber-700">Membersihkan registrasi nama, absensi, dan match sesi ini.</p>
          </button>

          <button
            onClick={() => { onReset('kumulatif'); onClose(); }}
            className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl cursor-pointer transition"
          >
            <h4 className="font-extrabold text-xs text-red-900">🔴 Reset Data Kumulatif</h4>
            <p className="text-[11px] text-red-700">Menghapus seluruh klasemen kumulatif & arsip sesi lampau.</p>
          </button>

          <button
            onClick={() => { onReset('grading'); onClose(); }}
            className="w-full p-3 bg-red-100/50 hover:bg-red-100 border border-red-300 rounded-xl cursor-pointer transition"
          >
            <h4 className="font-extrabold text-xs text-red-950">⭐ Reset Database Grading</h4>
            <p className="text-[11px] text-red-800">Mengosongkan daftar grading skor pemain.</p>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          ✏️ Edit Pertandingan ({match.match_id})
        </h3>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">NAMA TIM A (PISAHKAN DENGAN / )</label>
            <input
              type="text"
              value={timA}
              onChange={e => setTimA(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">SKOR TIM A</label>
            <input
              type="number"
              min="0"
              value={skorA}
              onChange={e => setSkorA(Number(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded-md font-black text-blue-600"
              required
            />
          </div>

          <div className="h-px bg-slate-200"></div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">NAMA TIM B (PISAHKAN DENGAN / )</label>
            <input
              type="text"
              value={timB}
              onChange={e => setTimB(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">SKOR TIM B</label>
            <input
              type="number"
              min="0"
              value={skorB}
              onChange={e => setSkorB(Number(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded-md font-black text-blue-600"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">DURASI (MENIT:DETIK)</label>
            <input
              type="text"
              value={durasi}
              onChange={e => setDurasi(e.target.value)}
              placeholder="15:30"
              className="w-full p-2 border border-slate-300 rounded-md font-bold font-mono"
            />
          </div>

          {/* INTEGRASI SHUTTLECOCK TAMBAHAN DALAM MATCH_ID */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-emerald-900 block text-[11px] uppercase">
                🏸 Shuttlecock Tambahan Match Ini
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-emerald-300 rounded-md px-2 py-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCockExtra(Math.max(0, cockExtra - 1))}
                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-xs text-emerald-950 min-w-5 text-center">
                  {cockExtra} Pcs
                </span>
                <button
                  type="button"
                  onClick={() => setCockExtra(cockExtra + 1)}
                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {cockExtra > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-600">
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
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

          <div className="flex gap-2 justify-end pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b pb-2">
          ✏️ Edit Biaya Anggota Harian
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">NAMA PEMAIN</label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">BIAYA LAPANGAN (RP)</label>
            <input
              type="number"
              min="0"
              value={bLap}
              onChange={e => setBLap(Number(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded-md font-extrabold"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">BIAYA SHUTTLECOCK DASAR (RP)</label>
            <input
              type="number"
              min="0"
              value={bCock}
              onChange={e => setBCock(Number(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded-md font-extrabold"
              required
            />
          </div>

          <div className="p-2.5 bg-slate-50 border rounded-md">
            <span className="text-[11px] text-slate-500 block">Total Tagihan Dasar:</span>
            <b className="text-sm text-slate-800">Rp {(bLap + bCock).toLocaleString('id-ID')}</b>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
