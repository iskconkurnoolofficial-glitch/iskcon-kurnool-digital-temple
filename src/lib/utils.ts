import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Return a URL only if it uses a safe http(s) scheme, otherwise the fallback.
 * Prevents javascript:, data:, and other dangerous-scheme XSS via stored URLs.
 */
export function safeUrl(url: string | undefined | null, fallback = "/"): string {
  if (!url) return fallback;
  const trimmed = String(url).trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : fallback;
}

/**
 * Restrict an embedded map iframe src to Google Maps embed URLs only.
 */
export function safeMapEmbed(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = String(url).trim();
  return /^https:\/\/(www\.)?google\.com\/maps\/embed/i.test(trimmed) ? trimmed : "";
}
