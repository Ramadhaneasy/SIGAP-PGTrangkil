"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image-compressor";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);

  // Modal selector for Native Camera vs Gallery
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Process selected or captured file with compression
  const processImageFile = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type) && !file.type.startsWith("image/")) {
      toast.error("Format berkas harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    setOriginalSize(file.size);
    setIsCompressing(true);

    try {
      // Compress image automatically to maximum 50KB
      const compressedFile = await compressImage(file, 50);

      onChange(compressedFile);
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreview(objectUrl);
      toast.success("Foto berhasil diambil & dioptimalkan!", {
        description: `Ukuran berkas: ${formatFileSize(compressedFile.size)}`,
      });
    } catch (err) {
      console.error("Gagal mengompresi gambar:", err);
      // Fallback: use original file if compression fails
      onChange(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Open Native Gallery / File Picker
  const handleOpenGallery = () => {
    setIsOptionModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Trigger Native OS Camera Intent (Android / iOS / Windows Camera)
  const handleOpenNativeCamera = () => {
    setIsOptionModalOpen(false);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
      cameraInputRef.current.click();
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setOriginalSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      {/* 1. File Picker / Gallery */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        id="foto-upload-file"
        disabled={isCompressing}
      />

      {/* 2. Native Camera Capture (Triggers OS Camera app: Just Once / Always -> snap -> tap OK) */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        id="foto-upload-camera"
        disabled={isCompressing}
      />

      {/* State 1: Compressing State */}
      {isCompressing ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-sky-300 rounded-2xl p-6 bg-sky-50/60 text-center animate-pulse">
          <div className="p-3 rounded-full bg-sky-100 text-sky-600 mb-2">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <span className="text-sm font-black text-sky-900">
            Mengompresi Foto Kerusakan...
          </span>
          <span className="text-xs text-sky-600 mt-1 font-medium">
            Mengoptimalkan foto menjadi &le; 50 KB secara instan
          </span>
        </div>
      ) : preview ? (
        /* State 2: Uploaded Preview with Bottom Action Row (Super Flexible & 100% Mobile Safe) */
        <div className="w-full max-w-full rounded-2xl border border-sky-100 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all space-y-3 overflow-hidden">
          {/* Top Section: Thumbnail + File Details */}
          <div className="flex items-center gap-3 min-w-0 w-full">
            {/* Thumbnail */}
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl overflow-hidden border border-sky-100 bg-slate-100 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview Kerusakan"
                className="h-full w-full object-cover"
              />
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="font-bold text-slate-900 truncate text-xs sm:text-sm" title={value?.name}>
                {value?.name}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[10px] sm:text-[11px]">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  {value ? formatFileSize(value.size) : ""}
                </span>
                {originalSize && originalSize > (value?.size || 0) && (
                  <span className="text-slate-400 line-through text-[10px] sm:text-[11px]">
                    {formatFileSize(originalSize)}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                Terkompresi otomatis &le; 50 KB (Siap diunggah)
              </p>
            </div>
          </div>

          {/* Bottom Section: Dedicated Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOptionModalOpen(true)}
              className="w-full h-8 text-xs rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 font-bold flex items-center justify-center gap-1.5 px-2"
            >
              <Camera className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span className="truncate">Ganti Foto</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="w-full h-8 text-xs rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold border border-rose-100 flex items-center justify-center gap-1.5 px-2"
            >
              <X className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span className="truncate">Batal / Hapus</span>
            </Button>
          </div>
        </div>
      ) : (
        /* State 3: Interactive Trigger Box */
        <button
          type="button"
          onClick={() => setIsOptionModalOpen(true)}
          className="w-full flex flex-col items-center justify-center border-2 border-dashed border-sky-200 hover:border-sky-400 bg-white/80 hover:bg-sky-50/40 rounded-2xl p-6 sm:p-7 cursor-pointer transition-all text-center group shadow-2xs"
        >
          <div className="p-3.5 rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:scale-110 transition-all duration-200 mb-3 shadow-xs">
            <Camera className="h-6 w-6" />
          </div>
          <span className="text-sm font-extrabold text-slate-800 group-hover:text-sky-700 flex items-center gap-1.5">
            <Upload className="h-4 w-4 text-sky-600" />
            Ambil / Upload Foto Kerusakan
          </span>
          <span className="text-xs text-slate-500 mt-1 font-medium">
            Klik untuk membuka <b>Kamera HP / Perangkat</b> atau <b>Galeri / Berkas</b>
          </span>
        </button>
      )}

      {/* Modal: Option Modal (Kamera Asli Perangkat vs Galeri) */}
      <Dialog open={isOptionModalOpen} onOpenChange={setIsOptionModalOpen}>
        <DialogContent className="max-w-sm sm:max-w-md p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 shadow-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Camera className="h-4 w-4" />
              </div>
              Pilih Sumber Foto Kerusakan
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Buka aplikasi kamera perangkat Anda untuk mengambil foto langsung atau pilih berkas dari galeri.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Option 1: Kamera Asli OS (Just once / Always -> Kamera -> OK) */}
            <button
              type="button"
              onClick={handleOpenNativeCamera}
              className="p-4 rounded-2xl border-2 border-sky-100 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50 text-slate-800 hover:text-sky-800 transition-all flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer shadow-2xs group"
            >
              <div className="p-3 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-extrabold block">Kamera Perangkat</span>
                <span className="text-[11px] text-slate-500 font-medium">Buka aplikasi kamera asli</span>
              </div>
            </button>

            {/* Option 2: Galeri / File Manager */}
            <button
              type="button"
              onClick={handleOpenGallery}
              className="p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 text-slate-800 hover:text-emerald-800 transition-all flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer shadow-2xs group"
            >
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-extrabold block">Galeri / File</span>
                <span className="text-[11px] text-slate-500 font-medium">Pilih dari memori perangkat</span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
