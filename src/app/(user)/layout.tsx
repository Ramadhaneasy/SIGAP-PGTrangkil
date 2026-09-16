"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LockKeyhole, Wrench, Search, Building, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserDockbar } from "@/components/mobile/user-dockbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Buat Laporan", href: "/lapor", icon: Wrench },
    { label: "Cek Status", href: "/cek-status", icon: Search },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 antialiased selection:bg-sky-500/20 selection:text-sky-700 relative overflow-x-hidden">
      {/* Subtle Corporate Ambient Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-100/30 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      </div>

      {/* Header Corporate Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/80 shadow-2xs transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo PT Kebon Agung Pabrik Gula Trangkil */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group py-1">
            <div className="relative h-8 sm:h-11 w-auto max-w-[200px] sm:max-w-[290px] flex items-center transition-transform group-hover:scale-[1.01]">
              <Image
                src="/assets/images/logo-pg-trangkil.png"
                alt="Logo PT Kebon Agung Pabrik Gula Trangkil"
                width={300}
                height={60}
                priority
                className="h-7 sm:h-10 w-auto object-contain"
              />
            </div>
            <div className="hidden xl:flex items-center gap-2 border-l pl-3 ml-1 border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
              </span>
              <span className="font-extrabold text-sm tracking-wider text-sky-900">
                SIGAP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/90 border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-sky-700 text-white shadow-2xs"
                      : "text-slate-600 hover:text-sky-700 hover:bg-white"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "text-white" : "text-sky-600"}`} />
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/admin/login"
              className="ml-1 px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-slate-700 hover:text-sky-700 bg-white hover:bg-sky-50 transition-all flex items-center gap-1.5 border border-slate-200 shadow-2xs hover:border-sky-300"
            >
              <LockKeyhole className="h-3.5 w-3.5 text-sky-600" />
              Login Admin
            </Link>
          </nav>

          {/* Mobile Navigation Drawer Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger render={
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 rounded-xl border border-slate-200 bg-white text-sky-700 hover:bg-sky-50 shadow-2xs flex items-center justify-center shrink-0"
                  aria-label="Buka Menu Navigasi"
                >
                  <Menu className="h-5 w-5 stroke-[2.5]" />
                </Button>
              }>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-6 bg-white">
                <SheetHeader className="text-left border-b border-slate-100 pb-4 mb-6">
                  <SheetTitle className="text-sky-700 font-extrabold flex items-center gap-2">
                    <Image
                      src="/assets/images/logo-pg-trangkil.png"
                      alt="Logo PT Kebon Agung PG Trangkil"
                      width={240}
                      height={50}
                      className="h-8 sm:h-9 w-auto object-contain"
                    />
                  </SheetTitle>
                  <p className="text-xs text-slate-500 font-medium pt-1">
                    SIGAP — Sistem Informasi Gangguan & Perbaikan
                  </p>
                </SheetHeader>

                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? "bg-sky-700 text-white shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-sky-600"}`} />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <Link
                      href="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-sky-50 border border-slate-200 shadow-2xs"
                    >
                      <LockKeyhole className="h-4 w-4 text-sky-600" />
                      Login Admin
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile User Floating Dockbar */}
      <UserDockbar />

      {/* Footer Minimalis Corporate */}
      <footer className="relative z-10 border-t border-slate-200/80 py-6 pb-24 md:pb-6 bg-white text-slate-600 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Building className="h-4 w-4 text-sky-600" />
              <span>PT Kebon Agung &bull; Pabrik Gula Trangkil</span>
            </div>
            <span className="hidden md:inline text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem SIGAP Online</span>
            </div>
          </div>
          <p className="text-slate-400 font-medium text-[11px]">
            &copy; {new Date().getFullYear()} SIGAP &bull; PT Kebon Agung PG Trangkil. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
