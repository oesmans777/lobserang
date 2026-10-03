export interface Member {
  member_id: string;
  nama_pemain: string;
  status_aktif: boolean;
  tanggal_daftar: string;
  grading: number;
  kategori_level: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface SesiMabar {
  sesi_id: string;
  tanggal_sesi: string;
  judul_sesi: string;
  jumlah_lapangan: number;
  biaya_lapangan_per_pemain: number;
  biaya_shuttlecock_per_pemain: number;
  biaya_total_default_per_pemain: number;
  status_sesi: 'AKTIF' | 'SELESAI' | 'ARSIP';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KehadiranPembayaran {
  kehadiran_id: string;
  sesi_id: string;
  member_id: string;
  nama_pemain: string;
  status_hadir: boolean;
  jam_kedatangan?: string;
  status_pembayaran: 'Belum Bayar' | 'Lunas' | 'Tunai' | 'QRIS / Transfer' | 'Sponsor / Free';
  metode_pembayaran: 'Tunai' | 'QRIS' | 'Sponsor' | '-';
  biaya_lapangan_per_pemain: number;
  biaya_shuttlecock_per_pemain: number;
  jumlah_shuttlecock_tambahan: number;
  biaya_shuttlecock_tambahan: number;
  subtotal_shuttlecock_tambahan: number;
  total_biaya_shuttlecock: number;
  total_tagihan: number;
  nominal_dibayar: number;
  sisa_tagihan: number;
  tanggal_pembayaran?: string;
  catatan?: string;
  updated_at: string;
}

export interface Pertandingan {
  match_id: string;
  sesi_id: string;
  tanggal_pertandingan: string;
  lapangan: number;
  tim_a_pemain_1: string;
  tim_a_pemain_2?: string;
  tim_b_pemain_1: string;
  tim_b_pemain_2?: string;
  skor_tim_a: number;
  skor_tim_b: number;
  pemenang: 'A' | 'B' | 'SERI';
  durasi_menit: string; // e.g. "14:20"
  jumlah_shuttlecock_tambahan: number; // shuttlecock tambahan pada match ini
  detail_pemain_cock?: string; // JSON atau daftar nama pemain yang dibebankan cock pada match_id ini
  status_pertandingan: 'SELESAI' | 'BERJALAN' | 'BATAL';
  created_at: string;
  updated_at: string;
}

export interface StatistikHarian {
  sesi_id: string;
  member_id: string;
  nama_pemain: string;
  main: number;
  menang: number;
  kalah: number;
  poin_menang: number;
  poin_kalah: number;
  selisih_poin: number;
  poin_total: number;
  rata_rata_waktu_main: string;
  form_5_laga: string[]; // ['M', 'K', 'M', ...]
  updated_at: string;
}

export interface KlasemenKumulatif {
  member_id: string;
  nama_pemain: string;
  total_hadir: number;
  total_main: number;
  total_menang: number;
  total_kalah: number;
  total_poin_menang: number;
  total_poin_kalah: number;
  total_selisih_poin: number;
  total_poin: number;
  total_durasi_detik?: number;
  updated_at: string;
}

export interface ArsipSesiHarian {
  arsip_id: string;
  sesi_id: string;
  waktu_arsip: string;
  tanggal_sesi: string;
  total_pertandingan: number;
  jumlah_pemain_hadir: number;
  rata_rata_waktu_main: string;
  total_kas_masuk: number;
  snapshot_json?: string;
  diarsipkan_oleh: string;
}

export interface MadingPost {
  mading_id: string;
  type: 'post' | 'crew';
  title: string;
  content: string;
  nama?: string;
  hp?: string;
  url_gambar?: string;
  drive_file_id?: string;
  link_url?: string;
  style_class: 'pin-yellow' | 'pin-blue' | 'pin-green' | 'pin-purple' | 'pin-crew' | 'pin-sponsor';
  font_size: number;
  is_minimized: boolean;
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  z_index?: number;
  tanggal_publish: string;
  status_publish: 'ACTIVE' | 'ARCHIVED';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GradingConfig {
  nama: string;
  min: number;
  max: number;
}

export interface GradingPemain {
  grading_id: string;
  member_id: string;
  nama_pemain: string;
  nilai_grading: number;
  main_match: number;
  kategori: string;
  catatan?: string;
  rekomendasi_diterapkan?: boolean;
  updated_at: string;
}

export interface ShuttlecockTambahanMatch {
  shuttlecock_id: string;
  sesi_id: string;
  match_id: string;
  tanggal: string;
  lapangan: number;
  partai: string;
  nama_pemain: string;
  jumlah_cock: number;
  biaya_per_cock: number;
  subtotal: number;
  status_bayar_pemain?: string;
  keterangan?: string;
  created_at: string;
}

export interface CourtState {
  ta1: string;
  ta2: string;
  tb1: string;
  tb2: string;
  skorA: number;
  skorB: number;
  cockTambahan?: number;
  bebanCock?: string[]; // list of players in this match who bear the extra cock
  berjalan: boolean;
  startTime: number;
  accumulatedTime: number;
  blowoutResolved: boolean;
}

export type UserRole = 'admin' | 'member';
export type SyncStatusType = 'connected' | 'syncing' | 'error';
