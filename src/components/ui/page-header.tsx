import React from "react";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  badgeColor?: "sky" | "emerald" | "amber" | "purple";
  icon?: LucideIcon;
  backUrl?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badgeText,
  badgeColor = "sky",
  icon: Icon,
  backUrl,
  backLabel = "Kembali",
  children,
}: PageHeaderProps) {
  const badgeStyles = {
    sky: "text-sky-700 bg-sky-50 border-sky-100",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    purple: "text-purple-700 bg-purple-50 border-purple-100",
  }[badgeColor];

  return (
    <div className="space-y-3 pb-4 sm:pb-5 border-b border-slate-200/80">
      {backUrl && (
        <div>
          <Link href={backUrl}>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              {backLabel}
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          {badgeText && (
            <div
              className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border mb-1.5 ${badgeStyles}`}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              {badgeText}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1">
              {description}
            </p>
          )}
        </div>

        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  );
}
