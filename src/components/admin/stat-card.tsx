import React from "react";
import { type LucideIcon } from "lucide-react";

export type StatColorScheme = "blue" | "amber" | "sky" | "emerald" | "purple";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorScheme?: StatColorScheme;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  colorScheme = "sky",
  description,
  className = "",
}: StatCardProps) {
  const colorMap: Record<
    StatColorScheme,
    { iconBg: string; iconColor: string; valueColor: string; borderColor: string }
  > = {
    sky: {
      iconBg: "bg-sky-50",
      iconColor: "text-sky-700",
      valueColor: "text-sky-900",
      borderColor: "border-sky-100",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
      valueColor: "text-amber-900",
      borderColor: "border-amber-100",
    },
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
      valueColor: "text-blue-900",
      borderColor: "border-blue-100",
    },
    emerald: {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      valueColor: "text-emerald-900",
      borderColor: "border-emerald-100",
    },
    purple: {
      iconBg: "bg-purple-50",
      iconColor: "text-purple-700",
      valueColor: "text-purple-900",
      borderColor: "border-purple-100",
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      className={`p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:border-sky-200 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${scheme.iconBg} ${scheme.iconColor} ${scheme.borderColor}`}>
          <Icon className="h-4 w-4 shrink-0" />
        </div>
      </div>
      <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${scheme.valueColor}`}>
        {value}
      </div>
      {description && (
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
