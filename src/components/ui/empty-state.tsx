import React from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-3 shadow-2xs">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-slate-500 font-medium max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-4 h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 font-bold text-xs shadow-2xs cursor-pointer"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
