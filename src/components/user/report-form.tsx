"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, FileText, Loader2 } from "lucide-react";

import {
  reportSchema,
  ReportFormValues,
  WORK_UNITS,
} from "./report-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";

export function ReportForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      namaPelapor: "",
      bagian: "",
      unitKerja: "",
      nomorHp: "",
      deskripsi: "",
      foto: null,
    },
  });

  const selectedBagian = useWatch({ control: form.control, name: "bagian" });

  const filteredWorkUnits = selectedBagian
    ? WORK_UNITS.filter((unit) => unit.department === selectedBagian)
    : [];

  const onSubmit = async (data: ReportFormValues) => {
    setIsSubmitting(true);
    try {
      let fotoUrl: string | null = null;

      // Handle image if provided (base64 data url for MySQL storage)
      if (data.foto instanceof File) {
        fotoUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(data.foto as File);
        });
      }

      const payload = {
        nama_pelapor: data.namaPelapor,
        bagian: data.bagian,
        unit_kerja: data.unitKerja,
        nomor_hp: data.nomorHp || null,
        lokasi_kerusakan: data.unitKerja,
        deskripsi: data.deskripsi,
        foto_url: fotoUrl,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.error || "Gagal menyimpan laporan ke database MySQL.");
      }

      const finalTicketNumber = resData.ticket_number;

      toast.success("Laporan berhasil terkirim!", {
        description: `Nomor tiket resmi: ${finalTicketNumber}`,
      });

      router.push(`/status/${finalTicketNumber}`);
    } catch (err: unknown) {
      console.error("Error submitting report:", err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim laporan.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Single Card Container For Report Form */}
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm sm:text-base font-extrabold flex items-center gap-2.5 text-slate-900">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                <FileText className="h-4 w-4 shrink-0" />
              </div>
              Formulir Laporan Kerusakan
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-6 space-y-4">
            {/* Row 1: Nama Pelapor & Nomor HP (Perfectly Aligned 2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Nama Pelapor */}
              <FormField
                control={form.control}
                name="namaPelapor"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-700 block">
                      Nama Pelapor <span className="text-rose-500 font-bold">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap Anda"
                        {...field}
                        className="rounded-lg h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white shadow-2xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nomor HP / Kontak */}
              <FormField
                control={form.control}
                name="nomorHp"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-bold text-slate-700 block">
                        Nomor HP / Kontak
                      </FormLabel>
                      <span className="text-[11px] text-slate-400 font-medium">
                        (Opsional)
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="08xxxxxxxxxx"
                        {...field}
                        className="rounded-lg h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white shadow-2xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Bagian & Unit / Bagian Kerja (Perfectly Aligned 2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Bagian */}
              <FormField
                control={form.control}
                name="bagian"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-700 block">
                      Bagian <span className="text-rose-500 font-bold">*</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("unitKerja", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-lg h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white shadow-2xs font-medium text-slate-900">
                          <SelectValue placeholder="Pilih bagian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TUK">TUK</SelectItem>
                        <SelectItem value="Teknik">Teknik</SelectItem>
                        <SelectItem value="Pabrikasi">Pabrikasi</SelectItem>
                        <SelectItem value="Tanaman">Tanaman</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit / Bagian Kerja */}
              <FormField
                control={form.control}
                name="unitKerja"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-slate-700 block">
                      Unit / Bagian Kerja <span className="text-rose-500 font-bold">*</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedBagian}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-lg h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white shadow-2xs font-medium text-slate-900">
                          <SelectValue
                            placeholder={
                              !selectedBagian
                                ? "Pilih bagian terlebih dahulu"
                                : "Pilih unit / bagian kerja"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredWorkUnits.map((unit) => (
                          <SelectItem key={unit.kobag} value={unit.name}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Deskripsi Kerusakan */}
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-slate-700 block">
                    Deskripsi Kerusakan <span className="text-rose-500 font-bold">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan kondisi atau lokasi spesifik kerusakan..."
                      className="min-h-24 resize-y rounded-lg text-xs sm:text-sm border-slate-200 focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white shadow-2xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 4: Foto Lampiran (Opsional) */}
            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold text-slate-700 block">
                      Foto Lampiran Kerusakan
                    </FormLabel>
                    <span className="text-[11px] text-slate-400 font-medium">
                      (Opsional)
                    </span>
                  </div>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(file) => field.onChange(file)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-8 text-xs sm:text-sm font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim Laporan...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Laporan Kerusakan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
