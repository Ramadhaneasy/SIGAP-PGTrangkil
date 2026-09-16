"use client";

import React, { useState } from "react";
import { Activity, Search, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateIndonesian } from "@/lib/date-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogAktivitasMobileView } from "@/components/mobile/log-aktivitas-mobile-view";

export interface LogItem {
  id: string;
  waktu: string;
  admin: string;
  role: string;
  aktivitas: string;
  target: string;
  deskripsi: string;
}

export interface LogAktivitasViewProps {
  logs: LogItem[];
}

type SortField = "waktu" | "admin" | "aktivitas" | "target";
type SortOrder = "asc" | "desc";

export function LogAktivitasView({ logs }: LogAktivitasViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("waktu");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "waktu" ? "desc" : "asc");
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.admin.toLowerCase().includes(q) ||
      log.aktivitas.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.deskripsi.toLowerCase().includes(q) ||
      log.role.toLowerCase().includes(q)
    );
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let comparison = 0;
    if (sortField === "waktu") {
      comparison = new Date(a.waktu).getTime() - new Date(b.waktu).getTime();
    } else if (sortField === "admin") {
      comparison = a.admin.localeCompare(b.admin, "id-ID");
    } else if (sortField === "aktivitas") {
      comparison = a.aktivitas.localeCompare(b.aktivitas, "id-ID");
    } else if (sortField === "target") {
      comparison = a.target.localeCompare(b.target, "id-ID");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const renderSortIndicator = (field: SortField) => {
    const isActive = sortField === field;
    if (!isActive) {
      return (
        <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-purple-500 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-purple-600 shrink-0 stroke-[2.5]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-purple-600 shrink-0 stroke-[2.5]" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Halaman Dynamic */}
      <PageHeader
        title="Log Aktivitas & Audit Trail"
        description="Catatan terintegrasi untuk memantau jejak aktivitas perbaikan dan perubahan data oleh petugas."
        badgeText="SIGAP Audit Trail"
        badgeColor="purple"
      />

      {/* 💻 Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Jejak Audit Aktivitas Petugas
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Menampilkan {sortedLogs.length} dari total {logs.length} catatan audit
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari log / admin / tiket..."
                  className="pl-8.5 h-9 text-xs font-medium rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/90 border-b border-sky-100/80 select-none">
                  <TableHead className="w-[145px] pl-5 pr-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("waktu")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-purple-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Waktu Aktivitas"
                    >
                      <span>Waktu Aktivitas</span>
                      {renderSortIndicator("waktu")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[160px] px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("admin")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-purple-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Nama Admin"
                    >
                      <span>Petugas / Admin</span>
                      {renderSortIndicator("admin")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[135px] px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("aktivitas")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-purple-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Jenis Aktivitas"
                    >
                      <span>Aktivitas</span>
                      {renderSortIndicator("aktivitas")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[150px] px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("target")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-purple-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Target Tiket"
                    >
                      <span>Target Tiket</span>
                      {renderSortIndicator("target")}
                    </button>
                  </TableHead>
                  <TableHead className="font-extrabold text-slate-700 text-xs pr-5 pl-3 py-3.5">
                    Deskripsi Perubahan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8">
                      <EmptyState
                        icon={Activity}
                        title="Belum Ada Log Aktivitas"
                        description="Tidak ada catatan jejak audit yang cocok dengan kata kunci pencarian Anda."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLogs.map((log) => {
                    const formattedDate = formatDateIndonesian(log.waktu);
                    const formattedTime = new Date(log.waktu).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <TableRow key={log.id} className="hover:bg-purple-50/30 transition-colors border-b border-slate-100">
                        <TableCell className="text-xs text-slate-500 font-medium pl-5 pr-3 py-4">
                          <div className="font-semibold text-slate-800">{formattedDate}</div>
                          <div className="text-[11px] text-slate-400">{formattedTime} WIB</div>
                        </TableCell>
                        <TableCell className="px-3 py-4">
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                            {log.admin}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {log.role}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-4">
                          {(() => {
                            const act = log.aktivitas.toLowerCase();
                            let badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
                            if (act.includes("ban") && !act.includes("unban")) {
                              badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                            } else if (act.includes("unban") || act.includes("tambah")) {
                              badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            } else if (act.includes("hapus")) {
                              badgeStyle = "bg-rose-100 text-rose-800 border-rose-300";
                            } else if (act.includes("profil") || act.includes("update") || act.includes("password")) {
                              badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                            }

                            return (
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                              >
                                {log.aktivitas}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-sky-700 px-3 py-4">
                          {log.target}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium pr-5 pl-3 py-4">
                          {log.deskripsi}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      </div>

      {/* Tampilan Khusus Mobile HP */}
      <div className="block lg:hidden">
        <LogAktivitasMobileView logs={logs} />
      </div>
    </div>
  );
}
