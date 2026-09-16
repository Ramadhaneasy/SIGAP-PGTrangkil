import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Users,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ReportStatusBadge } from "@/components/user/report-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard, type StatColorScheme } from "@/components/admin/stat-card";
import { DashboardMobileView } from "@/components/mobile/dashboard-mobile-view";

export interface DashboardReportItem {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  unit_kerja: string;
  peralatan?: string;
  status: string;
  created_at: string;
}

export interface DashboardLogItem {
  id: string;
  waktu: string;
  admin: string;
  role: string;
  aktivitas: string;
  target: string;
  deskripsi: string;
}

export interface DashboardViewProps {
  totalCount: number;
  waitingCount: number;
  processingCount: number;
  completedCount: number;
  totalAdminCount: number;
  recentReports: DashboardReportItem[];
  recentLogs: DashboardLogItem[];
}

export function DashboardView(props: DashboardViewProps) {
  const {
    totalCount,
    waitingCount,
    processingCount,
    completedCount,
    totalAdminCount,
    recentReports,
    recentLogs,
  } = props;

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
      subtext: "Perlu disposisi",
      icon: Clock,
      colorScheme: "amber",
    },
    {
      title: "Diproses",
      value: processingCount,
      subtext: "Dalam perbaikan",
      icon: Wrench,
      colorScheme: "blue",
    },
    {
      title: "Selesai",
      value: completedCount,
      subtext: "Perbaikan tuntas",
      icon: CheckCircle2,
      colorScheme: "emerald",
    },
    {
      title: "Petugas Admin",
      value: totalAdminCount,
      subtext: "Akun terdaftar",
      icon: Users,
      colorScheme: "purple",
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header Halaman Minimalis */}
      <PageHeader
        title="Dashboard Overview"
        description="Ringkasan status penanganan fasilitas & aktivitas petugas PT Kebon Agung PG Trangkil."
        badgeText="SIGAP Summary"
      />

      {/* Tampilan Utama Desktop / PC */}
      <div className="hidden lg:block space-y-5">
        {/* Sleek Minimalist Stat Cards 5 Columns Grid */}
        <div className="grid grid-cols-5 gap-3.5">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              title={stat.title}
              value={stat.value}
              description={stat.subtext}
              icon={stat.icon}
              colorScheme={stat.colorScheme}
            />
          ))}
        </div>

        {/* Layout Grid 12 Kolom Simetris: Left Table Laporan (8 cols), Right Log Activity Feed (4 cols) */}
        <div className="grid grid-cols-12 gap-5 items-stretch">
          {/* LEFT: Desktop Table Laporan Terbaru (8 Kolom) */}
          <div className="col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Laporan Terbaru
                </h3>
              </div>
              <Link href="/admin/laporan">
                <Button variant="ghost" size="sm" className="text-xs text-sky-700 font-bold hover:bg-sky-50 rounded-xl px-2.5 h-7 gap-1 cursor-pointer">
                  Lihat Semua <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-b border-slate-100 hover:bg-slate-50/70">
                    <TableHead className="w-[130px] font-bold text-slate-600 text-xs py-3 pl-5">Nomor Tiket</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs py-3">Pelapor & Unit Kerja</TableHead>
                    <TableHead className="w-[120px] font-bold text-slate-600 text-xs py-3">Status</TableHead>
                    <TableHead className="text-right w-[90px] font-bold text-slate-600 text-xs py-3 pr-5">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-xs text-slate-400 font-medium">
                        Belum ada laporan kerusakan masuk
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-sky-50/30 transition-colors border-b border-slate-100/80">
                        <TableCell className="font-mono text-xs font-bold text-sky-700 py-3 pl-5">
                          {report.ticket_number}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="font-bold text-xs text-slate-800 truncate">
                            {report.nama_pelapor}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
                            {report.unit_kerja}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <ReportStatusBadge status={report.status} />
                        </TableCell>
                        <TableCell className="text-right py-3 pr-5">
                          <Link href={`/admin/laporan/${report.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 rounded-lg border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 font-bold shadow-2xs cursor-pointer">
                              Detail
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* RIGHT: Log Aktivitas Feed (4 Kolom) */}
          <div className="col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Log Aktivitas
                </h3>
              </div>
              <Link href="/admin/log-aktivitas">
                <Button variant="ghost" size="sm" className="text-xs text-purple-700 font-bold hover:bg-purple-50 rounded-xl px-2.5 h-7 gap-1 cursor-pointer">
                  Semua <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="p-3 divide-y divide-slate-100/80 flex-1 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  Belum ada catatan log aktivitas
                </div>
              ) : (
                recentLogs.map((log) => {
                  const dateObj = new Date(log.waktu);
                  const timeStr = dateObj.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={log.id} className="p-2.5 hover:bg-slate-50/70 rounded-xl transition-colors space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          {log.admin}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {timeStr} WIB
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate" title={log.deskripsi || log.aktivitas}>
                        {log.deskripsi || log.aktivitas}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tampilan Khusus Mobile HP */}
      <div className="block lg:hidden">
        <DashboardMobileView {...props} />
      </div>
    </div>
  );
}
