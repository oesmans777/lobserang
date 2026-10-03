/**
 * ============================================================================
 * LOB SERANG 2 - GOOGLE APPS SCRIPT BACKEND
 * Sistem Manajemen Member, Mabar Badminton, Kas & Klasemen Terintegrasi Google Sheets
 * Database: "LOB SERANG DATABASE"
 * ============================================================================
 */

// ==========================================
// KONFIGURASI DEFAULT & PROPERTIES HELPER
// ==========================================
const SPREADSHEET_NAME = "LOB SERANG DATABASE";
const DEFAULT_ADMIN_PASSWORD = "lobserangmlg";
const TIMEZONE = "Asia/Jakarta";

/**
 * Entry point Web App
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Lob Serang 2 - Badminton Management TaheSquat")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include helper untuk modular HTML (Styles, Scripts, dll)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mendapatkan Spreadsheet Database aktif
 */
function getDatabaseSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty("SPREADSHEET_ID");
  
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      Logger.log("Spreadsheet ID tidak valid, mencari berdasarkan nama: " + e.message);
    }
  }

  // Cari file berdasarkan nama jika ID belum diset atau rusak
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    const file = files.next();
    props.setProperty("SPREADSHEET_ID", file.getId());
    return SpreadsheetApp.openById(file.getId());
  }

  // Buat baru jika belum ada sama sekali
  const newSs = SpreadsheetApp.create(SPREADSHEET_NAME);
  props.setProperty("SPREADSHEET_ID", newSs.getId());
  initializeDatabase(newSs.getId());
  return newSs;
}

/**
 * Inisialisasi 11 Sheet Database beserta header dan formatting
 */
function initializeDatabase(explicitSsId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const props = PropertiesService.getScriptProperties();
    const ssId = explicitSsId || props.getProperty("SPREADSHEET_ID") || getDatabaseSpreadsheet().getId();
    const ss = SpreadsheetApp.openById(ssId);
    props.setProperty("SPREADSHEET_ID", ssId);

    // Inisialisasi password admin jika belum ada
    if (!props.getProperty("ADMIN_PASSWORD")) {
      props.setProperty("ADMIN_PASSWORD", DEFAULT_ADMIN_PASSWORD);
    }

    const sheetsConfig = [
      {
        name: "Members",
        headers: ["member_id", "nama_pemain", "status_aktif", "tanggal_daftar", "grading", "kategori_level", "catatan", "created_at", "updated_at"]
      },
      {
        name: "Sesi_Mabar",
        headers: ["sesi_id", "tanggal_sesi", "judul_sesi", "jumlah_lapangan", "biaya_lapangan_per_pemain", "biaya_shuttlecock_per_pemain", "biaya_total_default_per_pemain", "status_sesi", "created_by", "created_at", "updated_at"]
      },
      {
        name: "Kehadiran_Pembayaran",
        headers: [
          "kehadiran_id", "sesi_id", "member_id", "nama_pemain", "status_hadir", "jam_kedatangan",
          "status_pembayaran", "metode_pembayaran", "biaya_lapangan_per_pemain", "biaya_shuttlecock_per_pemain",
          "jumlah_shuttlecock_tambahan", "biaya_shuttlecock_tambahan", "total_biaya_shuttlecock",
          "total_tagihan", "nominal_dibayar", "sisa_tagihan", "tanggal_pembayaran", "catatan", "updated_at"
        ]
      },
      {
        name: "Pertandingan",
        headers: [
          "match_id", "sesi_id", "tanggal_pertandingan", "lapangan",
          "tim_a_pemain_1", "tim_a_pemain_2", "tim_b_pemain_1", "tim_b_pemain_2",
          "skor_tim_a", "skor_tim_b", "pemenang", "durasi_menit",
          "jumlah_shuttlecock_tambahan", "detail_pemain_cock",
          "status_pertandingan", "created_at", "updated_at"
        ]
      },
      {
        name: "Shuttlecock_Tambahan",
        headers: [
          "shuttlecock_id", "sesi_id", "match_id", "tanggal", "lapangan",
          "partai", "nama_pemain", "jumlah_cock", "biaya_per_cock",
          "subtotal", "status_bayar_pemain", "created_at"
        ]
      },
      {
        name: "Statistik_Harian",
        headers: [
          "sesi_id", "member_id", "nama_pemain", "main", "menang", "kalah",
          "poin_menang", "poin_kalah", "selisih_poin", "poin_total", "rata_rata_waktu_main", "form_5_laga", "updated_at"
        ]
      },
      {
        name: "Klasemen_Kumulatif",
        headers: [
          "member_id", "nama_pemain", "total_hadir", "total_main", "total_menang", "total_kalah",
          "total_poin_menang", "total_poin_kalah", "total_selisih_poin", "total_poin", "total_durasi_detik", "updated_at"
        ]
      },
      {
        name: "Arsip_Sesi_Harian",
        headers: [
          "arsip_id", "sesi_id", "waktu_arsip", "tanggal_sesi", "total_pertandingan",
          "jumlah_pemain_hadir", "rata_rata_waktu_main", "total_kas_masuk", "snapshot_json", "diarsipkan_oleh"
        ]
      },
      {
        name: "Mading",
        headers: [
          "mading_id", "type", "title", "content", "nama", "hp", "url_gambar", "drive_file_id",
          "link_url", "style_class", "font_size", "is_minimized", "x", "y", "w", "h", "rot", "z_index",
          "tanggal_publish", "status_publish", "created_by", "created_at", "updated_at"
        ]
      },
      {
        name: "Grading_Pemain",
        headers: ["grading_id", "member_id", "nama_pemain", "nilai_grading", "main_match", "kategori", "catatan", "updated_at"]
      },
      {
        name: "Konfigurasi",
        headers: ["config_key", "config_value", "deskripsi", "updated_at"]
      },
      {
        name: "Log_Aktivitas",
        headers: ["log_id", "timestamp", "user_role", "aksi", "entitas", "entitas_id", "detail"]
      }
    ];

    sheetsConfig.forEach(cfg => {
      let sheet = ss.getSheetByName(cfg.name);
      if (!sheet) {
        sheet = ss.insertSheet(cfg.name);
      }
      
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(cfg.headers);
        const headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
        headerRange.setFontWeight("bold")
                   .setBackground("#1e293b")
                   .setFontColor("#ffffff")
                   .setHorizontalAlignment("center");
        sheet.setFrozenRows(1);
      }
    });

    // Hapus sheet bawaan "Sheet1" jika ada
    const defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch (e) {}
    }

    // Inisialisasi data konfigurasi default jika kosong
    initDefaultConfigurations(ss);

    logActivity("INITIALIZE", "Database", ssId, "Berhasil inisialisasi 11 sheets database LOB SERANG", "admin");
    return { success: true, message: "Database LOB SERANG siap digunakan!", spreadsheetId: ssId };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mengisi nilai awal pada Sheet Konfigurasi
 */
