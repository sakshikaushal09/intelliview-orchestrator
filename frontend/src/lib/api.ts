/**
 * Lightweight API client for the FastAPI backend.
 *
 * Authentication uses a static API token sent via the `X-API-Token` header.
 * The token is stored in localStorage and managed by the `useTokenStore` hook.
 */
import type { ApiError } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("api_token", token);
      else localStorage.removeItem("api_token");
    }
  }

  loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("api_token");
    }
    return this.token;
  }

  private headers(extra: Record<string, string> = {}): HeadersInit {
    const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
    if (this.token) h["X-API-Token"] = this.token;
    return h;
  }

  private async request<T>(method: string, path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: this.headers(init?.headers as Record<string, string>),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const data = (await res.json()) as ApiError;
        if (data?.detail) detail = data.detail;
      } catch {
        // ignore
      }
      throw new Error(`${method} ${path} failed (${res.status}): ${detail}`);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  get<T>(path: string) {
    return this.request<T>("GET", path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, body);
  }
  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }

  /** Build the WebSocket URL with the token as a query param. */
  wsUrl(path: string): string {
    const base = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000").replace(/^http/, "ws");
    const q = this.token ? `?token=${encodeURIComponent(this.token)}` : "";
    return `${base}${path}${q}`;
  }
}

export const api = new ApiClient();

/* ---------- Endpoint helpers (typed wrappers) ---------- */

import type {
  InterviewSession,
  Worker,
  WorkerStats,
  SystemHealth,
  SessionStatistics,
  FaultStatistics,
  RetryStatistics,
  SchedulingStatus,
  LoadBalancingStrategy,
  TaskPriority,
} from "./types";

export const endpoints = {
  health: () => api.get<{ status: string; timestamp: string }>("/health"),
  startInterview: (payload: { candidate_id: string; candidate_name?: string; position?: string; priority?: TaskPriority }) =>
    api.post<InterviewSession>("/start-interview", payload),
  sessionStatus: (id: string) => api.get<InterviewSession>(`/session-status/${id}`),
  activeSessions: () => api.get<{ count: number; sessions: InterviewSession[] }>("/active-sessions"),
  completedSessions: (limit = 50) => api.get<{ count: number; sessions: InterviewSession[] }>(`/completed-sessions?limit=${limit}`),
  failedSessions: (limit = 50) => api.get<{ count: number; sessions: InterviewSession[] }>(`/failed-sessions?limit=${limit}`),
  sessionStatistics: () => api.get<SessionStatistics>("/session-statistics"),
  highRiskSessions: (threshold = 0.8) => api.get<{ count: number; sessions: InterviewSession[] }>(`/high-risk-sessions?threshold=${threshold}`),

  workers: () => api.get<{ total_workers: number; healthy_workers: number; unhealthy_workers: number; workers: Worker[]; timestamp: string }>("/workers"),
  workerStats: () => api.get<WorkerStats>("/worker-statistics"),
  registerWorker: (worker_id: string, capacity = 4) => api.post<{ status: string; worker_id: string }>("/register-worker", { worker_id, capacity }),
  deregisterWorker: (worker_id: string) => api.delete<void>(`/deregister-worker/${worker_id}`),
  sendHeartbeat: (worker_id: string, active_tasks: number) => api.post<{ status: string }>("/worker/heartbeat", { worker_id, active_tasks }),

  systemHealth: () => api.get<SystemHealth>("/system-health"),
  workerHealth: () => api.get<SystemHealth["components"]["workers"] & { status: string }>("/worker-health"),
  schedulingStatus: () => api.get<SchedulingStatus>("/scheduling-status"),
  switchStrategy: (strategy: LoadBalancingStrategy) => api.post<{ status: string; new_strategy: string }>("/switch-strategy", strategy),

  faultStatistics: () => api.get<{ fault_statistics: FaultStatistics; retry_statistics: RetryStatistics }>("/fault-statistics"),
  failureLog: (limit = 50) => api.get<{ count: number; failures: FaultStatistics["last_failures"] }>(`/failure-log?limit=${limit}`),
  deadLetterQueue: (limit = 50) => api.get<{ count: number; dead_letter_queue: Array<{ session_id: string; moved_at: string; reason: string }> }>(`/dead-letter-queue?limit=${limit}`),
  retrySession: (session_id: string) => api.post<{ status: string; retry_info: unknown }>(`/retry-session/${session_id}`),
  detectFailures: () => api.post<{ failed_sessions_detected: number; unhealthy_workers_detected: number; stuck_sessions_detected: number }>("/detect-failures"),
};
