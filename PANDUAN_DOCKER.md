# 🐳 Panduan Lengkap Menjalankan SIGAP Menggunakan Docker

Dokumen ini berisi panduan langkah demi langkah untuk menjalankan aplikasi **SIGAP (Sistem Informasi Gangguan & Pelaporan - PG Trangkil)** menggunakan **Docker** dan **Docker Compose**.

Dengan Docker, Anda **TIDAK PERLU** lagi menginstal Node.js, XAMPP, maupun mengimpor database MySQL secara manual. Semuanya berjalan otomatis dalam kontainer terisolasi!

---

## 1. 📋 Prasyarat Sistem

Sebelum memulai, pastikan komputer Anda telah terpasang:
* **Docker Desktop for Windows** $\rightarrow$ [Unduh Resmi Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Saat instalasi Docker Desktop, centang opsi **Use WSL 2 instead of Hyper-V (recommended)**.
* Setelah terinstal, pastikan aplikasi **Docker Desktop sudah dibuka dan statusnya "Engine running"** (ikon paus di taskbar tidak lagi berkedip).

> [!TIP]
> **Jika Anda sebelumnya menggunakan XAMPP:**  
> Pastikan modul **MySQL** di XAMPP Control Panel dalam keadaan **Stop**, agar port `3306` tidak bentrok dengan container MySQL Docker.

---

## 2. 🚀 Cara Menjalankan Aplikasi (1 Perintah)

Buka terminal (PowerShell / Command Prompt / Terminal VS Code) di folder proyek `sigap-pgtk`, lalu jalankan perintah berikut:

```bash
docker compose up -d --build
```

### Apa yang terjadi secara otomatis?
1. Docker akan mengunduh image MySQL 8.0 dan phpMyAdmin.
2. Docker akan mem-build aplikasi Next.js SIGAP menggunakan *multi-stage build* (sangat optimal dan ringan).
3. MySQL otomatis membuat database `sigap_db` dan mengimpor file `sigap_mysql_dump.sql` (semua tabel dan akun superadmin langsung siap).
4. Seluruh service (`sigap-app`, `sigap-db`, `sigap-pma`) langsung aktif di latar belakang (`-d`).

---

## 3. 🌐 Tautan Akses & Kredensial

Setelah container aktif, buka browser Anda:

| Layanan | URL Akses | Kredensial Login | Keterangan |
| :--- | :--- | :--- | :--- |
| **Aplikasi Web SIGAP** | [`http://localhost:3000`](http://localhost:3000) | — | Halaman publik & pelaporan kerusakan |
| **Login Administrator** | [`http://localhost:3000/admin/login`](http://localhost:3000/admin/login) | **Username:** `superadmin`<br>**Password:** `super123` | Dashboard & kelola tiket gangguan |
| **phpMyAdmin (GUI DB)** | [`http://localhost:8080`](http://localhost:8080) | **Username:** `sigap_user`<br>**Password:** `sigap_password_2026`<br>*(atau User: `root` / Pass: `sigap_root_password_2026`)* | Panel kelola database via web (pengganti phpMyAdmin XAMPP) |
| **Akses Langsung MySQL** | `localhost:3306` | **Database:** `sigap_db`<br>**User:** `sigap_user`<br>**Password:** `sigap_password_2026` | Untuk aplikasi seperti DBeaver, TablePlus, atau HeidiSQL |

---

## 4. 🕹️ Perintah Manajemen Docker yang Sering Digunakan

Jalankan perintah ini di dalam folder proyek:

### 🔍 1. Melihat Status Container
```bash
docker compose ps
```

### 📜 2. Melihat Log Aplikasi (Real-time)
```bash
# Melihat log aplikasi Next.js:
docker compose logs -f app

# Melihat log database MySQL:
docker compose logs -f db

# Tekan Ctrl + C untuk keluar dari tampilan log
```

### ⏸️ 3. Menghentikan Aplikasi Sementara
```bash
docker compose stop
```
*(Untuk menyalakannya kembali tanpa build ulang: `docker compose start`)*

### ⏹️ 4. Mematikan Container
```bash
docker compose down
```
> Data database **tetap aman tersimpan** di volume `sigap_mysql_data`.

### 🔄 5. Melakukan Build Ulang (Jika Ada Perubahan Kode)
```bash
docker compose up -d --build
```

### ⚠️ 6. Reset Database Total ke Kondisi Awal (Fresh Install)
Jika Anda ingin menghapus seluruh data database dan mengimpor ulang dari file `sigap_mysql_dump.sql` dari awal:
```bash
docker compose down -v
docker compose up -d --build
```
*(Opsi `-v` akan menghapus volume database lama).*

---

## 5. 🛠️ Solusi Masalah Umum (Troubleshooting)

### ❌ 1. Error: `Ports are not available: exposing port TCP 0.0.0.0:3306: listen tcp 0.0.0.0:3306: bind: address already in use`
* **Penyebab**: Port 3306 sedang dipakai oleh MySQL XAMPP lokal Anda atau service MySQL Windows lain.
* **Solusi**: 
  1. Buka XAMPP Control Panel, klik **Stop** pada modul MySQL.
  2. Atau jalankan `docker compose up -d` kembali.
  3. Alternatif lain, Anda dapat mengganti port MySQL di `docker-compose.yml` baris ports menjadi `"3307:3306"`.

### ❌ 2. Perintah `docker` tidak dikenali di terminal
* **Penyebab**: Docker Desktop belum terinstal atau belum berjalan.
* **Solusi**: Pastikan aplikasi Docker Desktop sudah dibuka di Windows. Jika baru saja diinstal, restart terminal atau restart komputer Anda.

### ❌ 3. Container App keluar (Exit) saat pertama kali running
* **Penyebab**: Container database MySQL masih dalam proses inisialisasi awal.
* **Solusi**: Konfigurasi `docker-compose.yml` sudah dilengkapi fitur **`healthcheck`**, sehingga container `app` akan otomatis menunggu hingga database MySQL benar-benar siap dan sehat sebelum menyalakan server Next.js.