function initDefaultConfigurations(ss) {
  const configSheet = ss.getSheetByName("Konfigurasi");
  if (configSheet.getLastRow() <= 1) {
    const now = getCurrentTimestamp();
    const defaultConfigs = [
      ["DEFAULT_COURT_FEE", "10000", "Biaya lapangan per pemain (Rp)", now],
      ["DEFAULT_SHUTTLECOCK_FEE", "3000", "Biaya shuttlecock dasar per pemain (Rp)", now],
      ["DEFAULT_EXTRA_SHUTTLECOCK_PRICE", "3000", "Biaya per shuttlecock tambahan (Rp)", now],
      ["DEFAULT_COURT_COUNT", "2", "Jumlah lapangan aktif", now],
      ["GRADING_LEVELS_JSON", JSON.stringify([
        { nama: "🔥 PRO / ADVANCED", min: 8.5, max: 10.0 },
        { nama: "⚡ INTERMEDIATE A", min: 7.0, max: 8.4 },
        { nama: "🏸 INTERMEDIATE B", min: 5.5, max: 6.9 },
        { nama: "🌱 BEGINNER", min: 4.0, max: 5.4 },
        { nama: "⚪ NEWBIE", min: 0.0, max: 3.9 }
      ]), "Rentang kategori grading", now]
    ];
    defaultConfigs.forEach(row => configSheet.appendRow(row));
  }
}

// ==========================================
// AUTENTIKASI ADMIN & KEAMANAN
// ==========================================
function verifyAdmin(password) {
  const props = PropertiesService.getScriptProperties();
  const validPassword = props.getProperty("ADMIN_PASSWORD") || DEFAULT_ADMIN_PASSWORD;
  
  if (password === validPassword) {
    const token = Utilities.getUuid();
    CacheService.getUserCache().put("ADMIN_AUTH_TOKEN", token, 21600); // 6 jam
    logActivity("LOGIN", "Auth", "admin", "Login Admin berhasil", "admin");
    return { success: true, token: token, role: "admin" };
  } else {
    logActivity("LOGIN_FAILED", "Auth", "anonymous", "Percobaan login admin gagal", "member");
    return { success: false, message: "Password Admin salah!" };
  }
}

function checkAdminRole(role) {
  if (role !== "admin") {
    throw new Error("Akses Ditolak: Anda harus login sebagai Admin untuk aksi ini.");
  }
}

// ==========================================
// INITIAL DATA LOADER
// ==========================================
function getInitialData(authRole) {
  try {
    const ss = getDatabaseSpreadsheet();
    
    // Pastikan database terinisialisasi
    initializeDatabase(ss.getId());

    const membersData = sheetToObjects(ss.getSheetByName("Members"));
    const sesiData = sheetToObjects(ss.getSheetByName("Sesi_Mabar"));
    const kehadiranData = sheetToObjects(ss.getSheetByName("Kehadiran_Pembayaran"));
    const pertandinganData = sheetToObjects(ss.getSheetByName("Pertandingan"));
    const statistikData = sheetToObjects(ss.getSheetByName("Statistik_Harian"));
    const kumulatifData = sheetToObjects(ss.getSheetByName("Klasemen_Kumulatif"));
    const arsipData = sheetToObjects(ss.getSheetByName("Arsip_Sesi_Harian"));
    const madingData = sheetToObjects(ss.getSheetByName("Mading"));
    const gradingData = sheetToObjects(ss.getSheetByName("Grading_Pemain"));
    const configData = sheetToObjects(ss.getSheetByName("Konfigurasi"));
    const shuttlecockData = sheetToObjects(ss.getSheetByName("Shuttlecock_Tambahan"));

    // Cari sesi aktif hari ini atau buat otomatis
    let currentSession = sesiData.find(s => s.status_sesi === "AKTIF");
    if (!currentSession) {
      currentSession = createNewSessionInternal(ss, "Mabar Hari Ini", 2, 10000, 3000);
    }

    return {
      success: true,
      currentSession: currentSession,
      members: membersData,
      kehadiran: kehadiranData.filter(k => k.sesi_id === currentSession.sesi_id),
      pertandingan: pertandinganData.filter(p => p.sesi_id === currentSession.sesi_id),
      shuttlecockTambahan: shuttlecockData.filter(s => s.sesi_id === currentSession.sesi_id),
      statistikHarian: statistikData.filter(s => s.sesi_id === currentSession.sesi_id),
      kumulatif: kumulatifData,
      arsipSesi: arsipData,
      mading: madingData,
      gradingPemain: gradingData,
      konfigurasi: configData,
      userRole: authRole || "member"
    };
  } catch (err) {
    Logger.log("Error getInitialData: " + err.message);
    return { success: false, error: err.message };
  }
}

