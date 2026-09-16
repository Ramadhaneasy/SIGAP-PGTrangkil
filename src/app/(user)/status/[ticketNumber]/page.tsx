import React from "react";
import { getReportByTicket } from "@/lib/report-services";
import { StatusDetailView, StatusDetailReportItem } from "./status-detail-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface StatusDetailPageProps {
  params: Promise<{
    ticketNumber: string;
  }>;
}

export default async function StatusDetailPage({ params }: StatusDetailPageProps) {
  const { ticketNumber } = await params;
  let report: StatusDetailReportItem | null = null;

  try {
    const data = await getReportByTicket(ticketNumber);
    if (data) {
      report = {
        id: data.id,
        ticket_number: data.ticket_number,
        nama_pelapor: data.nama_pelapor,
        bagian: data.bagian,
        unit_kerja: data.unit_kerja,
        lokasi_kerusakan: data.lokasi_kerusakan,
        deskripsi: data.deskripsi,
        foto_url: data.foto_url,
        status: data.status,
        penanganan: data.penanganan,
        processed_at: data.processed_at ? data.processed_at.toISOString() : null,
        completed_at: data.completed_at ? data.completed_at.toISOString() : null,
        created_at: data.created_at ? data.created_at.toISOString() : undefined,
      };
    }
  } catch (err) {
    console.warn("MySQL fetch report error:", err);
  }

  return <StatusDetailView ticketNumber={ticketNumber} report={report} />;
}
