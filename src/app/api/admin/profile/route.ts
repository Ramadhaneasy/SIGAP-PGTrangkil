import { NextResponse } from "next/server";
import { getAdminSession, createAdminToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi admin tidak ditemukan. Silakan login." }, { status: 401 });
    }

    let admin = null;
    try {
      const admins = await db.$queryRawUnsafe<Array<{
        id: string;
        nama: string;
        username: string | null;
        role: string;
      }>>(
        `SELECT id, nama, username, role FROM admin_users WHERE id = ? LIMIT 1`,
        session.id
      );

      if (admins && admins.length > 0) {
        admin = admins[0];
      }
    } catch (dbErr) {
      console.warn("Database fetch profile error:", dbErr);
    }

    if (!admin) {
      return NextResponse.json({
        id: session.id,
        nama: session.nama || "Petugas Administrator",
        username: session.username || "admin",
        role: session.role || "ADMIN",
      });
    }

    return NextResponse.json({
      id: admin.id,
      nama: admin.nama,
      username: admin.username || "admin",
      role: admin.role,
    });
  } catch (err) {
    console.error("GET /api/admin/profile error:", err);
    return NextResponse.json({ error: "Gagal memuat profil admin" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi admin tidak ditemukan. Silakan login." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, nama, username, currentPassword, confirmPassword, newPassword } = body;

    // Mode 1: Ubah Password Saja
    if (action === "CHANGE_PASSWORD") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Password lama dan password baru wajib diisi" }, { status: 400 });
      }

      if (newPassword.trim().length < 4) {
        return NextResponse.json({ error: "Password baru minimal 4 karakter" }, { status: 400 });
      }

      const admins = await db.$queryRawUnsafe<Array<{
        id: string;
        password: string;
        nama: string;
        username: string;
        role: string;
      }>>(
        `SELECT id, password, nama, username, role FROM admin_users WHERE id = ? LIMIT 1`,
        session.id
      );

      if (!admins || admins.length === 0) {
        return NextResponse.json({ error: "Akun admin tidak ditemukan di database" }, { status: 404 });
      }

      const isPasswordCorrect = await bcrypt.compare(currentPassword, admins[0].password);
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: "Password lama yang Anda masukkan salah" }, { status: 400 });
      }

      const updatedPassword = await bcrypt.hash(newPassword.trim(), 10);
      await db.$executeRawUnsafe(
        `UPDATE admin_users SET password = ?, updated_at = ? WHERE id = ?`,
        updatedPassword,
        new Date(),
        session.id
      );

      return NextResponse.json({ success: true, message: "Password berhasil diubah!" });
    }

    // Mode 2: Update Informasi Profil (Nama & Username) - Memerlukan Verifikasi Password
    if (!nama || !username) {
      return NextResponse.json({ error: "Nama dan username wajib diisi" }, { status: 400 });
    }

    const passToVerify = confirmPassword || currentPassword;

    if (!passToVerify || typeof passToVerify !== "string" || !passToVerify.trim()) {
      return NextResponse.json(
        { error: "Password akun Anda wajib dimasukkan untuk mengonfirmasi perubahan profil" },
        { status: 400 }
      );
    }

    // Verify Password Login Admin Saat Ini
    const admins = await db.$queryRawUnsafe<Array<{ id: string; password: string }>>(
      `SELECT id, password FROM admin_users WHERE id = ? LIMIT 1`,
      session.id
    );

    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: "Akun admin tidak ditemukan di database" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(passToVerify, admins[0].password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password konfirmasi yang Anda masukkan salah" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Update Admin Profile in MySQL directly
    await db.$executeRawUnsafe(
      `UPDATE admin_users SET nama = ?, username = ?, updated_at = ? WHERE id = ?`,
      nama.trim(),
      cleanUsername,
      new Date(),
      session.id
    );

    // Update JWT session cookie with new profile info
    const token = await createAdminToken({
      id: session.id,
      username: cleanUsername,
      nama: nama.trim(),
      role: session.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: session.id,
        nama: nama.trim(),
        username: cleanUsername,
        role: session.role,
      },
    });

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.url.startsWith("https://") ||
      process.env.COOKIE_SECURE === "true";

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("PUT /api/admin/profile error:", err);
    const errObj = err as { message?: string; code?: string };
    if (errObj?.message?.includes("Duplicate entry") || errObj?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Username sudah digunakan oleh akun lain." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui data profil admin" }, { status: 500 });
  }
}