// ==========================================
// SESI MABAR & STRUKTUR BIAYA
// ==========================================
function createNewSessionInternal(ss, judul, jumlahLap, biayaLap, biayaCock) {
  const sheet = ss.getSheetByName("Sesi_Mabar");
  const sesiId = "SESI-" + Utilities.formatDate(new Date(), TIMEZONE, "yyyyMMdd-HHmmss");
  const now = getCurrentTimestamp();
  const totalDefault = (Number(biayaLap) || 10000) + (Number(biayaCock) || 3000);

  const newRow = [
    sesiId,
    Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
    judul || "Mabar Badminton",
    Number(jumlahLap) || 2,
    Number(biayaLap) || 10000,
    Number(biayaCock) || 3000,
    totalDefault,
    "AKTIF",
    "admin",
    now,
    now
  ];

  sheet.appendRow(newRow);
  return {
    sesi_id: sesiId,
    tanggal_sesi: Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
    judul_sesi: judul || "Mabar Badminton",
    jumlah_lapangan: Number(jumlahLap) || 2,
    biaya_lapangan_per_pemain: Number(biayaLap) || 10000,
    biaya_shuttlecock_per_pemain: Number(biayaCock) || 3000,
    biaya_total_default_per_pemain: totalDefault,
    status_sesi: "AKTIF"
  };
}

// ==========================================
// REGISTRASI PEMAIN & BATCH WHATSAPP
// ==========================================
function savePlayersBatch(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const ss = getDatabaseSpreadsheet();
    const membersSheet = ss.getSheetByName("Members");
    const kehadiranSheet = ss.getSheetByName("Kehadiran_Pembayaran");
    const gradingSheet = ss.getSheetByName("Grading_Pemain");

    const sesiId = payload.sesi_id;
    const biayaLap = Number(payload.biaya_lapangan) || 10000;
    const biayaCock = Number(payload.biaya_shuttlecock) || 3000;
    const totalTagihanAwal = biayaLap + biayaCock;
    const now = getCurrentTimestamp();

    const existingMembers = sheetToObjects(membersSheet);
    const existingKehadiran = sheetToObjects(kehadiranSheet).filter(k => k.sesi_id === sesiId);

    const result = { added: [], skipped: [] };

    payload.player_names.forEach(rawName => {
      const cleanName = String(rawName).trim().replace(/['"`]/g, "").toUpperCase();
      if (!cleanName) return;

      // Cek apakah sudah terdaftar di sesi aktif ini
      if (existingKehadiran.some(k => k.nama_pemain === cleanName)) {
        result.skipped.push(cleanName);
        return;
      }

      // Cek / buat Member ID
      let member = existingMembers.find(m => m.nama_pemain === cleanName);
      let memberId = member ? member.member_id : "MEM-" + Utilities.getUuid().substring(0, 8);

      if (!member) {
        membersSheet.appendRow([
          memberId, cleanName, true, Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
          5.0, "🌱 BEGINNER", "Didaftarkan dari input sesi", now, now
        ]);
        gradingSheet.appendRow([
          "GRD-" + Utilities.getUuid().substring(0, 8), memberId, cleanName, 5.0, 0, "🌱 BEGINNER", "", now
        ]);
      }

      // Tambahkan ke Kehadiran_Pembayaran sesi ini
      const kehadiranId = "KHD-" + Utilities.getUuid().substring(0, 8);
      kehadiranSheet.appendRow([
        kehadiranId, sesiId, memberId, cleanName, false, "",
        "Belum Bayar", "Tunai", biayaLap, biayaCock,
        0, 3000, biayaCock,
        totalTagihanAwal, 0, totalTagihanAwal, "", "", now
      ]);

      result.added.push(cleanName);
    });

    logActivity("REGISTER_PLAYERS", "Kehadiran", sesiId, `Menambahkan ${result.added.length} pemain ke sesi`, payload.role);
    return { success: true, data: result };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// KEHADIRAN & ABSENSI
// ==========================================
function updatePlayerAttendance(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Kehadiran_Pembayaran");
    const data = sheet.getDataRange().getValues();
    const now = getCurrentTimestamp();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === payload.sesi_id && data[i][3] === payload.nama_pemain) {
        data[i][4] = payload.status_hadir;
        data[i][5] = payload.status_hadir ? Utilities.formatDate(new Date(), TIMEZONE, "HH:mm") : "";
        data[i][18] = now;
        
        sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
        break;
      }
    }

    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// PEMBAYARAN & REKAP KAS LENGKAP DENGAN SHUTTLECOCK TAMBAHAN
// ==========================================
function updatePayment(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Kehadiran_Pembayaran");
    const data = sheet.getDataRange().getValues();
    const now = getCurrentTimestamp();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === payload.sesi_id && data[i][3] === payload.nama_pemain) {
        const biayaLap = Number(payload.biaya_lapangan !== undefined ? payload.biaya_lapangan : data[i][8]);
        const biayaCockDasar = Number(payload.biaya_shuttlecock !== undefined ? payload.biaya_shuttlecock : data[i][9]);
        const qtyExtra = Number(payload.jumlah_shuttlecock_tambahan !== undefined ? payload.jumlah_shuttlecock_tambahan : data[i][10]);
        const priceExtra = Number(payload.biaya_shuttlecock_tambahan !== undefined ? payload.biaya_shuttlecock_tambahan : data[i][11]);
        
        // Kalkulasi Wajib Sesuai Aturan Baru:
        const subtotalExtra = qtyExtra * priceExtra;
        const totalBiayaCock = biayaCockDasar + subtotalExtra;
        const totalTagihanAkhir = (payload.metode_pembayaran === "Sponsor") ? 0 : (biayaLap + totalBiayaCock);
        
        const statusBayar = payload.status_pembayaran || data[i][6];
        const metodeBayar = payload.metode_pembayaran || data[i][7];
        const nominalBayar = (statusBayar === "Lunas" || statusBayar === "Tunai" || statusBayar === "QRIS / Transfer") ? totalTagihanAkhir : (Number(payload.nominal_dibayar) || 0);
        const sisaTagihan = Math.max(0, totalTagihanAkhir - nominalBayar);

        data[i][6] = statusBayar;
        data[i][7] = metodeBayar;
        data[i][8] = biayaLap;
        data[i][9] = biayaCockDasar;
        data[i][10] = qtyExtra;
        data[i][11] = priceExtra;
        data[i][12] = totalBiayaCock;
        data[i][13] = totalTagihanAkhir;
        data[i][14] = nominalBayar;
        data[i][15] = sisaTagihan;
        data[i][16] = (statusBayar !== "Belum Bayar") ? Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm") : "";
        data[i][18] = now;

        sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
        break;
      }
    }

    logActivity("UPDATE_PAYMENT", "Kehadiran_Pembayaran", payload.nama_pemain, `Update pembayaran ${payload.nama_pemain}: ${payload.status_pembayaran}`, payload.role);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// PERTANDINGAN & STATISTIK
// ==========================================
function saveMatch(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Pertandingan");
    const matchId = "MTH-" + Utilities.getUuid().substring(0, 8);
    const now = getCurrentTimestamp();

    const skorA = Number(payload.skor_tim_a) || 0;
    const skorB = Number(payload.skor_tim_b) || 0;
    const pemenang = skorA > skorB ? "A" : (skorB > skorA ? "B" : "SERI");
    const cockExtra = Number(payload.jumlah_shuttlecock_tambahan) || 0;
    const detailPemain = payload.detail_pemain_cock || "";

    sheet.appendRow([
      matchId,
      payload.sesi_id,
      Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
      Number(payload.lapangan) || 1,
      payload.tim_a_pemain_1,
      payload.tim_a_pemain_2 || "",
      payload.tim_b_pemain_1,
      payload.tim_b_pemain_2 || "",
      skorA,
      skorB,
      pemenang,
      payload.durasi_menit || "00:00",
      cockExtra,
      detailPemain,
      "SELESAI",
      now,
      now
    ]);

    recalculateStatsInternal(ss, payload.sesi_id);
    syncPlayerShuttlecockPaymentsInternal(ss, payload.sesi_id);
    logActivity("SAVE_MATCH", "Pertandingan", matchId, `Match selesai di Lap ${payload.lapangan} (Cock Extra: ${cockExtra})`, payload.role);
    return { success: true, matchId: matchId };
  } finally {
    lock.releaseLock();
  }
}

