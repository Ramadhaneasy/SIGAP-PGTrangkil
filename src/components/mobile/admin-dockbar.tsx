"use client";

import React, { useTransition, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  History,
  Users,
  Settings,
  Loader2,
} from "lucide-react";

export const ADMIN_DOCKBAR_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Riwayat", href: "/admin/riwayat", icon: History },
  { label: "Admin", href: "/admin/kelola-admin", icon: Users },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

export function AdminDockbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const handleNavigate = (href: string, e: React.MouseEvent) => {
    if (pathname === href) return;

    e.preventDefault();
    setLoadingHref(href);

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div
      suppressHydrationWarning
      className="lg:hidden fixed bottom-4 inset-x-0 z-[9999] flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <nav
        suppressHydrationWarning
        aria-label="Admin Mobile Navigation Dockbar"
        className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_12px_36px_rgba(2,132,199,0.2)] rounded-3xl p-1.5 flex items-center justify-around pointer-events-auto transition-all"
      >
        {ADMIN_DOCKBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          const isLoadingThis = isPending && loadingHref === item.href && pathname !== item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavigate(item.href, e)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-sky-700 font-extrabold"
                  : "text-slate-500 hover:text-sky-700 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-sky-100/90 text-sky-700 shadow-2xs scale-105"
                    : "hover:bg-slate-100/60"
                }`}
              >
                {isLoadingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-sky-700 stroke-[2.5]" : "text-slate-500"
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-[9.5px] tracking-tight mt-0.5 leading-none ${
                  isActive ? "text-sky-900 font-black" : "text-slate-500 font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
