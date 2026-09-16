import React from "react";
import { getActiveReports } from "@/lib/report-services";
import { CekStatusView, ActiveReportItem } from "./cek-status-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CekStatusPage() {
  let activeReports: ActiveReportItem[] = [];

  try {
    const data = await getActiveReports();
    if (data && data.length > 0) {
      activeReports = data.map((item) => ({
        id: item.id,
        ticket_number: item.ticket_number,
        nama_pelapor: item.nama_pelapor,
        bagian: item.bagian,
        unit_kerja: item.unit_kerja,
        lokasi_kerusakan: item.lokasi_kerusakan,
        deskripsi: item.deskripsi,
        status: item.status,
        created_at: item.created_at.toISOString(),
      }));
    }
  } catch (err) {
    console.warn("Error fetching active reports for cek-status page:", err);
  }

  return <CekStatusView initialReports={activeReports} />;
}
