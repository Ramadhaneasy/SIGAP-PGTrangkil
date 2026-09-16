# 📖 Panduan Lengkap Instalasi & Pengoperasian Aplikasi SIGAP
**SIGAP — Sistem Informasi Gangguan & Pelaporan**  
*PT Kebon Agung Pabrik Gula Trangkil*

---

## 1. 📋 Prasyarat Sistem
Pastikan laptop / komputer baru telah terpasang:
1. **Node.js** (Versi 18 LTS atau 20 LTS) $\rightarrow$ [Download Resmi](https://nodejs.org)
2. **XAMPP / MySQL Server** $\rightarrow$ [Download XAMPP](https://www.apachefriends.org)
3. **Visual Studio Code** (Text Editor)

---

## 2. 📦 Tips Memindahkan Proyek (File ZIP)
> [!IMPORTANT]
> **HAPUS / JANGAN MASUKKAN** folder berikut ke dalam file ZIP agar ukuran file kecil (hanya 1-5 MB) dan transfer cepat:
> * `node_modules/` *(akan di-install ulang di laptop baru)*
> * `.next/` *(cache build otomatis)*

---

## 3. 🗄️ Langkah 1: Setup Database MySQL di XAMPP
1. Buka aplikasi **XAMPP Control Panel**, lalu klik **Start** pada modul **Apache** dan **MySQL** (hingga indikator berwarna hijau).
2. Buka browser dan kunjungi: **`http://localhost/phpmyadmin`**
3. Klik menu **New / Baru** di bilah kiri phpMyAdmin.
4. Buat database dengan nama: **`sigap_db`** (Collation: `utf8mb4_unicode_ci`), lalu klik **Create**.
5. Klik database `sigap_db` $\rightarrow$ pilih tab **Import** $\rightarrow$ klik **Choose File** $\rightarrow$ pilih berkas **`sigap_mysql_dump.sql`** yang ada di folder proyek $\rightarrow$ klik tombol **Import** di bagian bawah.

---

## 4. ⚙️ Langkah 2: Konfigurasi File `.env`
Buat file bernama **`.env`** di root folder proyek (jika belum ada), lalu isi dengan:

```env
# Koneksi MySQL Lokal (User default root, tanpa password, port 3306)
DATABASE_URL="mysql://root:@localhost:3306/sigap_db"

# Kunci Rahasia JWT (Bebas / Acak)
JWT_SECRET="sigap_pg_trangkil_super_secret_key_2026"

# URL Aplikasi Lokal
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 5. 💻 Langkah 3: Eksekusi Perintah di Terminal
Buka terminal VS Code di folder proyek (tekan `Ctrl + ~`), lalu jalankan:

```bash
# 1. Install seluruh dependencies / library
npm install

# 2. Sinkronkan Prisma ORM dengan database MySQL
npx prisma generate

# 3. Jalankan aplikasi dalam mode development
npm run dev
```

---

## 6. 🌐 Tautan Akses & Kredensial Login

* **Halaman Publik / Pelapor**: `http://localhost:3000`
* **Formulir Lapor Kerusakan**: `http://localhost:3000/lapor`
* **Cek Status Laporan**: `http://localhost:3000/cek-status`
* **Login Administrator**: `http://localhost:3000/admin/login`

### 🔑 Akun Super Admin Bawaan:
* **Username**: `superadmin`
* **Password**: `super123`
* **Hak Akses**: `SUPER_ADMIN` *(Dapat menambah akun admin teknis, memantau audit log, dan mengelola seluruh laporan).*

---

## 🛠️ Solusi Kendala Umum (FAQ)
* **Error `Can't reach database server at localhost:3306`**: Pastikan MySQL di XAMPP sudah di-start.
* **Error Prisma Client**: Jalankan `npx prisma generate` lalu restart `npm run dev`.
* **Reset Database dari Nol**: Jalankan `npm run db:setup` (otomatis push schema dan seed akun superadmin).
