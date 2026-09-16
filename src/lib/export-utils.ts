import { CompletedReportItem } from "@/app/admin/(dashboard)/riwayat/riwayat-view";
import * as XLSX from "xlsx";

export interface ExportFilterOptions {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  bagian?: string;    // 'ALL' | 'TUK' | 'Teknik' | 'Pabrikasi' | 'Tanaman'
}

export function filterReportsForExport(
  reports: CompletedReportItem[],
  options: ExportFilterOptions
): CompletedReportItem[] {
  return reports.filter((item) => {
    // Filter by Bagian
    if (options.bagian && options.bagian !== "ALL") {
      if (item.bagian !== options.bagian) return false;
    }

    // Filter by Date Range
    const itemDate = new Date(item.updated_at || item.created_at);
    if (isNaN(itemDate.getTime())) return true;

    if (options.startDate) {
      const start = new Date(options.startDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }

    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }

    return true;
  });
}

function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const tgl = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(/:/g, ".");
  return `${tgl}, ${jam} WIB`;
}

// 📅 Format tanggal tunggal ke format DD/MM/YYYY (contoh: 01/01/2026)
function formatDateOnlyIndo(dateStr?: string): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ⏰ Format waktu cetak saat ini ke DD/MM/YYYY, HH.mm.ss WIB
function getFormattedCurrentDateTime(): string {
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).replace(/:/g, ".");
  return `${tgl}, ${jam} WIB`;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 🧹 Helper membersihkan kode angka di depan (contoh: "14000 - ", "35023 - ")
function cleanCodePrefix(str?: string | null): string {
  if (!str) return "";
  return str.replace(/^\d+\s*[-–—:]\s*/i, "").trim();
}

// 🏢 Helper menggabungkan Bagian dan Unit Kerja menjadi satu tanpa kode nomor
function formatBagianDanUnit(bagian: string, unitKerja?: string | null): string {
  const cleanBagian = escapeHtml(bagian || "-");
  if (!unitKerja) return cleanBagian;

  const cleanUnit = cleanCodePrefix(unitKerja);
  if (!cleanUnit) return cleanBagian;

  // Jika nama unit kerja sudah diawali oleh nama bagian (contoh: "TUK - Pimpinan")
  const regexBagianPrefix = new RegExp(`^${bagian}\\s*[-–—:]\\s*`, "i");
  const finalUnit = cleanUnit.replace(regexBagianPrefix, "").trim();

  // Jika setelah dibersihkan isinya sama persis dengan nama bagian
  if (!finalUnit || finalUnit.toLowerCase() === bagian.toLowerCase()) {
    return cleanBagian;
  }

  return `${cleanBagian} - ${escapeHtml(finalUnit)}`;
}

