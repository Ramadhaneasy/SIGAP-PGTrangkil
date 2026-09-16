"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Play, CheckCircle2, Eye, Filter, Loader2, Building, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, RotateCcw } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LaporanMobileView } from "@/components/mobile/laporan-mobile-view";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { SelesaiPenangananModal } from "@/components/admin/selesai-penanganan-modal";

export interface LaporanItem {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  nomor_hp?: string;
  lokasi_kerusakan: string;
  peralatan?: string;
  deskripsi: string;
  status: string;
  penanganan?: string | null;
  processed_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface LaporanListViewProps {
  reports: LaporanItem[];
}

type SortField = "ticket_number" | "created_at" | "nama_pelapor" | "lokasi_kerusakan" | "status";
type SortOrder = "asc" | "desc";

export function LaporanListView({ reports: initialReports }: LaporanListViewProps) {
  const router = useRouter();
  const [reports, setReports] = useState<LaporanItem[]>(initialReports);
  const [prevInitialReports, setPrevInitialReports] = useState(initialReports);

  if (initialReports !== prevInitialReports) {
    setPrevInitialReports(initialReports);
    setReports(initialReports);
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [bagianFilter, setBagianFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReportToComplete, setSelectedReportToComplete] = useState<LaporanItem | null>(null);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data laporan berhasil dimuat ulang.");
    }, 600);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setBagianFilter("ALL");
  };

  const isFiltered = searchQuery !== "" || statusFilter !== "ALL" || bagianFilter !== "ALL";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "created_at" ? "desc" : "asc");
    }
  };



  // Handle Quick Status Update Action (e.g. MENUNGGU -> DIPROSES)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/reports/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengupdate status");
      }

      const nowIso = new Date().toISOString();
      setReports((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
                processed_at: newStatus === "DIPROSES" ? (item.processed_at || nowIso) : item.processed_at,
              }
            : item
        )
      );
      toast.success("Status Laporan Diperbarui!", {
        description: `Status berhasil diubah menjadi ${newStatus}.`,
      });

      router.refresh();
    } catch (err) {
      console.error("Gagal mengubah status:", err);
      toast.error("Gagal memperbarui status laporan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteSuccess = (reportId: string) => {
    setReports((prev) => prev.filter((item) => item.id !== reportId));
    router.refresh();
  };

  // Filter Reports based on search query, status filter & bagian filter
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

  // Sort Reports dynamically based on selected field and order
  const sortedReports = [...filteredReports].sort((a, b) => {
    let comparison = 0;
    if (sortField === "created_at") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === "status") {
      const statusWeight: Record<string, number> = { MENUNGGU: 1, DIPROSES: 2, SELESAI: 3 };
      comparison = (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
    } else if (sortField === "ticket_number") {
      comparison = a.ticket_number.localeCompare(b.ticket_number, "id-ID");
    } else if (sortField === "nama_pelapor") {
      comparison = a.nama_pelapor.localeCompare(b.nama_pelapor, "id-ID");
    } else if (sortField === "lokasi_kerusakan") {
      comparison = a.lokasi_kerusakan.localeCompare(b.lokasi_kerusakan, "id-ID");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate Status Counts
  const totalCount = reports.length;
  const waitingCount = reports.filter((r) => r.status === "MENUNGGU").length;
  const processingCount = reports.filter((r) => r.status === "DIPROSES").length;

  const renderSortIndicator = (field: SortField) => {
    const isActive = sortField === field;
    if (!isActive) {
      return <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-sky-500 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-sky-600 shrink-0 stroke-[2.5]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-sky-600 shrink-0 stroke-[2.5]" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Halaman Dynamic */}
      <PageHeader
        title="Manage Laporan Aktif"
        description="Kelola laporan aktif yang membutuhkan respon atau perbaikan teknis. Laporan selesai otomatis dipindahkan ke Riwayat Laporan."
        badgeText="SIGAP Active Reports"
      />

      {/* Tampilan Utama Desktop / PC */}
      <div className="hidden lg:block">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          {/* Header Card & Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900">
                  Data Laporan Aktif
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                  Menampilkan {filteredReports.length} laporan aktif (Menunggu & Diproses)
                </CardDescription>
              </div>

              {/* Professional Search, Multi-Filter Selectors & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Bar Input */}
                <div className="relative w-44 sm:w-52 lg:w-56">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tiket / pelapor / deskripsi..."
                    className="pl-9 h-9 text-xs font-medium rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-white shadow-2xs"
                  />
                </div>

                {/* Filter Bagian Selector Dropdown */}
                <div className="relative flex items-center">
                  <Building className="absolute left-3 h-3.5 w-3.5 text-sky-600 pointer-events-none" />
                  <select
                    value={bagianFilter}
                    onChange={(e) => setBagianFilter(e.target.value)}
                    className="pl-9 pr-8 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer hover:border-sky-400 transition-all appearance-none"
                    aria-label="Filter Bagian Laporan"
                  >
                    <option value="ALL">Semua Bagian</option>
                    <option value="TUK">TUK</option>
                    <option value="Teknik">Teknik</option>
                    <option value="Pabrikasi">Pabrikasi</option>
                    <option value="Tanaman">Tanaman</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[9px]">▼</div>
                </div>

                {/* Filter Status Selector Dropdown */}
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 h-3.5 w-3.5 text-sky-600 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs cursor-pointer hover:border-sky-400 transition-all appearance-none"
                    aria-label="Filter Status Laporan"
                  >
                    <option value="ALL">Semua Status ({totalCount})</option>
                    <option value="MENUNGGU">Menunggu ({waitingCount})</option>
                    <option value="DIPROSES">Diproses ({processingCount})</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[9px]">▼</div>
                </div>

                {/* Tombol Reset Filter */}
                {isFiltered && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-9 px-2.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs cursor-pointer transition-all active:scale-95"
                    title="Reset Semua Filter"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                )}

                {/* Tombol Refresh Data */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-9 px-3 rounded-xl border-sky-200/90 bg-white text-sky-700 hover:bg-sky-50 shadow-2xs font-bold text-xs cursor-pointer shrink-0 transition-all active:scale-95"
                  title="Muat Ulang Data Laporan"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isRefreshing && "animate-spin text-sky-600")} />
                  <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Table Container yang Rapi & Pas di Layar */}
          <div className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/90 border-b border-sky-100/80 select-none">
                    <TableHead className="w-36.25 pl-5 pr-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort("ticket_number")}
                        className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                        title="Urutkan berdasarkan Nomor Tiket"
                      >
                        <span>Nomor Tiket</span>
                        {renderSortIndicator("ticket_number")}
                      </button>
                    </TableHead>
                    <TableHead className="w-48.75 px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort("created_at")}
                        className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                        title="Urutkan berdasarkan Waktu Dibuat"
                      >
                        <span>Waktu &amp; Tanggal</span>
                        {renderSortIndicator("created_at")}
                      </button>
                    </TableHead>
                    <TableHead className="w-40 px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort("nama_pelapor")}
                        className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                        title="Urutkan berdasarkan Nama Pelapor"
                      >
                        <span>Pelapor & Unit Kerja</span>
                        {renderSortIndicator("nama_pelapor")}
                      </button>
                    </TableHead>
                    <TableHead className="w-37.5 px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort("lokasi_kerusakan")}
                        className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                        title="Urutkan berdasarkan Lokasi Kerusakan"
                      >
                        <span>Lokasi Kerusakan</span>
                        {renderSortIndicator("lokasi_kerusakan")}
                      </button>
                    </TableHead>
                    <TableHead className="w-50 px-3 py-3.5 font-extrabold text-slate-700 text-xs">
                      Deskripsi Kerusakan
                    </TableHead>
                    <TableHead className="w-28.75 px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort("status")}
                        className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                        title="Urutkan berdasarkan Urutan Status Penanganan"
                      >
                        <span>Status</span>
                        {renderSortIndicator("status")}
                      </button>
                    </TableHead>
                    <TableHead className="text-center w-31.25 font-extrabold text-slate-700 text-xs pr-5 pl-3 py-3.5">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-400 italic text-xs">
                        Tidak ada laporan kerusakan yang cocok dengan pencarian / filter ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedReports.map((report) => {
                      const formatDateTime = (isoString?: string | null) => {
                        if (!isoString) return null;
                        const d = new Date(isoString);
                        if (isNaN(d.getTime())) return null;
                        const tgl = d.toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const jam = d.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return { tgl, jam: `${jam} WIB` };
                      };

                      const timeCreated = formatDateTime(report.created_at);
                      const timeProcessed = formatDateTime(report.processed_at);
                      const timeCompleted = formatDateTime(report.completed_at);

                      const isUpdatingThis = updatingId === report.id;

                      return (
                        <TableRow key={report.id} className="hover:bg-sky-50/40 transition-colors border-b border-slate-100">
                          <TableCell className="font-mono text-xs font-bold text-sky-700 pl-5 pr-3 py-3.5 align-top">
                            {report.ticket_number}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-3.5 w-48.75 align-top">
                            <div className="space-y-1.5 text-[11px]">
                              {/* 1. Waktu Laporan Dibuat */}
                              <div className="flex items-center gap-1.5" title="Waktu Laporan Dibuat">
                                <span className="inline-block w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                                <span className="text-[10px] font-bold text-slate-500 w-11 shrink-0">Dibuat:</span>
                                <span className="font-bold text-slate-800">
                                  {timeCreated ? `${timeCreated.tgl}, ${timeCreated.jam}` : "-"}
                                </span>
                              </div>

                              {/* 2. Waktu Laporan Diproses */}
                              <div className="flex items-center gap-1.5" title="Waktu Laporan Mulai Diproses">
                                <span className={cn(
                                  "inline-block w-2 h-2 rounded-full shrink-0",
                                  report.processed_at ? "bg-amber-500" : "bg-slate-300"
                                )} />
                                <span className="text-[10px] font-bold text-slate-500 w-11 shrink-0">Proses:</span>
                                {timeProcessed ? (
                                  <span className="font-bold text-amber-700">
                                    {timeProcessed.tgl}, {timeProcessed.jam}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">Belum diproses</span>
                                )}
                              </div>

                              {/* 3. Waktu Laporan Selesai */}
                              <div className="flex items-center gap-1.5" title="Waktu Laporan Selesai Dikerjakan">
                                <span className={cn(
                                  "inline-block w-2 h-2 rounded-full shrink-0",
                                  report.completed_at ? "bg-emerald-500" : "bg-slate-300"
                                )} />
                                <span className="text-[10px] font-bold text-slate-500 w-11 shrink-0">Selesai:</span>
                                {timeCompleted ? (
                                  <span className="font-bold text-emerald-700">
                                    {timeCompleted.tgl}, {timeCompleted.jam}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">Belum selesai</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4 max-w-40">
                            <div className="font-bold text-xs text-slate-900 truncate" title={report.nama_pelapor}>
                              {report.nama_pelapor}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate" title={`${report.bagian} • ${report.unit_kerja}`}>
                              {report.bagian} &bull; {report.unit_kerja}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium px-3 py-4 max-w-37.5">
                            <div className="truncate" title={report.lokasi_kerusakan}>
                              {report.lokasi_kerusakan}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium px-3 py-4 max-w-50">
                            <div className="line-clamp-2 leading-relaxed" title={report.deskripsi || "-"}>
                              {report.deskripsi || "-"}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <ReportStatusBadge status={report.status} />
                          </TableCell>
                          <TableCell className="text-center pr-5 pl-3 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1-Click Quick Action Button: MENUNGGU -> DIPROSES */}
                              {report.status === "MENUNGGU" && (
                                <Button
                                  size="sm"
                                  disabled={isUpdatingThis}
                                  onClick={() => handleUpdateStatus(report.id, "DIPROSES")}
                                  className="h-7 text-[11px] px-2.5 rounded-full bg-linear-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold shadow-2xs active:scale-95 cursor-pointer"
                                  title="Ubah Status menjadi Diproses"
                                >
                                  {isUpdatingThis ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Play className="mr-1 h-3 w-3 fill-current" />
                                      Proses
                                    </>
                                  )}
                                </Button>
                              )}

                              {/* 1-Click Quick Action Button: DIPROSES -> SELESAI */}
                              {report.status === "DIPROSES" && (
                                <Button
                                  size="sm"
                                  disabled={isUpdatingThis}
                                  onClick={() => setSelectedReportToComplete(report)}
                                  className="h-7 text-[11px] px-2.5 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-2xs active:scale-95 cursor-pointer"
                                  title="Tandai Selesai Perbaikan"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Selesai
                                </Button>
                              )}

                              {/* Detail Button */}
                              <Link href={`/admin/laporan/${report.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 font-bold shadow-2xs cursor-pointer"
                                  title="Lihat Detail Laporan"
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  Detail
                                </Button>
                              </Link>
                            </div>
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
        <LaporanMobileView
          reports={reports}
          onOpenCompleteModal={(report) => setSelectedReportToComplete(report)}
        />
      </div>

      {/* Modal Deskripsi Tindakan Penanganan Selesai */}
      <SelesaiPenangananModal
        report={selectedReportToComplete}
        open={Boolean(selectedReportToComplete)}
        onOpenChange={(open) => !open && setSelectedReportToComplete(null)}
        onSuccess={handleCompleteSuccess}
      />
    </div>
  );
}
