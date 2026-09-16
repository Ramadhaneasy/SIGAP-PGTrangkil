import { db } from "@/lib/db";
import crypto from "crypto";

export interface ReportRecord {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  nomor_hp: string | null;
  lokasi_kerusakan: string;
  deskripsi: string;
  foto_url: string | null;
  status: string;
  penanganan: string | null;
  processed_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface RawReportRow {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  nomor_hp?: string | null;
  lokasi_kerusakan: string;
  deskripsi: string;
  foto_url?: string | null;
  status: string;
  penanganan?: string | null;
  processed_at?: Date | string | null;
  completed_at?: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapReportRow(row: RawReportRow): ReportRecord {
  return {
    id: row.id,
    ticket_number: row.ticket_number,
    nama_pelapor: row.nama_pelapor,
    bagian: row.bagian,
    unit_kerja: row.unit_kerja,
    nomor_hp: row.nomor_hp || null,
    lokasi_kerusakan: row.lokasi_kerusakan,
    deskripsi: row.deskripsi,
    foto_url: row.foto_url || null,
    status: row.status,
    penanganan: row.penanganan || null,
    processed_at: row.processed_at
      ? row.processed_at instanceof Date
        ? row.processed_at
        : new Date(row.processed_at)
      : null,
    completed_at: row.completed_at
      ? row.completed_at instanceof Date
        ? row.completed_at
        : new Date(row.completed_at)
      : null,
    created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
  };
}


export async function getAllReports(): Promise<ReportRecord[]> {
  try {
    const rows = await db.$queryRawUnsafe<RawReportRow[]>(
      `SELECT id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, processed_at, completed_at, created_at, updated_at FROM reports ORDER BY created_at DESC`
    );
    return (rows || []).map(mapReportRow);
  } catch (err) {
    console.error("Failed to fetch reports from MySQL:", err);
    return [];
  }
}

export async function getActiveReports(): Promise<ReportRecord[]> {
  try {
    const rows = await db.$queryRawUnsafe<RawReportRow[]>(
      `SELECT id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, processed_at, completed_at, created_at, updated_at FROM reports WHERE status IN ('MENUNGGU', 'DIPROSES') ORDER BY created_at DESC`
    );
    return (rows || []).map(mapReportRow);
  } catch (err) {
    console.error("Failed to fetch active reports from MySQL:", err);
    return [];
  }
}

export async function getReportByTicket(ticketNumber: string): Promise<ReportRecord | null> {
  try {
    const rows = await db.$queryRawUnsafe<RawReportRow[]>(
      `SELECT id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, processed_at, completed_at, created_at, updated_at FROM reports WHERE ticket_number = ? LIMIT 1`,
      ticketNumber
    );
    return rows && rows.length > 0 ? mapReportRow(rows[0]) : null;
  } catch (err) {
    console.error("Failed to fetch report by ticket from MySQL:", err);
    return null;
  }
}

export async function getReportById(id: string): Promise<ReportRecord | null> {
  try {
    const rows = await db.$queryRawUnsafe<RawReportRow[]>(
      `SELECT id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, processed_at, completed_at, created_at, updated_at FROM reports WHERE id = ? OR ticket_number = ? LIMIT 1`,
      id,
      id
    );
    return rows && rows.length > 0 ? mapReportRow(rows[0]) : null;
  } catch (err) {
    console.error("Failed to fetch report by ID from MySQL:", err);
    return null;
  }
}

export async function getCompletedReports(): Promise<ReportRecord[]> {
  try {
    const rows = await db.$queryRawUnsafe<RawReportRow[]>(
      `SELECT id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, processed_at, completed_at, created_at, updated_at FROM reports WHERE status = 'SELESAI' ORDER BY updated_at DESC`
    );
    return (rows || []).map(mapReportRow);
  } catch (err) {
    console.error("Failed to fetch completed reports from MySQL:", err);
    return [];
  }
}

export async function getActivityLogs() {
  try {
    return await db.activityLog.findMany({
      orderBy: { waktu: "desc" },
    });
  } catch (err) {
    console.error("Failed to fetch activity logs from MySQL:", err);
    return [];
  }
}

export function getBagianTicketPrefix(bagian?: string): string {
  if (!bagian) return "TUK";
  const cleaned = bagian.trim().toUpperCase();
  if (cleaned.includes("TUK")) return "TUK";
  if (cleaned.includes("TEKNIK") || cleaned.startsWith("TEK") || cleaned.startsWith("TNK")) return "TEK";
  if (cleaned.includes("PABRIK") || cleaned.startsWith("PAB") || cleaned.startsWith("PBK")) return "PAB";
  if (cleaned.includes("TANAMAN") || cleaned.startsWith("TAN") || cleaned.startsWith("TNM")) return "TAN";
  return cleaned.replace(/[^A-Z0-9]/g, "").slice(0, 3) || "TUK";
}

export async function generateNextSequentialTicket(bagian?: string, offset = 0): Promise<string> {
  const prefix = getBagianTicketPrefix(bagian);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const tglBulan = `${day}${month}`; // Contoh: 2608 (26 Agustus)

  const searchPattern = `${prefix}-${tglBulan}-%`;

  // Query seluruh tiket pada hari & prefix tersebut untuk mencari urutan nomor tertinggi
  const existingTickets = await db.$queryRawUnsafe<Array<{ ticket_number: string }>>(
    `SELECT ticket_number FROM reports WHERE ticket_number LIKE ? ORDER BY ticket_number DESC`,
    searchPattern
  );

  let maxSeq = 0;
  if (existingTickets && existingTickets.length > 0) {
    for (const item of existingTickets) {
      const parts = item.ticket_number.split("-");
      if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  const nextSeq = String(maxSeq + 1 + offset).padStart(3, "0");
  return `${prefix}-${tglBulan}-${nextSeq}`;
}

export async function createReport(data: {
  ticket_number?: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  nomor_hp?: string | null;
  lokasi_kerusakan: string;
  deskripsi: string;
  foto_url?: string | null;
}) {
  const now = new Date();

  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentTicket = await generateNextSequentialTicket(data.bagian, attempt);
    const newId = crypto.randomUUID();

    try {
      await db.$executeRawUnsafe(
        `INSERT INTO reports (id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'MENUNGGU', NULL, ?, ?)`,
        newId,
        currentTicket,
        data.nama_pelapor,
        data.bagian,
        data.unit_kerja,
        data.nomor_hp || null,
        data.lokasi_kerusakan,
        data.deskripsi,
        data.foto_url || null,
        now,
        now
      );

      return {
        id: newId,
        ticket_number: currentTicket,
        nama_pelapor: data.nama_pelapor,
        bagian: data.bagian,
        unit_kerja: data.unit_kerja,
        nomor_hp: data.nomor_hp || null,
        lokasi_kerusakan: data.lokasi_kerusakan,
        deskripsi: data.deskripsi,
        foto_url: data.foto_url || null,
        status: "MENUNGGU",
        penanganan: null,
        processed_at: null,
        completed_at: null,
        created_at: now,
        updated_at: now,
      };
    } catch (err: unknown) {
      const isDuplicate =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: string }).message === "string" &&
        (err as { message: string }).message.includes("Duplicate entry");

      if (isDuplicate && attempt < maxAttempts - 1) {
        continue;
      }
      console.error("Failed to create report in MySQL:", err);
      throw err;
    }
  }

  throw new Error("Gagal membuat laporan setelah beberapa percobaan nomor tiket unik.");
}

export async function updateReportStatus(
  id: string,
  newStatus: string,
  adminName = "Admin SIGAP",
  penanganan?: string | null
) {
  try {
    const now = new Date();

    if (newStatus === "DIPROSES") {
      await db.$executeRawUnsafe(
        `UPDATE reports SET status = ?, processed_at = COALESCE(processed_at, ?), updated_at = ? WHERE id = ? OR ticket_number = ?`,
        newStatus,
        now,
        now,
        id,
        id
      );
    } else if (newStatus === "SELESAI") {
      if (penanganan !== undefined && penanganan !== null) {
        await db.$executeRawUnsafe(
          `UPDATE reports SET status = ?, penanganan = ?, completed_at = COALESCE(completed_at, ?), processed_at = COALESCE(processed_at, ?), updated_at = ? WHERE id = ? OR ticket_number = ?`,
          newStatus,
          penanganan,
          now,
          now,
          now,
          id,
          id
        );
      } else {
        await db.$executeRawUnsafe(
          `UPDATE reports SET status = ?, completed_at = COALESCE(completed_at, ?), processed_at = COALESCE(processed_at, ?), updated_at = ? WHERE id = ? OR ticket_number = ?`,
          newStatus,
          now,
          now,
          now,
          id,
          id
        );
      }
    } else {
      if (penanganan !== undefined && penanganan !== null) {
        await db.$executeRawUnsafe(
          `UPDATE reports SET status = ?, penanganan = ?, updated_at = ? WHERE id = ? OR ticket_number = ?`,
          newStatus,
          penanganan,
          now,
          id,
          id
        );
      } else {
        await db.$executeRawUnsafe(
          `UPDATE reports SET status = ?, updated_at = ? WHERE id = ? OR ticket_number = ?`,
          newStatus,
          now,
          id,
          id
        );
      }
    }

    const reports = await db.$queryRawUnsafe<RawReportRow[]>(
      `SELECT id, ticket_number, nama_pelapor, bagian, unit_kerja, nomor_hp, lokasi_kerusakan, deskripsi, foto_url, status, penanganan, processed_at, completed_at, created_at, updated_at FROM reports WHERE id = ? OR ticket_number = ? LIMIT 1`,
      id,
      id
    );

    const report = reports && reports.length > 0
      ? mapReportRow(reports[0])
      : {
          id,
          ticket_number: id,
          nama_pelapor: "",
          bagian: "",
          unit_kerja: "",
          nomor_hp: null,
          lokasi_kerusakan: "",
          deskripsi: "",
          foto_url: null,
          status: newStatus,
          penanganan: penanganan || null,
          processed_at: newStatus === "DIPROSES" || newStatus === "SELESAI" ? now : null,
          completed_at: newStatus === "SELESAI" ? now : null,
          created_at: now,
          updated_at: now,
        };

    // Record activity log
    try {
      const logId = crypto.randomUUID();
      const logDeskripsi = penanganan
        ? `Mengubah status laporan ${report.ticket_number} menjadi ${newStatus}. Catatan penanganan: ${penanganan}`
        : `Mengubah status laporan ${report.ticket_number} menjadi ${newStatus}.`;

      await db.$executeRawUnsafe(
        `INSERT INTO activity_logs (id, waktu, admin, role, aktivitas, target, deskripsi) VALUES (?, ?, ?, 'SUPER_ADMIN', ?, ?, ?)`,
        logId,
        now,
        adminName,
        newStatus === "SELESAI" ? "Penyelesaian Perbaikan" : "Disposisi Laporan",
        report.ticket_number,
        logDeskripsi
      );
    } catch (logErr) {
      console.warn("Failed to create activity log:", logErr);
    }

    return report;
  } catch (err) {
    console.error("Failed to update report status in MySQL:", err);
    throw err;
  }
}
