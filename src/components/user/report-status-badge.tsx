import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Wrench, CheckCircle2 } from "lucide-react";

export type ReportStatus = "MENUNGGU" | "DIPROSES" | "SELESAI";

interface ReportStatusBadgeProps {
  status: ReportStatus | string;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  // Catatan: Status nantinya berasal dari database Supabase
  const normalizedStatus = (status?.toUpperCase() || "MENUNGGU") as ReportStatus;

  switch (normalizedStatus) {
    case "MENUNGGU":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 gap-1.5 px-2.5 py-1 text-xs font-semibold"
        >
          <Clock className="h-3.5 w-3.5" />
          MENUNGGU
        </Badge>
      );
    case "DIPROSES":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 gap-1.5 px-2.5 py-1 text-xs font-semibold"
        >
          <Wrench className="h-3.5 w-3.5" />
          DIPROSES
        </Badge>
      );
    case "SELESAI":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1.5 px-2.5 py-1 text-xs font-semibold"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          SELESAI
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
