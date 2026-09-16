import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/admin/login-form";

export function LoginView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/60 text-slate-800 antialiased relative overflow-hidden">
      {/* Subtle Corporate Ambient Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-sky-100/30 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-5">
        {/* Card Header & Form */}
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
          <CardHeader className="space-y-3 text-center pb-5 border-b border-slate-100 bg-slate-50/50">
            <div className="mx-auto h-12 w-auto max-w-[240px] flex items-center justify-center pt-2">
              <Image
                src="/assets/images/logo-pg-trangkil.png"
                alt="Logo PT Kebon Agung PG Trangkil"
                width={260}
                height={55}
                priority
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5 text-sky-700" />
                SIGAP Admin Panel
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                Sistem Informasi Gangguan dan Perbaikan
                <br />
                PT Kebon Agung &bull; Pabrik Gula Trangkil
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-6 px-6">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Tombol Kembali ke Halaman Utama */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-sky-700 bg-white hover:bg-sky-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 text-sky-600" />
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </div>
  );
}
