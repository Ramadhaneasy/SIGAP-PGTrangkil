"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Wrench,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  Play,
  Loader2,
  Copy,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/user/report-status-badge";
import { SelesaiPenangananModal } from "@/components/admin/selesai-penanganan-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface LaporanDetailItem {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  nomor_hp?: string;
  lokasi_kerusakan: string;
  peralatan?: string;
  deskripsi: string;
  foto_url?: string;
  status: string;
  penanganan?: string;
  processed_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface LaporanDetailViewProps {
  report: LaporanDetailItem;
}

export function LaporanDetailView({ report: initialReport }: LaporanDetailViewProps) {
  const router = useRouter();
  const [report, setReport] = useState<LaporanDetailItem>(initialReport);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSelesaiModalOpen, setIsSelesaiModalOpen] = useState(false);

  const formatDetailTime = (isoString?: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const tgl = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const jam = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { tgl, jam: `${jam} WIB` };
  };

  const createdTime = formatDetailTime(report.created_at);
  const processedTime = formatDetailTime(report.processed_at);
  const completedTime = formatDetailTime(report.completed_at);

  const copyTicket = () => {
    navigator.clipboard.writeText(report.ticket_number);
    toast.success("Nomor tiket berhasil disalin ke clipboard!");
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/reports/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate status");

      const nowIso = new Date().toISOString();
      setReport((prev) => ({
        ...prev,
        status: newStatus,
        processed_at: newStatus === "DIPROSES" ? (prev.processed_at || nowIso) : prev.processed_at,
      }));
      toast.success("Status Berhasil Diperbarui!", {
        description: `Status tiket diubah menjadi ${newStatus}.`,
      });
      router.refresh();
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Gagal mengubah status laporan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteSuccess = (reportId: string, ticketNumber: string, penanganan: string) => {
    const nowIso = new Date().toISOString();
    setReport((prev) => ({
      ...prev,
      status: "SELESAI",
      penanganan,
      processed_at: prev.processed_at || nowIso,
      completed_at: nowIso,
    }));
    router.refresh();
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/laporan">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50/80 rounded-full font-bold cursor-pointer"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Kembali ke Daftar Laporan
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Nomor Tiket Laporan Resmi
            </div>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <h1 className="text-xl sm:text-3xl font-mono font-black tracking-wider text-sky-800">
                {report.ticket_number}
              </h1>
              <button
                type="button"
                onClick={copyTicket}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-sky-700 border border-slate-200 transition-colors cursor-pointer"
                title="Salin Nomor Tiket"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ReportStatusBadge status={report.status} />

            {/* Quick Action Button in Header */}
            {report.status === "MENUNGGU" && (
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("DIPROSES")}
                className="h-8 px-3 rounded-full bg-linear-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold shadow-2xs cursor-pointer"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Play className="mr-1 h-3.5 w-3.5 fill-current" />
                    Mulai Proses
                  </>
                )}
              </Button>
            )}

            {report.status === "DIPROSES" && (
              <Button
                size="sm"
                onClick={() => setIsSelesaiModalOpen(true)}
                className="h-8 px-3 rounded-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Tandai Selesai
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Details (2 Columns on Desktop) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Card: Tindakan Penanganan Selesai (Jika Ada) */}
          {report.penanganan && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-emerald-100 bg-emerald-100/40 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Tindakan Penanganan &amp; Catatan Perbaikan
                </h3>
                <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                  Tuntas
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-emerald-950 font-medium whitespace-pre-wrap leading-relaxed bg-white/80 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
                  {report.penanganan}
                </p>
              </div>
            </div>
          )}

          {/* Card 1: Informasi Pelapor & Lokasi */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-slate-900">
                <User className="h-4 w-4 text-sky-600" />
                Informasi Pelapor &amp; Lokasi
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Nama Pelapor</span>
                  <span className="font-bold text-slate-800">{report.nama_pelapor}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Bagian / Unit Kerja</span>
                  <span className="font-bold text-slate-800">
                    {report.bagian} &bull; {report.unit_kerja}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-sky-600" /> Nomor HP / Kontak
                  </span>
                  <span className="font-semibold text-slate-800">{report.nomor_hp || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-600" /> Lokasi Kerusakan
                  </span>
                  <span className="font-semibold text-slate-800">{report.lokasi_kerusakan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Detail Kerusakan & Foto */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-slate-900">
                <Wrench className="h-4 w-4 text-sky-600" />
                Detail Kerusakan &amp; Lampiran Foto
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1.5">Deskripsi Kerusakan</span>
                <p className="text-xs sm:text-sm text-slate-800 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 whitespace-pre-wrap leading-relaxed">
                  {report.deskripsi}
                </p>
              </div>

              {/* Lampiran Foto */}
              {report.foto_url ? (
                <div className="pt-2">
                  <span className="text-xs text-slate-400 font-medium block mb-2">Foto Lampiran</span>
                  <div className="relative max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.foto_url}
                      alt="Foto Kerusakan"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2 text-xs text-slate-400 italic">
                  Tidak ada lampiran foto untuk laporan ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel: Informasi Waktu & Linimasa */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-sky-600" />
                Informasi &amp; Linimasa Waktu
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-sm">
              {/* 1. Waktu Laporan Dibuat */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    1. Waktu Laporan Masuk
                  </span>
                  <span className="font-bold text-slate-800 block text-xs sm:text-sm mt-0.5">
                    {createdTime ? createdTime.tgl : "-"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 block">
                    {createdTime ? createdTime.jam : "-"}
                  </span>
                </div>
              </div>

              {/* 2. Waktu Laporan Diproses */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <div className={cn(
                  "p-2 rounded-xl border shrink-0 mt-0.5",
                  report.processed_at
                    ? "bg-amber-50 text-amber-600 border-amber-200/80"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                )}>
                  <Play className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    2. Waktu Mulai Diproses
                  </span>
                  {processedTime ? (
                    <>
                      <span className="font-bold text-amber-900 block text-xs sm:text-sm mt-0.5">
                        {processedTime.tgl}
                      </span>
                      <span className="text-xs font-semibold text-amber-700 block">
                        {processedTime.jam}
                      </span>
                    </>
                  ) : (
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80">
                      Menunggu Disposisi
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Waktu Laporan Selesai */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <div className={cn(
                  "p-2 rounded-xl border shrink-0 mt-0.5",
                  report.completed_at
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200/80"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                )}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                    3. Waktu Penanganan Selesai
                  </span>
                  {completedTime ? (
                    <>
                      <span className="font-bold text-emerald-900 block text-xs sm:text-sm mt-0.5">
                        {completedTime.tgl}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 block">
                        {completedTime.jam}
                      </span>
                    </>
                  ) : (
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80">
                      Belum Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Selesai Penanganan */}
      <SelesaiPenangananModal
        report={report}
        open={isSelesaiModalOpen}
        onOpenChange={setIsSelesaiModalOpen}
        onSuccess={handleCompleteSuccess}
      />
    </div>
  );
}
