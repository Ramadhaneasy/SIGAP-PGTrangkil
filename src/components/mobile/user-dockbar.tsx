"use client";

import React, { useTransition, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Wrench, Search, Loader2 } from "lucide-react";

export const USER_DOCKBAR_ITEMS = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Lapor", href: "/lapor", icon: Wrench },
  { label: "Cek Status", href: "/cek-status", icon: Search },
];

export function UserDockbar() {
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
      className="md:hidden fixed bottom-4 inset-x-0 z-[9999] flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <nav
        suppressHydrationWarning
        aria-label="User Mobile Navigation Dockbar"
        className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_12px_36px_rgba(2,132,199,0.2)] rounded-3xl p-1.5 flex items-center justify-around pointer-events-auto transition-all"
      >
        {USER_DOCKBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
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
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-sky-600" />
                ) : (
                  <Icon
                    className={`h-4.5 w-4.5 ${
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
