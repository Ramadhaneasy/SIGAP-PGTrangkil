"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  History,
  Activity,
  Users,
  Settings,
  LogOut,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDockbar } from "@/components/mobile/admin-dockbar";
import { AdminJwtPayload } from "@/lib/auth";
import { toast } from "sonner";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Manage Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Riwayat Laporan", href: "/admin/riwayat", icon: History },
  { label: "Daftar Admin", href: "/admin/kelola-admin", icon: Users },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
  { label: "Log Aktivitas", href: "/admin/log-aktivitas", icon: Activity },
];

interface NavLinksProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
}

export function AdminNavLinks({ onItemClick, isCollapsed = false }: NavLinksProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const handleNavigate = (href: string, e: React.MouseEvent) => {
    if (pathname === href) return;

    e.preventDefault();
    setLoadingHref(href);
    if (onItemClick) onItemClick();

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="space-y-1.5">
      {ADMIN_NAV_ITEMS.map((item) => {
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
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center rounded-2xl text-xs sm:text-sm font-bold transition-colors ${
              isCollapsed
                ? "justify-center h-10 w-10 mx-auto"
                : "justify-between px-3.5 py-2.5"
            } ${
              isActive
                ? "bg-linear-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-600/20"
                : "text-slate-600 hover:bg-sky-50/80 hover:text-sky-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-sky-600"}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </div>

            {!isCollapsed && isLoadingThis && (
              <Loader2 className="h-4 w-4 animate-spin shrink-0 opacity-90" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBottomNav() {
  return <AdminDockbar />;
}

export function AdminSidebar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userSession, setUserSession] = useState<AdminJwtPayload | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUserSession(data.user);
        }
      })
      .catch((err) => console.warn("Failed to load session for mobile header:", err));
  }, []);

  // Restore collapsed state from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem("sigap_admin_sidebar_collapsed");
    if (saved !== null) {
      queueMicrotask(() => {
        setIsCollapsed(saved === "true");
      });
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sigap_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Berhasil logout dari sistem");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Gagal melakukan logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Floating Non-Stick/Fixed Card Sidebar (lg+) */}
      <aside
        className={`hidden lg:flex flex-col border border-sky-100/90 bg-white/95 backdrop-blur-2xl p-3.5 space-y-4 shrink-0 fixed top-3 left-3 bottom-3 z-30 shadow-[0_10px_35px_rgba(2,132,199,0.08)] rounded-3xl transition-all duration-300 ease-in-out h-[calc(100vh-1.5rem)] ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Floating Expand/Collapse Button on Edge (Guaranteed Never Clipped) */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="absolute -right-3.5 top-6 z-50 h-7 w-7 rounded-full bg-white border border-sky-200/90 shadow-md text-sky-700 hover:text-sky-900 hover:bg-sky-50 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title={isCollapsed ? "Buka Sidebar (Expand)" : "Sembunyikan Sidebar (Collapse)"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Header & Logo */}
        <div className="border-b border-sky-100/80 pb-3">
          {!isCollapsed ? (
            <Link href="/admin/dashboard" className="block group pr-2">
              <div className="relative h-8 w-auto flex items-center mb-1">
                <Image
                  src="/assets/images/logo-pg-trangkil.png"
                  alt="Logo PT Kebon Agung PG Trangkil"
                  width={200}
                  height={40}
                  priority
                  className="h-6.5 w-auto object-contain drop-shadow-xs"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-sky-50/80 border border-sky-100 px-2 py-0.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
                </span>
                <span className="font-extrabold text-[10px] tracking-wide text-sky-800">
                  SIGAP Admin
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="mx-auto block" title="SIGAP Admin Panel">
              <div className="h-10 w-10 rounded-2xl bg-linear-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-600/30 mx-auto">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
          <AdminNavLinks isCollapsed={isCollapsed} />
        </div>

        {/* Footer Info & Logout Button */}
        <div className="pt-4 border-t border-sky-100/80 space-y-3">
          {!isCollapsed ? (
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-[11px] font-medium text-center">
              <span>&copy; {new Date().getFullYear()} SIGAP &bull; PG Trangkil</span>
            </div>
          ) : (
            <div className="flex justify-center text-[10px] text-slate-400 font-semibold" title={`© ${new Date().getFullYear()} SIGAP`}>
              <span>&copy;{new Date().getFullYear()}</span>
            </div>
          )}

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Logout"
            className={`w-full bg-rose-50 hover:bg-rose-600 border border-rose-200/90 text-rose-700 hover:text-white rounded-2xl font-bold transition-all shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98] ${
              isCollapsed ? "justify-center p-0 h-11 w-11 mx-auto" : "justify-center px-3.5 h-11 text-xs"
            }`}
            size="sm"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </div>
            )}
          </Button>
        </div>
      </aside>

      {/* Layout Spacer for Flex Container so Main Content respects the fixed floating sidebar */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-23" : "w-68"
        }`}
      />

      {/* Mobile Top Header (< lg) - Clean & Minimalist */}
      <header className="lg:hidden flex items-center justify-between min-h-14 py-2 px-3.5 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-40 shadow-2xs">
        {/* Left: Compact Official PG Trangkil Logo (No Admin Text) */}
        <Link href="/admin/dashboard" className="flex items-center shrink-0">
          <Image
            src="/assets/images/logo-pg-trangkil.png"
            alt="Logo PT Kebon Agung PG Trangkil"
            width={125}
            height={26}
            className="h-5 w-auto object-contain"
          />
        </Link>

        {/* Right: SIGAP Badge + User Session Pill */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-linear-to-r from-sky-50 to-indigo-50 border border-sky-200/80 shadow-2xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-600"></span>
            </span>
            <span className="font-black text-[10.5px] tracking-wider text-sky-900 leading-none">
              SIGAP
            </span>
          </div>

          {userSession && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-2xs max-w-42.5 sm:max-w-57.5 ${
                userSession.role === "SUPER_ADMIN"
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : "bg-sky-50 text-sky-800 border-sky-200"
              }`}
              title={`${userSession.nama} : ${userSession.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Teknis"}`}
            >
              {userSession.role === "SUPER_ADMIN" ? (
                <Crown className="h-2.5 w-2.5 text-purple-600 shrink-0" />
              ) : (
                <Wrench className="h-2.5 w-2.5 text-sky-600 shrink-0" />
              )}
              <span className="truncate">
                {userSession.nama} : {userSession.role === "SUPER_ADMIN" ? "Super Admin" : "Admin Teknis"}
              </span>
            </div>
          )}
        </div>
      </header>
    </>
  );
}


