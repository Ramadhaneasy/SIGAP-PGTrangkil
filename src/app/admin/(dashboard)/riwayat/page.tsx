import React from "react";
import { getCompletedReports } from "@/lib/report-services";
import { RiwayatView, CompletedReportItem } from "./riwayat-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRiwayatPage() {
  let completedReports: CompletedReportItem[] = [];

  try {
    const data = await getCompletedReports();

    if (data && data.length > 0) {
      completedReports = data.map((item) => ({
        id: item.id,
        ticket_number: item.ticket_number,
        nama_pelapor: item.nama_pelapor,
        bagian: item.bagian,
        unit_kerja: item.unit_kerja,
        lokasi_kerusakan: item.lokasi_kerusakan,
        deskripsi: item.deskripsi,
        penanganan: item.penanganan,
        status: item.status,
        processed_at: item.processed_at ? item.processed_at.toISOString() : null,
        completed_at: item.completed_at ? item.completed_at.toISOString() : null,
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
      }));
    }
  } catch (err) {
    console.warn("MySQL fetch completed reports error:", err);
  }

  return <RiwayatView completedReports={completedReports} />;
}
