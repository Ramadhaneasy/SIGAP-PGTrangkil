"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const statusSearchSchema = z.object({
  ticketNumber: z
    .string()
    .min(1, { message: "Nomor laporan wajib diisi" })
    .regex(/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/i, {
      message: "Format nomor laporan tidak valid. Contoh: TUK-2608-001",
    }),
});

type StatusSearchFormValues = z.infer<typeof statusSearchSchema>;

export function StatusSearchForm() {
  const router = useRouter();

  const form = useForm<StatusSearchFormValues>({
    resolver: zodResolver(statusSearchSchema),
    defaultValues: {
      ticketNumber: "",
    },
  });

  const onSubmit = (data: StatusSearchFormValues) => {
    const formattedTicket = data.ticketNumber.trim().toUpperCase();
    router.push(`/status/${formattedTicket}`);
  };

  return (
    <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-2xs overflow-hidden">
      <CardContent className="p-5 sm:p-7 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ticketNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-700 block">
                    Nomor Tiket Laporan <span className="text-rose-500 font-bold">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Contoh: TUK-2608-001"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        className="font-mono uppercase tracking-wider h-11 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 bg-white pl-3.5 pr-10 font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-slate-500 font-medium">
                    Nomor tiket diberikan otomatis setelah Anda berhasil mengirimkan laporan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto h-11 px-7 text-xs sm:text-sm font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-2xs cursor-pointer transition-all"
            >
              <Search className="mr-2 h-4 w-4" />
              Cek Status Tiket Laporan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
