"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-3.5 text-emerald-600 shrink-0" />,
        info: <InfoIcon className="size-3.5 text-sky-600 shrink-0" />,
        warning: <TriangleAlertIcon className="size-3.5 text-amber-600 shrink-0" />,
        error: <OctagonXIcon className="size-3.5 text-rose-600 shrink-0" />,
        loading: <Loader2Icon className="size-3.5 animate-spin text-sky-600 shrink-0" />,
      }}
      toastOptions={{
        className:
          "!font-sans !bg-white/95 !backdrop-blur-xl !border !border-slate-200/90 !text-slate-900 !shadow-xl !shadow-slate-900/10 !rounded-xl !p-2.5 !gap-2 !mx-auto !w-auto !max-w-[320px] sm:!max-w-sm",
        classNames: {
          title: "!text-slate-900 !font-extrabold !text-[11px] sm:!text-xs !tracking-tight !leading-tight",
          description: "!text-slate-600 !font-medium !text-[10px] sm:!text-[11px] !leading-snug !mt-0.5",
          actionButton: "!bg-sky-600 hover:!bg-sky-700 !text-white !font-bold !text-[10px] !rounded-lg !px-2 !py-1 !shadow-xs",
          cancelButton: "!bg-slate-100 !text-slate-700 !font-bold !text-[10px] !rounded-lg !px-2 !py-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