function editMatch(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Pertandingan");
    const data = sheet.getDataRange().getValues();
    const now = getCurrentTimestamp();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.match_id) {
        const skorA = Number(payload.skor_tim_a);
        const skorB = Number(payload.skor_tim_b);
        data[i][4] = payload.tim_a_pemain_1;
        data[i][5] = payload.tim_a_pemain_2 || "";
        data[i][6] = payload.tim_b_pemain_1;
        data[i][7] = payload.tim_b_pemain_2 || "";
        data[i][8] = skorA;
        data[i][9] = skorB;
        data[i][10] = skorA > skorB ? "A" : (skorB > skorA ? "B" : "SERI");
        data[i][11] = payload.durasi_menit || data[i][11];
        data[i][12] = Number(payload.jumlah_shuttlecock_tambahan) || 0;
        data[i][13] = payload.detail_pemain_cock || "";
        data[i][16] = now;
        
        sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
        break;
      }
    }

    recalculateStatsInternal(ss, payload.sesi_id);
    syncPlayerShuttlecockPaymentsInternal(ss, payload.sesi_id);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteMatch(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Pertandingan");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payload.match_id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }

    recalculateStatsInternal(ss, payload.sesi_id);
    syncPlayerShuttlecockPaymentsInternal(ss, payload.sesi_id);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Sinkronisasi Shuttlecock Tambahan dari seluruh match_id ke tabel Kehadiran_Pembayaran tiap pemain
 */
function syncPlayerShuttlecockPaymentsInternal(ss, sesiId) {
  const matches = sheetToObjects(ss.getSheetByName("Pertandingan")).filter(m => m.sesi_id === sesiId);
  const kehadiranSheet = ss.getSheetByName("Kehadiran_Pembayaran");
  const data = kehadiranSheet.getDataRange().getValues();
  const now = getCurrentTimestamp();

  // Hitung akumulasi shuttlecock tambahan per nama pemain dari seluruh match_id
  const playerCockMap = {};
  matches.forEach(m => {
    const qty = Number(m.jumlah_shuttlecock_tambahan) || 0;
    if (qty <= 0) return;

    let chargedList = [];
    if (m.detail_pemain_cock) {
      chargedList = String(m.detail_pemain_cock).split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
    } else {
      chargedList = [m.tim_a_pemain_1, m.tim_a_pemain_2, m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean).map(s => String(s).toUpperCase());
    }

    chargedList.forEach(pName => {
      playerCockMap[pName] = (playerCockMap[pName] || 0) + qty;
    });
  });

  // Update ke baris Kehadiran_Pembayaran
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === sesiId) {
      const pName = String(data[i][3]).toUpperCase();
      const extraQty = playerCockMap[pName] || 0;
      const bLap = Number(data[i][8]) || 10000;
      const bCockDasar = Number(data[i][9]) || 3000;
      const priceExtra = Number(data[i][11]) || 3000;

      const subtotalExtra = extraQty * priceExtra;
      const totalBiayaCock = bCockDasar + subtotalExtra;
      const totalTagihan = (data[i][7] === "Sponsor") ? 0 : (bLap + totalBiayaCock);
      const isPaid = (data[i][6] === "Lunas" || data[i][6] === "Tunai" || data[i][6] === "QRIS / Transfer");
      const dibayar = isPaid ? totalTagihan : (Number(data[i][14]) || 0);
      const sisaTagihan = Math.max(0, totalTagihan - dibayar);

      data[i][10] = extraQty;
      data[i][12] = totalBiayaCock;
      data[i][13] = totalTagihan;
      data[i][14] = dibayar;
      data[i][15] = sisaTagihan;
      data[i][18] = now;
    }
  }

  if (data.length > 1) {
    kehadiranSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }

  // ==========================================
  // SINKRONISASI TABEL SHUTTLECOCK_TAMBAHAN
  // ==========================================
  let cockSheet = ss.getSheetByName("Shuttlecock_Tambahan");
  if (!cockSheet) {
    cockSheet = ss.insertSheet("Shuttlecock_Tambahan");
  }

  const cockHeaders = [
    "shuttlecock_id", "sesi_id", "match_id", "tanggal", "lapangan",
    "partai", "nama_pemain", "jumlah_cock", "biaya_per_cock",
    "subtotal", "status_bayar_pemain", "created_at"
  ];

  const cockData = cockSheet.getDataRange().getValues();
  const retainedRows = [cockHeaders];

  // Pertahankan data dari sesi lain
  if (cockData.length > 1) {
    for (let i = 1; i < cockData.length; i++) {
      if (cockData[i][1] && cockData[i][1] !== sesiId) {
        retainedRows.push(cockData[i]);
      }
    }
  }

  // Masukkan baris baru dari setiap match pada sesi ini
  matches.forEach(m => {
    const qty = Number(m.jumlah_shuttlecock_tambahan) || 0;
    if (qty <= 0) return;

    let chargedList = [];
    if (m.detail_pemain_cock) {
      chargedList = String(m.detail_pemain_cock).split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
    } else {
      chargedList = [m.tim_a_pemain_1, m.tim_a_pemain_2, m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean).map(s => String(s).toUpperCase());
    }

    const timA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean).join(" / ");
    const timB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean).join(" / ");
    const partai = (timA || "Tim A") + " vs " + (timB || "Tim B");

    chargedList.forEach((pName, idx) => {
      let statusBayar = "Belum Bayar";
      let priceExtra = 3000;
      for (let k = 1; k < data.length; k++) {
        if (data[k][1] === sesiId && String(data[k][3]).toUpperCase() === pName) {
          statusBayar = data[k][6] || "Belum Bayar";
          priceExtra = Number(data[k][11]) || 3000;
          break;
        }
      }

      retainedRows.push([
        "SCK-" + m.match_id + "-" + (idx + 1),
        sesiId,
        m.match_id,
        m.tanggal_pertandingan || Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
        Number(m.lapangan) || 1,
        partai,
        pName,
        qty,
        priceExtra,
        qty * priceExtra,
        statusBayar,
        now
      ]);
    });
  });

  cockSheet.clear();
  cockSheet.getRange(1, 1, retainedRows.length, retainedRows[0].length).setValues(retainedRows);
  const headerR = cockSheet.getRange(1, 1, 1, retainedRows[0].length);
  headerR.setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff").setHorizontalAlignment("center");
}

