import React from "react";
import { getActivityLogs } from "@/lib/report-services";
import { LogAktivitasView, LogItem } from "./log-aktivitas-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLogAktivitasPage() {
  let logs: LogItem[] = [];

  try {
    const data = await getActivityLogs();
    if (data && data.length > 0) {
      logs = data.map((item: { waktu: Date; [key: string]: unknown }) => ({
        ...(item as unknown as LogItem),
        waktu: item.waktu.toISOString(),
      }));
    }
  } catch (err) {
    console.warn("MySQL fetch activity logs error:", err);
  }

  return <LogAktivitasView logs={logs} />;
}
