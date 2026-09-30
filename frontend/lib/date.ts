/**
 * Deterministic date formatting helpers to prevent SSR hydration mismatches.
 * Using explicit 'en-GB' locale and UTC ensures the exact same string
 * is produced on both server (Node.js) and browser clients regardless of local timezone.
 */

export function formatDisplayDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return String(dateInput);
  }
}

export function formatDisplayDateTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  } catch {
    return String(dateInput);
  }
}