/**
 * Kalkulasi ulang statistik harian berdasarkan daftar pertandingan
 */
function recalculateStatsInternal(ss, sesiId) {
  const matches = sheetToObjects(ss.getSheetByName("Pertandingan")).filter(m => m.sesi_id === sesiId);
  const kehadiran = sheetToObjects(ss.getSheetByName("Kehadiran_Pembayaran")).filter(k => k.sesi_id === sesiId);
  const statsSheet = ss.getSheetByName("Statistik_Harian");

  const playerStats = {};
  kehadiran.forEach(p => {
    playerStats[p.nama_pemain] = {
      sesi_id: sesiId,
      member_id: p.member_id,
      nama_pemain: p.nama_pemain,
      main: 0, menang: 0, kalah: 0,
      poin_menang: 0, poin_kalah: 0, selisih_poin: 0, poin_total: 0,
      total_durasi_detik: 0,
      form_5_laga: []
    };
  });

  // Iterasi matches dari yang terlama ke terbaru
  matches.forEach(m => {
    const pA = [m.tim_a_pemain_1, m.tim_a_pemain_2].filter(Boolean);
    const pB = [m.tim_b_pemain_1, m.tim_b_pemain_2].filter(Boolean);
    const skorA = Number(m.skor_tim_a) || 0;
    const skorB = Number(m.skor_tim_b) || 0;
    const pemenang = m.pemenang;

    let durasiDetik = 0;
    if (m.durasi_menit && m.durasi_menit.includes(":")) {
      const parts = m.durasi_menit.split(":");
      durasiDetik = (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
    }

    pA.forEach(name => {
      if (!playerStats[name]) {
        playerStats[name] = {
          sesi_id: sesiId, member_id: "", nama_pemain: name,
          main: 0, menang: 0, kalah: 0, poin_menang: 0, poin_kalah: 0,
          selisih_poin: 0, poin_total: 0, total_durasi_detik: 0, form_5_laga: []
        };
      }
      const st = playerStats[name];
      st.main++;
      st.poin_menang += skorA;
      st.poin_kalah += skorB;
      st.total_durasi_detik += durasiDetik;
      if (pemenang === "A") { st.menang++; st.poin_total += 3; st.form_5_laga.push("M"); }
      else if (pemenang === "B") { st.kalah++; st.form_5_laga.push("K"); }
      st.selisih_poin = st.poin_menang - st.poin_kalah;
    });

    pB.forEach(name => {
      if (!playerStats[name]) {
        playerStats[name] = {
          sesi_id: sesiId, member_id: "", nama_pemain: name,
          main: 0, menang: 0, kalah: 0, poin_menang: 0, poin_kalah: 0,
          selisih_poin: 0, poin_total: 0, total_durasi_detik: 0, form_5_laga: []
        };
      }
      const st = playerStats[name];
      st.main++;
      st.poin_menang += skorB;
      st.poin_kalah += skorA;
      st.total_durasi_detik += durasiDetik;
      if (pemenang === "B") { st.menang++; st.poin_total += 3; st.form_5_laga.push("M"); }
      else if (pemenang === "A") { st.kalah++; st.form_5_laga.push("K"); }
      st.selisih_poin = st.poin_menang - st.poin_kalah;
    });
  });

  // Hapus data lama di Statistik_Harian untuk sesi ini
  const rawRows = statsSheet.getDataRange().getValues();
  for (let i = rawRows.length - 1; i >= 1; i--) {
    if (rawRows[i][0] === sesiId) {
      statsSheet.deleteRow(i + 1);
    }
  }

  // Tulis batch baru
  const now = getCurrentTimestamp();
  const rowsToInsert = [];
  Object.values(playerStats).forEach(s => {
    const avgDetik = s.main > 0 ? Math.floor(s.total_durasi_detik / s.main) : 0;
    const avgStr = padZero(Math.floor(avgDetik / 60)) + ":" + padZero(avgDetik % 60);
    const formStr = JSON.stringify(s.form_5_laga.slice(-5));

    rowsToInsert.push([
      sesiId, s.member_id, s.nama_pemain, s.main, s.menang, s.kalah,
      s.poin_menang, s.poin_kalah, s.selisih_poin, s.poin_total, avgStr, formStr, now
    ]);
  });

  if (rowsToInsert.length > 0) {
    statsSheet.getRange(statsSheet.getLastRow() + 1, 1, rowsToInsert.length, rowsToInsert[0].length).setValues(rowsToInsert);
  }
}

// ==========================================
// SELESAI SESI, ARSIP, & AKUMULASI KUMULATIF
// ==========================================
function archiveDailySession(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sesiId = payload.sesi_id;
    const now = getCurrentTimestamp();

    const kehadiranSheet = ss.getSheetByName("Kehadiran_Pembayaran");
    const pertandinganSheet = ss.getSheetByName("Pertandingan");
    const kumulatifSheet = ss.getSheetByName("Klasemen_Kumulatif");
    const gradingSheet = ss.getSheetByName("Grading_Pemain");
    const arsipSheet = ss.getSheetByName("Arsip_Sesi_Harian");
    const sesiSheet = ss.getSheetByName("Sesi_Mabar");

    const kehadiran = sheetToObjects(kehadiranSheet).filter(k => k.sesi_id === sesiId);
    const matches = sheetToObjects(pertandinganSheet).filter(m => m.sesi_id === sesiId);
    const stats = sheetToObjects(ss.getSheetByName("Statistik_Harian")).filter(s => s.sesi_id === sesiId);

    // Hitung total kas masuk sesi ini
    let totalKasMasuk = 0;
    kehadiran.forEach(k => {
      if (k.status_pembayaran !== "Belum Bayar" && k.metode_pembayaran !== "Sponsor") {
        totalKasMasuk += Number(k.nominal_dibayar) || 0;
      }
    });

    const pemainHadir = kehadiran.filter(k => k.status_hadir).length;
    let totalDetik = 0;
    matches.forEach(m => {
      if (m.durasi_menit && m.durasi_menit.includes(":")) {
        const parts = m.durasi_menit.split(":");
        totalDetik += (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
      }
    });
    const avgDetikSession = matches.length > 0 ? Math.floor(totalDetik / matches.length) : 0;
    const avgWaktuSessionStr = padZero(Math.floor(avgDetikSession / 60)) + ":" + padZero(avgDetikSession % 60);

    // 1. Catat ke Arsip_Sesi_Harian
    const arsipId = "ARS-" + Utilities.getUuid().substring(0, 8);
    const snapshotJson = JSON.stringify({
      kehadiran: kehadiran,
      matches: matches,
      stats: stats
    });

    arsipSheet.appendRow([
      arsipId,
      sesiId,
      Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy HH:mm"),
      Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
      matches.length,
      pemainHadir,
      avgWaktuSessionStr,
      totalKasMasuk,
      snapshotJson,
      "admin"
    ]);

    // 2. Akumulasi ke Klasemen_Kumulatif
    const existingKumulatif = sheetToObjects(kumulatifSheet);
    const kumulatifMap = {};
    existingKumulatif.forEach(k => {
      kumulatifMap[k.nama_pemain] = k;
    });

    // Tambah kehadiran bagi yang hadir
    kehadiran.forEach(k => {
      if (k.status_hadir) {
        if (!kumulatifMap[k.nama_pemain]) {
          kumulatifMap[k.nama_pemain] = {
            member_id: k.member_id,
            nama_pemain: k.nama_pemain,
            total_hadir: 0, total_main: 0, total_menang: 0, total_kalah: 0,
            total_poin_menang: 0, total_poin_kalah: 0, total_selisih_poin: 0, total_poin: 0,
            total_durasi_detik: 0
          };
        }
        kumulatifMap[k.nama_pemain].total_hadir = (Number(kumulatifMap[k.nama_pemain].total_hadir) || 0) + 1;
      }
    });

    // Tambah statistik laga
    stats.forEach(s => {
      if (!kumulatifMap[s.nama_pemain]) {
        kumulatifMap[s.nama_pemain] = {
          member_id: s.member_id,
          nama_pemain: s.nama_pemain,
          total_hadir: 0, total_main: 0, total_menang: 0, total_kalah: 0,
          total_poin_menang: 0, total_poin_kalah: 0, total_selisih_poin: 0, total_poin: 0,
          total_durasi_detik: 0
        };
      }
      const km = kumulatifMap[s.nama_pemain];
      km.total_main = (Number(km.total_main) || 0) + (Number(s.main) || 0);
      km.total_menang = (Number(km.total_menang) || 0) + (Number(s.menang) || 0);
      km.total_kalah = (Number(km.total_kalah) || 0) + (Number(s.kalah) || 0);
      km.total_poin_menang = (Number(km.total_poin_menang) || 0) + (Number(s.poin_menang) || 0);
      km.total_poin_kalah = (Number(km.total_poin_kalah) || 0) + (Number(s.poin_kalah) || 0);
      km.total_poin = (Number(km.total_poin) || 0) + (Number(s.poin_total) || 0);
      km.total_selisih_poin = km.total_poin_menang - km.total_poin_kalah;
    });

    // Perbarui Klasemen_Kumulatif sheet
    kumulatifSheet.clearContents();
    kumulatifSheet.appendRow([
      "member_id", "nama_pemain", "total_hadir", "total_main", "total_menang", "total_kalah",
      "total_poin_menang", "total_poin_kalah", "total_selisih_poin", "total_poin", "total_durasi_detik", "updated_at"
    ]);
    kumulatifSheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#1e293b").setFontColor("#fff");

    const kumulatifRows = Object.values(kumulatifMap).map(k => [
      k.member_id || "", k.nama_pemain, k.total_hadir, k.total_main, k.total_menang, k.total_kalah,
      k.total_poin_menang, k.total_poin_kalah, k.total_selisih_poin, k.total_poin, k.total_durasi_detik || 0, now
    ]);
    if (kumulatifRows.length > 0) {
      kumulatifSheet.getRange(2, 1, kumulatifRows.length, 12).setValues(kumulatifRows);
    }

    // 3. Tambah main_match di Grading_Pemain
    const gradingData = gradingSheet.getDataRange().getValues();
    for (let i = 1; i < gradingData.length; i++) {
      const pName = gradingData[i][2];
      const pStat = stats.find(s => s.nama_pemain === pName);
      if (pStat) {
        gradingData[i][4] = (Number(gradingData[i][4]) || 0) + (Number(pStat.main) || 0);
        gradingData[i][7] = now;
      }
    }
    if (gradingData.length > 1) {
      gradingSheet.getRange(1, 1, gradingData.length, gradingData[0].length).setValues(gradingData);
    }

    // 4. Update status sesi menjadi SELESAI
    const sesiRows = sesiSheet.getDataRange().getValues();
    for (let i = 1; i < sesiRows.length; i++) {
      if (sesiRows[i][0] === sesiId) {
        sesiRows[i][7] = "SELESAI";
        sesiRows[i][10] = now;
        sesiSheet.getRange(i + 1, 1, 1, sesiRows[i].length).setValues([sesiRows[i]]);
        break;
      }
    }

    // 5. Buat Sesi Baru Otomatis
    createNewSessionInternal(ss, "Mabar Hari Ini", 2, 10000, 3000);

    logActivity("ARCHIVE_SESSION", "Sesi_Mabar", sesiId, `Sesi diarsipkan dengan ${matches.length} laga & total kas Rp ${totalKasMasuk}`, payload.role);
    return { success: true, message: "Sesi berhasil diarsipkan dan diakumulasikan ke Klasemen Kumulatif!" };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// RESET HANDLERS
// ==========================================
function resetDailySession(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const ss = getDatabaseSpreadsheet();
    const type = payload.type; // 'hari-ini' | 'kumulatif' | 'grading'

    if (type === "hari-ini") {
      const sesiId = payload.sesi_id;
      // Hapus pertandingan sesi ini
      deleteRowsByFilter(ss.getSheetByName("Pertandingan"), 1, sesiId);
      // Hapus kehadiran sesi ini
      deleteRowsByFilter(ss.getSheetByName("Kehadiran_Pembayaran"), 1, sesiId);
      // Hapus statistik sesi ini
      deleteRowsByFilter(ss.getSheetByName("Statistik_Harian"), 0, sesiId);

      logActivity("RESET_TODAY", "Sesi_Mabar", sesiId, "Reset data mabar hari ini", payload.role);
    } else if (type === "kumulatif") {
      const sheet = ss.getSheetByName("Klasemen_Kumulatif");
      sheet.clearContents();
      sheet.appendRow([
        "member_id", "nama_pemain", "total_hadir", "total_main", "total_menang", "total_kalah",
        "total_poin_menang", "total_poin_kalah", "total_selisih_poin", "total_poin", "total_durasi_detik", "updated_at"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#1e293b").setFontColor("#fff");

      const arsipSheet = ss.getSheetByName("Arsip_Sesi_Harian");
      arsipSheet.clearContents();
      arsipSheet.appendRow([
        "arsip_id", "sesi_id", "waktu_arsip", "tanggal_sesi", "total_pertandingan",
        "jumlah_pemain_hadir", "rata_rata_waktu_main", "total_kas_masuk", "snapshot_json", "diarsipkan_oleh"
      ]);
      arsipSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#1e293b").setFontColor("#fff");

      logActivity("RESET_CUMULATIVE", "Klasemen_Kumulatif", "ALL", "Reset klasemen kumulatif dan arsip sesi", payload.role);
    } else if (type === "grading") {
      const sheet = ss.getSheetByName("Grading_Pemain");
      sheet.clearContents();
      sheet.appendRow(["grading_id", "member_id", "nama_pemain", "nilai_grading", "main_match", "kategori", "catatan", "updated_at"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1e293b").setFontColor("#fff");

      logActivity("RESET_GRADING", "Grading_Pemain", "ALL", "Reset total database grading pemain", payload.role);
    }

    return { success: true, message: `Reset tipe ${type} berhasil dijalankan!` };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// GRADING CRUD & SMART RECOMMENDATIONS
// ==========================================
function updateGradingScore(payload) {
  checkAdminRole(payload.role);
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName("Grading_Pemain");
  const data = sheet.getDataRange().getValues();
  const now = getCurrentTimestamp();

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === payload.nama_pemain) {
      data[i][3] = Number(payload.nilai_grading);
      data[i][5] = payload.kategori || data[i][5];
      data[i][7] = now;
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      break;
    }
  }

  // Update juga di sheet Members
  const memberSheet = ss.getSheetByName("Members");
  const memberData = memberSheet.getDataRange().getValues();
  for (let i = 1; i < memberData.length; i++) {
    if (memberData[i][1] === payload.nama_pemain) {
      memberData[i][4] = Number(payload.nilai_grading);
      memberData[i][5] = payload.kategori || memberData[i][5];
      memberData[i][8] = now;
      memberSheet.getRange(i + 1, 1, 1, memberData[i].length).setValues([memberData[i]]);
      break;
    }
  }

  return { success: true };
}

function updateGradingBatch(payload) {
  checkAdminRole(payload.role);
  payload.updates.forEach(u => {
    updateGradingScore({
      nama_pemain: u.nama,
      nilai_grading: u.grading,
      kategori: u.kategori,
      role: payload.role
    });
  });
  return { success: true };
}

function saveGradingConfig(payload) {
  checkAdminRole(payload.role);
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName("Konfigurasi");
  const data = sheet.getDataRange().getValues();
  const now = getCurrentTimestamp();

  let updated = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "GRADING_LEVELS_JSON") {
      data[i][1] = JSON.stringify(payload.config_levels);
      data[i][3] = now;
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      updated = true;
      break;
    }
  }

  if (!updated) {
    sheet.appendRow(["GRADING_LEVELS_JSON", JSON.stringify(payload.config_levels), "Rentang kategori grading", now]);
  }

  return { success: true };
}

// ==========================================
// MADING & GOOGLE DRIVE UPLOAD
// ==========================================
function saveMadingPost(payload) {
  checkAdminRole(payload.role);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Mading");
    const madingData = sheet.getDataRange().getValues();
    const now = getCurrentTimestamp();

    const madingId = payload.mading_id || ("MD-" + Utilities.getUuid().substring(0, 8));
    let existingIndex = -1;

    for (let i = 1; i < madingData.length; i++) {
      if (madingData[i][0] === madingId) {
        existingIndex = i;
        break;
      }
    }

    const rowData = [
      madingId,
      payload.type || "post",
      payload.title || "",
      payload.content || "",
      payload.nama || "",
      payload.hp || "",
      payload.url_gambar || "",
      payload.drive_file_id || "",
      payload.link_url || "",
      payload.style_class || "pin-yellow",
      Number(payload.font_size) || 13,
      Boolean(payload.is_minimized),
      Number(payload.x) || 20,
      Number(payload.y) || 20,
      Number(payload.w) || 250,
      Number(payload.h) || 180,
      Number(payload.rot) || 0,
      Number(payload.z_index) || 10,
      Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd"),
      "ACTIVE",
      "admin",
      existingIndex !== -1 ? madingData[existingIndex][21] : now,
      now
    ];

    if (existingIndex !== -1) {
      sheet.getRange(existingIndex + 1, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return { success: true, mading_id: madingId };
  } finally {
    lock.releaseLock();
  }
}

function deleteMadingPost(payload) {
  checkAdminRole(payload.role);
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName("Mading");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.mading_id) {
      // Hapus berkas drive jika ada
      const driveFileId = data[i][7];
      if (driveFileId) {
        try { DriveApp.getFileById(driveFileId).setTrashed(true); } catch (e) {}
      }
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return { success: true };
}

/**
 * Upload file/gambar ke Google Drive folder khusus
 */
function uploadFileToDrive(payload) {
  checkAdminRole(payload.role);
  try {
    const props = PropertiesService.getScriptProperties();
    let folderId = props.getProperty("GDRIVE_FOLDER_ID");
    let folder;

    if (folderId) {
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (e) {
        Logger.log("Folder ID tidak ditemukan, membuat baru...");
      }
    }

    if (!folder) {
      folder = DriveApp.createFolder("LOB_SERANG_UPLOADS");
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      props.setProperty("GDRIVE_FOLDER_ID", folder.getId());
    }

    const decodedData = Utilities.base64Decode(payload.base64Data);
    const blob = Utilities.newBlob(decodedData, payload.mimeType || "image/jpeg", payload.fileName || "mading_upload.jpg");
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const driveUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
    return {
      success: true,
      fileId: file.getId(),
      url: driveUrl,
      downloadUrl: file.getDownloadUrl()
    };
  } catch (err) {
    Logger.log("Gagal upload ke Drive: " + err.message);
    return { success: false, error: err.message };
  }
}

// ==========================================
// EXPORT DATA (CSV / REKAP FILTER)
// ==========================================
function exportData(payload) {
  const ss = getDatabaseSpreadsheet();
  const type = payload.type; // 'HARIAN' | 'KUMULATIF' | 'KAS'
  let sheetName = "Statistik_Harian";

  if (type === "KUMULATIF") sheetName = "Klasemen_Kumulatif";
  else if (type === "KAS") sheetName = "Kehadiran_Pembayaran";
  else if (type === "PERTANDINGAN") sheetName = "Pertandingan";

  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  return {
    success: true,
    sheetName: sheetName,
    data: data,
    generatedAt: Utilities.formatDate(new Date(), TIMEZONE, "dd-MM-yyyy HH:mm")
  };
}

// ==========================================
// UTILITAS BANTU
// ==========================================
function sheetToObjects(sheet) {
  if (!sheet || sheet.getLastRow() === 0) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const objects = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    objects.push(obj);
  }
  return objects;
}

function deleteRowsByFilter(sheet, colIndex, filterValue) {
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][colIndex] === filterValue) {
      sheet.deleteRow(i + 1);
    }
  }
}

function getCurrentTimestamp() {
  return Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}

function padZero(num) {
  return num < 10 ? "0" + num : "" + num;
}

function logActivity(aksi, entitas, entitasId, detail, userRole) {
  try {
    const ss = getDatabaseSpreadsheet();
    const sheet = ss.getSheetByName("Log_Aktivitas");
    if (!sheet) return;
    sheet.appendRow([
      "LOG-" + Utilities.getUuid().substring(0, 8),
      getCurrentTimestamp(),
      userRole || "system",
      aksi,
      entitas,
      entitasId || "-",
      detail || ""
    ]);
  } catch (e) {
    Logger.log("Gagal mencatat log: " + e.message);
  }
}
