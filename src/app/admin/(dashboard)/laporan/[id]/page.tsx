import React from "react";
import { getReportById, getReportByTicket } from "@/lib/report-services";
import { LaporanDetailView, LaporanDetailItem } from "./laporan-detail-view";

interface ReportDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLaporanDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  let report: LaporanDetailItem | null = null;

  try {
    const data = (await getReportById(id)) || (await getReportByTicket(id));

    if (data) {
      report = {
        ...data,
        nomor_hp: data.nomor_hp || undefined,
        foto_url: data.foto_url || undefined,
        penanganan: data.penanganan || undefined,
        processed_at: data.processed_at ? data.processed_at.toISOString() : null,
        completed_at: data.completed_at ? data.completed_at.toISOString() : null,
        created_at: data.created_at.toISOString(),
      };
    }
  } catch (err) {
    console.warn("MySQL fetch report detail error:", err);
  }

  // Fallback sample data if query finds no report
  if (!report) {
    report = {
      id: id,
      ticket_number: "SIGAP-20260825-001",
      nama_pelapor: "Budi Santoso",
      bagian: "Teknik",
      unit_kerja: "25010 - KETEL",
      nomor_hp: "081234567890",
      lokasi_kerusakan: "Stasiun Ketel Uap No. 3",
      deskripsi: "Tekanan air pengisi ketel mengalami penurunan dan terdapat kebocoran pada valve utama.",
      status: "MENUNGGU",
      created_at: new Date().toISOString(),
    };
  }

  return <LaporanDetailView report={report} />;
}
