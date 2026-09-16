import React from "react";
import { getAllReports, getActivityLogs } from "@/lib/report-services";
import { getAllAdminUsers } from "@/lib/admin-services";
import { DashboardView, DashboardReportItem, DashboardLogItem } from "./dashboard-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  let totalCount = 0;
  let waitingCount = 0;
  let processingCount = 0;
  let completedCount = 0;
  let totalAdminCount = 0;
  let recentReports: DashboardReportItem[] = [];
  let recentLogs: DashboardLogItem[] = [];

  try {
    const [reportsData, logsData, usersData] = await Promise.all([
      getAllReports(),
      getActivityLogs(),
      getAllAdminUsers(),
    ]);

    if (reportsData && reportsData.length > 0) {
      totalCount = reportsData.length;
      waitingCount = reportsData.filter((r: { status: string }) => r.status === "MENUNGGU").length;
      processingCount = reportsData.filter((r: { status: string }) => r.status === "DIPROSES").length;
      completedCount = reportsData.filter((r: { status: string }) => r.status === "SELESAI").length;
      recentReports = reportsData.slice(0, 5).map((r) => ({
        id: r.id,
        ticket_number: r.ticket_number,
        nama_pelapor: r.nama_pelapor,
        unit_kerja: r.unit_kerja,
        status: r.status,
        created_at: r.created_at.toISOString(),
      }));
    }

    if (logsData && logsData.length > 0) {
      recentLogs = logsData.slice(0, 4).map((l: { waktu: Date; [key: string]: unknown }) => ({
        ...(l as unknown as DashboardLogItem),
        waktu: l.waktu ? new Date(l.waktu).toISOString() : new Date().toISOString(),
      }));
    }

    if (usersData) {
      totalAdminCount = usersData.length;
    }
  } catch (err) {
    console.warn("MySQL fetch warning in dashboard:", err);
  }

  return (
    <DashboardView
      totalCount={totalCount}
      waitingCount={waitingCount}
      processingCount={processingCount}
      completedCount={completedCount}
      totalAdminCount={totalAdminCount}
      recentReports={recentReports}
      recentLogs={recentLogs}
    />
  );
}
