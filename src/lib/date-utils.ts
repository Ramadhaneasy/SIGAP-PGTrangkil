/**
 * Utility functions for date formatting in Indonesian (id-ID) locale.
 */

/**
 * Formats a date string or Date object into Indonesian full date format.
 * Example: "26 Agustus 2026"
 */
export function formatDateIndonesian(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

/**
 * Formats a date string or Date object into Indonesian date + time format.
 * Example: "26 Agustus 2026, 14:30 WIB"
 */
export function formatDateTimeIndonesian(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "-";
    
    const formattedDate = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${formattedDate}, ${formattedTime} WIB`;
  } catch {
    return "-";
  }
}

/**
 * Formats a date for header display.
 * Example: "Rabu, 26 Agustus 2026"
 */
export function formatFullDayDateIndonesian(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
