import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Memulai update & inject data waktu laporan...");

  // 1. Perbarui data lama yang statusnya SELESAI agar memiliki processed_at dan completed_at yang realistis
  const existingSelesai = await prisma.report.findMany({
    where: { status: "SELESAI" },
  });

  for (const report of existingSelesai) {
    const createdAt = new Date(report.created_at);
    // processed_at: 15-45 menit setelah created_at
    const processedAt = report.processed_at
      ? new Date(report.processed_at)
      : new Date(createdAt.getTime() + (20 + Math.floor(Math.random() * 25)) * 60 * 1000);

    // completed_at: 45-150 menit setelah processed_at
    const completedAt = report.completed_at
      ? new Date(report.completed_at)
      : new Date(processedAt.getTime() + (45 + Math.floor(Math.random() * 90)) * 60 * 1000);

    await prisma.report.update({
      where: { id: report.id },
      data: {
        processed_at: processedAt,
        completed_at: completedAt,
        penanganan: report.penanganan || "Perbaikan perangkat keras dan konfigurasi ulang sistem telah berhasil diselesaikan oleh teknisi IT.",
      },
    });
  }
  console.log(`✅ Berhasil memperbarui ${existingSelesai.length} laporan SELESAI dengan waktu proses & tuntas.`);

  // 2. Perbarui data lama yang statusnya DIPROSES agar memiliki processed_at yang realistis
  const existingDiproses = await prisma.report.findMany({
    where: { status: "DIPROSES" },
  });

  for (const report of existingDiproses) {
    const createdAt = new Date(report.created_at);
    const processedAt = report.processed_at
      ? new Date(report.processed_at)
      : new Date(createdAt.getTime() + (15 + Math.floor(Math.random() * 30)) * 60 * 1000);

    await prisma.report.update({
      where: { id: report.id },
      data: {
        processed_at: processedAt,
        completed_at: null,
      },
    });
  }
  console.log(`✅ Berhasil memperbarui ${existingDiproses.length} laporan DIPROSES.`);

  // 3. Tambahkan beberapa sampel laporan baru yang bervariasi (termasuk laporan di Bagian IT & Pabrik)
  const newSamples = [
    {
      ticket_number: "IT-1609-001",
      nama_pelapor: "Bagus Setiawan",
      bagian: "Teknologi Informasi",
      unit_kerja: "Infrastruktur Jaringan IT",
      nomor_hp: "081234567890",
      lokasi_kerusakan: "Ruang Server IT - Lantai 2",
      deskripsi: "Switch Distribusi Cisco Gigabit port 12-24 down mendadak, menyebabkan koneksi LAN divisi pabrikasi dan timbangan drop.",
      status: "DIPROSES",
      created_at: new Date("2026-09-16T07:15:00+07:00"),
      processed_at: new Date("2026-09-16T07:35:00+07:00"),
      completed_at: null,
      penanganan: null,
    },
    {
      ticket_number: "IT-1609-002",
      nama_pelapor: "Dian Wahyuni",
      bagian: "Teknologi Informasi",
      unit_kerja: "Helpdesk & Aplikasi",
      nomor_hp: "082198765432",
      lokasi_kerusakan: "Kantor IT PG Trangkil",
      deskripsi: "PC Monitor Helpdesk blank hitam saat dinyalakan, terdengar bunyi beep 3 kali dari motherboard.",
      status: "MENUNGGU",
      created_at: new Date("2026-09-16T08:05:00+07:00"),
      processed_at: null,
      completed_at: null,
      penanganan: null,
    },
    {
      ticket_number: "IT-1509-001",
      nama_pelapor: "Ahmad Fauzi",
      bagian: "Teknologi Informasi",
      unit_kerja: "Database & Sistem",
      nomor_hp: "085611223344",
      lokasi_kerusakan: "Ruang Kerja IT",
      deskripsi: "UPS backup server database baterai indikator berkedip merah (replace battery warning).",
      status: "SELESAI",
      created_at: new Date("2026-09-15T09:30:00+07:00"),
      processed_at: new Date("2026-09-15T09:50:00+07:00"),
      completed_at: new Date("2026-09-15T11:20:00+07:00"),
      penanganan: "Penggantian 2 unit baterai aki 12V 7Ah UPS server, kalibrasi ulang, dan uji coba load shedding normal.",
    },
    {
      ticket_number: "TEK-1609-001",
      nama_pelapor: "Bambang Sugeng",
      bagian: "Teknik",
      unit_kerja: "Stasiun Ketel",
      nomor_hp: "081399887766",
      lokasi_kerusakan: "Panel Kontrol Ketel No. 3",
      deskripsi: "PC HMI SCADA Ketel 3 tidak bisa membaca sensor tekanan uap, kabel data RS-485 terindikasi putus.",
      status: "DIPROSES",
      created_at: new Date("2026-09-16T06:30:00+07:00"),
      processed_at: new Date("2026-09-16T06:55:00+07:00"),
      completed_at: null,
      penanganan: null,
    },
    {
      ticket_number: "PBK-1509-002",
      nama_pelapor: "Hendro Wibowo",
      bagian: "Pabrikasi",
      unit_kerja: "Stasiun Gilingan",
      nomor_hp: "087755443322",
      lokasi_kerusakan: "Ruang Pengawas Gilingan",
      deskripsi: "Printer thermal laporan gilingan macet (paper jam parah) dan roll roller penarik kertas patah.",
      status: "SELESAI",
      created_at: new Date("2026-09-15T13:10:00+07:00"),
      processed_at: new Date("2026-09-15T13:25:00+07:00"),
      completed_at: new Date("2026-09-15T14:40:00+07:00"),
      penanganan: "Pembersihan sisa kertas, penggantian roller penarik, serta pelumasan gear mekanik printer. Uji cetak 10 lembar lancar.",
    },
    {
      ticket_number: "TUK-1609-001",
      nama_pelapor: "Siti Rahmawati",
      bagian: "TUK",
      unit_kerja: "Akuntansi & Keuangan",
      nomor_hp: "081288990011",
      lokasi_kerusakan: "Ruang Tata Usaha Keuangan Lantai 1",
      deskripsi: "Akses WiFi dan kabel LAN tidak dapat IP (No Internet Access / Limited Connection).",
      status: "DIPROSES",
      created_at: new Date("2026-09-16T07:45:00+07:00"),
      processed_at: new Date("2026-09-16T08:10:00+07:00"),
      completed_at: null,
      penanganan: null,
    },
  ];

  for (const sample of newSamples) {
    const exists = await prisma.report.findUnique({
      where: { ticket_number: sample.ticket_number },
    });

    if (!exists) {
      await prisma.report.create({
        data: sample,
      });
      console.log(`➕ Menambahkan sample laporan baru: ${sample.ticket_number} (${sample.status}) - ${sample.bagian}`);
    } else {
      await prisma.report.update({
        where: { ticket_number: sample.ticket_number },
        data: sample,
      });
      console.log(`🔄 Memperbarui sample laporan: ${sample.ticket_number} (${sample.status})`);
    }
  }

  console.log("✨ Selesai menginjeksi data waktu dan laporan!");
}

main()
  .catch((err) => {
    console.error("Error updating reports:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
