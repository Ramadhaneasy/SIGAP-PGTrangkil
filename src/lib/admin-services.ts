import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface AdminUserRecord {
  id: string;
  username: string;
  nama: string;
  role: "SUPER_ADMIN" | "ADMIN";
  is_banned: boolean;
  banned_until: Date | string | null;
  banned_reason: string | null;
  created_at: Date | string;
}

export async function recordActivityLog(data: {
  admin: string;
  role: string;
  aktivitas: string;
  target: string;
  deskripsi: string;
}) {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    await db.$executeRawUnsafe(
      `INSERT INTO activity_logs (id, waktu, admin, role, aktivitas, target, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      now,
      data.admin,
      data.role,
      data.aktivitas,
      data.target,
      data.deskripsi
    );
  } catch (err) {
    console.warn("Failed to insert activity log:", err);
  }
}

export async function getAllAdminUsers(): Promise<AdminUserRecord[]> {
  try {
    const rawUsers = await db.$queryRawUnsafe<Array<{
      id: string;
      username: string;
      nama: string;
      role: "SUPER_ADMIN" | "ADMIN";
      is_banned: boolean | number;
      banned_until: Date | string | null;
      banned_reason: string | null;
      created_at: Date | string;
    }>>(
      `SELECT id, username, nama, role, is_banned, banned_until, banned_reason, created_at FROM admin_users ORDER BY created_at DESC`
    );

    return rawUsers.map((u) => ({
      id: u.id,
      username: u.username,
      nama: u.nama,
      role: u.role,
      is_banned: Boolean(u.is_banned),
      banned_until: u.banned_until,
      banned_reason: u.banned_reason,
      created_at: u.created_at,
    }));
  } catch (err) {
    console.error("Failed to fetch admin users from MySQL:", err);
    return [];
  }
}

export async function createAdminUser(data: {
  nama: string;
  username: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN";
}) {
  try {
    const id = crypto.randomUUID();
    const cleanUsername = data.username.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const now = new Date();

    await db.$executeRawUnsafe(
      `INSERT INTO admin_users (id, username, password, nama, role, is_banned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, FALSE, ?, ?)`,
      id,
      cleanUsername,
      hashedPassword,
      data.nama.trim(),
      data.role,
      now,
      now
    );

    return {
      id,
      nama: data.nama.trim(),
      username: cleanUsername,
      role: data.role,
      is_banned: false,
      banned_until: null,
      banned_reason: null,
      created_at: now.toISOString(),
    };
  } catch (err) {
    console.error("Failed to create admin user in MySQL:", err);
    throw err;
  }
}

export async function deleteAdminUser(id: string) {
  try {
    await db.$executeRawUnsafe(`DELETE FROM admin_users WHERE id = ?`, id);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete admin user in MySQL:", err);
    throw err;
  }
}

export async function updateAdminUser(
  id: string,
  data: {
    nama?: string;
    username?: string;
    role?: "SUPER_ADMIN" | "ADMIN";
    password?: string;
  }
) {
  try {
    const cleanUsername = data.username ? data.username.trim().toLowerCase() : null;

    if (data.password && data.password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await db.$executeRawUnsafe(
        `UPDATE admin_users SET nama = COALESCE(?, nama), username = COALESCE(?, username), role = COALESCE(?, role), password = ?, updated_at = ? WHERE id = ?`,
        data.nama ? data.nama.trim() : null,
        cleanUsername,
        data.role || null,
        hashedPassword,
        new Date(),
        id
      );
    } else {
      await db.$executeRawUnsafe(
        `UPDATE admin_users SET nama = COALESCE(?, nama), username = COALESCE(?, username), role = COALESCE(?, role), updated_at = ? WHERE id = ?`,
        data.nama ? data.nama.trim() : null,
        cleanUsername,
        data.role || null,
        new Date(),
        id
      );
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to update admin user in MySQL:", err);
    throw err;
  }
}

export async function banAdminUser(
  id: string,
  options: {
    isPermanent: boolean;
    bannedUntil?: string | null;
    bannedReason?: string | null;
  }
) {
  try {
    const bannedUntilDate = !options.isPermanent && options.bannedUntil ? new Date(options.bannedUntil) : null;
    const reason = options.bannedReason ? options.bannedReason.trim() : "Penonaktifan oleh Super Admin";

    await db.$executeRawUnsafe(
      `UPDATE admin_users SET is_banned = TRUE, banned_until = ?, banned_reason = ?, updated_at = ? WHERE id = ?`,
      bannedUntilDate,
      reason,
      new Date(),
      id
    );

    return { success: true };
  } catch (err) {
    console.error("Failed to ban admin user in MySQL:", err);
    throw err;
  }
}

export async function unbanAdminUser(id: string) {
  try {
    await db.$executeRawUnsafe(
      `UPDATE admin_users SET is_banned = FALSE, banned_until = NULL, banned_reason = NULL, updated_at = ? WHERE id = ?`,
      new Date(),
      id
    );

    return { success: true };
  } catch (err) {
    console.error("Failed to unban admin user in MySQL:", err);
    throw err;
  }
}
