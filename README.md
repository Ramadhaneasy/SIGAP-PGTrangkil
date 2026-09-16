# 🏭 SIGAP &bull; Sistem Informasi Gangguan & Perbaikan

**PT Kebon Agung &bull; Pabrik Gula Trangkil**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql)
![XAMPP](https://img.shields.io/badge/XAMPP-Local_Server-FB7A24?style=flat-square&logo=xampp)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss)

**SIGAP** adalah platform web sistem pelaporan gangguan dan perbaikan fasilitas serta peralatan kerja di **PT Kebon Agung Pabrik Gula Trangkil**. Aplikasi ini dirancang untuk mempercepat respons perbaikan teknis, meningkatkan transparansi penanganan kendala di lapangan, serta menyediakan manajemen arsip data perbaikan secara efisien.

---

## ✨ Fitur-Fitur Utama

### 👤 Modul Publik & Pelapor (User Side)

- **Formulir Laporan Gangguan (`/lapor`)**: Form pelaporan dengan generator nomor tiket otomatis (format `[BAGIAN]-DDMM-XXX`, contoh: `TUK-1609-002`), pilihan unit/bagian kerja, lokasi kendala, rincian kerusakan, dan kompresi foto lampiran otomatis.
- **Pencarian & Cek Status Tiket (`/cek-status`)**: Pelacakan status perbaikan real-time berdasarkan nomor tiket laporan tanpa perlu login.
- **Papan Perkembangan Tiket (`/status/[ticketNumber]`)**: Tampilan alur progres perbaikan 4 langkah (_Form Dikirim &rarr; Menunggu Disposisi &rarr; Sedang Diproses &rarr; Perbaikan Selesai_).
- **Riwayat Tiket Lokal**: Penyimpanan otomatis nomor tiket laporan di peranti pelapor untuk kemudahan akses kembali.

### 🛡️ Modul Panel Admin SIGAP (Admin Side)

- **Dashboard Analitik (`/admin/dashboard`)**: Ringkasan 5 statistik utama (_Total Laporan, Menunggu, Diproses, Selesai, Petugas Admin_) dan feed Log Aktivitas terbaru.
- **Manajemen Laporan Aktif (`/admin/laporan`)**: Pengelolaan laporan berstatus `MENUNGGU` & `DIPROSES`. Laporan yang telah berstatus `SELESAI` otomatis dipindahkan ke arsip riwayat.
- **Riwayat & Arsip Perbaikan (`/admin/riwayat`)**: Pengarsipan data laporan tuntas dengan filter tanggal, pencarian kata kunci, serta opsi ekspor dokumen (PDF F4 Portrait / Excel XLSX / Word DOCX / TXT).
- **Kelola Akun Admin (`/admin/kelola-admin`)**: Manajemen pengguna admin oleh Super Admin, termasuk fitur penonaktifan/banned berjangka maupun permanen.
- **Audit Log Aktivitas (`/admin/log-aktivitas`)**: Pencatatan riwayat tindakan admin (perubahan status laporan, pembaruan profil, penambahan/banned admin).
- **Pengaturan Profil (`/admin/pengaturan`)**: Pembaruan profil dengan verifikasi keamanan kata sandi saat menyimpan perubahan.

---

## 🛠️ Teknologi & Arsitektur

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React Server Components, API Routes)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: Database [MySQL](https://www.mysql.com/) dengan [Prisma ORM](https://www.prisma.io/)
- **Server Lokal**: **XAMPP** (Apache & MySQL Control Panel / phpMyAdmin)
- **Desain & UI**: [TailwindCSS v4](https://tailwindcss.com/), Radix UI, Lucide Icons, dan Motion Animation
- **Tipografi**: Google Font `Poppins` (Font Utama) & `JetBrains Mono` (Nomor Tiket & Kode Log)
- **Autentikasi**: JWT (JSON Web Token) dengan penyimpanan HttpOnly Cookie & Bcrypt Password Hashing

---

## 📐 Panduan Desain & Style Guide

Aplikasi ini menggunakan standar panduan visual resmi **PT Kebon Agung PG Trangkil**. Dokumentasi lengkap warna, tipografi, dan prinsip desain minimalis dapat dilihat pada dokumen:

👉 [**STYLE_GUIDE.md**](./STYLE_GUIDE.md)

---

## 🚀 Cara Menjalankan Proyek (Getting Started)

### 1. Prasyarat Sistem

- **Node.js**: v18.18.0 atau versi yang lebih baru (disarankan LTS v20.x atau v22.x)
- **Server Database MySQL**: Dapat dijalankan menggunakan **XAMPP Control Panel** (Aktifkan modul MySQL & Apache/phpMyAdmin)

### 2. Instalasi Dependensi

```bash
# Clone repositori proyek
git clone https://github.com/Ramadhaneasy/SIGAP-PGTrangkil.git sigap-pgtk
cd sigap-pgtk

# Instal dependensi paket
npm install
```

### 3. Konfigurasi Environment Variable

Buat file `.env` di root proyek dan lengkapi konfigurasi variabel lingkungan yang dibutuhkan sesuai dengan environment database dan rahasia JWT server Anda.

### 4. Migrasi & Seed Database

```bash
# Sinkronisasi skema database Prisma
npx prisma db push

# Menjalankan data awal admin default
npx prisma db seed
```

### 5. Menjalankan Server Pengembang

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat aplikasi SIGAP.

---

## 📂 Struktur Folder & Fungsi File Proyek

Berikut adalah rincian struktur direktori serta fungsi masing-masing folder dan file utama dalam repositori **SIGAP**:

```text
sigap-pgtk/
├── 📁 prisma/                       # Konfigurasi & Schema Database Prisma ORM
│   ├── 📄 schema.prisma             # Definisi skema tabel MySQL (admin_users, reports, activity_logs)
│   └── 📄 seed.ts                   # Script pengisian data awal default Super Admin
│
├── 📁 public/                       # Asset gambar statis & favicon
│   ├── 📁 assets/images/            # Logo PT Kebon Agung & PG Trangkil
│   │   ├── 🖼️ logo-ka.png           # Logo resmi PT Kebon Agung (Canvas Rasio 1:1)
│   │   └── 🖼️ logo-pg-trangkil.png  # Logo resmi Pabrik Gula Trangkil (Kop Surat & Cetak PDF)
│   ├── 📄 sw.js                     # Service Worker untuk Web Push Notifications
│   └── 🖼️ favicon.ico               # Icon tab browser
│
├── 📁 src/                          # Kode Sumber Utama Aplikasi (Next.js App Router)
│   ├── 📁 app/                      # Direktori Routing & API Endpoints Next.js
│   │   ├── 📁 (user)/               # Halaman Publik / Pelapor (Masyarakat & Pegawai)
│   │   │   ├── 📁 cek-status/       # Halaman pencarian status laporan (cek-status-view.tsx)
│   │   │   ├── 📁 lapor/            # Halaman formulir buat laporan baru (lapor-view.tsx)
│   │   │   ├── 📁 status/[ticketNumber]/ # Halaman detail stepper progres perbaikan tiket
│   │   │   ├── 📄 layout.tsx        # Wrapper layout publik (Header & Footer pelapor)
│   │   │   └── 📄 page.tsx          # Landing page utama SIGAP (landing-view.tsx)
│   │   │
│   │   ├── 📁 admin/                # Panel Operasional Administrasi Admin
│   │   │   ├── 📁 (dashboard)/      # Kelompok halaman terlindungi sesi login admin
│   │   │   │   ├── 📁 dashboard/    # Halaman Dashboard Analitik & Feed Aktivitas
│   │   │   │   ├── 📁 kelola-admin/ # Halaman Manajemen Akun Admin, Banned & Akses Super Admin
│   │   │   │   ├── 📁 laporan/      # Halaman Manajemen Laporan Aktif (MENUNGGU & DIPROSES)
│   │   │   │   ├── 📁 log-aktivitas/# Halaman Audit Log Aktivitas Operasional
│   │   │   │   ├── 📁 pengaturan/   # Halaman Pengaturan Profil Admin & Ganti Password
│   │   │   │   ├── 📁 riwayat/      # Halaman Arsip Riwayat Laporan Selesai & Export
│   │   │   │   └── 📄 layout.tsx    # Wrapper layout admin (Sidebar & Header Admin)
│   │   │   └── 📁 login/            # Halaman Form Login Admin (login-view.tsx)
│   │   │
│   │   ├── 📁 api/                  # Backend API Routes (REST API Endpoints)
│   │   │   ├── 📁 admin/            # API internal admin (login, logout, me, profile, users)
│   │   │   └── 📁 reports/          # API laporan (buat laporan, update status, cek tiket)
│   │   │
│   │   ├── 📄 globals.css           # Stylesheet global & TailwindCSS base style
│   │   ├── 📄 icon.png / favicon.ico# Favicon tab browser (Logo KA Centered 1:1)
│   │   └── 📄 layout.tsx            # Root Layout Aplikasi (Font Poppins & Metadata)
│   │
│   ├── 📁 components/               # Komponen UI React Reusable
│   │   ├── 📁 admin/                # Komponen UI khusus Admin (Header, Sidebar, StatCard, ExportDialog)
│   │   ├── 📁 mobile/               # Komponen tampilan responsif khusus smartphone / HP
│   │   ├── 📁 ui/                   # Atom UI Components (Button, Card, Input, Dialog, EmptyState, Table)
│   │   └── 📁 user/                 # Komponen UI khusus Pelapor Publik (Form Lapor, SearchForm)
│   │
│   ├── 📁 lib/                      # Helper, Utility & Logic Business Layer
│   │   ├── 📄 admin-services.ts     # Query database MySQL & audit log operasional admin
│   │   ├── 📄 auth.ts               # Autentikasi JWT token, verifikasi sesi cookie & Bcrypt
│   │   ├── 📄 date-utils.ts         # Utility format tanggal & waktu Bahasa Indonesia
│   │   ├── 📄 db.ts                 # Koneksi Prisma Client Singleton ke Database MySQL
│   │   ├── 📄 export-utils.ts       # Utility ekspor berkas arsip (PDF F4, Excel XLSX, Word DOCX, TXT)
│   │   ├── 📄 image-compressor.ts   # Kompresi gambar browser sebelum dikirim ke server
│   │   ├── 📄 notifications.ts      # Helper manajemen notifikasi lokal browser admin
│   │   ├── 📄 rate-limit.ts         # Proteksi rate limiting request
│   │   └── 📄 report-services.ts    # Logika bisnis laporan (buat tiket, ubah status, pencarian)
│   │
│   ├── 📁 types/                    # Definisi Type Definition TypeScript
│   │   └── 📄 index.ts              # Interface global TypeScript (Report, AdminUser, Log, Status)
│   │
│   └── 📄 proxy.ts                  # Server Proxy HTTP untuk routing & cookie forwarding
│
├── 📄 STYLE_GUIDE.md                # Dokumentasi Standar Desain Visual PG Trangkil
└── 📄 README.md                     # Dokumentasi Utama Proyek SIGAP
```

---

© **PT Kebon Agung &bull; Pabrik Gula Trangkil**.

