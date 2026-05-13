/**
 * Utility helpers shared across the UI.
 */
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function formatRelative(iso?: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const abs = Math.abs(diff);
  const sec = Math.round(abs / 1000);
  if (sec < 60) return diff >= 0 ? `${sec}s ago` : `in ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return diff >= 0 ? `${min}m ago` : `in ${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return diff >= 0 ? `${hr}h ago` : `in ${hr}h`;
  const day = Math.round(hr / 24);
  return diff >= 0 ? `${day}d ago` : `in ${day}d`;
}

export function formatPercent(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function statusColor(status: string): "success" | "warn" | "danger" | "muted" {
  const s = status.toUpperCase();
  if (["COMPLETED", "HEALTHY"].includes(s)) return "success";
  if (["FAILED", "TIMEOUT", "CRITICAL", "UNHEALTHY"].includes(s)) return "danger";
  if (["CANCELLED", "DEGRADED", "WARNING"].includes(s)) return "warn";
  return "muted";
}

export function riskColor(score: number | null | undefined): "success" | "warn" | "danger" | "muted" {
  if (score == null) return "muted";
  if (score >= 0.8) return "danger";
  if (score >= 0.6) return "warn";
  if (score >= 0.3) return "warn";
  return "success";
}
