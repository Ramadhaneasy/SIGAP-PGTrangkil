import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/user/report-status-badge";
import { StatColorScheme } from "@/components/admin/stat-card";
import { DashboardReportItem, DashboardLogItem } from "@/app/admin/(dashboard)/dashboard/dashboard-view";

export interface DashboardMobileViewProps {
  totalCount: number;
  waitingCount: number;
  processingCount: number;
  completedCount: number;
  totalAdminCount: number;
  recentReports: DashboardReportItem[];
  recentLogs: DashboardLogItem[];
}

export function DashboardMobileView({
  totalCount,
  waitingCount,
  processingCount,
  completedCount,
  totalAdminCount,
  recentReports,
  recentLogs,
}: DashboardMobileViewProps) {
  const stats: Array<{
    title: string;
    value: number;
    subtext: string;
    icon: LucideIcon;
    colorScheme: StatColorScheme;
  }> = [
    {
      title: "Total Laporan",
      value: totalCount,
      subtext: "Terverifikasi",
      icon: FileText,
      colorScheme: "sky",
    },
    {
      title: "Menunggu",
      value: waitingCount,
      subtext: "Disposisi",
      icon: Clock,
      colorScheme: "amber",
    },
    {
      title: "Diproses",
      value: processingCount,
      subtext: "Perbaikan",
      icon: Wrench,
      colorScheme: "blue",
    },
    {
      title: "Selesai",
      value: completedCount,
      subtext: "Tuntas",
      icon: CheckCircle2,
      colorScheme: "emerald",
    },
    {
      title: "Akun Admin",
      value: totalAdminCount,
      subtext: "Petugas",
      icon: Users,
      colorScheme: "purple",
    },
  ];

  const colorStyles: Record<
    StatColorScheme,
    { iconBg: string; iconColor: string; valueColor: string }
  > = {
    sky: { iconBg: "bg-sky-50", iconColor: "text-sky-700", valueColor: "text-sky-900" },
    amber: { iconBg: "bg-amber-50", iconColor: "text-amber-700", valueColor: "text-amber-900" },
    blue: { iconBg: "bg-blue-50", iconColor: "text-blue-700", valueColor: "text-blue-900" },
    emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-700", valueColor: "text-emerald-900" },
    purple: { iconBg: "bg-purple-50", iconColor: "text-purple-700", valueColor: "text-purple-900" },
  };

  return (
    <div className="space-y-3">
      {/* Minimalist Compact Stat Cards */}
      <div className="grid grid-cols-2 gap-1.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isLastSingle = idx === stats.length - 1 && stats.length % 2 !== 0;
          const color = colorStyles[stat.colorScheme];

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs ${
                isLastSingle ? "col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {stat.title}
                </span>
                <div className={`p-1.5 rounded-lg ${color.iconBg} ${color.iconColor} shrink-0`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className={`text-xl font-extrabold tracking-tight mt-0.5 ${color.valueColor}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                {stat.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimalist Recent Reports List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-sky-600" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Laporan Terbaru
            </h2>
          </div>
          <Link href="/admin/laporan" className="text-[11px] font-bold text-sky-700 flex items-center gap-0.5">
            Lihat Semua <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-center text-xs text-slate-400">
            Belum ada laporan masuk
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs space-y-1.5 hover:border-sky-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-sky-800 truncate">
                    {report.ticket_number}
                  </span>
                  <ReportStatusBadge status={report.status} />
                </div>

                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-slate-900 block truncate">
                    {report.unit_kerja}
                  </span>
                  <span className="text-[10.5px] text-slate-500 font-medium truncate block">
                    Pelapor: {report.nama_pelapor}
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-100 flex justify-end">
                  <Link href={`/admin/laporan/${report.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6.5 text-[10.5px] px-2.5 rounded-lg border-slate-200 text-slate-700 hover:text-sky-700 font-semibold"
                    >
                      Detail Laporan <ArrowRight className="ml-1 h-2.5 w-2.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minimalist Log Activity Feed */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-purple-600" />
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Log Aktivitas
            </h3>
          </div>
          <Link href="/admin/log-aktivitas" className="text-[11px] font-bold text-purple-700 flex items-center gap-0.5">
            Semua <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <div className="py-3 text-center text-xs text-slate-400">
              Belum ada log aktivitas
            </div>
          ) : (
            recentLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="py-1.5 first:pt-0 last:pb-0 space-y-0.5 text-[10.5px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate">{log.admin}</span>
                  <span className="text-[9.5px] text-slate-400 font-mono">
                    {new Date(log.waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </span>
                </div>
                <p className="text-slate-500 truncate" title={log.deskripsi || log.aktivitas}>
                  {log.deskripsi || log.aktivitas}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
