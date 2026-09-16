"use client";

import React, { useState } from "react";
import {
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CompletedReportItem } from "@/app/admin/(dashboard)/riwayat/riwayat-view";
import {
  ExportFilterOptions,
  filterReportsForExport,
  exportToExcel,
  exportToPdf,
} from "@/lib/export-utils";

export interface ExportDialogProps {
  completedReports: CompletedReportItem[];
}

type DatePreset = "ALL" | "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR" | "CUSTOM";

export function ExportDialog({ completedReports }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<DatePreset>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [bagian, setBagian] = useState<string>("ALL");
  const [format, setFormat] = useState<"PDF" | "EXCEL">("PDF");
  const [isExporting, setIsExporting] = useState(false);

  // Helper to format local date without UTC offset shifting (guaranteed day 1)
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Apply Quick Date Presets
  const applyPreset = (preset: "ALL" | "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR") => {
    setActivePreset(preset);
    const now = new Date();
    if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "THIS_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(formatLocalDate(firstDay));
      setEndDate(formatLocalDate(lastDay));
    } else if (preset === "LAST_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(formatLocalDate(firstDay));
      setEndDate(formatLocalDate(lastDay));
    } else if (preset === "THIS_YEAR") {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      setStartDate(formatLocalDate(firstDay));
      setEndDate(formatLocalDate(lastDay));
    }
  };

  const options: ExportFilterOptions = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    bagian: bagian !== "ALL" ? bagian : undefined,
  };

  const filteredData = filterReportsForExport(completedReports, options);

  const handleExport = async () => {
    if (filteredData.length === 0) {
      toast.warning("Tidak ada laporan pada rentang tanggal yang dipilih.", {
        description: "Silakan ubah filter tanggal atau pilih rentang yang lebih luas.",
      });
      return;
    }

    setIsExporting(true);
    try {
      if (format === "PDF") {
        exportToPdf(filteredData, options);
        toast.success("Dokumen PDF berhasil dibuka!", {
          description: `Mencetak ${filteredData.length} arsip laporan.`,
        });
      } else if (format === "EXCEL") {
        exportToExcel(filteredData, options);
        toast.success("File Excel (.xlsx) berhasil diunduh!", {
          description: `Menyimpan ${filteredData.length} baris data laporan.`,
        });
      }
      setOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Gagal melakukan export dokumen.");
    } finally {
      setIsExporting(false);
    }
  };

  const getPresetButtonClass = (preset: DatePreset) => {
    const isActive = activePreset === preset;
    return `h-7 text-[11px] font-semibold rounded-lg px-2.5 transition-all cursor-pointer ${
      isActive
        ? "bg-sky-700 text-white border-sky-700 shadow-xs font-bold"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="h-9 px-3.5 sm:px-4 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs transition-all cursor-pointer"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Riwayat
          </Button>
        }
      />

      <DialogContent className="max-w-lg sm:max-w-xl p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-lg space-y-3.5 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Header Dialog */}
        <DialogHeader className="space-y-0.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/80">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Export Arsip Laporan
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-500 font-medium">
                Pilih periode tanggal, bagian kerja, dan format berkas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5">
          {/* Section 1: Periode & Filter Tanggal */}
          <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
                1. Rentang Waktu Laporan
              </Label>
              <span className="text-[10px] text-slate-400 font-medium">Preset / Kustom</span>
            </div>

            {/* Quick Presets Chips */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("ALL")}
                className={getPresetButtonClass("ALL")}
              >
                Semua Waktu
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("THIS_MONTH")}
                className={getPresetButtonClass("THIS_MONTH")}
              >
                Bulan Ini
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("LAST_MONTH")}
                className={getPresetButtonClass("LAST_MONTH")}
              >
                Bulan Lalu
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("THIS_YEAR")}
                className={getPresetButtonClass("THIS_YEAR")}
              >
                Tahun Ini
              </Button>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">Dari Tanggal (Mulai)</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActivePreset("CUSTOM");
                  }}
                  className="h-9 text-xs rounded-xl border-slate-200 focus:border-sky-500 bg-white shadow-2xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">Sampai Tanggal (Selesai)</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActivePreset("CUSTOM");
                  }}
                  className="h-9 text-xs rounded-xl border-slate-200 focus:border-sky-500 bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Filter Bagian */}
          <div className="space-y-1">
            <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-sky-600" />
              2. Filter Bagian Unit (Opsional)
            </Label>
            <Select value={bagian} onValueChange={(val) => setBagian(val || "ALL")}>
              <SelectTrigger className="w-full h-9 text-xs rounded-xl border-slate-200 bg-white shadow-2xs">
                <SelectValue placeholder="Pilih Bagian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Bagian (TUK, Teknik, Pabrikasi, Tanaman)</SelectItem>
                <SelectItem value="TUK">TUK</SelectItem>
                <SelectItem value="Teknik">Teknik</SelectItem>
                <SelectItem value="Pabrikasi">Pabrikasi</SelectItem>
                <SelectItem value="Tanaman">Tanaman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section 3: Format File Export */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              3. Pilih Format Berkas
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* PDF Option */}
              <button
                type="button"
                onClick={() => setFormat("PDF")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  format === "PDF"
                    ? "border-rose-500 bg-rose-50/70 text-rose-900 shadow-2xs ring-2 ring-rose-500/20 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <FileText className={`h-5 w-5 ${format === "PDF" ? "text-rose-600" : "text-slate-400"}`} />
                <span className="text-xs font-extrabold block">PDF Document</span>
                <span className="text-[10px] text-slate-400 font-medium">Siap Cetak / Arsip</span>
              </button>

              {/* Excel Option */}
              <button
                type="button"
                onClick={() => setFormat("EXCEL")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  format === "EXCEL"
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-2xs ring-2 ring-emerald-500/20 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className={`h-5 w-5 ${format === "EXCEL" ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-xs font-extrabold block">Excel Spreadsheet</span>
                <span className="text-[10px] text-slate-400 font-medium">Format Microsoft Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Results Summary Info Box */}
          <div className="p-2.5 sm:p-3 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Siap diexport:
            </span>
            <span className="font-mono font-black text-xs text-sky-800 bg-white px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
              {filteredData.length} Laporan
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="gap-2 sm:gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredData.length === 0}
            className="h-9 px-5 rounded-xl text-xs font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download ({format})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
