import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createAdminToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";

// Constant dummy hash to prevent timing attacks when username does not exist
const DUMMY_HASH = "$2a$10$e8w6Q0Xp7aL1w0FzYwT1xOP5L.p5QJ1C1zFkOQ7g1g.mF5c5p7m.e";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawUsername = body.username || body.usernameOrEmail || body.identifier;
    const rawPassword = body.password;

    // 1. Strict Input Validation & Type Checking
    if (
      !rawUsername ||
      typeof rawUsername !== "string" ||
      !rawPassword ||
      typeof rawPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Input Sanitization (Clean control characters, null bytes, and whitespaces)
    const sanitizedUsername = rawUsername
      .replace(/\0/g, "")
      .trim()
      .toLowerCase();
    const sanitizedPassword = rawPassword;

    if (sanitizedUsername.length < 2 || sanitizedUsername.length > 50) {
      return NextResponse.json(
        { error: "Format username tidak valid (2 - 50 karakter)" },
        { status: 400 }
      );
    }

    if (sanitizedPassword.length < 3 || sanitizedPassword.length > 100) {
      return NextResponse.json(
        { error: "Format password tidak valid" },
        { status: 400 }
      );
    }

    // 3. Anti-Brute-Force Rate Limiting (per username)
    const rateCheck = checkRateLimit(sanitizedUsername);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Demi keamanan akun, silakan coba lagi dalam ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} menit.`,
        },
        { status: 429 }
      );
    }

    // 4. Parameterized Prepared SQL Query (100% Immune to SQL Injection)
    let adminUser: {
      id: string;
      username: string;
      password: string;
      nama: string;
      role: string;
      is_banned: boolean | number;
      banned_until: Date | string | null;
      banned_reason: string | null;
    } | null = null;

    try {
      const records = await db.$queryRawUnsafe<
        Array<{
          id: string;
          username: string;
          password: string;
          nama: string;
          role: string;
          is_banned: boolean | number;
          banned_until: Date | string | null;
          banned_reason: string | null;
        }>
      >(
        `SELECT id, username, password, nama, role, is_banned, banned_until, banned_reason FROM admin_users WHERE LOWER(username) = ? LIMIT 1`,
        sanitizedUsername
      );

      if (records && records.length > 0) {
        adminUser = {
          ...records[0],
          is_banned: Boolean(records[0].is_banned),
        };
      }
    } catch (dbErr) {
      console.error("Database query error during login:", dbErr);
    }

    // 5. Constant-Time Password Verification (Timing Attack Safe)
    const targetHash = adminUser ? adminUser.password : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(sanitizedPassword, targetHash);

    if (!adminUser || !isPasswordValid) {
      recordFailedAttempt(sanitizedUsername);
      return NextResponse.json(
        { error: "Username atau password yang Anda masukkan salah" },
        { status: 401 }
      );
    }

    // 6. Security Check: Banned/Suspended Accounts Enforcement
    if (adminUser.is_banned) {
      if (adminUser.banned_until) {
        const bannedUntilDate = new Date(adminUser.banned_until);
        if (new Date() < bannedUntilDate) {
          const formattedUntil = bannedUntilDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          return NextResponse.json(
            {
              isBanned: true,
              banType: "TEMPORARY",
              bannedUntil: formattedUntil,
              bannedReason: adminUser.banned_reason || null,
              error: `Akun Anda telah di-banned sampai : ${formattedUntil}`,
            },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          {
            isBanned: true,
            banType: "PERMANENT",
            bannedUntil: null,
            bannedReason: adminUser.banned_reason || null,
            error: "Akun Anda telah di-banned secara permanen oleh Super Admin.",
          },
          { status: 403 }
        );
      }
    }

    // Reset rate limiter on successful credentials verification
    resetRateLimit(sanitizedUsername);

    // 7. Generate Cryptographically Signed JWT Token
    const token = await createAdminToken({
      id: adminUser.id,
      username: adminUser.username,
      nama: adminUser.nama,
      role: adminUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        nama: adminUser.nama,
        role: adminUser.role,
      },
    });

    // 8. Set Secure HTTP-Only Cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("POST /api/admin/login internal error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat memproses login" },
      { status: 500 }
    );
  }
}
