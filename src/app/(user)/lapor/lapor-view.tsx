"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportForm } from "@/components/user/report-form";
import { FadeIn, FadeInScale } from "@/components/ui/motion";

export function LaporView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Halaman Dynamic */}
      <FadeIn>
        <PageHeader
          title="Laporkan Kerusakan"
          description="Laporkan kerusakan fasilitas atau peralatan agar dapat segera ditindaklanjuti oleh petugas SIGAP."
          badgeText="Formulir Online"
          icon={Wrench}
          backUrl="/"
          backLabel="Kembali ke Beranda"
        />
      </FadeIn>

      {/* Form Laporan Card */}
      <FadeInScale delay={0.1}>
        <ReportForm />
      </FadeInScale>
    </div>
  );
}
