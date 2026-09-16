"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Search, ArrowRight, ShieldCheck, Clock, FileCheck, CheckCircle2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { LandingMobileView } from "@/components/mobile/landing-mobile-view";

export function LandingView() {
  return (
    <>
      {/* Tampilan Utama Desktop / PC */}
      <div className="hidden lg:block space-y-10 py-4">
        {/* Desktop Hero Section Minimalis & Corporate */}
        <StaggerContainer className="text-center space-y-5 max-w-3xl mx-auto pt-2">
          <StaggerItem>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-sky-800 border border-slate-200 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
              </span>
              <span className="tracking-wider">PT KEBON AGUNG &bull; PABRIK GULA TRANGKIL</span>
            </div>
          </StaggerItem>

          <StaggerItem className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Sistem Pelaporan Gangguan <br />
              <span className="text-sky-700">
                &amp; Perbaikan (SIGAP)
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
              Layanan terpadu pelaporan kerusakan alat atau fasilitas pabrik. Kirim laporan secara praktis dan cek status penanganan teknisi secara realtime.
            </p>
          </StaggerItem>

          <StaggerItem className="flex items-center justify-center gap-3.5 pt-2">
            <Link href="/lapor">
              <Button
                size="lg"
                className="h-12 px-7 rounded-xl text-sm font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-xs transition-all cursor-pointer"
              >
                <Wrench className="mr-2 h-4 w-4" />
                Buat Laporan Baru
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/cek-status">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-7 rounded-xl text-sm font-bold border-slate-200 text-sky-900 bg-white hover:bg-sky-50 hover:border-sky-300 transition-all shadow-2xs cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4 text-sky-600" />
                Cek Status Tiket
              </Button>
            </Link>
          </StaggerItem>
        </StaggerContainer>

        {/* Desktop 2 Feature Action Cards Grid */}
        <StaggerContainer className="grid grid-cols-2 gap-5 max-w-3xl mx-auto">
          <StaggerItem>
            <Link href="/lapor" className="group block">
              <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 group-hover:border-sky-400">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-sky-800 transition-colors">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        Buat Laporan Kerusakan
                      </h3>
                      <ArrowRight className="h-4 w-4 text-sky-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      Isi formulir online untuk melaporkan kendala fasilitas atau peralatan pabrik tanpa perlu login.
                    </p>
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-sky-100">
                        <FileCheck className="h-3 w-3" /> Form Online &bull; Tanpa Login
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/cek-status" className="group block">
              <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 group-hover:border-sky-400">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-sky-800 transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        Cek Status Laporan
                      </h3>
                      <ArrowRight className="h-4 w-4 text-sky-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      Masukkan nomor tiket laporan untuk memantau perkembangan penanganan oleh tim teknisi.
                    </p>
                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-sky-100">
                        <CheckCircle2 className="h-3 w-3" /> Cek Status Realtime
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </StaggerItem>
        </StaggerContainer>

        {/* Desktop 3 Easy Steps Section */}
        <section className="max-w-3xl mx-auto space-y-4 pt-4">
          <FadeIn className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Alur Pelaporan Laporan Kerusakan
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              3 langkah praktis dari pengajuan hingga tindak lanjut penanganan teknis
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-3 gap-4">
            <StaggerItem>
              <div className="border border-slate-200/80 bg-white rounded-2xl p-4 text-center space-y-2 shadow-2xs">
                <div className="mx-auto h-9 w-9 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-sky-600 shrink-0" />
                  Form Laporan
                </h4>
                <p className="text-xs text-slate-500 leading-snug font-medium">
                  Pilih Bagian &amp; Unit Kerja, deskripsikan kendala &amp; lokasi kerusakan.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="border border-slate-200/80 bg-white rounded-2xl p-4 text-center space-y-2 shadow-2xs">
                <div className="mx-auto h-9 w-9 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />
                  Kode Tiket
                </h4>
                <p className="text-xs text-slate-500 leading-snug font-medium">
                  Sistem menerbitkan nomor tiket resmi (<code className="font-mono text-sky-700">SIGAP-2026...</code>).
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="border border-slate-200/80 bg-white rounded-2xl p-4 text-center space-y-2 shadow-2xs">
                <div className="mx-auto h-9 w-9 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1.5">
                  <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                  Penanganan
                </h4>
                <p className="text-xs text-slate-500 leading-snug font-medium">
                  Petugas teknis menindaklanjuti perbaikan hingga status laporan tuntas.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </div>

      {/* Tampilan Khusus Mobile HP */}
      <div className="block lg:hidden">
        <LandingMobileView />
      </div>
    </>
  );
}
