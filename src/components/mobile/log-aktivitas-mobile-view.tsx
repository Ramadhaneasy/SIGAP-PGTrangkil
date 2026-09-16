"use client";

import React, { useState } from "react";
import {
  Activity,
  Search,
  Crown,
  Wrench,
  Clock,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogItem } from "@/app/admin/(dashboard)/log-aktivitas/log-aktivitas-view";

export interface LogAktivitasMobileViewProps {
  logs: LogItem[];
}

export function LogAktivitasMobileView({ logs }: LogAktivitasMobileViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  const handleResetFilters = () => {
    setSearchQuery("");
    setActivityFilter("ALL");
    setSortBy("NEWEST");
  };

  const isFiltered =
    searchQuery !== "" ||
    activityFilter !== "ALL" ||
    sortBy !== "NEWEST";

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.admin.toLowerCase().includes(q) ||
      log.aktivitas.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.deskripsi.toLowerCase().includes(q);

    const matchesFilter =
      activityFilter === "ALL" ||
      (activityFilter === "ADMIN" &&
        (log.aktivitas.includes("Admin") || log.aktivitas.includes("Ban") || log.aktivitas.includes("Unban"))) ||
      (activityFilter === "LAPORAN" &&
        (log.aktivitas.includes("Laporan") || log.aktivitas.includes("Perbaikan") || log.aktivitas.includes("Disposisi")));

    return matchesSearch && matchesFilter;
  });

  // Sorting: Terbaru dan Terlama saja (tanpa emote)
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === "OLDEST") {
      return new Date(a.waktu).getTime() - new Date(b.waktu).getTime();
    }
    // Default NEWEST
    return new Date(b.waktu).getTime() - new Date(a.waktu).getTime();
  });

  return (
    <div className="space-y-2.5 pb-6">
      {/* Mobile Search & Controls */}
      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search Bar Input */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari admin, aktivitas, tiket..."
            className="pl-8 h-8 text-xs rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 shadow-none transition-all"
          />
        </div>

        {/* Dropdowns Row: Filter Aktivitas & Sort Controls */}
        <div className="grid grid-cols-2 gap-1">
          <div className="relative flex items-center w-full">
            <Activity className="absolute left-2 h-3 w-3 text-purple-600 pointer-events-none" />
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="w-full pl-6 pr-5 h-7.5 text-[10.5px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-purple-500 cursor-pointer appearance-none truncate"
              aria-label="Filter Jenis Aktivitas"
            >
              <option value="ALL">Semua Aktivitas</option>
              <option value="LAPORAN">Penanganan Laporan</option>
              <option value="ADMIN">Kelola Admin</option>
            </select>
            <div className="absolute right-1.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
          </div>

          {/* Fitur Urutkan: Terbaru dan Terlama saja */}
          <div className="relative flex items-center w-full">
            <ArrowUpDown className="absolute left-2 h-3 w-3 text-purple-600 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-6 pr-5 h-7.5 text-[10.5px] font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-purple-500 cursor-pointer appearance-none truncate"
              aria-label="Urutkan Log"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
            </select>
            <div className="absolute right-1.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
          </div>
        </div>

        {/* Status Hasil & Reset Button */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
          <span className="text-slate-400 font-medium">
            Total <strong className="text-slate-700 font-bold">{sortedLogs.length}</strong> catatan
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

      {/* Mobile Activity Cards */}
      {sortedLogs.length === 0 ? (
        <Card className="border border-dashed border-slate-200 bg-white rounded-xl p-6 text-center shadow-2xs">
          <p className="text-xs text-slate-400 italic font-medium">
            Tidak ada catatan log aktivitas yang cocok dengan pencarian.
          </p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {sortedLogs.map((log) => {
            const dateObj = new Date(log.waktu);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            const formattedTime = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const isSuper = log.role === "SUPER_ADMIN";
            const isBanOrDelete =
              log.aktivitas.includes("Ban") || log.aktivitas.includes("Hapus");
            const isReportResolve = log.aktivitas.includes("Selesai") || log.aktivitas.includes("Penyelesaian");

            return (
              <Card
                key={log.id}
                className="border border-slate-200/80 bg-white rounded-xl shadow-2xs hover:border-purple-200 transition-all overflow-hidden"
              >
                <CardContent className="p-2.5 space-y-1">
                  {/* Top Row: Activity Badge & Timestamp */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        isBanOrDelete
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : isReportResolve
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-purple-50 text-purple-800 border-purple-200"
                      }`}
                    >
                      <Activity className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{log.aktivitas}</span>
                    </span>

                    <span className="text-[9.5px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {formattedDate}, {formattedTime}
                    </span>
                  </div>

                  {/* Target & Deskripsi */}
                  <div className="space-y-0.5">
                    {log.target && (
                      <div className="text-[10.5px] font-semibold text-slate-700 flex items-center gap-1">
                        <span className="text-slate-400 font-normal text-[9.5px]">Target:</span>
                        <span className="font-mono text-sky-700 text-[10px] font-bold">
                          {log.target}
                        </span>
                      </div>
                    )}
                    <p className="text-[10.5px] text-slate-600 leading-snug">
                      {log.deskripsi || log.aktivitas}
                    </p>
                  </div>

                  {/* Footer Row: Admin Info */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9.5px]">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[8.5px] shrink-0">
                        {log.admin.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700 truncate">{log.admin}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-0.5 font-bold shrink-0 text-[9px] ${
                        isSuper ? "text-purple-700" : "text-sky-700"
                      }`}
                    >
                      {isSuper ? <Crown className="h-2.5 w-2.5" /> : <Wrench className="h-2.5 w-2.5" />}
                      {isSuper ? "Super Admin" : "Admin Teknis"}
                    </span>
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
