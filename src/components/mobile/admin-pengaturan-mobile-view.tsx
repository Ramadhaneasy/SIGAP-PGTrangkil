"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Wrench,
  Edit3,
  Key,
  Activity,
  Users,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface AdminPengaturanMobileViewProps {
  nama: string;
  username: string;
  role: string;
  isLoadingProfile: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  permissionState: string;
  isTestingNotif: boolean;
  onTogglePush: () => void;
  onToggleSound: () => void;
  onTestNotif: () => void;
  onOpenEditProfile: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function AdminPengaturanMobileView({
  nama,
  username,
  role,
  pushEnabled,
  soundEnabled,
  permissionState,
  isTestingNotif,
  onTogglePush,
  onToggleSound,
  onTestNotif,
  onOpenEditProfile,
  onOpenChangePassword,
  onLogout,
  isLoggingOut,
}: AdminPengaturanMobileViewProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      {/* Compact Profile Header Card */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-700 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
              {nama ? nama.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-xs text-slate-900 truncate">
                {nama || "Petugas Administrator"}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-sky-700">
                  @{username || "admin"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wide border ${
                    isSuperAdmin
                      ? "bg-purple-50 text-purple-800 border-purple-200"
                      : "bg-sky-50 text-sky-800 border-sky-200"
                  }`}
                >
                  {isSuperAdmin ? (
                    <Crown className="h-3 w-3 text-purple-600" />
                  ) : (
                    <Wrench className="h-3 w-3 text-sky-600" />
                  )}
                  {isSuperAdmin ? "Super Admin" : "Admin Teknis"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Profile Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenEditProfile}
              className="h-8.5 text-xs font-bold rounded-xl border-slate-200 hover:bg-sky-50 hover:text-sky-700 text-slate-700 shadow-2xs cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
              Edit Profil
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenChangePassword}
              className="h-8.5 text-xs font-bold rounded-xl border-slate-200 hover:bg-sky-50 hover:text-sky-700 text-slate-700 shadow-2xs cursor-pointer"
            >
              <Key className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
              Ganti Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Operasional & Log Petugas */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Menu Operasional &amp; Log
        </h4>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* Tile 1: Log Aktivitas */}
          <Link
            href="/admin/log-aktivitas"
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors">
                  Log Aktivitas &amp; Audit Trail
                </h5>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  Catatan riwayat tindakan &amp; audit petugas
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 shrink-0 ml-2" />
          </Link>

          {/* Tile 2: Kelola Admin (Hanya Super Admin) */}
          {isSuperAdmin && (
            <Link
              href="/admin/kelola-admin"
              className="flex items-center justify-between p-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 transition-colors">
                    Daftar &amp; Kelola Admin
                  </h5>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    Tambah akun baru, ubah role, atau banned
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 shrink-0 ml-2" />
            </Link>
          )}
        </div>
      </div>

      {/* Section 2: Preferensi Notifikasi */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Notifikasi Realtime
        </h4>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* Row 1: Push Notification Toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                {pushEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-slate-400" />}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-slate-900">
                  Push Notification Browser
                </h5>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pop-up notifikasi laporan baru di layar HP/PC
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={onTogglePush}
              className={`h-7 px-2.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer shrink-0 ml-2 ${
                pushEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              {pushEnabled ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Row 2: Sound Chime Toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-slate-900">
                  Suara Lonceng Notifikasi
                </h5>
                <p className="text-[11px] text-slate-500 font-medium">
                  Bunyi nada dering saat pengaduan masuk
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={onToggleSound}
              className={`h-7 px-2.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer shrink-0 ml-2 ${
                soundEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              {soundEnabled ? "ON" : "OFF"}
            </Button>
          </div>

          {/* Row 3: Test Push Trigger */}
          <div className="p-3 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Izin Browser: {permissionState === "granted" ? "Diizinkan" : "Standby"}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={onTestNotif}
              disabled={isTestingNotif}
              className="h-7 px-2.5 text-[11px] font-bold rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 cursor-pointer"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Uji Bunyi
            </Button>
          </div>
        </div>
      </div>

      {/* Section 3: Keluar Sistem (Logout) */}
      <div className="pt-2">
        <Button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full h-11 rounded-2xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
        >
          <LogOut className="h-4 w-4" />
          Keluar dari Akun (Logout)
        </Button>
      </div>

      {/* Info Footer Minimalis */}
      <div className="text-center pt-1">
        <p className="text-[10px] text-slate-400 font-medium">
          SIGAP &bull; PT Kebon Agung PG Trangkil
        </p>
      </div>

      {/* Pop-up Dialog Konfirmasi Logout */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="max-w-xs p-5 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 text-center">
            <div className="mx-auto p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 w-fit">
              <LogOut className="h-5 w-5" />
            </div>
            <DialogTitle className="text-sm font-extrabold text-slate-900 pt-2">
              Konfirmasi Keluar Akun
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Apakah Anda yakin ingin logout dari panel admin SIGAP?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
              className="h-9 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsLogoutModalOpen(false);
                onLogout();
              }}
              disabled={isLoggingOut}
              className="h-9 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Ya, Logout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
