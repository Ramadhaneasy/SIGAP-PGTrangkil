import React from "react";
import { getActiveReports } from "@/lib/report-services";
import { LaporanListView, LaporanItem } from "./laporan-list-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLaporanPage() {
  let reports: LaporanItem[] = [];

  try {
    const data = await getActiveReports();

    if (data && data.length > 0) {
      reports = data.map((item) => ({
        id: item.id,
        ticket_number: item.ticket_number,
        nama_pelapor: item.nama_pelapor,
        bagian: item.bagian,
        unit_kerja: item.unit_kerja,
        nomor_hp: item.nomor_hp || undefined,
        lokasi_kerusakan: item.lokasi_kerusakan,
        deskripsi: item.deskripsi,
        status: item.status,
        penanganan: item.penanganan || undefined,
        processed_at: item.processed_at ? item.processed_at.toISOString() : null,
        completed_at: item.completed_at ? item.completed_at.toISOString() : null,
        created_at: item.created_at.toISOString(),
      }));
    }
  } catch (err) {
    console.warn("MySQL fetch reports error:", err);
  }

  return <LaporanListView reports={reports} />;
}
