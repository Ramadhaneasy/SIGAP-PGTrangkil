"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Wrench,
  ArrowRight,
  Play,
  CheckCircle2,
  Loader2,
  Filter,
  Building,
  RotateCcw,
  ArrowUpDown,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportStatusBadge } from "@/components/user/report-status-badge";
import { LaporanItem } from "@/app/admin/(dashboard)/laporan/laporan-list-view";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface LaporanMobileViewProps {
  reports: LaporanItem[];
  onOpenCompleteModal?: (report: LaporanItem) => void;
}

export function LaporanMobileView({
  reports: initialReports,
  onOpenCompleteModal,
}: LaporanMobileViewProps) {
  const router = useRouter();
  const [reports, setReports] = useState<LaporanItem[]>(initialReports);
  const [prevInitialReports, setPrevInitialReports] = useState(initialReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bagianFilter, setBagianFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (initialReports !== prevInitialReports) {
    setPrevInitialReports(initialReports);
    setReports(initialReports);
  }

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setBagianFilter("ALL");
    setSortBy("NEWEST");
  };

  const isFiltered =
    searchQuery !== "" ||
    statusFilter !== "ALL" ||
    bagianFilter !== "ALL" ||
    sortBy !== "NEWEST";

  // Handle Quick Status Change on Mobile (e.g. MENUNGGU -> DIPROSES)
  const handleUpdateStatus = async (id: string, newStatus: string, ticketNumber: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/reports/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate status via API");

      setReports((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      toast.success(`Status ${ticketNumber} Diperbarui!`, {
        description: `Status diubah menjadi: ${newStatus}`,
      });

      router.refresh();
    } catch (err) {
      console.error("Gagal mengubah status di mobile:", err);
      toast.error("Gagal memperbarui status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.ticket_number.toLowerCase().includes(q) ||
      item.nama_pelapor.toLowerCase().includes(q) ||
      item.lokasi_kerusakan.toLowerCase().includes(q) ||
      item.unit_kerja.toLowerCase().includes(q) ||
      item.bagian.toLowerCase().includes(q) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(q)) ||
      (item.peralatan && item.peralatan.toLowerCase().includes(q)) ||
      (item.penanganan && item.penanganan.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesBagian = bagianFilter === "ALL" || item.bagian === bagianFilter;

    return matchesSearch && matchesStatus && matchesBagian;
  });

  // Sorting: Terbaru dan Terlama saja (tanpa emote)
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "OLDEST") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // Default NEWEST
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-2.5 pb-6">
      {/* Mobile Search & Multi-Controls */}
      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search Bar Input */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tiket, pelapor, deskripsi..."
            className="pl-8 h-8 text-xs rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 shadow-none transition-all"
          />
        </div>

        {/* Dropdowns Row: Bagian, Status, dan Urutkan (Terbaru / Terlama) */}
        <div className="grid grid-cols-3 gap-1">
          {/* Bagian Filter */}
          <div className="relative flex items-center w-full">
            <Building className="absolute left-1.5 h-3 w-3 text-sky-600 pointer-events-none" />
            <select
              value={bagianFilter}
              onChange={(e) => setBagianFilter(e.target.value)}
              className="w-full pl-5 pr-4 h-7.5 text-[10px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-sky-500 cursor-pointer appearance-none truncate"
              aria-label="Filter Bagian Laporan"
            >
              <option value="ALL">Semua Bagian</option>
              <option value="TUK">TUK</option>
              <option value="Teknik">Teknik</option>
              <option value="Pabrikasi">Pabrikasi</option>
              <option value="Tanaman">Tanaman</option>
            </select>
            <div className="absolute right-1 pointer-events-none text-slate-400 text-[7px]">▼</div>
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center w-full">
            <Filter className="absolute left-1.5 h-3 w-3 text-sky-600 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-5 pr-4 h-7.5 text-[10px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-sky-500 cursor-pointer appearance-none truncate"
              aria-label="Filter Status Laporan"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU">Menunggu ({reports.filter((r) => r.status === "MENUNGGU").length})</option>
              <option value="DIPROSES">Diproses ({reports.filter((r) => r.status === "DIPROSES").length})</option>
            </select>
            <div className="absolute right-1 pointer-events-none text-slate-400 text-[7px]">▼</div>
          </div>

          {/* Fitur Urutkan: Terbaru dan Terlama saja */}
          <div className="relative flex items-center w-full">
            <ArrowUpDown className="absolute left-1.5 h-3 w-3 text-sky-600 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-5 pr-4 h-7.5 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 cursor-pointer appearance-none truncate"
              aria-label="Urutkan Laporan"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
            </select>
            <div className="absolute right-1 pointer-events-none text-slate-400 text-[7px]">▼</div>
          </div>
        </div>

        {/* Status Hasil & Reset Button */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
          <span className="text-slate-400 font-medium">
            Total <strong className="text-slate-700 font-bold">{sortedReports.length}</strong> laporan
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Minimalist Mobile Report Cards List */}
      <div className="space-y-2">
        {sortedReports.length === 0 ? (
          <div className="text-center py-6 text-slate-400 italic text-xs bg-white rounded-xl border border-slate-200/80 p-3">
            Tidak ada laporan yang cocok dengan filter.
          </div>
        ) : (
          sortedReports.map((report) => {
            const dateObj = new Date(report.created_at);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            const formattedTime = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const isUpdatingThis = updatingId === report.id;

            return (
              <Card
                key={report.id}
                className="border border-slate-200/80 bg-white rounded-xl shadow-2xs hover:border-sky-300 transition-all overflow-hidden"
              >
                <CardContent className="p-2.5 space-y-1.5">
                  {/* Top Row: Ticket Number, Bagian Badge & Status Badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[11px] font-bold text-sky-800 truncate">
                        {report.ticket_number}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
                        {report.bagian}
                      </span>
                    </div>
                    <ReportStatusBadge status={report.status} />
                  </div>

                  {/* Middle: Unit Kerja & Description */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <Wrench className="h-3 w-3 text-sky-600 shrink-0" />
                      <span className="truncate">{report.unit_kerja}</span>
                    </h4>
                    {report.deskripsi && (
                      <p className="text-slate-600 text-[11px] leading-snug line-clamp-2 mt-0.5">
                        {report.deskripsi}
                      </p>
                    )}
                  </div>

                  {/* Linimasa 3 Titik Waktu */}
                  <div className="pt-2 border-t border-slate-100/90 space-y-1 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      <span className="font-semibold text-slate-500 w-11 shrink-0">Dibuat:</span>
                      <span className="font-medium text-slate-800">{formattedDate}, {formattedTime} WIB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        report.processed_at ? "bg-amber-500" : "bg-slate-300"
                      )} />
                      <span className="font-semibold text-slate-500 w-11 shrink-0">Proses:</span>
                      {report.processed_at ? (
                        <span className="font-semibold text-amber-700">
                          {new Date(report.processed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })},{" "}
                          {new Date(report.processed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[9.5px]">Belum diproses</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        report.completed_at ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <span className="font-semibold text-slate-500 w-11 shrink-0">Selesai:</span>
                      {report.completed_at ? (
                        <span className="font-semibold text-emerald-700">
                          {new Date(report.completed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })},{" "}
                          {new Date(report.completed_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[9.5px]">Belum selesai</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Metadata Pelapor & Action Buttons */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                    <div className="text-slate-500 min-w-0 truncate">
                      <div className="flex items-center gap-1 truncate font-semibold text-slate-700">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{report.nama_pelapor}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {report.status === "MENUNGGU" && (
                        <Button
                          size="sm"
                          disabled={isUpdatingThis}
                          onClick={() => handleUpdateStatus(report.id, "DIPROSES", report.ticket_number)}
                          className="h-6.5 px-2 rounded-md text-[10.5px] font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs"
                        >
                          {isUpdatingThis ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          ) : (
                            <>
                              <Play className="mr-1 h-2.5 w-2.5 fill-current" />
                              Proses
                            </>
                          )}
                        </Button>
                      )}

                      {report.status === "DIPROSES" && (
                        <Button
                          size="sm"
                          disabled={isUpdatingThis}
                          onClick={() => {
                            if (onOpenCompleteModal) {
                              onOpenCompleteModal(report);
                            } else {
                              handleUpdateStatus(report.id, "SELESAI", report.ticket_number);
                            }
                          }}
                          className="h-6.5 px-2 rounded-md text-[10.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                        >
                          <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                          Selesai
                        </Button>
                      )}

                      <Link href={`/admin/laporan/${report.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6.5 px-2 rounded-md text-[10.5px] font-bold border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300"
                        >
                          Detail <ArrowRight className="ml-1 h-2.5 w-2.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
