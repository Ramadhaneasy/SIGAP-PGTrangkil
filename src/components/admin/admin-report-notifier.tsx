"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  sendBrowserPushNotification,
  getNotificationSettings,
  registerServiceWorker,
} from "@/lib/notifications";
import { toast } from "sonner";

export function AdminReportNotifier() {
  const router = useRouter();
  const lastKnownReportId = useRef<string | null>(null);
  const isFirstCheck = useRef<boolean>(true);

  useEffect(() => {
    // Register Service Worker for Mobile Notifications on mount
    registerServiceWorker();

    // Polling function to check for incoming reports
    const checkNewReports = async () => {
      try {
        const settings = getNotificationSettings();
        if (!settings.pushEnabled && !settings.soundEnabled) return;

        const res = await fetch("/api/reports?limit=1", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const latest = Array.isArray(data) ? data[0] : (data.reports ? data.reports[0] : null);

        if (!latest || !latest.id) return;

        if (isFirstCheck.current) {
          lastKnownReportId.current = latest.id;
          isFirstCheck.current = false;
          return;
        }

        // If a new report has appeared
        if (lastKnownReportId.current && latest.id !== lastKnownReportId.current) {
          lastKnownReportId.current = latest.id;

          const ticket = latest.ticket_number || "SIGAP";
          const pelapor = latest.nama_pelapor || "Pelapor";
          const unit = latest.unit_kerja || latest.bagian || "Unit Pabrik";
          const deskripsi = latest.deskripsi || "Catatan kerusakan baru masuk ke riwayat";

          // 1. Trigger Mobile / Desktop System Push Notification + Sound + Vibration
          sendBrowserPushNotification({
            title: `Laporan Kerusakan Baru #${ticket}`,
            body: `${pelapor} (${unit}): ${deskripsi}`,
            onClickUrl: `/admin/laporan`,
          });

          // 2. In-App Floating Toast Alert (Visible immediately on screen for mobile & desktop)
          toast.info(`Laporan Kerusakan Baru #${ticket}`, {
            description: `${pelapor} - ${unit}: ${deskripsi}`,
            duration: 8000,
            action: {
              label: "Buka Laporan",
              onClick: () => router.push("/admin/laporan"),
            },
          });

          // 3. Refresh Next.js server components live
          router.refresh();
        }
      } catch {
        // Silently ignore network glitch during background polling
      }
    };

    checkNewReports();
    const interval = setInterval(checkNewReports, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
