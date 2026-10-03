export const GAS_TEMPLATES = {
  "Code.gs": `/**
 * ============================================================================
 * LOB SERANG 2 - GOOGLE APPS SCRIPT BACKEND
 * Database: "LOB SERANG DATABASE"
 * ============================================================================
 */
const SPREADSHEET_NAME = "LOB SERANG DATABASE";
const DEFAULT_ADMIN_PASSWORD = "lobserangmlg";
const TIMEZONE = "Asia/Jakarta";

function doGet(e) {
  const template = HtmlService.createTemplateFromFile("Index");
  return template.evaluate()
    .setTitle("Lob Serang 2 - Badminton Management TaheSquat")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getDatabaseSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty("SPREADSHEET_ID");
  if (ssId) {
    try { return SpreadsheetApp.openById(ssId); } catch (e) {}
  }
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    const file = files.next();
    props.setProperty("SPREADSHEET_ID", file.getId());
    return SpreadsheetApp.openById(file.getId());
  }
  const newSs = SpreadsheetApp.create(SPREADSHEET_NAME);
  props.setProperty("SPREADSHEET_ID", newSs.getId());
  initializeDatabase(newSs.getId());
  return newSs;
}

function initializeDatabase(explicitSsId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const ssId = explicitSsId || props.getProperty("SPREADSHEET_ID") || getDatabaseSpreadsheet().getId();
    const ss = SpreadsheetApp.openById(ssId);
    props.setProperty("SPREADSHEET_ID", ssId);
    if (!props.getProperty("ADMIN_PASSWORD")) {
      props.setProperty("ADMIN_PASSWORD", DEFAULT_ADMIN_PASSWORD);
    }
    const sheets = [
      { name: "Members", headers: ["member_id", "nama_pemain", "status_aktif", "tanggal_daftar", "grading", "kategori_level", "catatan", "created_at", "updated_at"] },
      { name: "Sesi_Mabar", headers: ["sesi_id", "tanggal_sesi", "judul_sesi", "jumlah_lapangan", "biaya_lapangan_per_pemain", "biaya_shuttlecock_per_pemain", "biaya_total_default_per_pemain", "status_sesi", "created_by", "created_at", "updated_at"] },
      { name: "Kehadiran_Pembayaran", headers: ["kehadiran_id", "sesi_id", "member_id", "nama_pemain", "status_hadir", "jam_kedatangan", "status_pembayaran", "metode_pembayaran", "biaya_lapangan_per_pemain", "biaya_shuttlecock_per_pemain", "jumlah_shuttlecock_tambahan", "biaya_shuttlecock_tambahan", "total_biaya_shuttlecock", "total_tagihan", "nominal_dibayar", "sisa_tagihan", "tanggal_pembayaran", "catatan", "updated_at"] },
      { name: "Pertandingan", headers: ["match_id", "sesi_id", "tanggal_pertandingan", "lapangan", "tim_a_pemain_1", "tim_a_pemain_2", "tim_b_pemain_1", "tim_b_pemain_2", "skor_tim_a", "skor_tim_b", "pemenang", "durasi_menit", "jumlah_shuttlecock_tambahan", "detail_pemain_cock", "status_pertandingan", "created_at", "updated_at"] },
      { name: "Shuttlecock_Tambahan", headers: ["shuttlecock_id", "sesi_id", "match_id", "tanggal", "lapangan", "partai", "nama_pemain", "jumlah_cock", "biaya_per_cock", "subtotal", "status_bayar_pemain", "created_at"] },
      { name: "Statistik_Harian", headers: ["sesi_id", "member_id", "nama_pemain", "main", "menang", "kalah", "poin_menang", "poin_kalah", "selisih_poin", "poin_total", "rata_rata_waktu_main", "form_5_laga", "updated_at"] },
      { name: "Klasemen_Kumulatif", headers: ["member_id", "nama_pemain", "total_hadir", "total_main", "total_menang", "total_kalah", "total_poin_menang", "total_poin_kalah", "total_selisih_poin", "total_poin", "total_durasi_detik", "updated_at"] },
      { name: "Arsip_Sesi_Harian", headers: ["arsip_id", "sesi_id", "waktu_arsip", "tanggal_sesi", "total_pertandingan", "jumlah_pemain_hadir", "rata_rata_waktu_main", "total_kas_masuk", "snapshot_json", "diarsipkan_oleh"] },
      { name: "Mading", headers: ["mading_id", "type", "title", "content", "nama", "hp", "url_gambar", "drive_file_id", "link_url", "style_class", "font_size", "is_minimized", "x", "y", "w", "h", "rot", "z_index", "tanggal_publish", "status_publish", "created_by", "created_at", "updated_at"] },
      { name: "Grading_Pemain", headers: ["grading_id", "member_id", "nama_pemain", "nilai_grading", "main_match", "kategori", "catatan", "updated_at"] },
      { name: "Konfigurasi", headers: ["config_key", "config_value", "deskripsi", "updated_at"] },
      { name: "Log_Aktivitas", headers: ["log_id", "timestamp", "user_role", "aksi", "entitas", "entitas_id", "detail"] }
    ];
    sheets.forEach(cfg => {
      let sheet = ss.getSheetByName(cfg.name);
      if (!sheet) sheet = ss.insertSheet(cfg.name);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(cfg.headers);
        sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#fff");
        sheet.setFrozenRows(1);
      }
    });
    return { success: true, message: "Database siap!", spreadsheetId: ssId };
  } finally { lock.releaseLock(); }
}

function verifyAdmin(password) {
  const props = PropertiesService.getScriptProperties();
  const valid = props.getProperty("ADMIN_PASSWORD") || DEFAULT_ADMIN_PASSWORD;
  if (password === valid) {
    return { success: true, role: "admin" };
  }
  return { success: false, message: "Password Admin salah!" };
}
// Seluruh fungsi lengkap tersedia pada file /google-apps-script/Code.gs di proyek ini`,

  "appsscript.json": `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  },
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.properties"
  ],
  "runtimeVersion": "V8"
}`,

  "README.md": `# Panduan Lengkap Instalasi Google Apps Script
Lihat file /google-apps-script/README.md untuk langkah deployment dan konfigurasi Google Sheets & Google Drive.`
};
