import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminReportNotifier } from "@/components/admin/admin-report-notifier";
import { AdminDockbar } from "@/components/mobile/admin-dockbar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col lg:flex-row bg-slate-50 text-slate-800 antialiased selection:bg-sky-500/20 selection:text-sky-700 relative">
      {/* Background Push Notifier Listener */}
      <AdminReportNotifier />

      {/* Reusable Modular Admin Sidebar (Desktop Left Sidebar + Mobile Top Header) */}
      <AdminSidebar />

      {/* Main Content Area: Strictly this container scrolls */}
      <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        {/* Desktop Fixed Header */}
        <AdminHeader />

        {/* Scrollable Main Area for Both Mobile and Desktop */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-28 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Floating Dockbar (Immune to page scroll) */}
      <AdminDockbar />
    </div>
  );
}
