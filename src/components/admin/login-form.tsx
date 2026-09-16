"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  LogIn,
  Eye,
  EyeOff,
  Loader2,
  User,
  ShieldAlert,
  Calendar,
  Ban,
  AlertTriangle,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username wajib diisi" })
    .min(2, { message: "Username minimal 2 karakter" }),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi" })
    .min(3, { message: "Password minimal 3 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface BanModalInfo {
  banType: "PERMANENT" | "TEMPORARY";
  bannedUntil: string | null;
  bannedReason: string | null;
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Centered Ban Alert Pop-up Modal State
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banModalInfo, setBanModalInfo] = useState<BanModalInfo | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.trim(),
          password: data.password,
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        if (res.status === 403 && resData.isBanned) {
          setBanModalInfo({
            banType: resData.banType || "PERMANENT",
            bannedUntil: resData.bannedUntil || null,
            bannedReason: resData.bannedReason || null,
          });
          setIsBanModalOpen(true);
          return;
        }

        toast.error("Gagal masuk admin", {
          description: resData.error || "Username atau password salah",
        });
        return;
      }

      toast.success("Berhasil masuk ke SIGAP Panel Admin", {
        description: `Selamat datang, ${resData.user?.nama || data.username}.`,
      });
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Terjadi kesalahan sistem saat mencoba masuk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-sky-700" />
                  Username Admin <span className="text-rose-500 font-bold">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Masukkan username admin"
                    autoComplete="username"
                    className="rounded-xl border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 bg-white shadow-2xs text-slate-900 text-xs sm:text-sm font-medium h-10 placeholder:text-slate-400 placeholder:font-normal"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-sky-700" />
                  Password <span className="text-rose-500 font-bold">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      className="rounded-xl border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 bg-white shadow-2xs text-slate-900 text-xs sm:text-sm font-medium h-10 pr-10 placeholder:text-slate-400 placeholder:font-normal"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 hover:bg-sky-50 text-slate-400 hover:text-sky-700 rounded-lg cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 font-bold mt-2 bg-sky-700 hover:bg-sky-800 text-white shadow-2xs rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Masuk Panel Admin
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Pop-up Dialog Khusus Akun Terkena Banned */}
      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-2xl bg-white border border-rose-200 shadow-xl space-y-4 outline-none"
        >
          {/* Header & Tombol Close 'X' */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 shrink-0">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold tracking-tight text-slate-900 leading-snug">
                  Akses Akun Dinonaktifkan
                </DialogTitle>
                <DialogDescription className="text-xs text-rose-600 font-bold mt-0.5">
                  Autentikasi login akun Anda ditolak oleh sistem.
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBanModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tutup (Close)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {banModalInfo && (
            <div className="space-y-3.5 text-xs pt-1">
              {banModalInfo.banType === "TEMPORARY" ? (
                <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-rose-600 shrink-0" />
                    Akun Anda telah di-banned sampai :
                  </div>
                  <div className="text-sm font-bold text-rose-700 bg-white px-3 py-2 rounded-lg border border-rose-200 text-center font-mono tracking-wide">
                    📅 {banModalInfo.bannedUntil}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <Ban className="h-4 w-4 text-rose-600 shrink-0" />
                    Status Sanksi: Ban Permanen
                  </div>
                  <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                    Akun Anda telah dinonaktifkan secara permanen oleh Super Admin.
                  </p>
                </div>
              )}

              {banModalInfo.bannedReason && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    Alasan / Catatan Penonaktifan:
                  </span>
                  <p className="text-slate-600 italic leading-relaxed">
                    &ldquo;{banModalInfo.bannedReason}&rdquo;
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Silakan hubungi <strong>Super Admin SIGAP PT Kebon Agung PG Trangkil</strong> jika Anda membutuhkan klarifikasi atau permohonan pembukaan akses akun.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <Button
              type="button"
              onClick={() => setIsBanModalOpen(false)}
              className="w-full h-10 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
