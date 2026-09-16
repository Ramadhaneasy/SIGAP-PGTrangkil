const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "..", "PANDUAN_INSTALASI_SIGAP_PG_TRANGKIL.pdf");
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Palet Warna Resmi SIGAP
const PRIMARY = "#0369a1"; // sky-700
const PRIMARY_DARK = "#075985"; // sky-800
const TEXT_MAIN = "#1e293b"; // slate-800
const TEXT_MUTED = "#64748b"; // slate-500
const BG_CARD = "#f8fafc"; // slate-50
const BORDER_COLOR = "#cbd5e1"; // slate-300
const ACCENT_EMERALD = "#047857"; // emerald-700
const ACCENT_AMBER = "#b45309"; // amber-700
const ACCENT_PURPLE = "#7e22ce"; // purple-700

function drawHeader(title) {
  doc.rect(45, 35, 505, 3).fill(PRIMARY);
  doc.fontSize(8).fillColor(TEXT_MUTED).text("SIGAP — PT KEBON AGUNG PABRIK GULA TRANGKIL", 45, 23, { align: "left" });
  doc.fontSize(8).fillColor(TEXT_MUTED).text(title, 45, 23, { align: "right" });
  doc.y = 48;
}

function drawSectionTitle(text, iconText = "") {
  doc.moveDown(0.8);
  const y = doc.y;
  doc.rect(45, y, 4, 16).fill(PRIMARY);
  doc.fontSize(13).font("Helvetica-Bold").fillColor(PRIMARY_DARK).text(`   ${iconText} ${text}`, 45, y + 1);
  doc.moveDown(0.5);
}

function drawCard(title, contentArray, bgColor = BG_CARD, borderColor = BORDER_COLOR) {
  const startY = doc.y;
  const cardWidth = 505;
  const padding = 10;

  // Measure content height roughly
  doc.fontSize(9).font("Helvetica");
  let estimatedHeight = 24 + contentArray.length * 14;

  doc.roundedRect(45, startY, cardWidth, estimatedHeight, 6).fillAndStroke(bgColor, borderColor);

  doc.fillColor(PRIMARY_DARK).font("Helvetica-Bold").fontSize(10).text(title, 45 + padding, startY + 8);

  let currentY = startY + 24;
  contentArray.forEach((line) => {
    doc.fillColor(TEXT_MAIN).font("Helvetica").fontSize(8.5).text(line, 45 + padding, currentY, {
      width: cardWidth - padding * 2,
    });
    currentY += 13;
  });

  doc.y = startY + estimatedHeight + 8;
}

function drawStep(num, title, desc, command = null) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor(PRIMARY).text(`[ Langkah ${num} ] ${title}`);
  doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN).text(desc, { indent: 10, lineGap: 2 });
  if (command) {
    doc.moveDown(0.2);
    const boxY = doc.y;
    doc.roundedRect(55, boxY, 495, 20, 4).fillAndStroke("#0f172a", "#334155");
    doc.fontSize(8.5).font("Courier-Bold").fillColor("#38bdf8").text(`$ ${command}`, 65, boxY + 5);
    doc.moveDown(0.4);
    doc.y = boxY + 26;
  } else {
    doc.moveDown(0.4);
  }
}

// ==========================================
// HALAMAN 1: COVER & PENGENALAN
// ==========================================
drawHeader("DOKUMEN PANDUAN PENGEMBANGAN");

doc.moveDown(1.5);
doc.rect(45, doc.y, 505, 80).fillAndStroke("#f0f9ff", "#bae6fd");
doc.fontSize(18).font("Helvetica-Bold").fillColor(PRIMARY_DARK).text("BUKU PANDUAN LENGKAP", 60, 68, { align: "center" });
doc.fontSize(13).font("Helvetica-Bold").fillColor(TEXT_MAIN).text("INSTALASI, KONFIGURASI & PENGOPERASIAN APLIKASI SIGAP", 60, 92, { align: "center" });
doc.fontSize(9).font("Helvetica").fillColor(PRIMARY).text("Sistem Informasi Gangguan & Pelaporan • PT Kebon Agung PG Trangkil", 60, 112, { align: "center" });

doc.y = 155;

drawSectionTitle("1. Tentang Aplikasi SIGAP");
doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN).text(
  "SIGAP (Sistem Informasi Gangguan & Pelaporan) adalah platform digital terpadu yang dibangun untuk mengelola, mencatat, dan memantau penanganan kerusakan fasilitas, permesinan, dan infrastruktur di Pabrik Gula Trangkil secara transparan, akurat, dan realtime berbasis Next.js dan database MySQL.",
  { align: "justify", lineGap: 2 }
);

