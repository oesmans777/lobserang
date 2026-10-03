# PANDUAN DEPLOYMENT & INTEGRASI GOOGLE APPS SCRIPT
## LOB SERANG 2 - MANAJEMEN BADMINTON TAHESQUAT

Aplikasi web app manajemen member dan mabar badminton TaheSquat yang dikonversi dari file sumber **TaheSquat_V06_fix.html** menjadi arsitektur Google Apps Script terintegrasi **Google Sheets** dan **Google Drive**.

---

### 1. Struktur File Proyek Google Apps Script

Buat file-file berikut di editor Google Apps Script (`script.google.com`):

| Nama File | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `Code.gs` | Script | Backend API: `doGet()`, autentikasi, CRUD Sheets, manajemen Drive, kalkulasi biaya & shuttlecock, pengarsipan, utilitas. |
| `Index.html` | HTML | Halaman utama: struktur antarmuka, modal, sidebar, papan skor, tabel kas & klasemen. |
| `Styles.html` | HTML | Seluruh CSS aplikasi: styling modern, Orbitron font, dark sidebar, court view, print poster E-sport. |
| `Scripts.html` | HTML | Client-side JavaScript: integrasi `google.script.run`, filter kas, timer, auto-draft, poster render. |
| `appsscript.json` | Manifest | Konfigurasi OAuth Scopes (`spreadsheets`, `drive`, `script.properties`), timeZone `Asia/Jakarta`, V8. |

---

### 2. Langkah-Langkah Deployment Web App

