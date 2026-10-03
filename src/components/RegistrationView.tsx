import React, { useState } from 'react';

interface RegistrationViewProps {
  biayaLapangan: number;
  biayaCock: number;
  tarifCockExtra: number;
  onUpdateBiayaSesi: (lap: number, cock: number, extra: number) => void;
  onRegisterPlayers: (names: string[]) => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  biayaLapangan,
  biayaCock,
  tarifCockExtra,
  onUpdateBiayaSesi,
  onRegisterPlayers,
}) => {
  const [waText, setWaText] = useState('');
  const [lapInput, setLapInput] = useState(biayaLapangan);
  const [cockInput, setCockInput] = useState(biayaCock);
  const [extraInput, setExtraInput] = useState(tarifCockExtra);

  const totalBiayaDasar = lapInput + cockInput;

  const handleApplyBiaya = () => {
    onUpdateBiayaSesi(lapInput, cockInput, extraInput);
  };

  const handleProses = () => {
    if (!waText.trim()) return;
    const lines = waText.split('\n');
    const names: string[] = [];
    lines.forEach(l => {
      const clean = l.replace(/^\d+[\.\-\s\)]+/, '').trim().replace(/[\d\.\-\)]+$/, '').trim().toUpperCase();
      if (clean.length > 1) {
        names.push(clean);
      }
    });

    if (names.length > 0) {
      onRegisterPlayers(names);
      setWaText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          📝 Registrasi & Masukkan Nama Pemain
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          Sesi Aktif
        </span>
      </div>

      <div className="bg-emerald-50/70 border border-dashed border-emerald-300 rounded-xl p-5 shadow-xs">
        {/* STRUKTUR BIAYA MABAR & SHUTTLECOCK WAJIB */}
        <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
              🏸 Struktur Biaya Mabar & Shuttlecock
            </h3>
            <button
              onClick={handleApplyBiaya}
              className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md cursor-pointer transition"
            >
              Simpan Biaya
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block uppercase mb-1">
                Biaya Lapangan / Pemain
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  value={lapInput}
                  onChange={e => setLapInput(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm font-extrabold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block uppercase mb-1">
                Biaya Shuttlecock Dasar / Pemain
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  value={cockInput}
                  onChange={e => setCockInput(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm font-extrabold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block uppercase mb-1">
                Tarif Shuttlecock Tambahan / Unit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  value={extraInput}
                  onChange={e => setExtraInput(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm font-extrabold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-3.5 p-2.5 bg-emerald-50 border-l-4 border-emerald-500 rounded-sm flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900">Total Biaya Dasar Pemain Baru:</span>
            <span className="font-extrabold text-emerald-900 text-sm">
              Rp {totalBiayaDasar.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-emerald-700 ml-1.5">
                (Rp {lapInput.toLocaleString('id-ID')} Lap + Rp {cockInput.toLocaleString('id-ID')} Cock)
              </span>
            </span>
          </div>
        </div>

        {/* INPUT WHATSAPP */}
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
          📋 Tempel Teks (Bisa 1 atau banyak nama WhatsApp sekaligus)
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Anda dapat mengetikkan 1 nama langsung, atau menyalin daftar berangka dari WhatsApp dan menempelkannya di sini.
        </p>

        <textarea
          value={waText}
          onChange={e => setWaText(e.target.value)}
          placeholder={"Contoh 1 nama:\nBUDI\n\nContoh daftar WhatsApp berangka:\n1. BUDI\n2. ANDI\n3. CITRA"}
          className="w-full h-32 p-3 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-hidden focus:border-emerald-500 resize-none font-mono"
        ></textarea>

        <button
          onClick={handleProses}
          className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm cursor-pointer shadow-md transition flex items-center justify-center gap-2"
        >
          <span>💾</span>
          <span>Proses & Masukkan Pemain ke Sesi</span>
        </button>
      </div>
    </div>
  );
};
