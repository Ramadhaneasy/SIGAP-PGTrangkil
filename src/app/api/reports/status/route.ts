import { NextResponse } from "next/server";
import { updateReportStatus } from "@/lib/report-services";
import { getAdminSession } from "@/lib/auth";

async function handleStatusUpdate(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login sebagai admin." }, { status: 401 });
    }

    const { id, status, adminName, penanganan } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi" }, { status: 400 });
    }

    const ALLOWED_STATUSES = ["MENUNGGU", "DIPROSES", "SELESAI"];
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Pilihan status yang diperbolehkan: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateReportStatus(
      id,
      status,
      adminName || session.nama || "Admin SIGAP",
      penanganan
    );
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Status update error:", err);
    const message = err instanceof Error ? err.message : "Gagal mengupdate status laporan di MySQL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleStatusUpdate(request);
}

export async function PATCH(request: Request) {
  return handleStatusUpdate(request);
}

export async function PUT(request: Request) {
  return handleStatusUpdate(request);
}
