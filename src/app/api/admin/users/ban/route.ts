import { NextResponse } from "next/server";
import { banAdminUser, unbanAdminUser, recordActivityLog } from "@/lib/admin-services";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Hanya Super Admin yang berhak melakukan tindakan Banned atau Unbanned akun." },
        { status: 403 }
      );
    }

    const { id, action, isPermanent, bannedUntil, bannedReason } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID admin wajib disertakan" }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menonaktifkan (banned) akun yang sedang Anda gunakan saat ini demi keamanan sistem." },
        { status: 400 }
      );
    }

    // Fetch target admin details for clean activity logging
    const targetUsers = await db.$queryRawUnsafe<Array<{ username: string; nama: string }>>(
      `SELECT username, nama FROM admin_users WHERE id = ? LIMIT 1`,
      id
    );

    const targetUsername = targetUsers && targetUsers[0] ? `@${targetUsers[0].username}` : id;
    const targetNama = targetUsers && targetUsers[0] ? targetUsers[0].nama : "Admin";

    if (action === "BAN") {
      await banAdminUser(id, {
        isPermanent: Boolean(isPermanent),
        bannedUntil,
        bannedReason,
      });

      const reason = bannedReason ? bannedReason.trim() : "Tanpa catatan alasan";
      const formattedUntil = bannedUntil
        ? new Date(bannedUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "";

      // Log Banned activity in activity_logs
      await recordActivityLog({
        admin: session.nama,
        role: session.role,
        aktivitas: isPermanent ? "Ban Permanen" : "Ban Berjangka",
        target: targetUsername,
        deskripsi: isPermanent
          ? `Menonaktifkan akun ${targetUsername} (${targetNama}) secara permanen. Alasan: "${reason}".`
          : `Menonaktifkan akun ${targetUsername} (${targetNama}) sampai ${formattedUntil}. Alasan: "${reason}".`,
      });

      return NextResponse.json({ success: true, message: "Akun admin berhasil dinonaktifkan (banned)." });
    } else if (action === "UNBAN") {
      await unbanAdminUser(id);

      // Log Unbanned activity in activity_logs
      await recordActivityLog({
        admin: session.nama,
        role: session.role,
        aktivitas: "Unban Akun",
        target: targetUsername,
        deskripsi: `Membuka kembali status penonaktifan (unban) akun ${targetUsername} (${targetNama}).`,
      });

      return NextResponse.json({ success: true, message: "Akun admin berhasil diaktifkan kembali (unbanned)." });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/admin/users/ban error:", err);
    return NextResponse.json({ error: "Gagal memproses status banned admin" }, { status: 500 });
  }
}
