import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  recordActivityLog,
} from "@/lib/admin-services";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi login admin tidak valid" }, { status: 401 });
    }

    const users = await getAllAdminUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data admin" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang berhak menambahkan akun admin baru" }, { status: 403 });
    }

    const { nama, username, password, role, confirmPassword } = await request.json();

    if (!nama || !username || !password) {
      return NextResponse.json({ error: "Nama, username, dan password wajib diisi" }, { status: 400 });
    }

    if (!confirmPassword || typeof confirmPassword !== "string" || !confirmPassword.trim()) {
      return NextResponse.json({ error: "Password konfirmasi Super Admin wajib dimasukkan" }, { status: 400 });
    }

    // Verify Super Admin Password
    const superAdminUsers = await db.$queryRawUnsafe<Array<{ id: string; password: string }>>(
      `SELECT id, password FROM admin_users WHERE id = ? LIMIT 1`,
      session.id
    );

    if (!superAdminUsers || superAdminUsers.length === 0) {
      return NextResponse.json({ error: "Akun Super Admin tidak ditemukan di database" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(confirmPassword, superAdminUsers[0].password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password konfirmasi Super Admin yang Anda masukkan salah" }, { status: 400 });
    }

    const newUser = await createAdminUser({
      nama,
      username: username.trim(),
      password,
      role: role || "ADMIN",
    });

    const targetUsername = `@${newUser.username}`;

    // Log Tambah Admin activity in activity_logs
    await recordActivityLog({
      admin: session.nama,
      role: session.role,
      aktivitas: "Tambah Admin Baru",
      target: targetUsername,
      deskripsi: `Telah menambahkan admin ${targetUsername}`,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    const errObj = err as { message?: string; code?: string };
    if (errObj?.message?.includes("Duplicate entry") || errObj?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Username sudah digunakan oleh akun lain. Silakan pilih username lain." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat akun admin baru" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang berhak mengubah data akun admin" }, { status: 403 });
    }

    const { id, nama, username, password, role } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID admin wajib disertakan" }, { status: 400 });
    }

    await updateAdminUser(id, {
      nama,
      username: username ? username.trim() : undefined,
      password: password && password.trim().length > 0 ? password : undefined,
      role,
    });

    const targetUsername = username ? `@${username.trim()}` : id;

    // Log Edit Admin activity
    await recordActivityLog({
      admin: session.nama,
      role: session.role,
      aktivitas: "Update Akun Admin",
      target: targetUsername,
      deskripsi: `Memperbarui akun ${targetUsername}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/users error:", err);
    const errObj = err as { message?: string; code?: string };
    if (errObj?.message?.includes("Duplicate entry") || errObj?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Username sudah digunakan oleh akun lain." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui data akun admin" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang berhak menghapus akun admin" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID admin wajib diisi" }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini demi keamanan sistem." },
        { status: 400 }
      );
    }

    const targetUsers = await db.$queryRawUnsafe<Array<{ username: string; nama: string }>>(
      `SELECT username, nama FROM admin_users WHERE id = ? LIMIT 1`,
      id
    );

    const targetUsername = targetUsers && targetUsers[0] ? `@${targetUsers[0].username}` : id;

    await deleteAdminUser(id);

    // Log Hapus Admin activity
    await recordActivityLog({
      admin: session.nama,
      role: session.role,
      aktivitas: "Hapus Akun Admin",
      target: targetUsername,
      deskripsi: `Menghapus akun ${targetUsername}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus akun admin" }, { status: 500 });
  }
}
