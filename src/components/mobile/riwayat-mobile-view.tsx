"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Wrench,
  Calendar,
  Eye,
  Building,
  RotateCcw,
  ArrowUpDown,
  CheckCircle2,
  User,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportStatusBadge } from "@/components/user/report-status-badge";
import { CompletedReportItem } from "@/app/admin/(dashboard)/riwayat/riwayat-view";
import { ExportDialog } from "@/components/admin/export-dialog";

export interface RiwayatMobileViewProps {
  completedReports: CompletedReportItem[];
}

export function RiwayatMobileView({ completedReports }: RiwayatMobileViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bagianFilter, setBagianFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  const handleResetFilters = () => {
    setSearchQuery("");
    setBagianFilter("ALL");
    setPeriodFilter("ALL");
    setSortBy("NEWEST");
  };

  const isFiltered =
    searchQuery !== "" ||
    bagianFilter !== "ALL" ||
    periodFilter !== "ALL" ||
    sortBy !== "NEWEST";

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

  const filteredReports = completedReports.filter((report) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      report.ticket_number.toLowerCase().includes(q) ||
      report.nama_pelapor.toLowerCase().includes(q) ||
      report.unit_kerja.toLowerCase().includes(q) ||
      report.bagian.toLowerCase().includes(q) ||
      report.lokasi_kerusakan.toLowerCase().includes(q) ||
      (report.deskripsi && report.deskripsi.toLowerCase().includes(q)) ||
      (report.peralatan && report.peralatan.toLowerCase().includes(q)) ||
      (report.penanganan && report.penanganan.toLowerCase().includes(q));

    const matchesBagian = bagianFilter === "ALL" || report.bagian === bagianFilter;
    const matchesPeriod = isWithinPeriod(report.updated_at || report.created_at, periodFilter);

    return matchesSearch && matchesBagian && matchesPeriod;
  });

  // Sorting: Terbaru dan Terlama saja (tanpa emote)
  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at).getTime();
    const dateB = new Date(b.updated_at || b.created_at).getTime();
    if (sortBy === "OLDEST") {
      return dateA - dateB;
    }
    // Default NEWEST
    return dateB - dateA;
  });

  return (
    <div className="space-y-2.5 pb-6">
      {/* Mobile Search & Controls */}
      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search Bar Input & Export Dialog */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, pelapor, penanganan..."
              className="pl-8 h-8 text-xs rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 shadow-none transition-all"
            />
          </div>
          <ExportDialog completedReports={sortedReports} />
        </div>

        {/* Dropdowns Row: Bagian, Periode & Urutkan */}
        <div className="grid grid-cols-3 gap-1">
          <div className="relative flex items-center w-full">
            <Building className="absolute left-1.5 h-3 w-3 text-emerald-600 pointer-events-none" />
            <select
              value={bagianFilter}
              onChange={(e) => setBagianFilter(e.target.value)}
              className="w-full pl-5 pr-4 h-7.5 text-[10px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer appearance-none truncate"
              aria-label="Filter Bagian Riwayat"
            >
              <option value="ALL">Semua Bagian</option>
              <option value="TUK">TUK</option>
              <option value="Teknik">Teknik</option>
              <option value="Pabrikasi">Pabrikasi</option>
              <option value="Tanaman">Tanaman</option>
            </select>
            <div className="absolute right-1 pointer-events-none text-slate-400 text-[7px]">▼</div>
          </div>

          <div className="relative flex items-center w-full">
            <Calendar className="absolute left-1.5 h-3 w-3 text-emerald-600 pointer-events-none" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full pl-5 pr-4 h-7.5 text-[10px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer appearance-none truncate"
              aria-label="Filter Periode Waktu"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="TODAY">Hari Ini</option>
              <option value="THIS_MONTH">Bulan Ini</option>
              <option value="LAST_MONTH">Bulan Lalu</option>
              <option value="THIS_YEAR">Tahun Ini</option>
            </select>
            <div className="absolute right-1 pointer-events-none text-slate-400 text-[7px]">▼</div>
          </div>

          {/* Fitur Urutkan: Terbaru dan Terlama saja */}
          <div className="relative flex items-center w-full">
            <ArrowUpDown className="absolute left-1.5 h-3 w-3 text-emerald-600 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-5 pr-4 h-7.5 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer appearance-none truncate"
              aria-label="Urutkan Riwayat"
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
            Total <strong className="text-slate-700 font-bold">{sortedReports.length}</strong> riwayat tuntas
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

      {/* Minimalist Mobile Completed Reports List */}
      {sortedReports.length === 0 ? (
        <Card className="border border-dashed border-slate-200 bg-white rounded-xl p-6 text-center shadow-2xs">
          <p className="text-xs text-slate-400 italic font-medium">
            Tidak ada riwayat laporan yang cocok dengan pencarian.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedReports.map((report) => {
            const dateObj = new Date(report.updated_at || report.created_at);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            const formattedTime = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={report.id}
                className="border border-slate-200/80 bg-white rounded-xl shadow-2xs hover:border-emerald-300 transition-all overflow-hidden"
              >
                <CardContent className="p-2.5 space-y-1.5">
                  {/* Top Row: Ticket Number, Bagian Badge & Status Badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 truncate">
                        {report.ticket_number}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
                        {report.bagian}
                      </span>
                    </div>
                    <ReportStatusBadge status={report.status} />
                  </div>

                  {/* Middle: Unit Kerja & Location */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <Wrench className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{report.unit_kerja}</span>
                    </h4>
                    {report.deskripsi && (
                      <p className="text-slate-600 text-[11px] leading-snug line-clamp-1 mt-0.5">
                        {report.deskripsi}
                      </p>
                    )}
                  </div>

                  {/* Penanganan Selesai Highlight Box */}
                  {report.penanganan && (
                    <div className="bg-emerald-50/70 border border-emerald-100/90 p-1.5 rounded-md text-[10px] text-emerald-950 leading-relaxed">
                      <span className="font-bold text-emerald-800 flex items-center gap-1 mb-0.5 text-[9.5px]">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                        Penanganan:
                      </span>
                      <p className="line-clamp-2 text-slate-700">{report.penanganan}</p>
                    </div>
                  )}

                  {/* Bottom Row: Metadata & Detail Action */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                    <div className="text-slate-500 min-w-0 truncate space-y-0.5">
                      <div className="flex items-center gap-1 truncate font-medium text-slate-700">
                        <User className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{report.nama_pelapor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[9.5px]">
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        <span>Selesai: {formattedDate}, {formattedTime}</span>
                      </div>
                    </div>

                    <Link href={`/admin/laporan/${report.id}`} className="shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6.5 text-[10.5px] px-2 rounded-md border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-bold"
                        title="Lihat Detail Laporan"
                      >
                        <Eye className="mr-1 h-2.5 w-2.5" />
                        Detail
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