1. **Buka Google Apps Script**:
   - Kunjungi [https://script.google.com](https://script.google.com) dan klik **Proyek Baru**.
   - Beri nama proyek: **Lob Serang 2**.

2. **Salin Kode File**:
   - Salin isi `Code.gs` ke file `Code.gs` di editor.
   - Klik tombol **+** di samping "File" > pilih **HTML** > beri nama `Index`. Salin isi `Index.html`.
   - Tambah file HTML bernama `Styles`. Salin isi `Styles.html`.
   - Tambah file HTML bernama `Scripts`. Salin isi `Scripts.html`.
   - Di Pengaturan Proyek (ikon gerigi), centang *"Tampilkan file manifes 'appsscript.json' di editor"*. Buka `appsscript.json` dan salin isinya.

3. **Inisialisasi Spreadsheet & Folder Drive**:
   - Di Google Drive Anda, buat Spreadsheet baru bernama **`LOB SERANG DATABASE`** (atau biarkan script membuatnya otomatis).
   - Salin ID Spreadsheet dari URL (contoh: `https://docs.google.com/spreadsheets/d/`**`1ABCxyz...`**`/edit`).
   - Buat Folder Google Drive bernama **`LOB_SERANG_UPLOADS`** untuk menyimpan foto Mading. Salin Folder ID dari URL.

4. **Konfigurasi Script Properties (`PropertiesService`)**:
   - Di editor Apps Script, pilih menu **Setelan Proyek** (ikon gerigi di sebelah kiri).
   - Gulir ke bawah ke bagian **Properti Script** dan tambahkan 3 baris konfigurasi:
     * `SPREADSHEET_ID`: *(ID spreadsheet database Anda)*
     * `GDRIVE_FOLDER_ID`: *(ID folder Drive untuk foto mading)*
     * `ADMIN_PASSWORD`: `lobserangmlg`
   - Klik **Simpan properti script**.

5. **Jalankan Fungsi Inisialisasi Database**:
   - Kembali ke editor `Code.gs`.
   - Pada dropdown fungsi di toolbar atas, pilih `initializeDatabase` lalu klik tombol **Jalankan**.
   - Berikan izin otorisasi Google jika diminta.
   - Fungsi ini akan otomatis membuat 11 sheet lengkap dengan header bold, background dark, frozen rows, dan default configurations.

6. **Deploy sebagai Web App**:
   - Klik tombol **Deploy** di kanan atas > **Deployment Baru**.
   - Klik ikon gerigi jenis deployment > pilih **Aplikasi Web**.
   - **Deskripsi**: `Lob Serang 2 V1.0`
   - **Jalankan sebagai**: `Saya (email Anda)`
   - **Siapa yang memiliki akses**: `Siapa saja` (Anyone) agar para member dapat mengakses mode baca tanpa perlu login akun Google pengembang.
   - Klik **Deploy** dan salin **URL Aplikasi Web**.

---

### 3. Struktur Database (12 Sheet di LOB SERANG DATABASE)

1. **`Members`**: Master anggota mabar (`member_id`, `nama_pemain`, `status_aktif`, `tanggal_daftar`, `grading`, `kategori_level`, `catatan`, `created_at`, `updated_at`).
2. **`Sesi_Mabar`**: Data sesi mabar harian (`sesi_id`, `tanggal_sesi`, `judul_sesi`, `jumlah_lapangan`, `biaya_lapangan_per_pemain`, `biaya_shuttlecock_per_pemain`, `biaya_total_default_per_pemain`, `status_sesi`, `created_by`, `created_at`, `updated_at`).
3. **`Kehadiran_Pembayaran`**: Absensi dan rincian iuran per member per sesi (`kehadiran_id`, `sesi_id`, `member_id`, `nama_pemain`, `status_hadir`, `jam_kedatangan`, `status_pembayaran`, `metode_pembayaran`, `biaya_lapangan_per_pemain`, `biaya_shuttlecock_per_pemain`, `jumlah_shuttlecock_tambahan`, `biaya_shuttlecock_tambahan`, `total_biaya_shuttlecock`, `total_tagihan`, `nominal_dibayar`, `sisa_tagihan`, `tanggal_pembayaran`, `catatan`, `updated_at`).
4. **`Pertandingan`**: Riwayat laga (`match_id`, `sesi_id`, `tanggal_pertandingan`, `lapangan`, `tim_a_pemain_1`, `tim_a_pemain_2`, `tim_b_pemain_1`, `tim_b_pemain_2`, `skor_tim_a`, `skor_tim_b`, `pemenang`, `durasi_menit`, `jumlah_shuttlecock_tambahan`, `detail_pemain_cock`, `status_pertandingan`, `created_at`, `updated_at`).
5. **`Shuttlecock_Tambahan`**: Tabel rincian shuttlecock tambahan per match (`shuttlecock_id`, `sesi_id`, `match_id`, `tanggal`, `lapangan`, `partai`, `nama_pemain`, `jumlah_cock`, `biaya_per_cock`, `subtotal`, `status_bayar_pemain`, `created_at`). Terintegrasi otomatis dari setiap `match_id`.
6. **`Statistik_Harian`**: Klasemen sesi aktif (`sesi_id`, `member_id`, `nama_pemain`, `main`, `menang`, `kalah`, `poin_menang`, `poin_kalah`, `selisih_poin`, `poin_total`, `rata_rata_waktu_main`, `form_5_laga`, `updated_at`).
7. **`Klasemen_Kumulatif`**: Akumulasi performa all-time (`member_id`, `nama_pemain`, `total_hadir`, `total_main`, `total_menang`, `total_kalah`, `total_poin_menang`, `total_poin_kalah`, `total_selisih_poin`, `total_poin`, `total_durasi_detik`, `updated_at`).
8. **`Arsip_Sesi_Harian`**: Snapshot sesi lampau (`arsip_id`, `sesi_id`, `waktu_arsip`, `tanggal_sesi`, `total_pertandingan`, `jumlah_pemain_hadir`, `rata_rata_waktu_main`, `total_kas_masuk`, `snapshot_json`, `diarsipkan_oleh`).
9. **`Mading`**: Pinboard pengumuman & crew (`mading_id`, `type`, `title`, `content`, `nama`, `hp`, `url_gambar`, `drive_file_id`, `link_url`, `style_class`, `font_size`, `is_minimized`, `x`, `y`, `w`, `h`, `rot`, `z_index`, `tanggal_publish`, `status_publish`, `created_by`, `created_at`, `updated_at`).
10. **`Grading_Pemain`**: Database skill (`grading_id`, `member_id`, `nama_pemain`, `nilai_grading`, `main_match`, `kategori`, `catatan`, `updated_at`).
11. **`Konfigurasi`**: Pengaturan sistem (`config_key`, `config_value`, `deskripsi`, `updated_at`).
12. **`Log_Aktivitas`**: Audit trail audit (`log_id`, `timestamp`, `user_role`, `aksi`, `entitas`, `entitas_id`, `detail`).

---

### 4. Pembaruan Wajib: Struktur Biaya Mabar & Integrasi Shuttlecock Match ID

Aplikasi menggunakan rumus audit terpisah:
- **Biaya Dasar Pemain** = `Biaya Lapangan per Pemain (Rp 10.000)` + `Biaya Shuttlecock Dasar per Pemain (Rp 3.000)` = `Rp 13.000`
- **Subtotal Shuttlecock Tambahan** = `Jumlah Shuttlecock Tambahan` × `Tarif per Shuttlecock Tambahan (Rp 3.000)`
- **Total Biaya Shuttlecock Aktual** = `Biaya Shuttlecock Dasar` + `Subtotal Shuttlecock Tambahan`
- **Total Tagihan Akhir Pemain** = `Biaya Lapangan` + `Total Biaya Shuttlecock Aktual`

#### 🏸 Integrasi Shuttlecock Tambahan Melalui `match_id`:
1. Pada saat pertandingan berlangsung (di Papan Skor Lapangan) atau saat mengedit riwayat match, Admin dapat memasukkan jumlah shuttlecock tambahan (`jumlah_shuttlecock_tambahan`) dan memilih pemain yang dibebankan (`detail_pemain_cock`).
2. Setiap kali match disimpan, diedit, atau dihapus, sistem secara otomatis:
   - Mencatat baris rincian di tabel/sheet **`Shuttlecock_Tambahan`** yang menyertakan relasi `match_id`, nomor lapangan, partai pertandingan, nama pemain, tarif, subtotal, dan status bayar.
   - Mengakumulasikan `jumlah_shuttlecock_tambahan` ke data masing-masing pemain di tabel **`Kehadiran_Pembayaran`**.
   - Menghitung ulang `total_tagihan` dan `sisa_tagihan` pemain secara real-time.
3. Di modul **Rekap Kas**, disajikan **Tabel Rincian Shuttlecock Tambahan per Match ID** yang transparan, lengkap dengan filter/pencarian dan status pelunasan. Admin juga tetap dapat melakukan penyesuaian manual langsung dengan tombol `+` / `-` pada baris pemain.
