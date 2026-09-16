"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, Clock, Crown, Wrench } from "lucide-react";
import { AdminJwtPayload } from "@/lib/auth";
import { formatFullDayDateIndonesian } from "@/lib/date-utils";

export function AdminHeader() {
  const pathname = usePathname();
  const [userSession, setUserSession] = useState<AdminJwtPayload | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUserSession(data.user);
        }
      })
      .catch((err) => console.warn("Failed to fetch session:", err));
  }, []);

  // Determine active page title for header dynamically
  let pageTitle = "Dashboard Overview";
  if (pathname.includes("/admin/laporan/")) pageTitle = "Detail Laporan Kerusakan";
  else if (pathname.startsWith("/admin/laporan")) pageTitle = "Manage Laporan";
  else if (pathname.startsWith("/admin/riwayat")) pageTitle = "Riwayat & Arsip Laporan";
  else if (pathname.startsWith("/admin/log-aktivitas")) pageTitle = "Log Aktivitas Petugas";
  else if (pathname.startsWith("/admin/pengaturan")) pageTitle = "Pengaturan Admin";
  else if (pathname.startsWith("/admin/kelola-admin")) pageTitle = "Daftar Admin";

  const currentDate = formatFullDayDateIndonesian(new Date());

  const isSuperAdmin = userSession?.role === "SUPER_ADMIN";
  const roleLabel = isSuperAdmin ? "Super Admin" : "Admin Teknis";

  return (
    <header className="hidden lg:flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-l border-slate-200/80 bg-white shrink-0 w-full z-20 shadow-2xs rounded-tl-2xl">
      {/* Left: Active Page Title & Company Tag */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 shadow-2xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-none">
              {pageTitle}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
              <span>PT Kebon Agung PG Trangkil</span>
              <span>&bull;</span>
              <span className="text-sky-700 font-bold">SIGAP Panel Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Nama Lengkap : Role Badge & Date Display */}
      <div className="flex items-center gap-3">
        {/* Dynamic Name and Role Badge */}
        {userSession && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs ${
              isSuperAdmin
                ? "bg-purple-50 text-purple-800 border-purple-200"
                : "bg-sky-50 text-sky-800 border-sky-200"
            }`}
            title={`Username: @${userSession.username || userSession.nama}`}
          >
            {isSuperAdmin ? (
              <Crown className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            ) : (
              <Wrench className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            )}
            <span>
              {userSession.nama} : {roleLabel}
            </span>
          </div>
        )}

        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80">
          <Clock className="h-3.5 w-3.5 text-sky-700" />
          <span suppressHydrationWarning>{currentDate}</span>
        </div>
      </div>
    </header>
  );
}
