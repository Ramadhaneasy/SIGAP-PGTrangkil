import React from "react";
import { getAllAdminUsers } from "@/lib/admin-services";
import { getAdminSession } from "@/lib/auth";
import { KelolaAdminView, AdminUserItem } from "./kelola-admin-view";

const SAMPLE_ADMINS: AdminUserItem[] = [
  {
    id: "adm-super-001",
    username: "superadmin",
    nama: "Super Admin SIGAP",
    role: "SUPER_ADMIN",
    created_at: new Date().toISOString(),
  },
  {
    id: "adm-teknis-002",
    username: "admin",
    nama: "Admin Teknis SIGAP",
    role: "ADMIN",
    created_at: new Date().toISOString(),
  },
];

export default async function KelolaAdminPage() {
  const session = await getAdminSession();
  const currentUserRole = session?.role || "ADMIN";

  let users: AdminUserItem[] = [];

  try {
    const data = await getAllAdminUsers();
    if (data && data.length > 0) {
      users = data.map((u) => ({
        id: u.id,
        nama: u.nama,
        username: u.username,
        role: u.role,
        is_banned: Boolean(u.is_banned),
        banned_until: u.banned_until ? new Date(u.banned_until).toISOString() : null,
        banned_reason: u.banned_reason,
        created_at: new Date(u.created_at).toISOString(),
      }));
    }
  } catch (err) {
    console.warn("MySQL fetch admin users error:", err);
  }

  if (users.length === 0) {
    users = SAMPLE_ADMINS;
  }

  return (
    <KelolaAdminView
      users={users}
      currentUserRole={currentUserRole}
      currentUserId={session?.id}
      currentUsername={session?.username}
    />
  );
}
