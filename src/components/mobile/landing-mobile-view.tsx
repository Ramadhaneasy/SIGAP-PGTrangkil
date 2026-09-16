"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Search, ArrowRight, ShieldCheck, Clock, FileCheck, CheckCircle2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export function LandingMobileView() {
  return (
    <div className="space-y-5 py-2">
      {/* Mobile Hero Banner Section */}
      <StaggerContainer className="text-center space-y-3 pt-1">
        <StaggerItem>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-sky-800 border border-slate-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
            </span>
            <span>PG TRANGKIL &bull; SIGAP</span>
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-1 px-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Sistem Pelaporan Gangguan <br />
            <span className="text-sky-700">
              &amp; Perbaikan (SIGAP)
            </span>
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Layanan pelaporan kerusakan fasilitas &amp; peralatan pabrik online secara terpadu.
          </p>
        </StaggerItem>

        {/* Mobile Action Buttons */}
        <StaggerItem className="flex flex-col gap-2 pt-1 px-1">
          <Link href="/lapor" className="w-full">
            <Button
              size="lg"
              className="w-full h-11 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs active:scale-98"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Buat Laporan Kerusakan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/cek-status" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-11 rounded-xl text-xs font-bold border-slate-200 text-sky-900 bg-white hover:bg-sky-50 active:scale-98 shadow-2xs"
            >
              <Search className="mr-2 h-4 w-4 text-sky-600" />
              Cek Status Tiket
            </Button>
          </Link>
        </StaggerItem>
      </StaggerContainer>

      {/* Mobile Stacked Action Cards */}
      <div className="space-y-2.5 px-0.5">
        <Link href="/lapor" className="block">
          <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs active:scale-98 transition-transform">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Buat Laporan Kerusakan</h3>
                  <ArrowRight className="h-3.5 w-3.5 text-sky-600 shrink-0 ml-1" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                  Isi formulir kerusakan fasilitas online tanpa login.
                </p>
                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-sky-100 mt-0.5">
                  <FileCheck className="h-3 w-3" /> Form Online &bull; Tanpa Login
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cek-status" className="block">
          <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs active:scale-98 transition-transform">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0">
                <Search className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Cek Status Laporan</h3>
                  <ArrowRight className="h-3.5 w-3.5 text-sky-600 shrink-0 ml-1" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                  Pantau tiket laporan perbaikan langsung di HP.
                </p>
                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-sky-100 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Cek Status Realtime
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Mobile 3 Steps List */}
      <section className="space-y-2.5 pt-1">
        <FadeIn className="text-center space-y-0.5">
          <h2 className="text-sm font-extrabold text-slate-900">
            Alur Pelaporan Laporan Kerusakan
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            3 langkah praktis dari smartphone Anda
          </p>
        </FadeIn>

        <div className="space-y-2">
          <div className="border border-slate-200/80 bg-white rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="h-7 w-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                Form Laporan
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                Pilih unit kerja &amp; jelaskan kerusakan.
              </p>
            </div>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="h-7 w-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                Dapatkan Tiket
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                Nomor tiket disimpan otomatis di HP.
              </p>
            </div>
          </div>

          <div className="border border-slate-200/80 bg-white rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="h-7 w-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                Pantau Perbaikan
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                Petugas teknis melakukan perbaikan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