drawSectionTitle("2. Prasyarat Sistem (System Requirements)");
drawCard("Software yang Wajib Terpasang di Laptop / Komputer Baru:", [
  "1. Node.js (Versi 18 LTS atau Versi 20 LTS) — Download resmi: https://nodejs.org",
  "2. XAMPP / MySQL Server (Versi 8.0+ / MariaDB 10+) — Untuk database relasional lokal.",
  "3. Visual Studio Code — Text editor yang disarankan untuk membuka proyek.",
  "4. Browser Modern (Google Chrome, Microsoft Edge, atau Mozilla Firefox).",
  "5. Git (Opsional, untuk pull/push pembaruan dari repository GitHub).",
]);

drawSectionTitle("3. Tips Memindahkan File Proyek (ZIP File)");
drawCard("PENTING: Jangan masukkan folder berikut ke dalam ZIP agar ringan & cepat:", [
  "• node_modules/  -> Folder library (akan dibuat otomatis saat 'npm install')",
  "• .next/         -> Folder cache build Next.js (dibuat otomatis saat build/dev)",
  "Ukuran proyek bersih tanpa node_modules hanya sekitar 1-5 MB saja.",
], "#fffbeb", "#fde68a");

// ==========================================
// HALAMAN 2: SETUP DATABASE & ENV
// ==========================================
doc.addPage();
drawHeader("SETUP DATABASE & ENVIRONMENT");

drawSectionTitle("4. Menyiapkan Database MySQL di XAMPP");

drawStep(
  "1",
  "Nyalakan MySQL di XAMPP Control Panel",
  "Buka aplikasi XAMPP Control Panel pada komputer Anda, lalu klik tombol 'Start' pada modul Apache dan MySQL hingga indikator berubah menjadi warna hijau."
);

drawStep(
  "2",
  "Buka phpMyAdmin di Browser",
  "Buka browser dan kunjungi tautan: http://localhost/phpmyadmin"
);

drawStep(
  "3",
  "Buat Database Baru",
  "Klik menu 'New' di bilah kiri phpMyAdmin. Pada kolom nama basis data, ketik persis: 'sigap_db' dengan collation 'utf8mb4_unicode_ci', lalu klik tombol 'Create / Buat'."
);

drawStep(
  "4",
  "Import File sigap_mysql_dump.sql",
  "Pilih database 'sigap_db' yang baru dibuat -> klik tab 'Import' di menu atas -> klik 'Choose File' dan pilih berkas 'sigap_mysql_dump.sql' dari folder proyek -> scroll ke bawah dan klik tombol 'Import'."
);

drawSectionTitle("5. Konfigurasi File Lingkungan (.env)");
doc.fontSize(9).font("Helvetica").fillColor(TEXT_MAIN).text(
  "Buat file bernama '.env' di folder utama (root) proyek SIGAP Anda, lalu salin konfigurasi berikut:",
  { lineGap: 2 }
);
doc.moveDown(0.3);

const envBoxY = doc.y;
doc.roundedRect(45, envBoxY, 505, 95, 6).fillAndStroke("#0f172a", "#334155");
doc.fontSize(8.5).font("Courier").fillColor("#94a3b8").text("# 1. Koneksi MySQL Lokal (User default root, tanpa password)", 55, envBoxY + 8);
doc.font("Courier-Bold").fillColor("#38bdf8").text('DATABASE_URL="mysql://root:@localhost:3306/sigap_db"', 55, envBoxY + 22);
doc.font("Courier").fillColor("#94a3b8").text("# 2. Kunci Rahasia JWT Token (Acak, minimal 32 karakter)", 55, envBoxY + 40);
doc.font("Courier-Bold").fillColor("#38bdf8").text('JWT_SECRET="sigap_pg_trangkil_super_secret_production_key_2026"', 55, envBoxY + 54);
doc.font("Courier").fillColor("#94a3b8").text("# 3. URL Domain Aplikasi", 55, envBoxY + 72);
doc.font("Courier-Bold").fillColor("#38bdf8").text('NEXT_PUBLIC_APP_URL="http://localhost:3000"', 55, envBoxY + 84);

doc.y = envBoxY + 105;

drawCard("Catatan Konfigurasi di Hosting (Vercel):", [
  "File .env di komputer lokal sengaja disembunyikan oleh .gitignore demi keamanan.",
  "Saat deploy ke Vercel, masukkan variabel DATABASE_URL, JWT_SECRET, dan NEXT_PUBLIC_APP_URL di menu: Project Settings -> Environment Variables.",
], "#f0fdf4", "#bbf7d0");

// ==========================================
// HALAMAN 3: EKSEKUSI & CARA MENJALANKAN
// ==========================================
doc.addPage();
drawHeader("CARA INSTALASI & MENJALANKAN APLIKASI");

drawSectionTitle("6. Langkah Eksekusi Perintah di Terminal");

drawStep(
  "1",
  "Ekstrak File Proyek & Buka Terminal di VS Code",
  "Ekstrak folder SIGAP di laptop Anda. Buka folder tersebut menggunakan Visual Studio Code. Buka terminal terintegrasi dengan menekan shortcut 'Ctrl + ~' (atau menu Terminal -> New Terminal)."
);

