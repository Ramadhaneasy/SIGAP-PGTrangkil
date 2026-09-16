"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface SelesaiModalReportItem {
  id: string;
  ticket_number: string;
  nama_pelapor: string;
  bagian: string;
  unit_kerja: string;
  lokasi_kerusakan?: string;
  deskripsi?: string;
}

interface SelesaiPenangananModalProps {
  report: SelesaiModalReportItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (reportId: string, ticketNumber: string, penanganan: string) => void;
}

export function SelesaiPenangananModal({
  report,
  open,
  onOpenChange,
  onSuccess,
}: SelesaiPenangananModalProps) {
  const [penanganan, setPenanganan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevReportId, setPrevReportId] = useState(report?.id);

  if (open !== prevOpen || report?.id !== prevReportId) {
    setPrevOpen(open);
    setPrevReportId(report?.id);
    if (open) {
      setPenanganan("");
      setError(null);
    }
  }

  if (!report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penanganan.trim()) {
      setError("Deskripsi tindakan penanganan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: report.id,
          status: "SELESAI",
          penanganan: penanganan.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memperbarui status laporan");
      }

      toast.success("Laporan Berhasil Diselesaikan!", {
        description: `Tiket ${report.ticket_number} telah ditandai selesai.`,
      });

      onSuccess(report.id, report.ticket_number, penanganan.trim());
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error completing report:", err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyelesaikan laporan.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-bold text-slate-900">
            Deskripsi Penanganan
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium">
            Tuliskan rincian perbaikan yang dilakukan untuk tiket <strong className="font-mono text-sky-700">{report.ticket_number}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="penanganan" className="text-xs font-bold text-slate-700">
              Tindakan Penanganan / Perbaikan <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="penanganan"
              rows={4}
              value={penanganan}
              onChange={(e) => {
                setPenanganan(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Tuliskan deskripsi tindakan perbaikan di sini..."
              className={`text-xs font-medium rounded-xl border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white leading-relaxed resize-none ${
                error ? "border-rose-400 focus-visible:border-rose-500" : ""
              }`}
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border-slate-200 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !penanganan.trim()}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
