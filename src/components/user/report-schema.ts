import { z } from "zod";

export interface WorkUnit {
  kobag: string;
  name: string;
  department: "TUK" | "Teknik" | "Pabrikasi" | "Tanaman";
}

export const WORK_UNITS: WorkUnit[] = [
  // TUK
  { kobag: "14000", name: "14000 - PIMPINAN DAN ADMINISTRASI", department: "TUK" },
  { kobag: "14002", name: "14002 - POLIKLINIK", department: "TUK" },
  { kobag: "14003", name: "14003 - MESS & PESANGGRAHAN", department: "TUK" },
  { kobag: "14004", name: "14004 - GUDANG GULA & TETES", department: "TUK" },
  { kobag: "14005", name: "14005 - GUDANG PERLENGKAPAN", department: "TUK" },
  { kobag: "14006", name: "14006 - KEAMANAN/SATPAM", department: "TUK" },
  { kobag: "25030", name: "25030 - B.U. KENDARAAN", department: "TUK" },
  { kobag: "25040", name: "25040 - B.U. BANGUNAN", department: "TUK" },

  // Teknik
  { kobag: "25000", name: "25000 - B.U. INSTALASI", department: "Teknik" },
  { kobag: "25002", name: "25002 - GILINGAN", department: "Teknik" },
  { kobag: "25010", name: "25010 - KETEL", department: "Teknik" },
  { kobag: "25011", name: "25011 - LISTRIK", department: "Teknik" },
  { kobag: "25012", name: "25012 - BENGKEL/BESALI", department: "Teknik" },

  // Pabrikasi
  { kobag: "35020", name: "35020 - B.U. PABRIKASI", department: "Pabrikasi" },
  { kobag: "35022", name: "35022 - QUALITY CONTROL", department: "Pabrikasi" },
  { kobag: "35023", name: "35023 - PEMURNIAN NIRA", department: "Pabrikasi" },
  { kobag: "35024", name: "35024 - PENGUAPAN", department: "Pabrikasi" },
  { kobag: "35025", name: "35025 - MASAKAN", department: "Pabrikasi" },
  { kobag: "35026", name: "35026 - D R K", department: "Pabrikasi" },
  { kobag: "35027", name: "35027 - PUTERAN", department: "Pabrikasi" },
  { kobag: "35028", name: "35028 - PEMBUNGKUSAN GULA", department: "Pabrikasi" },
  { kobag: "35029", name: "35029 - PENGELOLAAN LINGK.", department: "Pabrikasi" },

  // Tanaman
  { kobag: "46000", name: "46000 - B.U. TANAMAN", department: "Tanaman" },
  { kobag: "46002", name: "46002 - BIMBINGAN PETANI TR", department: "Tanaman" },
  { kobag: "46003", name: "46003 - LABORAT HAMA/PARASIT", department: "Tanaman" },
  { kobag: "46004", name: "46004 - TRAKTOR", department: "Tanaman" },
  { kobag: "46020", name: "46020 - TEBANGAN TEBU", department: "Tanaman" },
  { kobag: "46030", name: "46030 - B.U. ANGKUTAN TEBU", department: "Tanaman" },
];

export const reportSchema = z.object({
  namaPelapor: z
    .string()
    .min(1, { message: "Nama Pelapor wajib diisi" })
    .min(3, { message: "Nama Pelapor minimal 3 karakter" }),
  bagian: z.string().min(1, { message: "Bagian wajib dipilih" }),
  unitKerja: z.string().min(1, { message: "Unit / Bagian Kerja wajib dipilih" }),
  nomorHp: z.string().optional(),
  lokasiKerusakan: z.string().optional(),
  peralatan: z.string().optional(),
  deskripsi: z
    .string()
    .min(1, { message: "Deskripsi Kerusakan wajib diisi" })
    .min(10, { message: "Deskripsi Kerusakan minimal 10 karakter" }),
  foto: z.any().optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
