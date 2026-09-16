"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Wrench,
  ExternalLink,
  Building,
  User,
  Calendar,
  Sparkles,
  Filter,
  Copy,
  CheckCircle2,
  RefreshCw,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportStatusBadge } from "@/components/user/report-status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn, FadeInScale } from "@/components/ui/motion";
import { toast } from "sonner";

export interface ActiveReportItem {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  lokasi_kerusakan: string;
  deskripsi: string;
  status: string;
  created_at: string;
}

export interface CekStatusViewProps {
  initialReports: ActiveReportItem[];
}

export function CekStatusView({ initialReports }: CekStatusViewProps) {
  const router = useRouter();
  const reports = initialReports;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBagian, setSelectedBagian] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data laporan berhasil dimuat ulang.");
    }, 600);
  };

  const copyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    toast.success(`Nomor tiket ${ticket} disalin ke clipboard!`);
  };

  const handleDirectSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    // If query matches a ticket pattern, directly navigate to status detail
    if (/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/i.test(query)) {
      router.push(`/status/${query}`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBagian("ALL");
    setSelectedStatus("ALL");
    setSortBy("NEWEST");
  };

  const isFiltered =
    searchQuery !== "" ||
    selectedBagian !== "ALL" ||
    selectedStatus !== "ALL" ||
    sortBy !== "NEWEST";

  const filteredReports = reports.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.ticket_number.toLowerCase().includes(q) ||
      item.nama_pelapor.toLowerCase().includes(q) ||
      item.unit_kerja.toLowerCase().includes(q) ||
      item.lokasi_kerusakan.toLowerCase().includes(q) ||
      item.deskripsi.toLowerCase().includes(q);

    const matchesBagian = selectedBagian === "ALL" || item.bagian === selectedBagian;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

    return matchesQuery && matchesBagian && matchesStatus;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "OLDEST") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // Default NEWEST
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const waitingCount = reports.filter((r) => r.status === "MENUNGGU").length;
  const processingCount = reports.filter((r) => r.status === "DIPROSES").length;

  return (
    <div className="max-w-4xl mx-auto space-y-3.5 sm:space-y-6 pb-12">
      {/* Header Halaman Dynamic */}
      <FadeIn>
        <PageHeader
          title="Cek Status Laporan"
          description="Pantau progres laporan kerusakan yang sedang dalam penanganan teknisi PT Kebon Agung PG Trangkil."
          badgeText="Live Realtime Tracker"
          icon={Search}
          backUrl="/"
          backLabel="Kembali ke Beranda"
        />
      </FadeIn>

      {/* Main Search & Clean Selector Controls Card */}
      <FadeInScale delay={0.05} className="space-y-3">
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
          <CardContent className="p-3 sm:p-5 space-y-3">
            {/* Search Input Bar */}
            <form onSubmit={handleDirectSearch} className="space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nomor tiket, nama pelapor, unit kerja..."
                    className="pl-10 h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-slate-50/40 focus:bg-white shadow-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="submit"
                    className="h-10 px-5 rounded-xl text-xs sm:text-sm font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs cursor-pointer flex-1 sm:flex-initial"
                  >
                    <Search className="mr-1.5 h-4 w-4" />
                    Cari Tiket
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="Refresh data langsung dari server"
                    className="h-10 w-10 p-0 rounded-xl border-slate-200 text-slate-600 hover:text-sky-700 hover:bg-sky-50 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-sky-600" : ""}`} />
                  </Button>
                </div>
              </div>
            </form>

            {/* Clean Dropdown Filter Selectors Grid */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. Selector Bagian */}
                <div className="relative flex items-center w-full">
                  <Building className="absolute left-3 h-3.5 w-3.5 text-sky-600 pointer-events-none" />
                  <select
                    value={selectedBagian}
                    onChange={(e) => setSelectedBagian(e.target.value)}
                    className="w-full pl-9 pr-7 h-9 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-sky-500 hover:border-sky-300 cursor-pointer appearance-none truncate transition-colors"
                    aria-label="Filter Bagian"
                  >
                    <option value="ALL">Semua Bagian</option>
                    <option value="TUK">TUK</option>
                    <option value="Teknik">Teknik</option>
                    <option value="Pabrikasi">Pabrikasi</option>
                    <option value="Tanaman">Tanaman</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[9px]">▼</div>
                </div>

                {/* 2. Selector Status */}
                <div className="relative flex items-center w-full">
                  <Filter className="absolute left-3 h-3.5 w-3.5 text-sky-600 pointer-events-none" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-9 pr-7 h-9 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-sky-500 hover:border-sky-300 cursor-pointer appearance-none truncate transition-colors"
                    aria-label="Filter Status"
                  >
                    <option value="ALL">Semua Status ({reports.length})</option>
                    <option value="MENUNGGU">Menunggu ({waitingCount})</option>
                    <option value="DIPROSES">Diproses ({processingCount})</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[9px]">▼</div>
                </div>

                {/* 3. Selector Urutkan */}
                <div className="relative flex items-center w-full">
                  <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-sky-600 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-9 pr-7 h-9 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 hover:border-sky-300 cursor-pointer appearance-none truncate transition-colors"
                    aria-label="Urutkan Laporan"
                  >
                    <option value="NEWEST">Terbaru</option>
                    <option value="OLDEST">Terlama</option>
                  </select>
                  <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[9px]">▼</div>
                </div>
              </div>

              {/* Result Summary & Reset */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">
                  Menampilkan <strong className="text-slate-700 font-bold">{sortedReports.length}</strong> laporan aktif
                </span>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer text-[11px] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeInScale>

      {/* Section Title & Realtime Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-bold text-slate-900">
              Laporan Yang Belum Selesai
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
              Data laporan aktif langsung dari server SIGAP PG Trangkil
            </p>
          </div>
        </div>
        <span className="text-[10.5px] sm:text-xs font-bold font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-2xs">
          {sortedReports.length} Laporan
        </span>
      </div>

      {/* Cards List of Active Reports */}
      {sortedReports.length === 0 ? (
        <Card className="border border-dashed border-slate-200 bg-white rounded-2xl p-8 sm:p-12 text-center shadow-2xs space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Tidak Ada Laporan Aktif
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              {searchQuery || selectedBagian !== "ALL" || selectedStatus !== "ALL"
                ? "Tidak ada laporan aktif yang cocok dengan filter atau pencarian Anda."
                : "Semua laporan gangguan saat ini telah selesai ditangani oleh teknisi atau belum ada laporan baru."}
            </p>
          </div>
          <Link href="/lapor" className="inline-block pt-2">
            <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white">
              <Wrench className="mr-1.5 h-3.5 w-3.5" />
              Buat Laporan Baru
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          {sortedReports.map((report) => {
            const dateObj = new Date(report.created_at);
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
                className="border border-slate-200/80 hover:border-sky-300 bg-white rounded-xl shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Ticket Number & Status Badge */}
                  <CardHeader className="p-2.5 sm:p-4 pb-2 sm:pb-3 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[11px] sm:text-xs font-bold text-sky-800 truncate">
                        {report.ticket_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyTicket(report.ticket_number)}
                        className="p-0.5 sm:p-1 rounded-md text-slate-400 hover:text-sky-700 hover:bg-white transition-colors cursor-pointer shrink-0"
                        title="Salin Nomor Tiket"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <ReportStatusBadge status={report.status} />
                  </CardHeader>

                  {/* Card Content: Details */}
                  <CardContent className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block flex items-center gap-1">
                        <Wrench className="h-3.5 w-3.5 text-sky-700 shrink-0" />
                        <span className="truncate">{report.unit_kerja}</span>
                      </span>
                      <p className="text-slate-600 text-[10.5px] sm:text-xs font-normal mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed bg-slate-50/80 p-1.5 sm:p-2.5 rounded-lg border border-slate-100">
                        {report.deskripsi || report.lokasi_kerusakan}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-0.5 text-[10px] sm:text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate">
                        <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 shrink-0" />
                        <span className="truncate font-semibold text-slate-700">
                          {report.nama_pelapor}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 truncate justify-end">
                        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-500">
                          {formattedDate}, {formattedTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer: Detail Link */}
                <div className="p-2 sm:p-3 px-2.5 sm:px-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9.5px] sm:text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-sky-100">
                    {report.bagian}
                  </span>

                  <Link href={`/status/${report.ticket_number}`}>
                    <Button
                      size="sm"
                      className="h-6.5 sm:h-8 px-2 sm:px-3 rounded-md sm:rounded-xl text-[10.5px] sm:text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      Cek Status
                      <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
