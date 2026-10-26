import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes an image URL for Next.js Image component.
 * - Safely fallbacks to /placeholder.svg if empty
 * - Converts Windows path backslashes (\) to standard URL slashes (/)
 * - Resolves relative backend file paths (e.g. files/public/...) with API backend origin
 * - Automatically redirects unroutable Unsplash webpage/download links (e.g. unsplash.com/photos/...)
 *   to a stable CDN image (images.unsplash.com) to prevent net::ERR_CONNECTION_RESET
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || !url.trim()) return "/placeholder.svg";

  // Standardize backslashes from Windows paths
  let cleanUrl = url.trim().replace(/\\/g, "/");

  // If it's already an active CDN image on images.unsplash.com, return directly
  if (cleanUrl.includes("images.unsplash.com")) {
    return cleanUrl;
  }

  // Unsplash web page URLs (e.g. https://unsplash.com/photos/...) or /download links
  // trigger net::ERR_CONNECTION_RESET on many networks.
  // Map them to a verified high-resolution nature photo on the official images.unsplash.com CDN.
  if (/^https?:\/\/(?:www\.)?unsplash\.com\/photos\//i.test(cleanUrl)) {
    return "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80";
  }

  // If it's a relative path from backend (e.g. "files/public/..." or "/files/public/...")
  if (cleanUrl.startsWith("files/") || cleanUrl.startsWith("/files/")) {
    const backendOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001")
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");
    const relativePath = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    return `${backendOrigin}${relativePath}`;
  }

  return cleanUrl;
}

/**
 * Memeriksa apakah jadwal pelaksanaan workshop sudah terlewat (berakhir) dibandingkan waktu sekarang.
 * @param date - Format tanggal YYYY-MM-DD atau ISO string
 * @param endTime - Format jam selesai HH:mm (opsional, jika tidak ada memakai 23:59:59)
 * @returns boolean - true jika workshop sudah lewat
 */
export function isWorkshopPast(date?: string | null, endTime?: string | null): boolean {
  if (!date) return false;

  try {
    const dateOnly = date.split("T")[0].trim();
    const parts = dateOnly.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return false;
    }
    const [year, month, day] = parts;

    let hours = 23;
    let minutes = 59;

    if (endTime && endTime.trim()) {
      const timeParts = endTime.trim().split(":").map(Number);
      if (!isNaN(timeParts[0])) hours = timeParts[0];
      if (!isNaN(timeParts[1])) minutes = timeParts[1];
    }

    const workshopEnd = new Date(year, month - 1, day, hours, minutes, 59, 999);
    return workshopEnd.getTime() < Date.now();
  } catch {
    return false;
  }
}