// 📗 1. Export as Modern Microsoft Excel (.xlsx)
export function exportToExcel(reports: CompletedReportItem[], options: ExportFilterOptions) {
  const excelData = reports.map((r, idx) => {
    const cleanUnit = cleanCodePrefix(r.unit_kerja);
    const bagianUnitText = cleanUnit && cleanUnit.toLowerCase() !== r.bagian.toLowerCase()
      ? `${r.bagian} - ${cleanUnit}`
      : r.bagian;

    const cleanDeskripsi = (r.deskripsi?.trim().replace(/[\.\-\s]+$/, "") || r.lokasi_kerusakan || "Laporan kerusakan");
    const waktuLaporan = formatDateIndo(r.created_at);

    const cleanPenanganan = (r.penanganan?.trim().replace(/[\.\-\s]+$/, "") || "Sudah diselesaikan");
    const waktuSelesai = formatDateIndo(r.completed_at || r.updated_at || r.created_at);

    return {
      "No": idx + 1,
      "Nomor Tiket": r.ticket_number,
      "Nama Pelapor": r.nama_pelapor,
      "Bagian": bagianUnitText,
      "Laporan": cleanDeskripsi,
      "Tanggal Laporan": waktuLaporan,
      "Tindakan Diselesaikan": cleanPenanganan,
      "Tanggal Tindakan Selesai": waktuSelesai,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set neat column widths for optimal display in Excel
  worksheet["!cols"] = [
    { wch: 6 },   // No
    { wch: 18 },  // Nomor Tiket
    { wch: 24 },  // Nama Pelapor
    { wch: 34 },  // Bagian (Gabungan)
    { wch: 42 },  // Laporan (Deskripsi Kerusakan)
    { wch: 24 },  // Tanggal Laporan
    { wch: 42 },  // Tindakan Diselesaikan
    { wch: 24 },  // Tanggal Tindakan Selesai
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Laporan");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `SIGAP_Riwayat_Laporan_${options.startDate || "all"}_sd_${options.endDate || "all"}.xlsx`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 📄 2. Export as TXT
export function exportToTxt(reports: CompletedReportItem[], options: ExportFilterOptions) {
  const lineSeparator = "=".repeat(80);
  const subSeparator = "-".repeat(80);

  const startText = options.startDate ? formatDateOnlyIndo(options.startDate) : "Semua";
  const endText = options.endDate ? formatDateOnlyIndo(options.endDate) : "Sekarang";
  const bagianText = options.bagian && options.bagian !== "ALL" ? options.bagian : "Semua Bagian";
  const tanggalCetak = getFormattedCurrentDateTime();

  let content = `${lineSeparator}\r\n`;
  content += `SISTEM INFORMASI GANGGUAN DAN PERBAIKAN (SIGAP)\r\n`;
  content += `REKAPITULASI ARSIP RIWAYAT LAPORAN GANGGUAN & PERBAIKAN\r\n`;
  content += `${lineSeparator}\r\n`;
  content += `Tanggal Cetak  : ${tanggalCetak}\r\n`;
  content += `Periode Data   : ${startText} s/d ${endText}\r\n`;
  content += `Filter Bagian  : ${bagianText}\r\n`;
  content += `Total Laporan  : ${reports.length} Laporan Selesai\r\n`;
  content += `${lineSeparator}\r\n\r\n`;

  if (reports.length === 0) {
    content += `Tidak ada data laporan selesai pada rentang periode yang dipilih.\r\n`;
  } else {
    reports.forEach((r, idx) => {
      const cleanUnit = cleanCodePrefix(r.unit_kerja);
      const bagianTextFormatted = cleanUnit && cleanUnit.toLowerCase() !== r.bagian.toLowerCase()
        ? `${r.bagian} - ${cleanUnit}`
        : r.bagian;

      const cleanDeskripsi = (r.deskripsi?.trim().replace(/[\.\-\s]+$/, "") || r.lokasi_kerusakan || "Laporan kerusakan");
      const waktuLaporan = formatDateIndo(r.created_at);

      const cleanPenanganan = (r.penanganan?.trim().replace(/[\.\-\s]+$/, "") || "Sudah diselesaikan");
      const waktuSelesai = formatDateIndo(r.completed_at || r.updated_at || r.created_at);

      content += `[${idx + 1}] NOMOR TIKET : ${r.ticket_number}\r\n`;
      content += `    Pelapor                  : ${r.nama_pelapor}\r\n`;
      content += `    Bagian                   : ${bagianTextFormatted}\r\n`;
      content += `    Laporan                  : ${cleanDeskripsi}\r\n`;
      content += `    Tanggal Laporan          : ${waktuLaporan}\r\n`;
      content += `    Tindakan Diselesaikan    : ${cleanPenanganan}\r\n`;
      content += `    Tanggal Tindakan Selesai : ${waktuSelesai}\r\n`;
      content += `${subSeparator}\r\n`;
    });
  }

  content += `\r\n${lineSeparator}\r\n`;
  content += `PT Kebon Agung - PG Trangkil | Dicetak Otomatis oleh Sistem SIGAP\r\n`;
  content += `${lineSeparator}\r\n`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `SIGAP_Riwayat_Laporan_${options.startDate || "all"}_sd_${options.endDate || "all"}.txt`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 🟦 3. Export as Word / DOCX
export function exportToDocx(reports: CompletedReportItem[], options: ExportFilterOptions) {
  const startText = options.startDate ? formatDateOnlyIndo(options.startDate) : "Semua";
  const endText = options.endDate ? formatDateOnlyIndo(options.endDate) : "Sekarang";
  const bagianText = options.bagian && options.bagian !== "ALL" ? escapeHtml(options.bagian) : "Semua Bagian";
  const tanggalCetak = getFormattedCurrentDateTime();

  const rowsHtml = reports
    .map(
      (r, idx) => {
        const cleanDeskripsi = (r.deskripsi?.trim().replace(/[\.\-\s]+$/, "") || r.lokasi_kerusakan || "Laporan kerusakan");
        const waktuLaporan = formatDateIndo(r.created_at);
        const laporanDanWaktu = `${cleanDeskripsi} - ${waktuLaporan}`;

        const waktuSelesai = formatDateIndo(r.completed_at || r.updated_at || r.created_at);
        const cleanPenanganan = (r.penanganan?.trim().replace(/[\.\-\s]+$/, "") || "Sudah diselesaikan");
        const penangananDanWaktu = `${cleanPenanganan} - ${waktuSelesai}`;

        return `
      <tr>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
        <td style="font-family: Consolas, monospace; font-weight: bold; color: #0284c7; border: 1px solid #cbd5e1; padding: 6px;">${escapeHtml(r.ticket_number)}</td>
        <td style="font-weight: bold; border: 1px solid #cbd5e1; padding: 6px;">${escapeHtml(r.nama_pelapor)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px;">${formatBagianDanUnit(r.bagian, r.unit_kerja)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 9.5pt; color: #1e293b; line-height: 1.35;">${escapeHtml(laporanDanWaktu)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 9pt; color: #065f46; line-height: 1.35;">${escapeHtml(penangananDanWaktu)}</td>
      </tr>
    `;
      }
    )
    .join("");

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Laporan Riwayat SIGAP - PT Kebon Agung PG Trangkil</title>
      <style>
        @page Section1 { size: 215mm 330mm; margin: 15mm 15mm; }
        div.Section1 { page: Section1; }
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #0f172a; }
        h1 { color: #0284c7; font-size: 16pt; margin: 0; text-align: center; text-transform: uppercase; font-weight: bold; }
        h2 { color: #334155; font-size: 12pt; margin: 4px 0; text-align: center; font-weight: bold; }
        .sub-header { color: #64748b; font-size: 10pt; font-weight: bold; text-align: center; margin-bottom: 16px; }
        .meta-table { width: 100%; margin-bottom: 16px; font-size: 10pt; border-collapse: collapse; }
        .meta-table td { padding: 4px; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
        .data-table th { background-color: #0284c7; color: #ffffff; padding: 8px; border: 1px solid #0284c7; font-weight: bold; text-align: left; }
      </style>
    </head>
    <body>
      <div class="Section1">
      <h1>SISTEM INFORMASI GANGGUAN DAN PERBAIKAN (SIGAP)</h1>
      <h2>REKAPITULASI ARSIP LAPORAN GANGGUAN & PERBAIKAN</h2>
      <div class="sub-header">PT KEBON AGUNG &bull; PABRIK GULA TRANGKIL</div>

      <table class="meta-table">
        <tr>
          <td style="width: 140px; font-weight: bold;">Periode Data</td>
          <td>: ${startText} s/d ${endText}</td>
          <td style="width: 140px; font-weight: bold;">Tanggal Cetak</td>
          <td>: ${tanggalCetak}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Filter Bagian</td>
          <td>: ${bagianText}</td>
          <td style="font-weight: bold;">Total Laporan Selesai</td>
          <td>: <b>${reports.length} Tiket Laporan</b></td>
        </tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">No</th>
            <th style="width: 110px;">Nomor Tiket</th>
            <th style="width: 110px;">Nama Pelapor</th>
            <th style="width: 140px;">Bagian</th>
            <th style="width: 200px;">Laporan</th>
            <th>Tindakan Penanganan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || `<tr><td colspan="6" style="text-align: center; padding: 15px;">Tidak ada data laporan</td></tr>`}
        </tbody>
      </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + wordContent], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `SIGAP_Riwayat_Laporan_${options.startDate || "all"}_sd_${options.endDate || "all"}.doc`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 📕 4. Export as PDF (Direct Print F4 Portrait with PG Trangkil Logo & Combined Bagian)
export function exportToPdf(reports: CompletedReportItem[], options: ExportFilterOptions) {
  const startText = options.startDate ? formatDateOnlyIndo(options.startDate) : "Semua";
  const endText = options.endDate ? formatDateOnlyIndo(options.endDate) : "Sekarang";
  const bagianText = options.bagian && options.bagian !== "ALL" ? escapeHtml(options.bagian) : "Semua Bagian";
  const tanggalCetak = getFormattedCurrentDateTime();
  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/assets/images/logo-pg-trangkil.png` : "/assets/images/logo-pg-trangkil.png";

  const rowsHtml = reports
    .map(
      (r, idx) => {
        const cleanDeskripsi = (r.deskripsi?.trim().replace(/[\.\-\s]+$/, "") || r.lokasi_kerusakan || "Laporan kerusakan");
        const waktuLaporan = formatDateIndo(r.created_at);
        const laporanDanWaktu = `${cleanDeskripsi} - ${waktuLaporan}`;

        const waktuSelesai = formatDateIndo(r.completed_at || r.updated_at || r.created_at);
        const cleanPenanganan = (r.penanganan?.trim().replace(/[\.\-\s]+$/, "") || "Sudah diselesaikan");
        const penangananDanWaktu = `${cleanPenanganan} - ${waktuSelesai}`;

        return `
      <tr>
        <td style="text-align: center; padding: 6px 4px; border: 1px solid #cbd5e1;">${idx + 1}</td>
        <td style="padding: 6px 5px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #0369a1; font-size: 10px; white-space: nowrap;">${escapeHtml(r.ticket_number)}</td>
        <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 10px;">${escapeHtml(r.nama_pelapor)}</td>
        <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-size: 10px; line-height: 1.35;">${formatBagianDanUnit(r.bagian, r.unit_kerja)}</td>
        <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-size: 10px; line-height: 1.35; color: #1e293b;">${escapeHtml(laporanDanWaktu)}</td>
        <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-size: 10px; color: #065f46; line-height: 1.35;">${escapeHtml(penangananDanWaktu)}</td>
      </tr>
    `;
      }
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Laporan Riwayat SIGAP - PG TRANGKIL</title>
      <style>
        /* Standar Kertas F4 (Folio Indonesia): 215mm x 330mm (Portrait) */
        /* margin: 0 otomatis menghilangkan header (tanggal/judul) dan footer bawaan browser (localhost / url) */
        @page {
          size: 215mm 330mm portrait;
          margin: 0;
        }
        @media print {
          @page {
            size: 215mm 330mm portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .print-wrapper {
            padding: 10mm 8mm !important;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 0;
          font-size: 11px;
          background: #ffffff;
        }
        .print-wrapper {
          padding: 10mm 8mm;
          box-sizing: border-box;
          width: 100%;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2.5px solid #0284c7;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .header-logo {
          width: 145px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .header-logo img {
          height: 65px;
          max-width: 145px;
          object-fit: contain;
        }
        .header-text {
          flex: 1;
          text-align: center;
          padding: 0 8px;
        }
        .header-text h1 {
          margin: 0;
          font-size: 15px;
          text-transform: uppercase;
          color: #0369a1;
          letter-spacing: 0.3px;
          font-weight: 800;
          line-height: 1.25;
        }
        .header-text h2 {
          margin: 4px 0 0 0;
          font-size: 11.5px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.2px;
        }
        .header-spacer {
          width: 145px;
        }
        .meta-table {
          width: 100%;
          margin-bottom: 10px;
          font-size: 11px;
        }
        .meta-table td {
          padding: 2.5px 0;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 10px;
        }
        .data-table th {
          background-color: #f1f5f9;
          color: #1e293b;
          padding: 7px 6px;
          border: 1px solid #cbd5e1;
          text-align: left;
          font-weight: 700;
          font-size: 10px;
        }
        .data-table td {
          vertical-align: top;
        }
      </style>
    </head>
    <body>
      <div class="print-wrapper">
        <div class="header-container">
          <div class="header-logo">
            <img id="logo-pg-trangkil" src="${logoUrl}" alt="Logo PG Trangkil" />
          </div>
          <div class="header-text">
            <h1>SISTEM INFORMASI GANGGUAN DAN PERBAIKAN (SIGAP)</h1>
            <h2>REKAPITULASI ARSIP LAPORAN GANGGUAN & PERBAIKAN</h2>
          </div>
          <div class="header-spacer"></div>
        </div>

        <table class="meta-table">
          <tr>
            <td style="width: 140px; font-weight: bold;">Periode Data</td>
            <td>: ${startText} s/d ${endText}</td>
            <td style="width: 140px; font-weight: bold;">Tanggal Cetak</td>
            <td>: ${tanggalCetak}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Filter Bagian</td>
            <td>: ${bagianText}</td>
            <td style="font-weight: bold;">Total Laporan Selesai</td>
            <td>: <strong>${reports.length} Tiket Laporan</strong></td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">No</th>
              <th style="width: 95px;">Nomor Tiket</th>
              <th style="width: 105px;">Nama Pelapor</th>
              <th style="width: 135px;">Bagian</th>
              <th style="width: 195px;">Laporan</th>
              <th>Tindakan Penanganan</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="6" style="text-align: center; padding: 25px; color: #64748b;">Tidak ada data laporan</td></tr>`}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  // Use hidden iframe to trigger print without opening about:blank tab
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback if iframe fails
    const win = window.open("", "_blank");
    if (win) {
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      win.print();
    }
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  const triggerPrint = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  };

  const logoImg = doc.getElementById("logo-pg-trangkil") as HTMLImageElement | null;
  if (logoImg) {
    if (logoImg.complete) {
      setTimeout(triggerPrint, 150);
    } else {
      logoImg.onload = () => setTimeout(triggerPrint, 150);
      logoImg.onerror = () => setTimeout(triggerPrint, 150);
      setTimeout(triggerPrint, 1000);
    }
  } else {
    setTimeout(triggerPrint, 300);
  }
}
