import { NextResponse } from "next/server";
import { createReport, getAllReports } from "@/lib/report-services";
import { getAdminSession } from "@/lib/auth";
import {
  checkGenericRateLimit,
  recordGenericAttempt,
  getClientIdentifier,
} from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const reports = await getAllReports();
    return NextResponse.json(reports);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Anti-Spam Rate Limiting (Maks 10 laporan per 5 menit per IP)
    const clientIp = getClientIdentifier(request.headers);
    const rateCheck = checkGenericRateLimit("create_report", clientIp, 10);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak laporan dikirim dalam waktu singkat. Silakan tunggu ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} menit sebelum mengirim laporan baru.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      ticket_number,
      nama_pelapor,
      bagian,
      unit_kerja,
      nomor_hp,
      lokasi_kerusakan,
      deskripsi,
      foto_url,
    } = body;

    // 2. Server-side Validation
    if (!nama_pelapor || typeof nama_pelapor !== "string" || nama_pelapor.trim().length < 3 || nama_pelapor.trim().length > 150) {
      return NextResponse.json(
        { error: "Nama pelapor wajib diisi (minimal 3 karakter, maksimal 150 karakter)" },
        { status: 400 }
      );
    }

    if (!bagian || typeof bagian !== "string" || bagian.trim().length < 2 || bagian.trim().length > 100) {
      return NextResponse.json(
        { error: "Bagian wajib dipilih" },
        { status: 400 }
      );
    }

    if (!unit_kerja || typeof unit_kerja !== "string" || unit_kerja.trim().length < 2 || unit_kerja.trim().length > 150) {
      return NextResponse.json(
        { error: "Unit kerja wajib dipilih" },
        { status: 400 }
      );
    }

    if (nomor_hp && (typeof nomor_hp !== "string" || nomor_hp.trim().length > 30)) {
      return NextResponse.json(
        { error: "Format nomor HP tidak valid (maksimal 30 karakter)" },
        { status: 400 }
      );
    }

    if (!deskripsi || typeof deskripsi !== "string" || deskripsi.trim().length < 10 || deskripsi.trim().length > 3000) {
      return NextResponse.json(
        { error: "Deskripsi kerusakan wajib diisi (minimal 10 karakter, maksimal 3000 karakter)" },
        { status: 400 }
      );
    }

    // 3. Image Payload Validation (Anti-Malicious Payload & Size Check)
    if (foto_url) {
      if (typeof foto_url !== "string") {
        return NextResponse.json(
          { error: "Format lampiran foto tidak valid" },
          { status: 400 }
        );
      }

      // Max base64 payload size ~ 5MB
      if (foto_url.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran foto lampiran terlalu besar (maksimal 5 MB)" },
          { status: 400 }
        );
      }

      const isDataImage = foto_url.startsWith("data:image/");
      const isHttpUrl = foto_url.startsWith("http://") || foto_url.startsWith("https://") || foto_url.startsWith("/");
      if (!isDataImage && !isHttpUrl) {
        return NextResponse.json(
          { error: "Format berkas lampiran harus berupa gambar valid" },
          { status: 400 }
        );
      }
    }

    // Record submission attempt for rate limiting
    recordGenericAttempt("create_report", clientIp, 5 * 60 * 1000);

    const newReport = await createReport({
      ticket_number,
      nama_pelapor: nama_pelapor.trim(),
      bagian: bagian.trim(),
      unit_kerja: unit_kerja.trim(),
      nomor_hp: nomor_hp ? nomor_hp.trim() : null,
      lokasi_kerusakan: (lokasi_kerusakan && typeof lokasi_kerusakan === "string" ? lokasi_kerusakan.trim() : unit_kerja.trim()),
      deskripsi: deskripsi.trim(),
      foto_url: foto_url || null,
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/reports error:", err);
    const message = err instanceof Error ? err.message : "Failed to create report in MySQL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
