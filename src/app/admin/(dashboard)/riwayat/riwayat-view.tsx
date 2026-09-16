"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, Search, ArrowUpDown, ArrowUp, ArrowDown, Building, Calendar, RotateCcw, RefreshCw } from "lucide-react";
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
import { RiwayatMobileView } from "@/components/mobile/riwayat-mobile-view";
import { ExportDialog } from "@/components/admin/export-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CompletedReportItem {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  lokasi_kerusakan: string;
  peralatan?: string;
  deskripsi?: string;
  penanganan?: string | null;
  status: string;
  processed_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RiwayatViewProps {
  completedReports: CompletedReportItem[];
}

type SortField = "ticket_number" | "updated_at" | "nama_pelapor" | "lokasi_kerusakan";
type SortOrder = "asc" | "desc";

export function RiwayatView({ completedReports }: RiwayatViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [bagianFilter, setBagianFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data riwayat berhasil dimuat ulang.");
    }, 600);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setBagianFilter("ALL");
    setPeriodFilter("ALL");
  };

  const isFiltered = searchQuery !== "" || bagianFilter !== "ALL" || periodFilter !== "ALL";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "updated_at" ? "desc" : "asc");
    }
  };

  const isWithinPeriod = (dateStr: string, period: string) => {
    if (period === "ALL") return true;
    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;
    const now = new Date();

    if (period === "TODAY") {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "THIS_MONTH") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "LAST_MONTH") {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        itemDate.getMonth() === prevMonth.getMonth() &&
        itemDate.getFullYear() === prevMonth.getFullYear()
      );
    }
    if (period === "THIS_YEAR") {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredReports = completedReports.filter((item) => {
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

    const matchesBagian = bagianFilter === "ALL" || item.bagian === bagianFilter;
    const matchesPeriod = isWithinPeriod(item.updated_at || item.created_at, periodFilter);

    return matchesSearch && matchesBagian && matchesPeriod;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    let comparison = 0;
    if (sortField === "updated_at") {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      comparison = dateA - dateB;
    } else if (sortField === "ticket_number") {
      comparison = a.ticket_number.localeCompare(b.ticket_number, "id-ID");
    } else if (sortField === "nama_pelapor") {
      comparison = a.nama_pelapor.localeCompare(b.nama_pelapor, "id-ID");
    } else if (sortField === "lokasi_kerusakan") {
      comparison = a.lokasi_kerusakan.localeCompare(b.lokasi_kerusakan, "id-ID");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const renderSortIndicator = (field: SortField) => {
    const isActive = sortField === field;
    if (!isActive) {
      return (
        <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-emerald-600 shrink-0 stroke-[2.5]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-emerald-600 shrink-0 stroke-[2.5]" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Halaman Dynamic */}
      <PageHeader
        title="Riwayat & Arsip Laporan"
        description="Daftar seluruh laporan gangguan fasilitas yang telah selesai ditangani beserta rincian tindakan perbaikan."
        badgeText="SIGAP Archive & History"
        badgeColor="emerald"
      />

      {/* Tampilan Utama Desktop / PC */}
      <div className="hidden lg:block">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-600" />
                  Arsip Laporan Selesai
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                  Menampilkan {sortedReports.length} dari total {completedReports.length} laporan tuntas
                </CardDescription>
              </div>

              {/* Filter Controls Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Bar Input */}
                <div className="relative w-48 sm:w-56 lg:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tiket / pelapor / deskripsi..."
                    className="pl-8.5 h-9 text-xs font-medium rounded-xl border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 bg-white"
                  />
                </div>

                {/* Filter Bagian Selector Dropdown */}
                <div className="relative flex items-center">
                  <Building className="absolute left-3 h-3.5 w-3.5 text-emerald-600 pointer-events-none" />
                  <select
                    value={bagianFilter}
                    onChange={(e) => setBagianFilter(e.target.value)}
                    className="pl-9 pr-8 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all appearance-none"
                    aria-label="Filter Bagian Riwayat"
                  >
                    <option value="ALL">Semua Bagian</option>
                    <option value="TUK">TUK</option>
                    <option value="Teknik">Teknik</option>
                    <option value="Pabrikasi">Pabrikasi</option>
                    <option value="Tanaman">Tanaman</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[9px]">▼</div>
                </div>

                {/* Filter Waktu Selector Dropdown */}
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-3.5 w-3.5 text-emerald-600 pointer-events-none" />
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="pl-9 pr-8 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all appearance-none"
                    aria-label="Filter Periode Waktu"
                  >
                    <option value="ALL">Semua Waktu</option>
                    <option value="TODAY">Hari Ini</option>
                    <option value="THIS_MONTH">Bulan Ini</option>
                    <option value="LAST_MONTH">Bulan Lalu</option>
                    <option value="THIS_YEAR">Tahun Ini</option>
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
                  className="h-9 px-3 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-bold text-xs cursor-pointer shrink-0 transition-all active:scale-95"
                  title="Muat Ulang Data Riwayat"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isRefreshing && "animate-spin text-emerald-600")} />
                  <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
                </Button>

                {/* Export Dialog Button */}
                <ExportDialog completedReports={filteredReports} />
              </div>
            </div>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/90 border-b border-sky-100/80 select-none">
                    <TableHead className="w-35 pl-5 pr-3 py-3.5">
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
                    <TableHead className="w-31.25 px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort("updated_at")}
                        className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                        title="Urutkan berdasarkan Waktu Selesai"
                      >
                        <span>Waktu Selesai</span>
                        {renderSortIndicator("updated_at")}
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
                    <TableHead className="w-45 px-3 py-3.5 font-extrabold text-slate-700 text-xs">
                      Deskripsi Kerusakan
                    </TableHead>
                    <TableHead className="w-47.5 px-3 py-3.5 font-extrabold text-slate-700 text-xs">
                      Tindakan Penanganan
                    </TableHead>
                    <TableHead className="w-25 font-extrabold text-slate-700 text-xs px-3 py-3.5">
                      Status
                    </TableHead>
                    <TableHead className="text-center w-21.25 font-extrabold text-slate-700 text-xs pr-5 pl-3 py-3.5">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-slate-400 italic text-xs">
                        Tidak ada riwayat laporan yang cocok dengan pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedReports.map((report) => {
                      const dateObj = new Date(report.updated_at || report.created_at);
                      const formattedDate = dateObj.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      const formattedTime = dateObj.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <TableRow key={report.id} className="hover:bg-sky-50/40 transition-colors border-b border-slate-100">
                          <TableCell className="font-mono text-xs font-bold text-sky-700 pl-5 pr-3 py-4">
                            {report.ticket_number}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 font-medium px-3 py-4">
                            <div className="font-bold text-emerald-800">{formattedDate}</div>
                            <div className="text-[11px] text-emerald-700 font-semibold">{formattedTime} WIB</div>
                            {report.created_at && (
                              <div className="text-[10px] text-slate-400 mt-0.5" title="Waktu Laporan Dibuat">
                                Dibuat: {new Date(report.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-4 max-w-40">
                            <div className="font-bold text-xs text-slate-800 truncate" title={report.nama_pelapor}>
                              {report.nama_pelapor}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate" title={`${report.bagian} • ${report.unit_kerja}`}>
                              {report.bagian} &bull; {report.unit_kerja}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium px-3 py-4 max-w-37.5">
                            <div className="truncate" title={report.lokasi_kerusakan}>
                              {report.lokasi_kerusakan}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium px-3 py-4 max-w-45">
                            <div className="line-clamp-2 leading-relaxed" title={report.deskripsi || "-"}>
                              {report.deskripsi || "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-emerald-950 font-medium px-3 py-4 max-w-47.5">
                            {report.penanganan ? (
                              <div className="bg-emerald-50/80 border border-emerald-100 text-emerald-900 px-2.5 py-1.5 rounded-lg line-clamp-2 leading-snug text-[11px]" title={report.penanganan}>
                                {report.penanganan}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <ReportStatusBadge status={report.status} />
                          </TableCell>
                          <TableCell className="text-center pr-5 pl-3 py-4">
                            <div className="flex items-center justify-center">
                              <Link href={`/admin/laporan/${report.id}`}>
                                <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 font-bold shadow-2xs cursor-pointer">
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
        <RiwayatMobileView completedReports={completedReports} />
      </div>
    </div>
  );
}