drawStep(
  "2",
  "Install Seluruh Library & Dependencies",
  "Unduh seluruh paket pustaka yang terdaftar di package.json dengan menjalankan perintah:",
  "npm install"
);

drawStep(
  "3",
  "Generate Prisma Client",
  "Sinkronkan skema database Prisma agar ORM mengenali tabel-tabel MySQL:",
  "npx prisma generate"
);

drawStep(
  "4",
  "Jalankan Aplikasi dalam Mode Pengembangan (Dev Server)",
  "Nyalakan server lokal Next.js dengan perintah:",
  "npm run dev"
);

drawSectionTitle("7. Alamat URL Akses Aplikasi");
drawCard("Tautan Web yang Dapat Dibuka di Browser:", [
  "• Halaman Utama Pengguna (Landing) : http://localhost:3000",
  "• Formulir Buat Laporan Kerusakan  : http://localhost:3000/lapor",
  "• Halaman Cek Status Laporan        : http://localhost:3000/cek-status",
  "• Halaman Login Administrator       : http://localhost:3000/admin/login",
  "• Panel Dashboard Admin             : http://localhost:3000/admin/dashboard",
]);

drawSectionTitle("8. Kredensial Akun Login Bawaan");
drawCard("Akun Super Admin Resmi (Bawaan Database):", [
  "• Hak Akses : SUPER_ADMIN (Akses Penuh Kelola Admin, Audit Log & Laporan)",
  "• Username  : superadmin",
  "• Password  : super123",
  "Catatan: Setelah login, Super Admin dapat mendaftarkan akun Admin Teknis lainnya melalui menu 'Daftar & Kelola Admin'.",
], "#faf5ff", "#e9d5ff");

// ==========================================
// HALAMAN 4: FITUR & TROUBLESHOOTING
// ==========================================
doc.addPage();
drawHeader("FITUR UTAMA & PANDUAN PEMECAHAN MASALAH");

drawSectionTitle("9. Ringkasan Fitur Unggulan SIGAP");

drawCard("Fitur untuk Pengguna / Pelapor Pabrik:", [
  "1. Buat Laporan Cepat: Pengisian formulir online tanpa login, otomatis menghasilkan nomor tiket resmi (Contoh: TEK-2608-001, PAB-2608-001).",
  "2. Kompresi Foto Otomatis: Foto kamera HP dikompresi di sisi klien sehingga unggahan cepat.",
  "3. Cek Status Realtime: Filter bagian, status, dan sorting terbaru/terlama.",
  "4. Riwayat Penanganan & Solusi: Mengetahui tindakan perbaikan yang telah dilakukan teknisi.",
]);

drawCard("Fitur Panel Administrator & Super Admin:", [
  "1. Manage Laporan Aktif: Disposisi laporan dari Menunggu -> Diproses -> Selesai.",
  "2. Riwayat & Ekspor Data: Arsip laporan selesai + fitur ekspor laporan ke format Excel & PDF.",
  "3. Notifikasi Realtime: Browser push notification & audio lonceng saat ada laporan baru masuk.",
  "4. Kelola Admin: Super Admin dapat menambah akun teknisi, edit role, ban/unban akun.",
  "5. Audit Trail Log: Seluruh aktivitas administratif terekam otomatis dan tidak dapat dimanipulasi.",
]);

drawSectionTitle("10. Troubleshooting (Solusi Kendala Umum)");

drawCard("FAQ & Solusi Cepat:", [
  "Q: Muncul error 'Can't reach database server at localhost:3306'?",
  "A: Pastikan modul MySQL di XAMPP Control Panel sudah dalam status START (warna hijau).",
  "",
  "Q: Muncul pesan error 'PrismaClientInitializationError'?",
  "A: Jalankan perintah: 'npx prisma generate' lalu restart dev server ('npm run dev').",
  "",
  "Q: Ingin reset database dari nol secara otomatis?",
  "A: Jalankan perintah: 'npm run db:setup' (Otomatis push schema dan inject akun superadmin).",
], "#fff1f2", "#fecdd3");

// Footer Penutup
doc.moveDown(1);
doc.rect(45, doc.y, 505, 35).fillAndStroke("#f8fafc", "#e2e8f0");
doc.fontSize(8.5).font("Helvetica-Bold").fillColor(PRIMARY_DARK).text("SIGAP — PT KEBON AGUNG PABRIK GULA TRANGKIL", 55, doc.y - 28, { align: "center" });
doc.fontSize(8).font("Helvetica").fillColor(TEXT_MUTED).text("Dokumentasi Resmi & Panduan Teknis Sistem Informasi Gangguan & Pelaporan Pabrik Gula Trangkil", 55, doc.y - 14, { align: "center" });

// Penomoran Halaman Otomatis
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.fontSize(8).fillColor(TEXT_MUTED).text(
    `Halaman ${i + 1} dari ${range.count}`,
    45,
    doc.page.height - 30,
    { align: "center", width: 505 }
  );
}

doc.end();

writeStream.on("finish", () => {
  console.log("PDF Berhasil dibuat di:", outputPath);
});
