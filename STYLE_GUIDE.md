# SIGAP &bull; Design System & Style Guide
**PT Kebon Agung &bull; Pabrik Gula Trangkil**

Panduan standar desain visual, warna, tipografi, dan komponen antarmuka antarmuka (UI/UX) untuk aplikasi web **SIGAP (Sistem Informasi Gangguan & Perbaikan)**.

---

## 🎨 1. Skema Warna (Color Palette)

Aplikasi SIGAP mengusung identitas warna resmi **PT Kebon Agung PG Trangkil**, berbasis warna **Biru Logo** dan **Putih Crisp Minimalis** untuk memberikan kesan profesional, bersih, dan modern.

### 🔷 Warna Utama (Primary Corporate Colors)
| Elemen | Hex Code | Tailwind Class | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Primary Logo Blue** | `#0284C7` | `bg-sky-700`, `text-sky-700` | Tombol utama, header status, & aksen merek resmi |
| **Primary Blue Hover** | `#0369A1` | `hover:bg-sky-800` | State hover tombol utama |
| **Accent Sky Blue** | `#38BDF8` | `bg-sky-400`, `text-sky-600` | Indikator aktif, badge, & garis horizontal |
| **Soft Blue Surface** | `#F0F9FF` | `bg-sky-50` | Latar belakang badge, tag pilihan, & hover baris |

### ⚪ Warna Dasar & Netral (Base & Neutral Colors)
| Elemen | Hex Code | Tailwind Class | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Base Background** | `#FFFFFF` | `bg-white` | Latar belakang kartu, modal, input, & container |
| **Surface Background** | `#F8FAFC` | `bg-slate-50` | Latar belakang halaman & header tabel/kartu |
| **Text Primary** | `#0F172A` | `text-slate-900` | Judul utama, heading, & teks penting |
| **Text Secondary** | `#334155` | `text-slate-700` | Label input, teks tombol sekunder, & isi tabel |
| **Text Muted** | `#64748B` | `text-slate-500` | Subtitle, deskripsi singkat, & timestamp |
| **Border Neutral** | `#E2E8F0` | `border-slate-200/80` | Garis pembatas kartu, input, & pembatas modul |

### 🚦 Warna Indikator Status (Report Status Badges)
| Status Laporan | Hex Code | Style Badge | Arti Status |
| :--- | :--- | :--- | :--- |
| **MENUNGGU** | `#D97706` | `bg-amber-50 text-amber-700 border-amber-200` | Laporan diterima & menunggu disposisi teknisi |
| **DIPROSES** | `#2563EB` | `bg-blue-50 text-blue-700 border-blue-200` | Petugas teknis sedang memperbaiki kerusakan |
| **SELESAI** | `#059669` | `bg-emerald-50 text-emerald-700 border-emerald-200` | Perbaikan tuntas & diverifikasi |

---

## font 2. Tipografi (Typography)

Seluruh antarmuka SIGAP menggunakan font **Poppins** dari Google Fonts sebagai huruf utama untuk menghadirkan tampilan visual yang elegan, bersih, dan mudah dibaca di layar HP maupun PC.

* **Primary Font Family**: `Poppins`, sans-serif
* **Monospace Font Family**: `JetBrains Mono`, monospace *(Khusus Kode Tiket & Log Waktu)*

### 📏 Hierarki Ukuran Font (Font Hierarchy)
| Kategori | Ukuran Font | Weight | Contoh Penggunaan |
| :--- | :--- | :--- | :--- |
| **Display H1** | `2.25rem - 3rem` (36-48px) | `ExtraBold (800)` | Judul Hero Landing Page |
| **Page Title H2** | `1.25rem - 1.5rem` (20-24px) | `ExtraBold (800)` | Title Header Halaman (`PageHeader`) |
| **Card Title H3** | `0.875rem - 1rem` (14-16px) | `Bold (700)` | Judul Modul / Header Kartu |
| **Body Text** | `0.8125rem - 0.875rem` (13-14px) | `Medium (500)` | Isi Paragraf & Tabel |
| **Form Label** | `0.75rem` (12px) | `Bold (700)` | Label Input & Select Form |
| **Ticket Code** | `0.75rem - 0.875rem` (12-14px) | `Bold (700) Mono` | Nomor Tiket (`TUK-2608-001`) |

---

## 📐 3. Prinsip Desain Minimalis & Profesional Look

### 🔹 1. Presisi Border & Corners (Border Radius)
* **Input, Select, & Button**: Menggunakan `rounded-xl` (12px) atau `rounded-lg` (8px). Hindari bentuk lonjong *stadium/pill-shape* berlebihan pada input formulir.
* **Card & Container**: Menggunakan `rounded-2xl` (16px) dengan pembatas halus `border border-slate-200/80`.

### 🔹 2. Manajemen Bayangan (Shadow System)
* Mengutamakan bayangan mikro (*micro-shadows*): `shadow-2xs` atau `shadow-xs`.
* Hindari bayangan tebal yang ramai (*heavy blur shadows* atau *glow neon*) agar antarmuka tetap bersih dan profesional.

### 🔹 3. Tata Letak Simetris (Grid Alignment)
* Form dan modul disusun dalam grid simetris 2 kolom (`grid-cols-1 md:grid-cols-2 gap-4`).
* Tinggi elemen (input, tombol, dan header) dibuat seragam (`h-10` atau `h-11`) untuk mencegah perbedaan jarak vertikal yang timpang.

---

## 📁 4. Struktur Komponen Utama

```
src/
├── app/
│   ├── (user)/           # Halaman Publik (Landing Page, Form Lapor, Cek Status)
│   ├── admin/            # Dashboard & Manajemen Admin SIGAP
│   └── layout.tsx        # RootLayout dengan Google Font Poppins
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Card, Input, Form)
│   ├── user/             # Komponen Pelapor (ReportForm, StatusSearchForm)
│   ├── admin/            # Komponen Admin (AdminSidebar, AdminHeader)
│   └── mobile/           # View Khusus Smartphone
```
