"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Crown,
  Wrench,
  Trash2,
  Pencil,
  ShieldCheck,
  Loader2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  User,
  Shield,
  AtSign,
  Edit3,
  Ban,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KelolaAdminMobileView } from "@/components/mobile/kelola-admin-mobile-view";
import { toast } from "sonner";

export interface AdminUserItem {
  id: string;
  username: string;
  nama: string;
  role: "SUPER_ADMIN" | "ADMIN";
  is_banned?: boolean;
  banned_until?: string | null;
  banned_reason?: string | null;
  created_at: string;
}

export interface KelolaAdminViewProps {
  users: AdminUserItem[];
  currentUserRole?: string;
  currentUserId?: string;
  currentUsername?: string;
}

type SortField = "nama" | "username" | "role" | "created_at";
type SortOrder = "asc" | "desc";

export function KelolaAdminView({
  users: initialUsers,
  currentUserRole = "ADMIN",
  currentUserId,
  currentUsername,
}: KelolaAdminViewProps) {
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddConfirmDialogOpen, setIsAddConfirmDialogOpen] = useState(false);
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [showAddConfirmPassword, setShowAddConfirmPassword] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  // Custom Modal States for Unban and Delete
  const [unbanTarget, setUnbanTarget] = useState<AdminUserItem | null>(null);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUserItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Add Admin Form State
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");

  // Edit Admin Form State
  const [editId, setEditId] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");

  // Ban Admin Form State
  const [banTarget, setBanTarget] = useState<AdminUserItem | null>(null);
  const [banType, setBanType] = useState<"PERMANENT" | "TEMPORARY">("PERMANENT");
  const [banStartDate, setBanStartDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [banEndDate, setBanEndDate] = useState(() =>
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [banReason, setBanReason] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "created_at" ? "desc" : "asc");
    }
  };

  const handleOpenEdit = (adminItem: AdminUserItem) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Super Admin yang berhak mengubah data akun.",
      });
      return;
    }
    setEditId(adminItem.id);
    setEditNama(adminItem.nama);
    setEditUsername(adminItem.username);
    setEditPassword("");
    setEditRole(adminItem.role);
    setIsEditDialogOpen(true);
  };

  const handleOpenBan = (adminItem: AdminUserItem) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Super Admin yang berhak melakukan tindakan Banned.",
      });
      return;
    }
    setBanTarget(adminItem);
    setBanType("PERMANENT");
    setBanStartDate(new Date().toISOString().split("T")[0]);
    setBanEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setBanReason("");
    setIsBanDialogOpen(true);
  };

  const handleAddAdminStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Super Admin yang berhak menambahkan akun admin baru.",
      });
      return;
    }

    if (!nama || !username || !password) {
      toast.error("Nama, username, dan password wajib diisi.");
      return;
    }

    if (password.length < 4) {
      toast.error("Password minimal 4 karakter.");
      return;
    }

    setAddConfirmPassword("");
    setShowAddConfirmPassword(false);
    setIsAddConfirmDialogOpen(true);
  };

  const handleConfirmAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addConfirmPassword) {
      toast.error("Password akun Super Admin Anda wajib diisi untuk verifikasi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          username: username.trim(),
          password,
          role,
          confirmPassword: addConfirmPassword,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        toast.error("Gagal menambah admin", { description: resData.error });
        return;
      }

      toast.success("Akun Admin Baru Berhasil Didaftarkan!", {
        description: `Petugas ${nama} (@${username}) telah ditambahkan ke sistem.`,
      });

      setUsers((prev) => [
        {
          id: resData.id || `adm-${Date.now()}`,
          nama: nama.trim(),
          username: username.trim(),
          role,
          is_banned: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Reset & Close Dialogs
      setNama("");
      setUsername("");
      setPassword("");
      setAddConfirmPassword("");
      setRole("ADMIN");
      setIsAddConfirmDialogOpen(false);
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Gagal menambah admin:", err);
      toast.error("Terjadi kesalahan koneksi sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    if (!editNama || !editUsername) {
      toast.error("Nama dan username wajib diisi.");
      return;
    }

    if (editPassword && editPassword.length < 4) {
      toast.error("Password baru minimal 4 karakter.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          nama: editNama,
          username: editUsername.trim(),
          password: editPassword ? editPassword : undefined,
          role: editRole,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        toast.error("Gagal mengubah data admin", { description: resData.error });
        return;
      }

      toast.success("Data Akun Admin Berhasil Diperbarui!", {
        description: `Perubahan data untuk ${editNama} telah disimpan.`,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                nama: editNama,
                username: editUsername.trim(),
                role: editRole,
              }
            : item
        )
      );

      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Gagal mengubah data admin:", err);
      toast.error("Terjadi kesalahan sistem saat memperbarui admin.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !banTarget) return;

    setIsBanning(true);
    try {
      const isPermanent = banType === "PERMANENT";
      const bannedUntil = isPermanent ? null : new Date(banEndDate + "T23:59:59").toISOString();

      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: banTarget.id,
          action: "BAN",
          isPermanent,
          bannedUntil,
          bannedReason: banReason ? banReason.trim() : "Penonaktifan oleh Super Admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Gagal menonaktifkan akun admin", { description: data.error });
        return;
      }

      toast.success(`Akun ${banTarget.nama} Berhasil Dinonaktifkan (Banned)!`, {
        description: isPermanent ? "Status: Banned Permanen." : `Status: Banned s/d ${banEndDate}.`,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === banTarget.id
            ? {
                ...item,
                is_banned: true,
                banned_until: bannedUntil,
                banned_reason: banReason || "Penonaktifan oleh Super Admin",
              }
            : item
        )
      );

      setIsBanDialogOpen(false);
    } catch (err) {
      console.error("Ban error:", err);
      toast.error("Terjadi kesalahan sistem saat menonaktifkan akun.");
    } finally {
      setIsBanning(false);
    }
  };

  const handleOpenUnbanModal = (adminItem: AdminUserItem) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Super Admin yang berhak membuka banned akun.",
      });
      return;
    }
    setUnbanTarget(adminItem);
    setIsUnbanDialogOpen(true);
  };

  const handleConfirmUnban = async () => {
    if (!unbanTarget) return;
    setProcessingId(unbanTarget.id);
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: unbanTarget.id,
          action: "UNBAN",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Gagal membuka banned", { description: data.error });
        return;
      }

      toast.success(`Akun ${unbanTarget.nama} Berhasil Diaktifkan Kembali (Unbanned)!`);

      setUsers((prev) =>
        prev.map((item) =>
          item.id === unbanTarget.id
            ? {
                ...item,
                is_banned: false,
                banned_until: null,
                banned_reason: null,
              }
            : item
        )
      );
      setIsUnbanDialogOpen(false);
    } catch (err) {
      console.error("Unban error:", err);
      toast.error("Kesalahan jaringan saat membuka banned.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenDeleteModal = (adminItem: AdminUserItem) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Super Admin yang berhak menghapus akun admin.",
      });
      return;
    }
    setDeleteTarget(adminItem);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Gagal menghapus admin.");
        return;
      }

      setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success(`Akun ${deleteTarget.nama} berhasil dihapus.`);
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Kesalahan jaringan saat menghapus admin.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter and Sort Users
  const filteredUsers = users.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const isASelf = (currentUserId && a.id === currentUserId) || (currentUsername && a.username === currentUsername);
    const isBSelf = (currentUserId && b.id === currentUserId) || (currentUsername && b.username === currentUsername);
    if (isASelf) return -1;
    if (isBSelf) return 1;

    let comparison = 0;
    if (sortField === "created_at") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === "role") {
      comparison = a.role.localeCompare(b.role, "id-ID");
    } else if (sortField === "username") {
      comparison = a.username.localeCompare(b.username, "id-ID");
    } else {
      comparison = a.nama.localeCompare(b.nama, "id-ID");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const renderSortIndicator = (field: SortField) => {
    const isActive = sortField === field;
    if (!isActive) {
      return (
        <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-sky-500 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-sky-600 shrink-0 stroke-[2.5]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-sky-600 shrink-0 stroke-[2.5]" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Halaman Dynamic */}
      <PageHeader
        title="Daftar Admin"
        description={
          isSuperAdmin
            ? "Fitur khusus Super Admin untuk mendaftarkan akun baru, mengedit profil, mengatur role, serta tindakan Banned / Unbanned."
            : "Daftar seluruh petugas administrator aktif SIGAP PT Kebon Agung PG Trangkil."
        }
        badgeText={isSuperAdmin ? "Super Admin Exclusive" : "Admin Panel"}
        badgeColor={isSuperAdmin ? "purple" : "sky"}
        icon={isSuperAdmin ? Crown : Users}
      />

      {/* 💻 Desktop Full-Width Table View */}
      <div className="hidden lg:block">
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                Data Akun Administrator
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                Menampilkan {sortedUsers.length} dari total {users.length} akun terdaftar di sistem
              </CardDescription>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / username..."
                  className="pl-8.5 h-9 text-xs font-medium rounded-xl border-sky-200/80 focus:border-sky-500 focus:ring-sky-500/20 bg-white shadow-2xs"
                />
              </div>

              {/* Add New Admin Button (HANYA MUNCUL JIKA SUPER ADMIN) */}
              {isSuperAdmin && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        size="sm"
                        className="h-9 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer shrink-0"
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                        Tambah Admin Baru
                      </Button>
                    }
                  />

                  <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-sky-100/80 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
                    <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600 ring-2 ring-sky-100">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <div>
                          <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                            Tambah Akun Admin Baru
                          </DialogTitle>
                          <DialogDescription className="text-[11px] text-slate-500 font-medium">
                            Daftarkan petugas baru untuk mengakses panel operasional SIGAP.
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <form onSubmit={handleAddAdminStep1} className="space-y-3.5 text-xs">
                      {/* Nama Lengkap */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-sky-600" />
                          Nama Lengkap Petugas *
                        </label>
                        <Input
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="Contoh: Budi Santoso"
                          required
                          className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
                        />
                      </div>

                      {/* Username */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <AtSign className="h-3.5 w-3.5 text-sky-600" />
                          Username Login *
                        </label>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Contoh: budi_teknisi"
                          required
                          className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs font-mono"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-sky-600" />
                          Password Login *
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 4 karakter"
                          required
                          className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
                        />
                      </div>

                      {/* Role Access Selector */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-sky-600" />
                          Role / Tingkat Hak Akses *
                        </label>
                        <Select
                          value={role}
                          onValueChange={(val) => {
                            if (val) setRole(val as "SUPER_ADMIN" | "ADMIN");
                          }}
                        >
                          <SelectTrigger className="w-full h-10 px-3 text-xs font-semibold rounded-xl border-sky-200 bg-white shadow-2xs text-left focus:border-sky-500">
                            <SelectValue placeholder="Pilih Role Akses" />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width] min-w-[280px]">
                            <SelectItem value="ADMIN" className="text-xs py-2.5 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                                <span className="font-bold text-slate-800">Admin Teknis</span>
                                <span className="text-slate-400 text-[11px] font-normal">(Operasional & Tiket)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="SUPER_ADMIN" className="text-xs py-2.5 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                <span className="font-bold text-purple-800">Super Admin</span>
                                <span className="text-slate-400 text-[11px] font-normal">(Akses Penuh & Kelola Admin)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Modal Actions */}
                      <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          className="h-10 px-5 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs cursor-pointer"
                        >
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                          Simpan &amp; Verifikasi
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Pop-up Dialog Verifikasi Sandi Super Admin Sebelum Simpan Admin Baru */}
              {isSuperAdmin && (
                <Dialog open={isAddConfirmDialogOpen} onOpenChange={setIsAddConfirmDialogOpen}>
                  <DialogContent className="max-w-md p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
                    <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          <Lock className="h-4 w-4 text-amber-700" />
                        </div>
                        <div>
                          <DialogTitle className="text-base font-extrabold tracking-tight text-slate-900">
                            Verifikasi Sandi Super Admin
                          </DialogTitle>
                          <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                            Masukkan password akun Super Admin Anda untuk mengonfirmasi pendaftaran akun admin baru ({nama} - @{username}).
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <form onSubmit={handleConfirmAddAdmin} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">
                          Password Super Admin Saat Ini <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showAddConfirmPassword ? "text" : "password"}
                            value={addConfirmPassword}
                            onChange={(e) => setAddConfirmPassword(e.target.value)}
                            placeholder="Masukkan password Super Admin"
                            autoFocus
                            required
                            className="h-10 text-xs rounded-xl border-slate-200 focus:border-sky-500 bg-white shadow-2xs pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8 hover:bg-sky-50 text-slate-400 hover:text-sky-700 rounded-lg cursor-pointer"
                            onClick={() => setShowAddConfirmPassword(!showAddConfirmPassword)}
                          >
                            {showAddConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddConfirmDialogOpen(false)}
                          className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="h-10 px-5 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Memverifikasi...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                              Konfirmasi &amp; Simpan Admin
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Edit Admin Modal Dialog (HANYA SUPER ADMIN) */}
              {isSuperAdmin && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-sky-100/80 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
                    <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600 ring-2 ring-sky-100">
                          <Edit3 className="h-4 w-4" />
                        </div>
                        <div>
                          <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                            Edit Akun Administrator
                          </DialogTitle>
                          <DialogDescription className="text-[11px] text-slate-500 font-medium">
                            Ubah informasi profil, username, hak akses, atau password petugas.
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <form onSubmit={handleUpdateAdmin} className="space-y-3.5 text-xs">
                      {/* Nama Lengkap */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
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
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <AtSign className="h-3.5 w-3.5 text-sky-600" />
                          Username Login *
                        </label>
                        <Input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          placeholder="Contoh: budi_teknisi"
                          required
                          className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs font-mono"
                        />
                      </div>

                      {/* Change Role (Ubah Hak Akses) */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-sky-600" />
                          Role / Tingkat Hak Akses *
                        </label>
                        <Select
                          value={editRole}
                          onValueChange={(val) => {
                            if (val) setEditRole(val as "SUPER_ADMIN" | "ADMIN");
                          }}
                        >
                          <SelectTrigger className="w-full h-10 px-3 text-xs font-semibold rounded-xl border-sky-200 bg-white shadow-2xs text-left focus:border-sky-500">
                            <SelectValue placeholder="Pilih Role Akses" />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width] min-w-[280px]">
                            <SelectItem value="ADMIN" className="text-xs py-2.5 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                                <span className="font-bold text-slate-800">Admin Teknis</span>
                                <span className="text-slate-400 text-[11px] font-normal">(Operasional & Tiket)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="SUPER_ADMIN" className="text-xs py-2.5 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                                <span className="font-bold text-purple-800">Super Admin</span>
                                <span className="text-slate-400 text-[11px] font-normal">(Akses Penuh & Kelola Admin)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ubah Password Opsional */}
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          Ganti Password Baru (Opsional)
                        </label>
                        <Input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Kosongkan jika tidak ingin ganti"
                          className="h-10 text-xs rounded-xl border-sky-200 focus:border-sky-500 bg-white shadow-2xs"
                        />
                      </div>

                      {/* Modal Actions */}
                      <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                          className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="h-10 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md shadow-sky-600/20 cursor-pointer"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                              Simpan Perubahan
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Ban Admin Modal Dialog (HANYA SUPER ADMIN) */}
              {isSuperAdmin && (
                <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
                  <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-rose-200/90 shadow-2xl space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto">
                    <DialogHeader className="space-y-1 pb-2 border-b border-rose-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-100 text-rose-700 ring-2 ring-rose-200">
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div>
                          <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                            Nonaktifkan / Banned Akun Admin
                          </DialogTitle>
                          <DialogDescription className="text-[11px] text-slate-500 font-medium">
                            Terapkan penonaktifan akses login untuk petugas <strong>{banTarget?.nama}</strong>.
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <form onSubmit={handleApplyBan} className="space-y-3.5 text-xs">
                      {/* Pilih Jenis Banned */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          Pilihan Tipe Sanksi Banned *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBanType("PERMANENT")}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              banType === "PERMANENT"
                                ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-950 font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5 text-rose-700">
                              <Ban className="h-3.5 w-3.5" />
                              Ban Permanen
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-normal leading-tight">
                              Nonaktifkan akun tanpa batas waktu sampai dibuka manual.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setBanType("TEMPORARY")}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              banType === "TEMPORARY"
                                ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 text-rose-950 font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5 text-rose-700">
                              <Calendar className="h-3.5 w-3.5" />
                              Ban Berjangka
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-normal leading-tight">
                              Nonaktifkan sementara dalam rentang tanggal tertentu.
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Jika Ban Berjangka: Pilih Tanggal */}
                      {banType === "TEMPORARY" && (
                        <div className="p-3 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-2.5">
                          <div className="font-bold text-[11px] text-rose-900 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-rose-600" />
                            Rentang Waktu Penonaktifan:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Mulai Dari</label>
                              <Input
                                type="date"
                                value={banStartDate}
                                onChange={(e) => setBanStartDate(e.target.value)}
                                required
                                className="h-8 text-[11px] rounded-lg border-rose-200 bg-white focus:border-rose-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Sampai Dengan</label>
                              <Input
                                type="date"
                                value={banEndDate}
                                onChange={(e) => setBanEndDate(e.target.value)}
                                required
                                className="h-8 text-[11px] rounded-lg border-rose-200 bg-white focus:border-rose-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Alasan Banned */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                          Alasan / Catatan Penonaktifan (Opsional)
                        </label>
                        <Input
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Contoh: Evaluasi kedisiplinan / Cuti operasional"
                          className="h-10 text-xs rounded-xl border-slate-200 focus:border-rose-500 bg-white shadow-2xs"
                        />
                      </div>

                      {/* Modal Actions */}
                      <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsBanDialogOpen(false)}
                          className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          disabled={isBanning}
                          className="h-10 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white shadow-md shadow-rose-600/20 cursor-pointer"
                        >
                          {isBanning ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <Ban className="mr-1.5 h-3.5 w-3.5" />
                              Terapkan Banned
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Full-Width Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/90 border-b border-sky-100/80 select-none">
                  <TableHead className="pl-5 pr-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("nama")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Nama"
                    >
                      <span>Nama Lengkap & Identitas</span>
                      {renderSortIndicator("nama")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[180px] px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("username")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Username"
                    >
                      <span>Username Login</span>
                      {renderSortIndicator("username")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[160px] px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("role")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Hak Akses"
                    >
                      <span>Hak Akses</span>
                      {renderSortIndicator("role")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[140px] px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleSort("created_at")}
                      className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 text-xs hover:text-sky-700 transition-colors group cursor-pointer"
                      title="Urutkan berdasarkan Waktu Pembuatan"
                    >
                      <span>Terdaftar Sejak</span>
                      {renderSortIndicator("created_at")}
                    </button>
                  </TableHead>
                  {isSuperAdmin && (
                    <TableHead className="text-center w-[130px] font-extrabold text-slate-700 text-xs pr-5 pl-3 py-3.5">
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-12 text-slate-400 italic text-xs">
                      Tidak ada akun admin yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedUsers.map((adminItem) => {
                    const isSuper = adminItem.role === "SUPER_ADMIN";
                    const isBanned = Boolean(adminItem.is_banned);
                    const isProcessing = processingId === adminItem.id;
                    const isSelf = (currentUserId && adminItem.id === currentUserId) || (currentUsername && adminItem.username === currentUsername);
                    const dateObj = new Date(adminItem.created_at);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    // Format Banned Badge
                    let banInfoBadge = null;
                    if (isBanned) {
                      if (adminItem.banned_until) {
                        const untilDate = new Date(adminItem.banned_until).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        banInfoBadge = (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs"
                            title={adminItem.banned_reason ? `Alasan: ${adminItem.banned_reason}` : undefined}
                          >
                            <Calendar className="h-3 w-3 text-rose-600" />
                            Banned s/d {untilDate}
                          </span>
                        );
                      } else {
                        banInfoBadge = (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs"
                            title={adminItem.banned_reason ? `Alasan: ${adminItem.banned_reason}` : undefined}
                          >
                            <Ban className="h-3 w-3 text-rose-700" />
                            Banned Permanen
                          </span>
                        );
                      }
                    }

                    return (
                      <TableRow
                        key={adminItem.id}
                        className={`transition-colors border-b border-slate-100 ${
                          isSelf
                            ? "bg-sky-50/60 hover:bg-sky-50/80 font-medium"
                            : isBanned
                            ? "bg-rose-50/25 hover:bg-rose-50/40 opacity-80"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <TableCell className="pl-5 pr-3 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isBanned
                                  ? "bg-rose-100 text-rose-700"
                                  : isSelf
                                  ? "bg-sky-700 text-white"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {adminItem.nama.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                <span>{adminItem.nama}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100/90 px-1.5 py-0.5 rounded-md border border-sky-200">
                                    (Akun Anda)
                                  </span>
                                )}
                              </div>
                              {banInfoBadge && <div>{banInfoBadge}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                            @{adminItem.username}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border shadow-2xs ${
                              isSuper
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-sky-50 text-sky-800 border-sky-200"
                            }`}
                          >
                            {isSuper ? <Crown className="h-3.5 w-3.5 text-purple-600" /> : <Wrench className="h-3.5 w-3.5 text-sky-600" />}
                            {isSuper ? "Super Admin" : "Admin Teknis"}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-4 text-xs text-slate-500 font-medium">
                          {formattedDate}
                        </TableCell>

                        {/* Kolom Aksi (HANYA SUPER ADMIN) */}
                        {isSuperAdmin && (
                          <TableCell className="text-center pr-5 pl-3 py-4">
                            <div className="flex items-center justify-center gap-1">
                              {/* Tombol Edit Admin */}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={Boolean(isSelf)}
                                onClick={() => handleOpenEdit(adminItem)}
                                className="h-8 w-8 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-full cursor-pointer transition-colors disabled:opacity-25"
                                title={isSelf ? "Gunakan menu Pengaturan untuk mengedit akun Anda sendiri" : "Edit Data Admin & Ubah Role"}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              {/* Tombol Banned vs Unbanned */}
                              {isBanned ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={Boolean(isProcessing || isSelf)}
                                  onClick={() => handleOpenUnbanModal(adminItem)}
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full cursor-pointer transition-colors"
                                  title="Buka Banned (Aktifkan Kembali)"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                                  ) : (
                                    <UserCheck className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={Boolean(isProcessing || isSuper || isSelf)}
                                  onClick={() => handleOpenBan(adminItem)}
                                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors disabled:opacity-25"
                                  title={isSelf ? "Tidak dapat membanned akun sendiri" : isSuper ? "Super Admin tidak dapat dibanned" : "Banned Akun Admin"}
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              {/* Tombol Hapus Admin */}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={Boolean(isProcessing)}
                                onClick={() => handleOpenDeleteModal(adminItem)}
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
                                title="Hapus Akun Admin"
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <KelolaAdminMobileView
          users={users}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onOpenAdd={() => {
            setNama("");
            setUsername("");
            setPassword("");
            setRole("ADMIN");
            setIsAddDialogOpen(true);
          }}
          onOpenEdit={handleOpenEdit}
          onOpenBan={handleOpenBan}
          onOpenUnban={handleOpenUnbanModal}
          onOpenDelete={handleOpenDeleteModal}
        />
      </div>

      {/* Pop-up Modal Custom: Konfirmasi Unban */}
      <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-emerald-100 shadow-2xl space-y-4">
          <DialogHeader className="space-y-1 pb-2 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50 shrink-0">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                  Konfirmasi Pembukaan Akses (Unban)
                </DialogTitle>
                <DialogDescription className="text-xs text-emerald-700 font-bold">
                  Mengaktifkan kembali hak akses login akun admin.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {unbanTarget && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                <p className="text-slate-700 font-medium leading-relaxed">
                  Apakah Anda yakin ingin mengaktifkan kembali (Unbanned) akun <strong className="text-emerald-900 font-extrabold">{unbanTarget.nama}</strong> (<span className="font-mono text-emerald-800">@{unbanTarget.username}</span>)?
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Setelah di-unban, akun ini dapat kembali melakukan login ke SIGAP Panel Admin.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUnbanDialogOpen(false)}
              className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUnban}
              disabled={Boolean(processingId)}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {processingId ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                  Ya, Unban Akun
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pop-up Modal Custom: Konfirmasi Hapus Akun */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-rose-200 shadow-2xl space-y-4">
          <DialogHeader className="space-y-1 pb-2 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 ring-4 ring-rose-50 shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-slate-900">
                  Konfirmasi Hapus Akun Admin
                </DialogTitle>
                <DialogDescription className="text-xs text-rose-600 font-bold">
                  Tindakan permanen dan tidak dapat dibatalkan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteTarget && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 space-y-1">
                <p className="text-slate-700 font-medium leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun admin <strong className="text-rose-900 font-extrabold">{deleteTarget.nama}</strong> (<span className="font-mono text-rose-800">@{deleteTarget.username}</span>) dari sistem secara permanen?
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Seluruh data akun ini akan dihapus dari database MySQL.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-10 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={Boolean(processingId)}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer"
            >
              {processingId ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Hapus Akun Permanen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
