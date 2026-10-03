import React, { useState } from 'react';
import { KehadiranPembayaran, Pertandingan, UserRole } from '../types';

interface PaymentKasViewProps {
  userRole: UserRole | null;
  kehadiranList: KehadiranPembayaran[];
  pertandinganList: Pertandingan[];
  onToggleStatusBayar: (nama: string) => void;
  onGantiMetode: (nama: string, metode: 'Tunai' | 'QRIS' | 'Sponsor') => void;
  onUbahShuttlecockTambahan: (nama: string, delta: number) => void;
  onEditNominalPemain: (k: KehadiranPembayaran) => void;
  onOpenEditMatch?: (m: Pertandingan) => void;
}

export const PaymentKasView: React.FC<PaymentKasViewProps> = ({
  userRole,
  kehadiranList,
  pertandinganList,
  onToggleStatusBayar,
  onGantiMetode,
  onUbahShuttlecockTambahan,
  onEditNominalPemain,
  onOpenEditMatch,
}) => {
  const [filterKas, setFilterKas] = useState('semua');
  const [searchCockMatch, setSearchCockMatch] = useState('');

  let totalTunai = 0, totalTF = 0, totalBelum = 0;
  let countTunai = 0, countTF = 0, countBelum = 0, countSponsor = 0, totalExtraCock = 0;

  kehadiranList.forEach(k => {
    const dibayar = Number(k.nominal_dibayar) || 0;
    const tagihan = Number(k.total_tagihan) || 0;
    const extraCock = Number(k.jumlah_shuttlecock_tambahan) || 0;
    totalExtraCock += extraCock;

    const isLunas = (k.status_pembayaran === 'Lunas' || k.status_pembayaran === 'Tunai' || k.status_pembayaran === 'QRIS / Transfer');
    const isSponsor = (k.status_pembayaran === 'Sponsor / Free' || k.metode_pembayaran === 'Sponsor');

    if (isSponsor) {
      countSponsor++;
    } else if (isLunas) {
      if (k.metode_pembayaran === 'QRIS') {
        totalTF += dibayar;
        countTF++;
      } else {
        totalTunai += dibayar;
        countTunai++;
      }
    } else {
      totalBelum += (Number(k.sisa_tagihan) || tagihan);
      countBelum++;
    }
  });

  const totalBersihMasuk = totalTunai + totalTF;

  const filteredList = [...kehadiranList].sort((a, b) => a.nama_pemain.localeCompare(b.nama_pemain)).filter(k => {
    const isLunas = (k.status_pembayaran === 'Lunas' || k.status_pembayaran === 'Tunai' || k.status_pembayaran === 'QRIS / Transfer');
    const isSponsor = (k.status_pembayaran === 'Sponsor / Free' || k.metode_pembayaran === 'Sponsor');

    if (filterKas === 'sudah') return isLunas || isSponsor;
    if (filterKas === 'belum') return !(isLunas || isSponsor);
    if (filterKas === 'tunai') return isLunas && k.metode_pembayaran === 'Tunai';
    if (filterKas === 'tf') return isLunas && k.metode_pembayaran === 'QRIS';
    if (filterKas === 'sponsor') return isSponsor;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#B2DCE5] pb-3">
        <h2 className="text-xl font-black text-[#013A40] flex items-center gap-2 font-sporty uppercase italic">
          <span className="text-2xl text-[#F8B700]">💰</span>
          <span>Rekapitulasi Kas & Shuttlecock</span>
        </h2>
      </div>

      {/* SUMMARY KAS */}
      <div className="bg-white border-2 border-[#038C8C]/30 shape-cyber-card p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden">
        {/* Futuristic Ambient Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#B2DCE5]/25 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-b-2 border-dashed border-[#B2DCE5] pb-5 relative z-10">
          <div className="bg-[#F2F2F2] p-3.5 shape-cyber-card border border-[#B2DCE5]">
            <span className="text-[#038C8C] font-black text-xs uppercase tracking-wider block font-tech">💵 Kas Tunai</span>
            <span className="text-lg font-black text-[#013A40] mt-1 block">
              Rp {totalTunai.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#013A40]/70 font-bold">({countTunai} Orang)</span>
          </div>

          <div className="bg-[#F2F2F2] p-3.5 shape-cyber-card border border-[#B2DCE5]">
            <span className="text-[#013A40] font-black text-xs uppercase tracking-wider block font-tech">📱 QRIS / Transfer</span>
            <span className="text-lg font-black text-[#013A40] mt-1 block">
              Rp {totalTF.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#013A40]/70 font-bold">({countTF} Orang)</span>
          </div>

          <div className="bg-[#F2F2F2] p-3.5 shape-cyber-card border border-[#B2DCE5]">
            <span className="text-red-600 font-black text-xs uppercase tracking-wider block font-tech">⏳ Belum Bayar</span>
            <span className="text-lg font-black text-[#013A40] mt-1 block">
              Rp {totalBelum.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-[#013A40]/70 font-bold">({countBelum} Orang)</span>
          </div>
        </div>

        <div className="text-center font-black text-xl text-[#013A40] relative z-10 flex items-center justify-center gap-2">
          <span>💰</span>
          <span>Total Kas Bersih Masuk:</span>
          <span className="text-[#038C8C] bg-[#B2DCE5]/40 px-3 py-0.5 shape-cyber-pill border border-[#038C8C]/30">
            Rp {totalBersihMasuk.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex justify-around flex-wrap gap-2 text-xs font-bold text-[#013A40]/80 pt-3 border-t border-[#B2DCE5]/70 relative z-10">
          <span>Total Member: <b className="text-[#013A40]">{kehadiranList.length}</b></span>
          <span>Hadir Mabar: <b className="text-[#038C8C]">{kehadiranList.filter(k => k.status_hadir).length}</b></span>
          <span>Sudah Bayar: <b className="text-[#038C8C]">{countTunai + countTF}</b></span>
          <span>Sponsor/Free: <b className="text-[#F8B700]">{countSponsor}</b></span>
          <span>Shuttlecock Tambahan: <b className="text-[#013A40]">{totalExtraCock} Pcs</b></span>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-black text-[#013A40] uppercase tracking-wider font-tech">Filter Data:</span>
        <select
          value={filterKas}
          onChange={e => setFilterKas(e.target.value)}
          className="px-3.5 py-1.5 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card text-xs font-bold text-[#013A40] cursor-pointer shadow-2xs focus:outline-hidden"
        >
          <option value="semua">📋 Semua Anggota Sesi</option>
          <option value="sudah">🟢 Sudah Bayar (Lunas/Sponsor)</option>
          <option value="belum">🔴 Belum Bayar</option>
          <option value="tunai">💵 Pembayaran Tunai</option>
          <option value="tf">📱 Pembayaran QRIS / Transfer</option>
          <option value="sponsor">🤝 Free / Sponsor</option>
        </select>
      </div>

      {/* MEMBER LIST */}
      <div className="bg-white border-2 border-[#038C8C]/30 shape-cyber-card overflow-hidden shadow-xs divide-y divide-[#B2DCE5]/40">
        {filteredList.map(k => {
          const isLunas = (k.status_pembayaran === 'Lunas' || k.status_pembayaran === 'Tunai' || k.status_pembayaran === 'QRIS / Transfer');
          const isSponsor = (k.status_pembayaran === 'Sponsor / Free' || k.metode_pembayaran === 'Sponsor');
          const extraCock = Number(k.jumlah_shuttlecock_tambahan) || 0;
          const tagihan = Number(k.total_tagihan) || 0;

          const payIcon = isSponsor ? '🤝' : (k.metode_pembayaran === 'QRIS' ? '📱' : '💵');
          const labelBtn = isSponsor ? '🤝 SPONSOR' : (isLunas ? '✓ LUNAS' : '⏳ BELUM BAYAR');

          return (
            <div
              key={k.nama_pemain}
              className={`p-3.5 flex items-center justify-between flex-wrap gap-3 transition ${
                isLunas || isSponsor ? 'bg-[#B2DCE5]/10 hover:bg-[#B2DCE5]/20' : 'hover:bg-[#F2F2F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 shape-cyber-card flex items-center justify-center text-lg font-bold border transition ${
                    isLunas || isSponsor
                      ? 'bg-[#038C8C] text-white border-[#B2DCE5]/50 shadow-xs'
                      : 'bg-[#013A40] text-[#B2DCE5] border-[#038C8C]/40'
                  }`}
                >
                  {payIcon}
                </div>

                <div>
                  <div className="font-black text-sm text-[#013A40] flex items-center gap-1.5 uppercase tracking-wide">
                    {(isLunas || isSponsor) && (
                      <span className="w-4 h-4 shape-cyber-card bg-[#038C8C] text-white text-[10px] font-black flex items-center justify-center">
                        ✓
                      </span>
                    )}
                    <span>{k.nama_pemain}</span>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => onEditNominalPemain(k)}
                        className="text-[10px] font-black text-[#013A40] bg-[#F8B700] hover:bg-[#e0a500] px-2 py-0.5 rounded-md cursor-pointer ml-1 shadow-2xs transition"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-[#013A40]/70 mt-0.5 font-medium">
                    Tagihan: <b className="text-[#013A40] font-black">Rp {tagihan.toLocaleString('id-ID')}</b>
                    <span className="text-[11px] text-[#038C8C] font-semibold ml-1.5">
                      (Lap: Rp {(Number(k.biaya_lapangan_per_pemain) || 10000).toLocaleString('id-ID')} + Cock: Rp {(Number(k.total_biaya_shuttlecock) || 3000).toLocaleString('id-ID')})
                    </span>
                  </div>

                  {/* DETAIL SHUTTLECOCK DARI MATCH_ID */}
                  {(() => {
                    const matchCharges = pertandinganList.filter(m => {
                      if (!m.jumlah_shuttlecock_tambahan || m.jumlah_shuttlecock_tambahan <= 0) return false;
                      if (m.detail_pemain_cock) {
                        return m.detail_pemain_cock.split(',').map(s => s.trim().toUpperCase()).includes(k.nama_pemain.toUpperCase());
                      }
                      const players = [m.tim_a_pemain_1, m.tim_a_pemain_2, m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean) as string[];
                      return players.includes(k.nama_pemain);
                    });

                    if (matchCharges.length === 0) return null;

                    return (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-black text-[#038C8C] uppercase font-tech">
                          🏸 Dari Match:
                        </span>
                        {matchCharges.map(mc => (
                          <span
                            key={mc.match_id}
                            className="bg-[#B2DCE5]/40 text-[#013A40] text-[10px] px-2 py-0.5 shape-cyber-pill font-bold border border-[#038C8C]/30"
                            title={`Match ${mc.match_id} (Lap ${mc.lapangan}, ${mc.durasi_menit})`}
                          >
                            Lap {mc.lapangan}: +{mc.jumlah_shuttlecock_tambahan} Cock
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Shuttlecock Tambahan */}
                {userRole === 'admin' && (
                  <div className="flex items-center gap-1 bg-[#F2F2F2] border border-[#B2DCE5] shape-cyber-card px-2 py-1" title="Shuttlecock Tambahan">
                    <span className="text-[10px] font-black text-[#013A40]">Cock +</span>
                    <button
                      onClick={() => onUbahShuttlecockTambahan(k.nama_pemain, -1)}
                      className="w-5 h-5 bg-white hover:bg-[#B2DCE5]/50 text-[#013A40] border border-[#B2DCE5] rounded-xs font-black text-xs flex items-center justify-center cursor-pointer transition"
                    >
                      -
                    </button>
                    <b className="text-xs px-1 min-w-4 text-center font-black text-[#013A40]">{extraCock}</b>
                    <button
                      onClick={() => onUbahShuttlecockTambahan(k.nama_pemain, 1)}
                      className="w-5 h-5 bg-white hover:bg-[#B2DCE5]/50 text-[#013A40] border border-[#B2DCE5] rounded-xs font-black text-xs flex items-center justify-center cursor-pointer transition"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Metode Bayar */}
                {userRole === 'admin' ? (
                  <select
                    value={k.metode_pembayaran}
                    onChange={e => onGantiMetode(k.nama_pemain, e.target.value as any)}
                    className="p-1.5 bg-white border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card text-xs font-bold text-[#013A40] cursor-pointer focus:outline-hidden"
                  >
                    <option value="Tunai">💵 Tunai</option>
                    <option value="QRIS">📱 QRIS/TF</option>
                    <option value="Sponsor">🤝 Sponsor</option>
                  </select>
                ) : (
                  <span className="text-xs font-bold text-[#013A40] bg-[#B2DCE5]/30 border border-[#038C8C]/30 px-2 py-1 shape-cyber-card">
                    {k.metode_pembayaran}
                  </span>
                )}

                {/* Status Bayar Toggle */}
                {userRole === 'admin' ? (
                  <button
                    onClick={() => onToggleStatusBayar(k.nama_pemain)}
                    className={`py-1.5 px-3 shape-cyber-card text-xs font-black min-w-28 text-center cursor-pointer transition ${
                      isLunas || isSponsor
                        ? 'bg-[#038C8C] hover:bg-[#013A40] text-white border border-[#B2DCE5]/40 shadow-xs'
                        : 'bg-[#F2F2F2] hover:bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {labelBtn}
                  </button>
                ) : (
                  <span
                    className={`py-1 px-3 shape-cyber-card text-xs font-black ${
                      isLunas || isSponsor ? 'bg-[#038C8C]/20 text-[#038C8C] border border-[#038C8C]/30' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {labelBtn}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TABEL RINCIAN SHUTTLECOCK TAMBAHAN PER MATCH_ID           */}
      {/* Terintegrasi langsung ke pembayaran tiap pemain           */}
      {/* ========================================================= */}
      <div className="bg-white border-2 border-[#038C8C]/30 shape-cyber-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#B2DCE5] pb-3">
          <div>
            <h3 className="text-base font-black text-[#013A40] flex items-center gap-2 font-tech">
              <span className="text-lg text-[#F8B700]">🏸</span>
              <span>TABEL RINCIAN SHUTTLECOCK TAMBAHAN PER MATCH ID</span>
            </h3>
            <p className="text-xs text-[#013A40]/70 mt-0.5">
              Tabel data shuttlecock tambahan yang dicatat per partai pertandingan (match_id) dan otomatis membebankan tagihan ke pembayaran pemain.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="🔍 Cari Match ID / Pemain..."
              value={searchCockMatch}
              onChange={e => setSearchCockMatch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-[#B2DCE5] focus:border-[#038C8C] shape-cyber-card focus:outline-hidden bg-[#F2F2F2] text-[#013A40] font-bold"
            />
            <span className="bg-[#F8B700] text-[#013A40] font-black text-xs px-3 py-1 shape-cyber-pill shadow-2xs">
              🏸 Total: {totalExtraCock} Cock
            </span>
          </div>
        </div>

        {(() => {
          const matchesWithCock = pertandinganList.filter(m => Number(m.jumlah_shuttlecock_tambahan) > 0);
          const filteredMatches = matchesWithCock.filter(m => {
            if (!searchCockMatch.trim()) return true;
            const q = searchCockMatch.toLowerCase();
            const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean).join(' ').toLowerCase();
            const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean).join(' ').toLowerCase();
            const detail = (m.detail_pemain_cock || '').toLowerCase();
            const mid = m.match_id.toLowerCase();
            return mid.includes(q) || pA.includes(q) || pB.includes(q) || detail.includes(q) || `lapangan ${m.lapangan}`.includes(q);
          });

          if (matchesWithCock.length === 0) {
            return (
              <div className="p-6 bg-[#F2F2F2] border-2 border-dashed border-[#B2DCE5] shape-cyber-card text-center space-y-1">
                <span className="text-2xl block text-[#F8B700]">🏸</span>
                <p className="text-xs font-black text-[#013A40]">Belum Ada Shuttlecock Tambahan Pada Match Hari Ini</p>
                <p className="text-[11px] text-[#013A40]/70">
                  Saat pertandingan berlangsung di menu <b>Klasemen & Match</b>, admin dapat menambahkan shuttlecock tambahan pada papan skor atau mengedit riwayat pertandingan. Biaya akan otomatis terintegrasi ke tagihan pemain di sini.
                </p>
              </div>
            );
          }

          if (filteredMatches.length === 0) {
            return (
              <div className="p-4 bg-[#F2F2F2] border border-[#B2DCE5] shape-cyber-card text-center text-xs text-[#013A40]/70 font-bold">
                Tidak ada match shuttlecock yang cocok dengan pencarian "{searchCockMatch}".
              </div>
            );
          }

          let sumCockPcs = 0;
          let sumRupiah = 0;

          return (
            <div className="overflow-x-auto border-2 border-[#038C8C]/30 shape-cyber-card">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#013A40] text-[#F2F2F2] font-black uppercase text-[10px] border-b border-[#038C8C]/50 font-tech tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Match ID</th>
                    <th className="py-2.5 px-3 w-20 text-center">Lap</th>
                    <th className="py-2.5 px-3 min-w-44">Partai Pertandingan</th>
                    <th className="py-2.5 px-3 w-24 text-center">Cock Match</th>
                    <th className="py-2.5 px-3 min-w-52">Pemain yang Dibebankan</th>
                    <th className="py-2.5 px-3 w-28 text-right">Tarif / Cock</th>
                    <th className="py-2.5 px-3 w-28 text-right text-[#F8B700]">Subtotal</th>
                    {userRole === 'admin' && onOpenEditMatch && <th className="py-2.5 px-3 w-16 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B2DCE5]/40 font-medium">
                  {filteredMatches.map((m, idx) => {
                    const timA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean).join(' / ');
                    const timB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean).join(' / ');
                    const cockQty = Number(m.jumlah_shuttlecock_tambahan) || 0;
                    sumCockPcs += cockQty;

                    // Daftar pemain yang dibebankan
                    let chargedList: string[] = [];
                    if (m.detail_pemain_cock) {
                      chargedList = m.detail_pemain_cock.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                      chargedList = [m.tim_a_pemain_1, m.tim_a_pemain_2, m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean) as string[];
                    }

                    // Ambil tarif dari pemain atau default 3000
                    const firstPlayer = kehadiranList.find(k => k.nama_pemain.toUpperCase() === (chargedList[0] || '').toUpperCase());
                    const tarifCock = Number(firstPlayer?.biaya_shuttlecock_tambahan) || 3000;
                    const subtotalMatch = cockQty * tarifCock * (chargedList.length > 0 ? 1 : 1);
                    sumRupiah += subtotalMatch;

                    return (
                      <tr key={m.match_id} className="hover:bg-[#B2DCE5]/15 transition">
                        <td className="py-3 px-3 text-center font-bold text-[#013A40]/70">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-black text-[#038C8C] bg-[#B2DCE5]/30 px-2 py-0.5 rounded border border-[#038C8C]/30 text-[11px] block">
                            {m.match_id}
                          </span>
                          <span className="text-[10px] text-[#013A40]/50 mt-0.5 block">
                            ⏱️ {m.durasi_menit || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-black text-[#013A40] bg-[#F2F2F2] border border-[#B2DCE5] px-2 py-0.5 rounded-full text-[11px]">
                            Lap {m.lapangan}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#013A40]">
                          <div className="font-bold flex items-center gap-1.5 flex-wrap">
                            <span>{timA}</span>
                            <span className="text-[10px] bg-[#013A40] text-[#F8B700] px-1.5 py-0.5 rounded-sm font-black">
                              {m.skor_tim_a} : {m.skor_tim_b}
                            </span>
                            <span>{timB}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-[#038C8C] text-white font-black px-2.5 py-1 rounded-full border border-[#B2DCE5]/50 text-xs inline-flex items-center gap-1 shadow-2xs">
                            🏸 +{cockQty}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {chargedList.map(pName => {
                              const pData = kehadiranList.find(k => k.nama_pemain.toUpperCase() === pName.toUpperCase());
                              const isPaid = pData && (pData.status_pembayaran === 'Lunas' || pData.status_pembayaran === 'Tunai' || pData.status_pembayaran === 'QRIS / Transfer');
                              const isSponsor = pData && (pData.status_pembayaran === 'Sponsor / Free' || pData.metode_pembayaran === 'Sponsor');

                              let badgeColor = 'bg-red-50 text-red-700 border-red-200';
                              let statusIcon = '⏳ Belum Bayar';
                              if (isSponsor) {
                                badgeColor = 'bg-[#013A40] text-[#F8B700] border-[#038C8C]/40';
                                statusIcon = '🤝 Sponsor';
                              } else if (isPaid) {
                                badgeColor = 'bg-[#038C8C]/20 text-[#038C8C] border-[#038C8C]/40';
                                statusIcon = '✓ Lunas';
                              }

                              return (
                                <span
                                  key={pName}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}
                                  title={`${pName}: Status Tagihan ${statusIcon}`}
                                >
                                  <span>{pName}</span>
                                  <span className="text-[9px] opacity-80">({statusIcon})</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-[#013A40]/80 font-bold">
                          Rp {tarifCock.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-[#038C8C]">
                          Rp {(cockQty * tarifCock).toLocaleString('id-ID')}
                        </td>
                        {userRole === 'admin' && onOpenEditMatch && (
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onOpenEditMatch(m)}
                              className="px-2 py-1 bg-[#F8B700] hover:bg-[#e0a500] text-[#013A40] rounded-md text-[10px] font-black cursor-pointer shadow-2xs transition"
                              title="Edit Pertandingan & Cock Tambahan"
                            >
                              ✏️ Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F2F2F2] font-black text-[#013A40] border-t-2 border-[#B2DCE5]">
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[10px] font-tech">
                      Total Rangkuman Shuttlecock Match:
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#038C8C] text-xs font-black">
                      +{sumCockPcs} Cock
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-[10px] text-[#013A40]/70 font-tech">
                      Total Nominal Cock Tambahan:
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#038C8C] text-xs font-black">
                      Rp {sumRupiah.toLocaleString('id-ID')}
                    </td>
                    {userRole === 'admin' && onOpenEditMatch && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
