"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Crown,
  Wrench,
  Trash2,
  Edit3,
  Ban,
  Calendar,
  Search,
  CheckCircle2,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUserItem } from "@/app/admin/(dashboard)/kelola-admin/kelola-admin-view";

export interface KelolaAdminMobileViewProps {
  users: AdminUserItem[];
  currentUserRole?: string;
  currentUserId?: string;
  currentUsername?: string;
  onOpenAdd?: () => void;
  onOpenEdit?: (adminItem: AdminUserItem) => void;
  onOpenBan?: (adminItem: AdminUserItem) => void;
  onOpenUnban?: (adminItem: AdminUserItem) => void;
  onOpenDelete?: (adminItem: AdminUserItem) => void;
}

export function KelolaAdminMobileView({
  users,
  currentUserRole = "ADMIN",
  currentUserId,
  currentUsername,
  onOpenAdd,
  onOpenEdit,
  onOpenBan,
  onOpenUnban,
  onOpenDelete,
}: KelolaAdminMobileViewProps) {
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setSortBy("NEWEST");
  };

  const isFiltered =
    searchQuery !== "" ||
    roleFilter !== "ALL" ||
    sortBy !== "NEWEST";

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sorting: Pin own account to the very top, then sort by Terbaru / Terlama
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const isASelf = (currentUserId && a.id === currentUserId) || (currentUsername && a.username === currentUsername);
    const isBSelf = (currentUserId && b.id === currentUserId) || (currentUsername && b.username === currentUsername);
    if (isASelf) return -1;
    if (isBSelf) return 1;

    if (sortBy === "OLDEST") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // Default NEWEST
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-2.5 pb-6">
      {/* Mobile Search & Controls */}
      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search Bar & Tambah Button */}
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau username..."
              className="pl-8 h-8 text-xs rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 shadow-none transition-all"
            />
          </div>

          {isSuperAdmin && onOpenAdd && (
            <Button
              size="sm"
              onClick={onOpenAdd}
              className="h-8 px-2.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs shrink-0 cursor-pointer"
            >
              <UserPlus className="mr-1 h-3.5 w-3.5" />
              Tambah
            </Button>
          )}
        </div>

        {/* Dropdowns Row: Role Filter & Sort Controls (Terbaru / Terlama saja) */}
        <div className="grid grid-cols-2 gap-1">
          <div className="relative flex items-center w-full">
            <Users className="absolute left-2 h-3 w-3 text-sky-600 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-6 pr-5 h-7.5 text-[10.5px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-sky-500 cursor-pointer appearance-none truncate"
              aria-label="Filter Hak Akses Admin"
            >
              <option value="ALL">Semua Role</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin Teknis</option>
            </select>
            <div className="absolute right-1.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
          </div>

          {/* Fitur Urutkan: Terbaru dan Terlama saja */}
          <div className="relative flex items-center w-full">
            <ArrowUpDown className="absolute left-2 h-3 w-3 text-sky-600 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-6 pr-5 h-7.5 text-[10.5px] font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-sky-500 cursor-pointer appearance-none truncate"
              aria-label="Urutkan Akun Admin"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
            </select>
            <div className="absolute right-1.5 pointer-events-none text-slate-400 text-[8px]">▼</div>
          </div>
        </div>

        {/* Status Hasil & Reset Button */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
          <span className="text-slate-400 font-medium">
            Total <strong className="text-slate-700 font-bold">{sortedUsers.length}</strong> akun admin
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary Pills */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="p-1.5 px-2 rounded-lg border border-slate-200/80 bg-white shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="p-0.5 rounded bg-purple-50 text-purple-700">
              <Crown className="h-3 w-3" />
            </div>
            <span className="font-semibold text-slate-600 text-[10px]">Super Admin</span>
          </div>
          <span className="font-bold text-purple-700 text-[11px]">
            {users.filter((u) => u.role === "SUPER_ADMIN").length}
          </span>
        </div>

        <div className="p-1.5 px-2 rounded-lg border border-slate-200/80 bg-white shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="p-0.5 rounded bg-sky-50 text-sky-700">
              <Wrench className="h-3 w-3" />
            </div>
            <span className="font-semibold text-slate-600 text-[10px]">Admin Teknis</span>
          </div>
          <span className="font-bold text-sky-700 text-[11px]">
            {users.filter((u) => u.role === "ADMIN").length}
          </span>
        </div>
      </div>

      {/* Minimalist Admin User Cards List */}
      {sortedUsers.length === 0 ? (
        <Card className="border border-dashed border-slate-200 bg-white rounded-xl p-6 text-center shadow-2xs">
          <p className="text-xs text-slate-400 italic font-medium">
            Tidak ada akun admin yang sesuai dengan filter pencarian.
          </p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {sortedUsers.map((adminItem) => {
            const isSuper = adminItem.role === "SUPER_ADMIN";
            const isBanned = Boolean(adminItem.is_banned);
            const isSelf = (currentUserId && adminItem.id === currentUserId) || (currentUsername && adminItem.username === currentUsername);
            const dateObj = new Date(adminItem.created_at);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });

            return (
              <Card
                key={adminItem.id}
                className={`border rounded-xl transition-all shadow-2xs overflow-hidden ${
                  isSelf
                    ? "bg-sky-50/50 border-sky-300"
                    : isBanned
                    ? "bg-rose-50/30 border-rose-200"
                    : "bg-white border-slate-200/80 hover:border-sky-300"
                }`}
              >
                <CardContent className="p-2.5 space-y-1.5">
                  {/* Top Row: Avatar, Name & Role Badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isBanned
                            ? "bg-rose-100 text-rose-700"
                            : isSelf
                            ? "bg-sky-700 text-white"
                            : isSuper
                            ? "bg-purple-100 text-purple-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {adminItem.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {adminItem.nama}
                          </h4>
                          {isSelf && (
                            <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-1 py-0.2 rounded border border-sky-200 shrink-0">
                              (Anda)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[9.5px] font-semibold text-slate-400 block">
                          @{adminItem.username}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                        isSuper
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : "bg-sky-50 text-sky-800 border-sky-200"
                      }`}
                    >
                      {isSuper ? <Crown className="h-2.5 w-2.5 text-purple-600" /> : <Wrench className="h-2.5 w-2.5 text-sky-600" />}
                      {isSuper ? "Super Admin" : "Admin Teknis"}
                    </span>
                  </div>

                  {/* Banned Notice if active */}
                  {isBanned && (
                    <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 text-[10px] space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <Ban className="h-2.5 w-2.5 text-rose-600 shrink-0" />
                        <span>
                          {adminItem.banned_until
                            ? `Dinonaktifkan s/d ${new Date(adminItem.banned_until).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}`
                            : "Dinonaktifkan Permanen"}
                        </span>
                      </div>
                      {adminItem.banned_reason && (
                        <p className="text-[9.5px] text-rose-600 italic">
                          &ldquo;{adminItem.banned_reason}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Metadata Row: Date & Actions */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[9.5px]">
                    <span className="font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {formattedDate}
                    </span>

                    {/* Actions for Super Admin */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        {onOpenEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={Boolean(isSelf)}
                            onClick={() => onOpenEdit(adminItem)}
                            className="h-6 px-1.5 text-[10px] font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-md cursor-pointer disabled:opacity-25"
                            title={isSelf ? "Tidak dapat mengedit akun sendiri di sini" : "Edit Akun"}
                          >
                            <Edit3 className="h-2.5 w-2.5 mr-0.5 text-sky-600" />
                            Edit
                          </Button>
                        )}

                        {isBanned ? (
                          onOpenUnban && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={Boolean(isSelf)}
                              onClick={() => onOpenUnban(adminItem)}
                              className="h-6 px-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 rounded-md cursor-pointer"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 text-emerald-600" />
                              Unban
                            </Button>
                          )
                        ) : (
                          onOpenBan && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={Boolean(isSelf || isSuper)}
                              onClick={() => onOpenBan(adminItem)}
                              className="h-6 px-1.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-50 rounded-md cursor-pointer disabled:opacity-25"
                              title={isSelf ? "Tidak dapat membanned akun sendiri" : "Ban Akun"}
                            >
                              <Ban className="h-2.5 w-2.5 mr-0.5 text-amber-600" />
                              Ban
                            </Button>
                          )
                        )}

                        {onOpenDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenDelete(adminItem)}
                            className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
