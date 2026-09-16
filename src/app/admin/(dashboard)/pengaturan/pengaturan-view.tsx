"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Key,
  Save,
  Loader2,
  AtSign,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Crown,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getNotificationSettings,
  setNotificationSettings,
  getNotificationPermissionState,
  requestNotificationPermission,
  sendBrowserPushNotification,
  playNotificationSound,
  NotificationPermissionState,
} from "@/lib/notifications";
import { AdminPengaturanMobileView } from "@/components/mobile/admin-pengaturan-mobile-view";
import { toast } from "sonner";

export function AdminPengaturanView() {
  const router = useRouter();

  // Admin Profile States
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Edit Profile Dialog Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Dialog Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notification Settings States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>("default");
  const [isTestingNotif, setIsTestingNotif] = useState(false);

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

  useEffect(() => {
    // 1. Fetch active admin profile
    fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const profileNama = data.nama || "Petugas Administrator";
          const profileUsername = data.username || "admin";
          setNama(profileNama);
          setUsername(profileUsername);
          setRole(data.role || "ADMIN");
          setEditNama(profileNama);
          setEditUsername(profileUsername);
        }
      })
      .catch((err) => console.warn("Failed to load profile:", err))
      .finally(() => setIsLoadingProfile(false));

    // 2. Load Local Notification Settings & Browser Permission
    queueMicrotask(() => {
      const notifSettings = getNotificationSettings();
      setPushEnabled(notifSettings.pushEnabled);
      setSoundEnabled(notifSettings.soundEnabled);
      setPermissionState(getNotificationPermissionState());
    });
  }, []);

  const isSuperAdmin = role === "SUPER_ADMIN";

  // Toggle Push Notification ON/OFF
  const handleTogglePush = async () => {
    if (!pushEnabled) {
      const perm = await requestNotificationPermission();
      setPermissionState(perm);

      if (perm === "denied") {
        toast.error("Izin Notifikasi Ditolak Browser", {
          description: "Silakan izinkan notifikasi pada pengaturan situs browser Anda.",
        });
        return;
      }

      setPushEnabled(true);
      setNotificationSettings({ pushEnabled: true });
      toast.success("Notifikasi Push Diaktifkan (ON)!", {
        description: "Anda akan menerima notifikasi desktop setiap ada laporan baru yang masuk.",
      });
    } else {
      setPushEnabled(false);
      setNotificationSettings({ pushEnabled: false });
      toast.info("Notifikasi Push Dinonaktifkan (OFF)");
    }
  };

  // Toggle Sound ON/OFF
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    setNotificationSettings({ soundEnabled: nextVal });
    if (nextVal) {
      playNotificationSound("new-report");
      toast.success("Suara Lonceng Notifikasi Diaktifkan (ON)!");
    } else {
      toast.info("Suara Lonceng Notifikasi Dinonaktifkan (OFF)");
    }
  };

  // Test Push Notification Trigger
  const handleTestPushNotification = async () => {
    setIsTestingNotif(true);

    let perm = permissionState;
    if (perm !== "granted") {
      perm = await requestNotificationPermission();
      setPermissionState(perm);
    }

    if (perm !== "granted") {
      toast.error("Gagal Mengirim Uji Coba", {
        description: "Browser tidak mengizinkan notifikasi. Silakan aktifkan izin notifikasi di browser.",
      });
      setIsTestingNotif(false);
      return;
    }

    await sendBrowserPushNotification({
      title: "Laporan Kerusakan Baru Masuk!",
      body: "Tiket #TRK-2026-0826: Budi Santoso (Stasiun Gilingan) melaporkan kendala pipa uap.",
      onClickUrl: "/admin/riwayat",
    });

    toast.success("Uji Coba Notifikasi Push Berhasil Dikirim!", {
      description: "Periksa bilah notifikasi HP / browser Anda.",
    });

    setIsTestingNotif(false);
  };

  const handleOpenEditProfile = () => {
    setEditNama(nama);
    setEditUsername(username);
    setProfileConfirmPassword("");
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNama || !editUsername) {
      toast.error("Nama dan username wajib diisi.");
      return;
    }

    if (!profileConfirmPassword) {
      toast.error("Password login wajib dimasukkan untuk mengonfirmasi perubahan profil.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROFILE",
          nama: editNama.trim(),
          username: editUsername.trim(),
          confirmPassword: profileConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Gagal menyimpan profil", { description: data.error });
        return;
      }

      setNama(editNama.trim());
      setUsername(editUsername.trim());
      setProfileConfirmPassword("");
      toast.success("Profil Akun Berhasil Diperbarui!", {
        description: `Informasi akun ${editNama} (@${editUsername}) telah disimpan.`,
      });
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error("Terjadi kesalahan jaringan saat menyimpan profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Password lama dan password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Password baru minimal 4 karakter.");
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHANGE_PASSWORD",
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Gagal mengubah password", { description: data.error });
        return;
      }

      toast.success("Password Akun Berhasil Diubah!", {
        description: "Gunakan password baru saat login berikutnya.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordOpen(false);
    } catch (err) {
      console.error("Save password error:", err);
      toast.error("Terjadi kesalahan jaringan saat mengubah password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Dynamic Page Header */}
      <PageHeader
        title="Pengaturan Sistem & Notifikasi"
        description="Kelola preferensi notifikasi push laporan masuk secara realtime dan manajemen akun administrator SIGAP."
        badgeText="Admin Preferences"
        badgeColor="sky"
        icon={Settings}
      />

      {/* 💻 Desktop 2-Column Settings View */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PUSH NOTIFICATIONS SETTINGS */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700 ring-4 ring-sky-50 shadow-2xs">
                    <BellRing className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      Notifikasi Laporan Masuk
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                      Push notification desktop realtime saat laporan baru dikirim oleh pelapor
                    </CardDescription>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold border uppercase tracking-wider ${
                    pushEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {pushEnabled ? "Status: ON" : "Status: OFF"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Push Notification Switch Banner */}
              <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    {pushEnabled ? (
                      <Bell className="h-4 w-4 text-sky-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-slate-400" />
                    )}
                    Push Notification Browser (Desktop Banner)
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Menampilkan jendela pop-up notifikasi desktop layaknya notifikasi video YouTube saat ada tiket pengaduan baru.
                  </p>
                </div>

                <Button
                  onClick={handleTogglePush}
                  className={`h-10 px-5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 ${
                    pushEnabled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-slate-200/50"
                  }`}
                >
                  {pushEnabled ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Notifikasi ON
                    </>
                  ) : (
                    <>
                      <BellOff className="mr-1.5 h-3.5 w-3.5" />
                      Aktifkan (OFF)
                    </>
                  )}
                </Button>
              </div>

              {/* Sound Effect Switch Banner */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-sky-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-400" />
                    )}
                    Suara Lonceng Notifikasi (*Audio Chime*)
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Memainkan nada dering lonceng harmonik dua nada yang jernih ketika ada laporan kerusakan baru masuk ke sistem.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleToggleSound}
                  className={`h-10 px-5 rounded-xl font-bold text-xs border transition-all cursor-pointer shrink-0 ${
                    soundEnabled
                      ? "bg-white border-sky-300 text-sky-700 shadow-2xs hover:bg-sky-50"
                      : "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {soundEnabled ? "Suara: ON" : "Suara: Mute"}
                </Button>
              </div>

              {/* Browser Permission Status & Test Trigger */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {permissionState === "granted" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Izin Browser: Diizinkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Izin Browser: {permissionState === "denied" ? "Diblokir" : "Belum Diminta"}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleTestPushNotification}
                  disabled={isTestingNotif}
                  className="h-9 px-4 rounded-xl text-xs font-bold bg-linear-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-md shadow-sky-600/20 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Uji Coba Notifikasi Push (Test)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: KELOLA AKUN & PROFIL ADMIN */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 ring-2 ring-purple-50">
                  <User className="h-4 w-4" />
                </div>
                Kelola Akun
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                Informasi profil akun aktif dan tombol kontrol manajemen
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                  <span className="text-xs font-semibold">Memuat akun...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Account Summary Badge */}
                  <div className="p-4 rounded-2xl bg-linear-to-br from-slate-50 to-sky-50/50 border border-sky-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-linear-to-tr from-sky-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
                        {nama ? nama.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {nama || "Petugas Administrator"}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-600 font-mono font-semibold">
                            @{username || "admin"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-2xs ${
                              isSuperAdmin
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-sky-50 text-sky-800 border-sky-200"
                            }`}
                          >
                            {isSuperAdmin ? <Crown className="h-3 w-3 text-purple-600" /> : <Wrench className="h-3 w-3 text-sky-600" />}
                            {isSuperAdmin ? "Super Admin" : "Admin Teknis"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. Tombol Edit Profil Akun */}
                  <Button
                    onClick={handleOpenEditProfile}
                    className="w-full h-11 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-98"
                  >
                    <Edit3 className="h-4 w-4 text-sky-400" />
                    Edit Profil Akun
                  </Button>

                  {/* 2. Tombol Ubah Password (Tepat di Bawah Tombol Profil) */}
                  <Button
                    onClick={() => setIsChangePasswordOpen(true)}
                    variant="outline"
                    className="w-full h-11 rounded-2xl font-bold text-xs border-sky-200 hover:bg-sky-50 text-sky-900 shadow-2xs cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-98"
                  >
                    <Key className="h-4 w-4 text-sky-600" />
                    Ubah Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tampilan Khusus Mobile HP */}
      <div className="block lg:hidden">
        <AdminPengaturanMobileView
          nama={nama}
          username={username}
          role={role}
          isLoadingProfile={isLoadingProfile}
          pushEnabled={pushEnabled}
          soundEnabled={soundEnabled}
          permissionState={permissionState}
          isTestingNotif={isTestingNotif}
          onTogglePush={handleTogglePush}
          onToggleSound={handleToggleSound}
          onTestNotif={handleTestPushNotification}
          onOpenEditProfile={handleOpenEditProfile}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </div>

      {/* Modal 1: Edit Profil Akun (Nama & Username) */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 ring-2 ring-sky-100">
                <Edit3 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                  Edit Profil Akun
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 font-medium">
                  Perbarui nama lengkap dan username login akun admin Anda.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-sky-600" />
                Nama Lengkap Petugas *
              </label>
              <Input
                value={editNama}
                onChange={(e) => setEditNama(e.target.value)}
                required
                className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <AtSign className="h-3.5 w-3.5 text-sky-600" />
                Username Login *
              </label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
                className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs font-mono"
              />
            </div>

            {/* Konfirmasi Password Login saat ini untuk Keamanan */}
            <div className="space-y-1 pt-1.5 border-t border-slate-100">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-rose-600" />
                Password Login Akun Anda * <span className="text-[10px] text-rose-600 font-semibold">(Verifikasi Keamanan)</span>
              </label>
              <div className="relative">
                <Input
                  type={showProfileConfirmPassword ? "text" : "password"}
                  placeholder="Masukkan password akun Anda saat ini"
                  value={profileConfirmPassword}
                  onChange={(e) => setProfileConfirmPassword(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl border-rose-200/90 focus:border-rose-500 bg-white shadow-2xs pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-sky-600 transition-colors"
                  title={showProfileConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showProfileConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
                className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="h-10 px-5 rounded-xl text-xs font-bold bg-linear-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md shadow-sky-600/20 cursor-pointer"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Simpan Profil
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Ubah Password (Khusus Ganti Password) */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 ring-2 ring-sky-100">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                  Ubah Password Akun
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 font-medium">
                  Masukkan password lama dan password baru Anda untuk keamanan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
            {/* Password Lama */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-slate-400" />
                Password Saat Ini (Lama) *
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
                required
                className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
              />
            </div>

            {/* Password Baru */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-600" />
                Password Baru *
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                required
                className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
              />
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-600" />
                Konfirmasi Password Baru *
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                required
                className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
              />
            </div>

            {/* Modal Actions */}
            <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
                className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSavingPassword}
                className="h-10 px-5 rounded-xl text-xs font-bold bg-linear-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md shadow-sky-600/20 cursor-pointer"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Key className="mr-1.5 h-3.5 w-3.5" />
                    Simpan Password Baru
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
