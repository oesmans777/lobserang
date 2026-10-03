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
      <div className="flex items-center justify-between border-b border-[#B2DCE5] pb-3">
        <h2 className="text-xl font-black text-[#013A40] flex items-center gap-2 font-sporty uppercase italic">
          <span>📝</span>
          <span>Registrasi & Masukkan Nama Pemain</span>
        </h2>
        <span className="text-[11px] font-black px-3 py-1 bg-[#F8B700] text-[#013A40] shape-cyber-pill shadow-xs tracking-wider">
          SESI AKTIF
        </span>
      </div>

      <div className="bg-white/80 border-2 border-[#038C8C]/30 shape-cyber-card p-5 sm:p-6 shadow-sm relative overflow-hidden">
        {/* Ambient Corner Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#B2DCE5]/30 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>

        {/* STRUKTUR BIAYA MABAR & SHUTTLECOCK WAJIB */}
        <div className="bg-[#F2F2F2] border border-[#B2DCE5] shape-cyber-card p-4 sm:p-5 mb-5 shadow-2xs relative z-10">
          <div className="flex items-center justify-between mb-4 border-b border-[#B2DCE5]/70 pb-2.5">
            <h3 className="text-xs font-black uppercase text-[#013A40] tracking-wider flex items-center gap-2 font-tech">
              <span className="text-base text-[#038C8C]">🏸</span>
              <span>STRUKTUR BIAYA MABAR & SHUTTLECOCK</span>
            </h3>
            <button
              onClick={handleApplyBiaya}
              className="text-[11px] font-black bg-[#038C8C] hover:bg-[#013A40] text-white px-3.5 py-1.5 shape-cyber-card cursor-pointer transition shadow-xs border border-[#B2DCE5]/40"
            >
              Simpan Biaya
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10px] font-black text-[#013A40] block uppercase mb-1 tracking-wider">
                Biaya Lapangan / Pemain
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-black text-[#038C8C]">Rp</span>
                <input
                  type="number"
                  value={lapInput}
                  onChange={e => setLapInput(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] rounded-lg text-sm font-black text-[#013A40] focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[#013A40] block uppercase mb-1 tracking-wider">
                Biaya Shuttlecock Dasar / Pemain
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-black text-[#038C8C]">Rp</span>
                <input
                  type="number"
                  value={cockInput}
                  onChange={e => setCockInput(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] rounded-lg text-sm font-black text-[#013A40] focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[#013A40] block uppercase mb-1 tracking-wider">
                Tarif Shuttlecock Tambahan / Unit
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-black text-[#038C8C]">Rp</span>
                <input
                  type="number"
                  value={extraInput}
                  onChange={e => setExtraInput(Number(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#B2DCE5] focus:border-[#038C8C] rounded-lg text-sm font-black text-[#013A40] focus:outline-hidden transition"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white border-l-4 border-[#F8B700] rounded-r-lg flex items-center justify-between text-xs border-y border-r border-[#B2DCE5]/70">
            <span className="font-bold text-[#013A40]">Total Biaya Dasar Pemain Baru:</span>
            <span className="font-black text-[#013A40] text-sm">
              Rp {totalBiayaDasar.toLocaleString('id-ID')}
              <span className="text-xs font-semibold text-[#038C8C] ml-1.5">
                (Rp {lapInput.toLocaleString('id-ID')} Lap + Rp {cockInput.toLocaleString('id-ID')} Cock)
              </span>
            </span>
          </div>
        </div>

        {/* INPUT WHATSAPP */}
        <div className="relative z-10">
          <h4 className="text-sm font-black text-[#013A40] flex items-center gap-2 mb-1">
            <span className="text-base text-[#F8B700]">📋</span>
            <span>Tempel Teks (Bisa 1 atau banyak nama WhatsApp sekaligus)</span>
          </h4>
          <p className="text-xs text-[#013A40]/70 mb-3">
            Ketikkan 1 nama langsung, atau salin daftar berangka dari WhatsApp dan tempelkan di sini.
          </p>

          <textarea
            value={waText}
            onChange={e => setWaText(e.target.value)}
            placeholder={"Contoh 1 nama:\nBUDI\n\nContoh daftar WhatsApp berangka:\n1. BUDI\n2. ANDI\n3. CITRA"}
            className="w-full h-32 p-3 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card text-sm font-bold text-[#013A40] focus:outline-hidden resize-none font-mono"
          ></textarea>

          <button
            onClick={handleProses}
            className="w-full mt-3.5 py-3.5 bg-linear-to-r from-[#013A40] to-[#038C8C] hover:from-[#038C8C] hover:to-[#013A40] text-white shape-cyber-card font-black text-sm cursor-pointer shadow-md transition flex items-center justify-center gap-2 border border-[#B2DCE5]/30 group"
          >
            <span className="text-[#F8B700] group-hover:scale-110 transition-transform">💾</span>
            <span className="tracking-wide font-tech text-base">PROSES & MASUKKAN PEMAIN KE SESI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
