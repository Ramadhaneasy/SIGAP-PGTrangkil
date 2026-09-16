import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai Seeding Database MySQL untuk SIGAP PG Trangkil...");

  const now = new Date();

  // 1. Cek atau Seed Default Super Admin
  const existingSuperAdmin = await prisma.adminUser.findFirst({
    where: {
      OR: [
        { id: "adm-super-001" },
        { username: "superadmin" }
      ]
    }
  });

  if (!existingSuperAdmin) {
    const superPassword = await bcrypt.hash("super123", 10);
    await prisma.$executeRawUnsafe(
      `INSERT INTO admin_users (id, username, password, nama, role, is_banned, created_at, updated_at) 
       VALUES ('adm-super-001', 'superadmin', ?, 'Super Admin SIGAP', 'SUPER_ADMIN', FALSE, ?, ?)`,
      superPassword,
      now,
      now
    );
    console.log("✅ Super Admin default dibuat: Username (superadmin) | Password (super123)");
  } else {
    console.log("ℹ️ Akun Super Admin sudah ada. Password yang tersimpan tetap dipertahankan.");
  }

  // 2. Cek atau Seed Initial Activity Log
  const existingInitLog = await prisma.activityLog.findUnique({
    where: { id: "log-init-001" }
  });

  if (!existingInitLog) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO activity_logs (id, waktu, admin, role, aktivitas, target, deskripsi) 
       VALUES ('log-init-001', ?, 'Super Admin SIGAP', 'SUPER_ADMIN', 'INISIALISASI SISTEM', 'SISTEM', 'Database SIGAP PG Trangkil berhasil diinisialisasi.')`,
      now
    );
    console.log("✅ Log audit inisialisasi awal berhasil ditambahkan.");
  }

  console.log("🎉 Seeding Database MySQL SIGAP Selesai dengan Sempurna!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
