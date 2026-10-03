/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  UserRole,
  SyncStatusType,
  SesiMabar,
  KehadiranPembayaran,
  Pertandingan,
  KlasemenKumulatif,
  ArsipSesiHarian,
  MadingPost,
  GradingPemain,
  GradingConfig,
  CourtState
} from './types';

import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { RegistrationView } from './components/RegistrationView';
import { MatchView } from './components/MatchView';
import { PaymentKasView } from './components/PaymentKasView';
import { CumulativeView } from './components/CumulativeView';
import { MadingView } from './components/MadingView';
import { GradingView } from './components/GradingView';
import { PosterExportModal } from './components/PosterExportModal';
import { ExportExcelModal } from './components/ExportExcelModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import {
  SelesaiModal,
  ResetModal,
  EditMatchModal,
  EditPemainModal
} from './components/SessionModals';
import { FloatingCompass } from './components/FloatingCompass';
import { MobileBottomNav } from './components/MobileBottomNav';

const DEFAULT_GRADING_CONFIGS: GradingConfig[] = [
  { nama: "🔥 PRO / ADVANCED", min: 8.5, max: 10.0 },
  { nama: "⚡ INTERMEDIATE A", min: 7.0, max: 8.4 },
  { nama: "🏸 INTERMEDIATE B", min: 5.5, max: 6.9 },
  { nama: "🌱 BEGINNER", min: 4.0, max: 5.4 },
  { nama: "⚪ NEWBIE", min: 0.0, max: 3.9 }
];

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('lobSerangRole') as UserRole) || null;
  });

  const [activeTab, setActiveTab] = useState<string>('page-input');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('connected');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSelesaiModalOpen, setIsSelesaiModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Pertandingan | null>(null);
  const [editingPemain, setEditingPemain] = useState<KehadiranPembayaran | null>(null);

  // Application Data States
  const [currentSession, setCurrentSession] = useState<SesiMabar>({
    sesi_id: 'SESI-' + new Date().toISOString().slice(0, 10),
    tanggal_sesi: new Date().toISOString().slice(0, 10),
    judul_sesi: 'Mabar Badminton LOB SERANG',
    jumlah_lapangan: 2,
    biaya_lapangan_per_pemain: 10000,
    biaya_shuttlecock_per_pemain: 3000,
    biaya_total_default_per_pemain: 13000,
    status_sesi: 'AKTIF',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [tarifCockExtra, setTarifCockExtra] = useState<number>(3000);
  const [kehadiranList, setKehadiranList] = useState<KehadiranPembayaran[]>([]);
  const [pertandinganList, setPertandinganList] = useState<Pertandingan[]>([]);
  const [kumulatifList, setKumulatifList] = useState<KlasemenKumulatif[]>([]);
  const [arsipSesiList, setArsipSesiList] = useState<ArsipSesiHarian[]>([]);
  const [madingList, setMadingList] = useState<MadingPost[]>([]);
  const [gradingList, setGradingList] = useState<GradingPemain[]>([]);
  const [configGrading, setConfigGrading] = useState<GradingConfig[]>(DEFAULT_GRADING_CONFIGS);

  const [jumlahLapangan, setJumlahLapangan] = useState(2);
  const [courtStates, setCourtStates] = useState<Record<number, CourtState>>({});

  // Timer Ref for Live Game Timers
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Seed / Load Data from localStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('lob_serang_db_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentSession) setCurrentSession(parsed.currentSession);
        if (parsed.kehadiranList) setKehadiranList(parsed.kehadiranList);
        if (parsed.pertandinganList) setPertandinganList(parsed.pertandinganList);
        if (parsed.kumulatifList) setKumulatifList(parsed.kumulatifList);
        if (parsed.arsipSesiList) setArsipSesiList(parsed.arsipSesiList);
        if (parsed.madingList) setMadingList(parsed.madingList);
        if (parsed.gradingList) setGradingList(parsed.gradingList);
        if (parsed.configGrading) setConfigGrading(parsed.configGrading);
        if (parsed.jumlahLapangan) setJumlahLapangan(parsed.jumlahLapangan);
        if (parsed.courtStates) setCourtStates(parsed.courtStates);
        if (parsed.tarifCockExtra) setTarifCockExtra(parsed.tarifCockExtra);
        return;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }

    // Default Seed Data
    const seedMembers = [
      'BUDI SANTOSO', 'ANDI WIJAYA', 'CITRA LESTARI', 'EKO PRASETYO',
      'HENDRA KURNIA', 'DENI IRAWAN', 'FAJAR ALFIAN', 'GITA GUTAMA'
    ];

    const initialKehadiran: KehadiranPembayaran[] = seedMembers.map((nama, idx) => {
      const bLap = 10000;
      const bCock = 3000;
      const extra = idx % 3 === 0 ? 1 : 0;
      const subExtra = extra * 3000;
      const totCock = bCock + subExtra;
      const total = bLap + totCock;
      const isPaid = idx < 5;

      return {
        kehadiran_id: 'KHD-' + idx,
        sesi_id: currentSession.sesi_id,
        member_id: 'MEM-' + idx,
        nama_pemain: nama,
        status_hadir: idx < 6,
        jam_kedatangan: idx < 6 ? `19:${(10 + idx * 5).toString().padStart(2, '0')}` : '',
        status_pembayaran: isPaid ? (idx % 2 === 0 ? 'Tunai' : 'QRIS / Transfer') : 'Belum Bayar',
        metode_pembayaran: idx % 2 === 0 ? 'Tunai' : 'QRIS',
        biaya_lapangan_per_pemain: bLap,
        biaya_shuttlecock_per_pemain: bCock,
        jumlah_shuttlecock_tambahan: extra,
        biaya_shuttlecock_tambahan: 3000,
        subtotal_shuttlecock_tambahan: subExtra,
        total_biaya_shuttlecock: totCock,
        total_tagihan: total,
        nominal_dibayar: isPaid ? total : 0,
        sisa_tagihan: isPaid ? 0 : total,
        updated_at: new Date().toISOString()
      };
    });

    const initialGrading: GradingPemain[] = seedMembers.map((nama, idx) => ({
      grading_id: 'GRD-' + idx,
      member_id: 'MEM-' + idx,
      nama_pemain: nama,
      nilai_grading: [7.2, 6.8, 5.5, 8.0, 6.2, 5.0, 8.8, 4.8][idx] || 5.5,
      main_match: 12 + idx * 3,
      kategori: '⚡ INTERMEDIATE A',
      updated_at: new Date().toISOString()
    }));

    const initialMading: MadingPost[] = [
      {
        mading_id: 'MD-1',
        type: 'crew',
        title: 'Koordinator Mabar',
        nama: 'Budi Santoso',
        content: 'Penanggung Jawab Lapangan & Kas',
        hp: '0812-8888-9999',
        style_class: 'pin-crew',
        font_size: 14,
        is_minimized: false,
        x: 40,
        y: 30,
        w: 230,
        h: 160,
        tanggal_publish: new Date().toISOString().slice(0, 10),
        status_publish: 'ACTIVE',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        mading_id: 'MD-2',
        type: 'post',
        title: 'Info Jadwal & Kas Mabar',
        content: 'Mabar TaheSquat diadakan rutin tiap Selasa & Jumat pukul 19.30 WIB.\n\nBiaya Rp 13.000 (Lap 10rb + Cock 3rb). Shuttlecock tambahan dihitung Rp 3.000 / pcs.',
        style_class: 'pin-yellow',
        font_size: 13,
        is_minimized: false,
        x: 310,
        y: 30,
        w: 260,
        h: 180,
        tanggal_publish: new Date().toISOString().slice(0, 10),
        status_publish: 'ACTIVE',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setKehadiranList(initialKehadiran);
    setGradingList(initialGrading);
    setMadingList(initialMading);
  }, []);

  // Save State to localStorage on change
  useEffect(() => {
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      const dataToSave = {
        currentSession,
        kehadiranList,
        pertandinganList,
        kumulatifList,
        arsipSesiList,
        madingList,
        gradingList,
        configGrading,
        jumlahLapangan,
        courtStates,
        tarifCockExtra
      };
      localStorage.setItem('lob_serang_db_v2', JSON.stringify(dataToSave));
      setSyncStatus('connected');
    }, 400);

    return () => clearTimeout(timer);
  }, [
    currentSession,
    kehadiranList,
    pertandinganList,
    kumulatifList,
    arsipSesiList,
    madingList,
    gradingList,
    configGrading,
    jumlahLapangan,
    courtStates,
    tarifCockExtra
  ]);

  // Live timer tick for active courts
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setCourtStates(prev => {
        let changed = false;
        const copy = { ...prev };
        for (let i = 1; i <= jumlahLapangan; i++) {
          if (copy[i] && copy[i].berjalan) {
            changed = true;
          }
        }
        return changed ? { ...copy } : prev;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [jumlahLapangan]);

  // Handle Tab Switch
  const handleSelectTab = (tab: string) => {
    if (userRole === 'member' && (tab === 'page-input' || tab === 'page-rekap' || tab === 'page-grading')) {
      setActiveTab('page-match');
      return;
    }
    setActiveTab(tab);
  };

  // Auth Handlers
  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('lobSerangRole', role);
    if (role === 'member') {
      setActiveTab('page-match');
    } else {
      setActiveTab('page-input');
    }
    showToast(`Masuk sebagai ${role === 'admin' ? 'Administrator 🔑' : 'Member 👁️'}`);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('lobSerangRole');
  };

  // ==========================================
  // BUSINESS LOGIC: REGISTRASI & BIAYA
  // ==========================================
  const handleUpdateBiayaSesi = (lap: number, cock: number, extra: number) => {
    setCurrentSession(prev => ({
      ...prev,
      biaya_lapangan_per_pemain: lap,
      biaya_shuttlecock_per_pemain: cock,
      biaya_total_default_per_pemain: lap + cock
    }));
    setTarifCockExtra(extra);
    showToast('Biaya sesi dan tarif shuttlecock diperbarui! 🏸');
  };

  const handleRegisterPlayers = (names: string[]) => {
    let addedCount = 0;
    const newKehadiran = [...kehadiranList];
    const newGrading = [...gradingList];
    const bLap = currentSession.biaya_lapangan_per_pemain || 10000;
    const bCock = currentSession.biaya_shuttlecock_per_pemain || 3000;
    const totAwal = bLap + bCock;

    names.forEach(cleanName => {
      if (newKehadiran.some(k => k.nama_pemain === cleanName)) {
        return;
      }

      addedCount++;
      newKehadiran.push({
        kehadiran_id: 'KHD-' + Date.now() + Math.random().toString(36).substring(2, 6),
        sesi_id: currentSession.sesi_id,
        member_id: 'MEM-' + Date.now(),
        nama_pemain: cleanName,
        status_hadir: false,
        jam_kedatangan: '',
        status_pembayaran: 'Belum Bayar',
        metode_pembayaran: 'Tunai',
        biaya_lapangan_per_pemain: bLap,
        biaya_shuttlecock_per_pemain: bCock,
        jumlah_shuttlecock_tambahan: 0,
        biaya_shuttlecock_tambahan: tarifCockExtra,
        subtotal_shuttlecock_tambahan: 0,
        total_biaya_shuttlecock: bCock,
        total_tagihan: totAwal,
        nominal_dibayar: 0,
        sisa_tagihan: totAwal,
        updated_at: new Date().toISOString()
      });

      if (!newGrading.some(g => g.nama_pemain === cleanName)) {
        newGrading.push({
          grading_id: 'GRD-' + Date.now(),
          member_id: 'MEM-' + Date.now(),
          nama_pemain: cleanName,
          nilai_grading: 5.0,
          main_match: 0,
          kategori: '🌱 BEGINNER',
          updated_at: new Date().toISOString()
        });
      }
    });

    setKehadiranList(newKehadiran);
    setGradingList(newGrading);
    showToast(`Sukses: ${addedCount} pemain ditambahkan ke sesi! 📝`);
  };

  // ==========================================
  // BUSINESS LOGIC: ABSENSI & KAS
  // ==========================================
  const handleToggleAbsensi = (name: string) => {
    setKehadiranList(prev =>
      prev.map(k => {
        if (k.nama_pemain === name) {
          const newStatus = !k.status_hadir;
          const now = new Date();
          const jam = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          return {
            ...k,
            status_hadir: newStatus,
            jam_kedatangan: newStatus ? jam : ''
          };
        }
        return k;
      })
    );
  };

  const handleHapusPemainSesi = (name: string) => {
    setKehadiranList(prev => prev.filter(k => k.nama_pemain !== name));
    showToast(`${name} dihapus dari sesi hari ini.`);
  };

  const handleUbahShuttlecockTambahan = (name: string, delta: number) => {
    setKehadiranList(prev =>
      prev.map(k => {
        if (k.nama_pemain === name) {
          const currQty = Number(k.jumlah_shuttlecock_tambahan) || 0;
          const newQty = Math.max(0, currQty + delta);
          const bLap = Number(k.biaya_lapangan_per_pemain) || 10000;
          const bCock = Number(k.biaya_shuttlecock_per_pemain) || 3000;
          const tarif = Number(k.biaya_shuttlecock_tambahan) || 3000;

          const subExtra = newQty * tarif;
          const totCock = bCock + subExtra;
          const totalTagihan = k.metode_pembayaran === 'Sponsor' ? 0 : (bLap + totCock);

          const isPaid = (k.status_pembayaran === 'Lunas' || k.status_pembayaran === 'Tunai' || k.status_pembayaran === 'QRIS / Transfer');
          const dibayar = isPaid ? totalTagihan : (Number(k.nominal_dibayar) || 0);
          const sisa = Math.max(0, totalTagihan - dibayar);

          return {
            ...k,
            jumlah_shuttlecock_tambahan: newQty,
            subtotal_shuttlecock_tambahan: subExtra,
            total_biaya_shuttlecock: totCock,
            total_tagihan: totalTagihan,
            nominal_dibayar: dibayar,
            sisa_tagihan: sisa
          };
        }
        return k;
      })
    );
  };

  const handleToggleStatusBayar = (name: string) => {
    setKehadiranList(prev =>
      prev.map(k => {
        if (k.nama_pemain === name) {
          if (k.status_pembayaran === 'Belum Bayar') {
            const status = k.metode_pembayaran === 'QRIS' ? 'QRIS / Transfer' : 'Lunas';
            return {
              ...k,
              status_pembayaran: status,
              nominal_dibayar: k.total_tagihan,
              sisa_tagihan: 0
            };
          } else {
            return {
              ...k,
              status_pembayaran: 'Belum Bayar',
              nominal_dibayar: 0,
              sisa_tagihan: k.total_tagihan
            };
          }
        }
        return k;
      })
    );
  };

  const handleGantiMetode = (name: string, metode: 'Tunai' | 'QRIS' | 'Sponsor') => {
    setKehadiranList(prev =>
      prev.map(k => {
        if (k.nama_pemain === name) {
          if (metode === 'Sponsor') {
            return {
              ...k,
              metode_pembayaran: metode,
              status_pembayaran: 'Sponsor / Free',
              total_tagihan: 0,
              nominal_dibayar: 0,
              sisa_tagihan: 0
            };
          } else {
            const bLap = Number(k.biaya_lapangan_per_pemain) || 10000;
            const totTagihan = bLap + (Number(k.total_biaya_shuttlecock) || 3000);
            const isPaid = (k.status_pembayaran !== 'Belum Bayar');
            return {
              ...k,
              metode_pembayaran: metode,
              status_pembayaran: isPaid ? (metode === 'QRIS' ? 'QRIS / Transfer' : 'Lunas') : 'Belum Bayar',
              total_tagihan: totTagihan,
              nominal_dibayar: isPaid ? totTagihan : 0,
              sisa_tagihan: isPaid ? 0 : totTagihan
            };
          }
        }
        return k;
      })
    );
  };

  const handleSaveEditPemain = (namaBaru: string, bLap: number, bCock: number) => {
    if (!editingPemain) return;
    setKehadiranList(prev =>
      prev.map(k => {
        if (k.nama_pemain === editingPemain.nama_pemain) {
          const subExtra = (Number(k.jumlah_shuttlecock_tambahan) || 0) * (Number(k.biaya_shuttlecock_tambahan) || 3000);
          const totCock = bCock + subExtra;
          const totTagihan = k.metode_pembayaran === 'Sponsor' ? 0 : (bLap + totCock);
          return {
            ...k,
            nama_pemain: namaBaru,
            biaya_lapangan_per_pemain: bLap,
            biaya_shuttlecock_per_pemain: bCock,
            total_biaya_shuttlecock: totCock,
            total_tagihan: totTagihan,
            sisa_tagihan: Math.max(0, totTagihan - (Number(k.nominal_dibayar) || 0))
          };
        }
        return k;
      })
    );
    showToast(`Biaya ${namaBaru} diperbarui!`);
  };

  // ==========================================
  // BUSINESS LOGIC: PAPAN SKOR & MATCH
  // ==========================================
  const handleUpdateCourtSlot = (courtNum: number, slot: 'ta1' | 'ta2' | 'tb1' | 'tb2', val: string) => {
    setCourtStates(prev => ({
      ...prev,
      [courtNum]: {
        ...(prev[courtNum] || {
          ta1: '', ta2: '', tb1: '', tb2: '', skorA: 0, skorB: 0,
          berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
        }),
        [slot]: val
      }
    }));
  };

  const handleUpdateCourtScore = (courtNum: number, field: 'skorA' | 'skorB', val: number) => {
    setCourtStates(prev => ({
      ...prev,
      [courtNum]: {
        ...(prev[courtNum] || {
          ta1: '', ta2: '', tb1: '', tb2: '', skorA: 0, skorB: 0,
          berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
        }),
        [field]: val
      }
    }));
  };

  const handleUpdateCourtCock = (courtNum: number, count: number) => {
    setCourtStates(prev => {
      const curr = prev[courtNum] || {
        ta1: '', ta2: '', tb1: '', tb2: '', skorA: 0, skorB: 0,
        berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
      };
      const activePlayers = [curr.ta1, curr.ta2, curr.tb1, curr.tb2].filter(Boolean);
      return {
        ...prev,
        [courtNum]: {
          ...curr,
          cockTambahan: count,
          bebanCock: curr.bebanCock && curr.bebanCock.length > 0 ? curr.bebanCock : activePlayers
        }
      };
    });
  };

  const handleToggleBebanCock = (courtNum: number, playerName: string) => {
    setCourtStates(prev => {
      const curr = prev[courtNum];
      if (!curr) return prev;
      const currentList = curr.bebanCock || [];
      const updated = currentList.includes(playerName)
        ? currentList.filter(p => p !== playerName)
        : [...currentList, playerName];
      return {
        ...prev,
        [courtNum]: { ...curr, bebanCock: updated }
      };
    });
  };

  const handleToggleAllBebanCock = (courtNum: number, players: string[]) => {
    setCourtStates(prev => {
      const curr = prev[courtNum];
      if (!curr) return prev;
      return {
        ...prev,
        [courtNum]: { ...curr, bebanCock: players }
      };
    });
  };

  // Helper untuk menyinkronkan jumlah shuttlecock tambahan tiap pemain dari seluruh match_id
  const syncPlayerShuttlecockFromMatches = (matches: Pertandingan[], currentKehadiran: KehadiranPembayaran[]) => {
    const playerCockCountMap: Record<string, number> = {};

    matches.forEach(m => {
      const qty = Number(m.jumlah_shuttlecock_tambahan) || 0;
      if (qty <= 0) return;

      let chargedPlayers: string[] = [];
      if (m.detail_pemain_cock) {
        chargedPlayers = m.detail_pemain_cock.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      } else {
        chargedPlayers = [m.tim_a_pemain_1, m.tim_a_pemain_2, m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean) as string[];
      }

      chargedPlayers.forEach(pName => {
        playerCockCountMap[pName] = (playerCockCountMap[pName] || 0) + qty;
      });
    });

    return currentKehadiran.map(k => {
      const extraCock = playerCockCountMap[k.nama_pemain.toUpperCase()] || 0;
      const bLap = Number(k.biaya_lapangan_per_pemain) || 10000;
      const bCock = Number(k.biaya_shuttlecock_per_pemain) || 3000;
      const tarif = Number(k.biaya_shuttlecock_tambahan) || tarifCockExtra;

      const subExtra = extraCock * tarif;
      const totCock = bCock + subExtra;
      const totalTagihan = k.metode_pembayaran === 'Sponsor' ? 0 : (bLap + totCock);

      const isPaid = (k.status_pembayaran === 'Lunas' || k.status_pembayaran === 'Tunai' || k.status_pembayaran === 'QRIS / Transfer');
      const dibayar = isPaid ? totalTagihan : (Number(k.nominal_dibayar) || 0);
      const sisa = Math.max(0, totalTagihan - dibayar);

      return {
        ...k,
        jumlah_shuttlecock_tambahan: extraCock,
        subtotal_shuttlecock_tambahan: subExtra,
        total_biaya_shuttlecock: totCock,
        total_tagihan: totalTagihan,
        nominal_dibayar: dibayar,
        sisa_tagihan: sisa
      };
    });
  };

  const handleMulaiMatchTimer = (courtNum: number) => {
    const s = courtStates[courtNum];
    if (s && s.berjalan) {
      setCourtStates(prev => ({
        ...prev,
        [courtNum]: { ...prev[courtNum], berjalan: false, startTime: 0, accumulatedTime: 0 }
      }));
      showToast('Match dibatalkan ⏹️');
      return;
    }

    if (!s || !s.ta1 || !s.tb1) {
      showToast('Pilih minimal 1 pemain untuk Tim A dan Tim B!');
      return;
    }

    setCourtStates(prev => ({
      ...prev,
      [courtNum]: {
        ...(prev[courtNum] || {
          ta1: '', ta2: '', tb1: '', tb2: '', skorA: 0, skorB: 0,
          berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
        }),
        berjalan: true,
        startTime: Date.now()
      }
    }));
    showToast(`Match Lapangan ${courtNum} dimulai! ⏱️`);
  };

  const handleSelesaiMatch = (courtNum: number) => {
    const s = courtStates[courtNum];
    if (!s || !s.berjalan) return;

    let sec = Number(s.accumulatedTime) || 0;
    if (s.berjalan && s.startTime) {
      sec += Math.floor((Date.now() - s.startTime) / 1000);
    }
    const durStr = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

    const playersInMatch = [s.ta1, s.ta2, s.tb1, s.tb2].filter(Boolean);
    const chargedPlayers = (s.bebanCock && s.bebanCock.length > 0) ? s.bebanCock : playersInMatch;

    const newMatch: Pertandingan = {
      match_id: 'MTH-' + Date.now(),
      sesi_id: currentSession.sesi_id,
      tanggal_pertandingan: new Date().toISOString().slice(0, 10),
      lapangan: courtNum,
      tim_a_pemain_1: s.ta1,
      tim_a_pemain_2: s.ta2 || undefined,
      tim_b_pemain_1: s.tb1,
      tim_b_pemain_2: s.tb2 || undefined,
      skor_tim_a: s.skorA,
      skor_tim_b: s.skorB,
      pemenang: s.skorA > s.skorB ? 'A' : (s.skorB > s.skorA ? 'B' : 'SERI'),
      durasi_menit: durStr,
      jumlah_shuttlecock_tambahan: s.cockTambahan || 0,
      detail_pemain_cock: (s.cockTambahan || 0) > 0 ? chargedPlayers.join(', ') : '',
      status_pertandingan: 'SELESAI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedMatches = [newMatch, ...pertandinganList];
    setPertandinganList(updatedMatches);

    // Sinkronkan shuttlecock tambahan ke pembayaran tiap pemain secara otomatis
    setKehadiranList(prev => syncPlayerShuttlecockFromMatches(updatedMatches, prev));

    // Reset Lapangan
    setCourtStates(prev => ({
      ...prev,
      [courtNum]: {
        ta1: '', ta2: '', tb1: '', tb2: '', skorA: 0, skorB: 0,
        cockTambahan: 0, bebanCock: [],
        berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
      }
    }));

    showToast(`Match Lapangan ${courtNum} selesai! Shuttlecock tambahan terintegrasi ke pembayaran 🏸`);
  };

  const handleAutoDraft = (courtNum: number) => {
    const hadir = kehadiranList.filter(k => k.status_hadir);
    const playing: string[] = [];
    for (let j = 1; j <= jumlahLapangan; j++) {
      if (j === courtNum) continue;
      const st = courtStates[j];
      if (st) {
        if (st.ta1) playing.push(st.ta1);
        if (st.ta2) playing.push(st.ta2);
        if (st.tb1) playing.push(st.tb1);
        if (st.tb2) playing.push(st.tb2);
      }
    }

    const available = hadir.filter(k => !playing.includes(k.nama_pemain));
    if (available.length < 4) {
      showToast('Minimal butuh 4 pemain hadir yang sedang tidak bermain!');
      return;
    }

    available.sort(() => Math.random() - 0.5);
    const p = available.slice(0, 4);

    setCourtStates(prev => ({
      ...prev,
      [courtNum]: {
        ...(prev[courtNum] || {
          ta1: '', ta2: '', tb1: '', tb2: '', skorA: 0, skorB: 0,
          berjalan: false, startTime: 0, accumulatedTime: 0, blowoutResolved: false
        }),
        ta1: p[0].nama_pemain,
        ta2: p[1].nama_pemain,
        tb1: p[2].nama_pemain,
        tb2: p[3].nama_pemain,
        skorA: 0,
        skorB: 0
      }
    }));
    showToast(`Auto-Draft Lapangan ${courtNum} berhasil! 🎲`);
  };

  const handleSaveEditedMatch = (updated: Partial<Pertandingan>) => {
    const updatedMatches = pertandinganList.map(m => (m.match_id === updated.match_id ? { ...m, ...updated } : m));
    setPertandinganList(updatedMatches);
    setKehadiranList(prev => syncPlayerShuttlecockFromMatches(updatedMatches, prev));
    showToast('Perubahan hasil match & shuttlecock tambahan berhasil disimpan! ✏️');
  };

  const handleDeleteMatch = (id: string) => {
    const updatedMatches = pertandinganList.filter(m => m.match_id !== id);
    setPertandinganList(updatedMatches);
    setKehadiranList(prev => syncPlayerShuttlecockFromMatches(updatedMatches, prev));
    showToast('Match dihapus dan tagihan shuttlecock diperbarui.');
  };

  // ==========================================
  // BUSINESS LOGIC: ARSIP & RESET
  // ==========================================
  const handleArchiveSession = () => {
    let kasMasuk = 0;
    kehadiranList.forEach(k => {
      if (k.status_pembayaran !== 'Belum Bayar' && k.metode_pembayaran !== 'Sponsor') {
        kasMasuk += Number(k.nominal_dibayar) || 0;
      }
    });

    const hadirCount = kehadiranList.filter(k => k.status_hadir).length;

    let totSec = 0;
    pertandinganList.forEach(m => {
      if (m.durasi_menit && m.durasi_menit.includes(':')) {
        const parts = m.durasi_menit.split(':');
        totSec += (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
      }
    });
    const avgSec = pertandinganList.length > 0 ? Math.floor(totSec / pertandinganList.length) : 0;
    const avgStr = String(Math.floor(avgSec / 60)).padStart(2, '0') + ':' + String(avgSec % 60).padStart(2, '0');

    // 1. Simpan ke Arsip_Sesi_Harian
    const newArsip: ArsipSesiHarian = {
      arsip_id: 'ARS-' + Date.now(),
      sesi_id: currentSession.sesi_id,
      waktu_arsip: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tanggal_sesi: currentSession.tanggal_sesi,
      total_pertandingan: pertandinganList.length,
      jumlah_pemain_hadir: hadirCount,
      rata_rata_waktu_main: avgStr,
      total_kas_masuk: kasMasuk,
      diarsipkan_oleh: 'admin'
    };
    setArsipSesiList(prev => [newArsip, ...prev]);

    // 2. Akumulasi ke Klasemen Kumulatif
    setKumulatifList(prev => {
      const map: Record<string, KlasemenKumulatif> = {};
      prev.forEach(k => { map[k.nama_pemain] = { ...k }; });

      kehadiranList.forEach(k => {
        if (k.status_hadir) {
          if (!map[k.nama_pemain]) {
            map[k.nama_pemain] = {
              member_id: k.member_id,
              nama_pemain: k.nama_pemain,
              total_hadir: 0,
              total_main: 0,
              total_menang: 0,
              total_kalah: 0,
              total_poin_menang: 0,
              total_poin_kalah: 0,
              total_selisih_poin: 0,
              total_poin: 0,
              updated_at: new Date().toISOString()
            };
          }
          map[k.nama_pemain].total_hadir = (map[k.nama_pemain].total_hadir || 0) + 1;
        }
      });

      // Hitung match
      pertandinganList.forEach(m => {
        const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean) as string[];
        const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean) as string[];
        const sA = Number(m.skor_tim_a) || 0, sB = Number(m.skor_tim_b) || 0;

        pA.forEach(name => {
          if (map[name]) {
            map[name].total_main = (map[name].total_main || 0) + 1;
            map[name].total_poin_menang = (map[name].total_poin_menang || 0) + sA;
            map[name].total_poin_kalah = (map[name].total_poin_kalah || 0) + sB;
            if (sA > sB) {
              map[name].total_menang = (map[name].total_menang || 0) + 1;
              map[name].total_poin = (map[name].total_poin || 0) + 3;
            } else if (sB > sA) {
              map[name].total_kalah = (map[name].total_kalah || 0) + 1;
            }
            map[name].total_selisih_poin = map[name].total_poin_menang - map[name].total_poin_kalah;
          }
        });

        pB.forEach(name => {
          if (map[name]) {
            map[name].total_main = (map[name].total_main || 0) + 1;
            map[name].total_poin_menang = (map[name].total_poin_menang || 0) + sB;
            map[name].total_poin_kalah = (map[name].total_poin_kalah || 0) + sA;
            if (sB > sA) {
              map[name].total_menang = (map[name].total_menang || 0) + 1;
              map[name].total_poin = (map[name].total_poin || 0) + 3;
            } else if (sA > sB) {
              map[name].total_kalah = (map[name].total_kalah || 0) + 1;
            }
            map[name].total_selisih_poin = map[name].total_poin_menang - map[name].total_poin_kalah;
          }
        });
      });

      return Object.values(map);
    });

    // 3. Reset Sesi
    setPertandinganList([]);
    setKehadiranList([]);
    setCourtStates({});
    setCurrentSession({
      sesi_id: 'SESI-' + new Date().toISOString().slice(0, 10) + '-' + Date.now().toString().slice(-4),
      tanggal_sesi: new Date().toISOString().slice(0, 10),
      judul_sesi: 'Mabar Badminton TaheSquat',
      jumlah_lapangan: jumlahLapangan,
      biaya_lapangan_per_pemain: currentSession.biaya_lapangan_per_pemain,
      biaya_shuttlecock_per_pemain: currentSession.biaya_shuttlecock_per_pemain,
      biaya_total_default_per_pemain: currentSession.biaya_total_default_per_pemain,
      status_sesi: 'AKTIF',
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    setActiveTab('page-allmatch');
    showToast('Sesi mabar berhasil diarsipkan dan diakumulasikan! 🏁');
  };

  const handleReset = (type: 'hari-ini' | 'kumulatif' | 'grading') => {
    if (type === 'hari-ini') {
      setPertandinganList([]);
      setKehadiranList([]);
      setCourtStates({});
      showToast('Data hari ini dibersihkan.');
    } else if (type === 'kumulatif') {
      setKumulatifList([]);
      setArsipSesiList([]);
      showToast('Data kumulatif dan arsip sesi dihapus.');
    } else if (type === 'grading') {
      setGradingList([]);
      showToast('Database grading pemain dikosongkan.');
    }
  };

  // ==========================================
  // BUSINESS LOGIC: GRADING & MADING
  // ==========================================
  const handleUpdateGrading = (nama: string, score: number) => {
    setGradingList(prev =>
      prev.map(g => (g.nama_pemain === nama ? { ...g, nilai_grading: score } : g))
    );
    showToast(`Grading ${nama} diubah menjadi ${score.toFixed(1)}`);
  };

  const handleApplyAllRecommendations = () => {
    setGradingList(prev =>
      prev.map(g => {
        let main = 0, menang = 0, sp = 0;
        pertandinganList.forEach(m => {
          const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean);
          const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean);
          const sA = Number(m.skor_tim_a) || 0, sB = Number(m.skor_tim_b) || 0;
          if (pA.includes(g.nama_pemain)) {
            main++;
            if (sA > sB) menang++;
            sp += (sA - sB);
          } else if (pB.includes(g.nama_pemain)) {
            main++;
            if (sB > sA) menang++;
            sp += (sB - sA);
          }
        });
        if (main === 0) return g;
        const winRate = menang / main;
        const avgSP = sp / main;
        let adj = 0;
        if (winRate > 0.55 || (winRate >= 0.5 && avgSP > 1.5)) adj = 0.2;
        else if (winRate < 0.45 || (winRate <= 0.5 && avgSP < -1.5)) adj = -0.2;
        const rec = Math.max(0, Math.min(10, g.nilai_grading + adj));
        return { ...g, nilai_grading: Number(rec.toFixed(1)) };
      })
    );
    showToast('Seluruh rekomendasi penyesuaian kelas diterapkan! ⚡');
  };

  const handleSaveMading = (post: Partial<MadingPost>) => {
    if (post.mading_id) {
      setMadingList(prev =>
        prev.map(m => (m.mading_id === post.mading_id ? ({ ...m, ...post } as MadingPost) : m))
      );
    } else {
      const newPost: MadingPost = {
        mading_id: 'MD-' + Date.now(),
        type: post.type || 'post',
        title: post.title || 'Mading',
        content: post.content || '',
        nama: post.nama,
        hp: post.hp,
        url_gambar: post.url_gambar,
        link_url: post.link_url,
        style_class: post.style_class || 'pin-yellow',
        font_size: post.font_size || 13,
        is_minimized: Boolean(post.is_minimized),
        x: post.x || 30,
        y: post.y || 30,
        w: post.w || 250,
        h: post.h || 180,
        tanggal_publish: new Date().toISOString().slice(0, 10),
        status_publish: 'ACTIVE',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setMadingList(prev => [newPost, ...prev]);
    }
    showToast('Kartu mading tersimpan! 📌');
  };

  const handleDeleteMading = (id: string) => {
    setMadingList(prev => prev.filter(m => m.mading_id !== id));
    showToast('Kartu mading dihapus.');
  };

  const handleImportData = (_type: 'kumulatif' | 'grading', file: File) => {
    showToast(`Memproses import file ${file.name}...`);
  };

  // Live Score Stats
  const hadirCount = kehadiranList.filter(k => k.status_hadir).length;
  let totSec = 0;
  pertandinganList.forEach(m => {
    if (m.durasi_menit && m.durasi_menit.includes(':')) {
      const p = m.durasi_menit.split(':');
      totSec += (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0);
    }
  });
  const avgSec = pertandinganList.length > 0 ? Math.floor(totSec / pertandinganList.length) : 0;
  const avgStr = String(Math.floor(avgSec / 60)).padStart(2, '0') + ':' + String(avgSec % 60).padStart(2, '0');

  const getPlayerGrade = (nama: string) => {
    const g = gradingList.find(x => x.nama_pemain === nama);
    return g ? g.nilai_grading : 5.0;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-futuristic-mesh font-sans text-[#013A40]">
      {/* LOGIN OVERLAY */}
      {!userRole && <LoginScreen onLoginSuccess={handleLoginSuccess} />}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-[#013A40] text-[#F2F2F2] px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2.5 border-l-4 border-[#F8B700] text-xs font-extrabold animate-in fade-in slide-in-from-right-5 duration-200">
          <span className="text-base text-[#F8B700]">📢</span>
          <span className="tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        userRole={userRole}
        isOpen={isSidebarOpen}
        onSelectTab={handleSelectTab}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopNavbar
          userRole={userRole}
          syncStatus={syncStatus}
          totalHadir={hadirCount}
          totalMatch={pertandinganList.length}
          avgDurasi={avgStr}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenExportGambar={() => setIsPosterModalOpen(true)}
          onOpenExportExcel={() => setIsExcelModalOpen(true)}
          onOpenImport={() => setIsImportModalOpen(true)}
          onOpenSelesai={() => setIsSelesaiModalOpen(true)}
          onOpenReset={() => setIsResetModalOpen(true)}
        />

        <main className="content-body flex-1 p-3.5 sm:p-5 md:p-6 pb-24 md:pb-8 overflow-y-auto">
          {activeTab === 'page-input' && (
            <RegistrationView
              biayaLapangan={currentSession.biaya_lapangan_per_pemain}
              biayaCock={currentSession.biaya_shuttlecock_per_pemain}
              tarifCockExtra={tarifCockExtra}
              onUpdateBiayaSesi={handleUpdateBiayaSesi}
              onRegisterPlayers={handleRegisterPlayers}
            />
          )}

          {activeTab === 'page-match' && (
            <MatchView
              userRole={userRole}
              kehadiranList={kehadiranList}
              pertandinganList={pertandinganList}
              jumlahLapangan={jumlahLapangan}
              courtStates={courtStates}
              onToggleAbsensi={handleToggleAbsensi}
              onHapusPemain={handleHapusPemainSesi}
              onTambahLapangan={() => setJumlahLapangan(Math.min(10, jumlahLapangan + 1))}
              onKurangiLapangan={() => setJumlahLapangan(Math.max(1, jumlahLapangan - 1))}
              onUpdateCourtSlot={handleUpdateCourtSlot}
              onUpdateCourtScore={handleUpdateCourtScore}
              onUpdateCourtCock={handleUpdateCourtCock}
              onToggleBebanCock={handleToggleBebanCock}
              onToggleAllBebanCock={handleToggleAllBebanCock}
              onMulaiMatchTimer={handleMulaiMatchTimer}
              onSelesaiMatch={handleSelesaiMatch}
              onAutoDraft={handleAutoDraft}
              onOpenEditMatch={m => setEditingMatch(m)}
              onDeleteMatch={handleDeleteMatch}
              getGrade={getPlayerGrade}
            />
          )}

          {activeTab === 'page-rekap' && (
            <PaymentKasView
              userRole={userRole}
              kehadiranList={kehadiranList}
              pertandinganList={pertandinganList}
              onToggleStatusBayar={handleToggleStatusBayar}
              onGantiMetode={handleGantiMetode}
              onUbahShuttlecockTambahan={handleUbahShuttlecockTambahan}
              onEditNominalPemain={k => setEditingPemain(k)}
              onOpenEditMatch={m => setEditingMatch(m)}
            />
          )}

          {activeTab === 'page-allmatch' && (
            <CumulativeView
              kumulatifList={kumulatifList}
              arsipSesiList={arsipSesiList}
            />
          )}

          {activeTab === 'page-news' && (
            <MadingView
              userRole={userRole}
              madingList={madingList}
              onSaveMading={handleSaveMading}
              onDeleteMading={handleDeleteMading}
            />
          )}

          {activeTab === 'page-grading' && (
            <GradingView
              userRole={userRole}
              gradingList={gradingList}
              configGrading={configGrading}
              kehadiranList={kehadiranList}
              pertandinganList={pertandinganList}
              onUpdateGrading={handleUpdateGrading}
              onUpdateConfigGrading={configs => setConfigGrading(configs)}
              onApplyAllRecommendations={handleApplyAllRecommendations}
            />
          )}

          {/* FUTURISTIC WATERMARK FOOTER */}
          <footer className="mt-14 pt-6 pb-4 border-t border-[#B2DCE5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#013A40]/70 gap-2 select-none">
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <span className="font-sporty font-black text-[#013A40] tracking-wider uppercase italic drop-shadow-xs">
                LOB <span className="text-[#038C8C]">SERANG</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F8B700]"></span>
              <span className="font-bold text-[#013A40] tracking-wide">
                created by : TAHESQUAT Badminton System 2.0
              </span>
            </div>
            <div className="text-[11px] font-semibold text-[#038C8C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#038C8C]/40"></span>
              <span>Platform Manajemen Member & Mabar Terintegrasi Google Sheets</span>
            </div>
          </footer>
        </main>

        <FloatingCompass />

        {/* MOBILE BOTTOM NAVIGATION */}
        <MobileBottomNav
          activeTab={activeTab}
          userRole={userRole}
          onSelectTab={handleSelectTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* ALL MODALS */}
      <PosterExportModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        kehadiranList={kehadiranList}
        pertandinganList={pertandinganList}
        kumulatifList={kumulatifList}
      />

      <ExportExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        kehadiranList={kehadiranList}
        pertandinganList={pertandinganList}
        kumulatifList={kumulatifList}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportData={handleImportData}
      />

      <SelesaiModal
        isOpen={isSelesaiModalOpen}
        onClose={() => setIsSelesaiModalOpen(false)}
        onConfirm={handleArchiveSession}
      />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onReset={handleReset}
      />

      <EditMatchModal
        isOpen={Boolean(editingMatch)}
        match={editingMatch}
        onClose={() => setEditingMatch(null)}
        onSave={handleSaveEditedMatch}
      />

      <EditPemainModal
        isOpen={Boolean(editingPemain)}
        pemain={editingPemain}
        onClose={() => setEditingPemain(null)}
        onSave={handleSaveEditPemain}
      />
    </div>
  );
}
