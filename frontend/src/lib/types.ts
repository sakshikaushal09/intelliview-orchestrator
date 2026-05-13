/**
 * Shared TypeScript types matching the FastAPI Pydantic models.
 * Keep these in sync with `orchestrator/main.py` request/response models.
 */

export type SessionStatus =
  | "CREATED"
  | "QUEUED"
  | "PROCESSING"
  | "VIDEO_PROCESSING"
  | "AUDIO_PROCESSING"
  | "EVALUATING"
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED";

export type LoadBalancingStrategy = "ROUND_ROBIN" | "LEAST_LOADED" | "QUEUE_BASED";
export type TaskPriority = "low" | "medium" | "high";

export interface InterviewSession {
  session_id: string;
  status: SessionStatus;
  created_at?: string | null;
  candidate_id: string;
  candidate_name?: string | null;
  position?: string | null;
  risk_score?: number | null;
  assigned_node?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  updated_at?: string | null;
}

export interface Worker {
  worker_id: string;
  capacity: number;
  active_tasks: number;
  available_capacity: number;
  health_status: "healthy" | "unhealthy" | "degraded";
  last_heartbeat: string | null;
  joined_at: string | null;
}

export interface WorkerStats {
  total_workers: number;
  healthy_workers: number;
  unhealthy_workers: number;
  total_capacity: number;
  total_active_tasks: number;
  system_utilization_percent: number;
  idle_workers: number;
  average_active_tasks: number;
  min_active_tasks: number;
  max_active_tasks: number;
  worker_details: Array<{
    worker_id: string;
    capacity: number;
    active_tasks: number;
    status: string;
    last_heartbeat: string | null;
    total_tasks_processed: number;
    failed_tasks: number;
  }>;
  timestamp: string;
}

export interface SystemHealth {
  timestamp: string;
  overall_status: "healthy" | "degraded" | "unhealthy" | "critical";
  components: {
    redis?: { status: string; connected?: boolean; clients?: number; memory?: string };
    workers?: { status: string; total_workers: number; healthy_workers: number; unhealthy_workers: number };
    sessions?: { status: string; total_active: number; stuck_sessions: number; max_processing_time: number };
    queue?: { status: string; queue_length: number; threshold: number; backlog_percent: number };
  };
}

export interface SessionStatistics {
  total_sessions: number;
  status_breakdown: Record<string, number>;
  active_sessions: number;
  completed_sessions: number;
  failed_sessions: number;
  processing_stats: { average_duration_seconds: number; completed_session_count: number };
  risk_score_stats: { average_risk_score: number; max_risk_score: number; min_risk_score: number; high_risk_sessions: number };
}

export interface FaultStatistics {
  total_failures: number;
  failures_by_type: Record<string, number>;
  recovery_queue_size: number;
  dead_letter_queue_size: number;
  last_failures: Array<{ timestamp: string; session_id: string | null; failure_type: string; error_message: string; worker_id: string | null }>;
}

export interface RetryStatistics {
  total_scheduled_retries: number;
  scheduled_retries: Array<{ session_id: string; retry_count: number; scheduled_at: string; retry_after: string; delay_seconds: number; strategy: string }>;
  retry_strategy: string;
  max_retries: number;
  base_delay: number;
  max_delay: number;
  timestamp: string;
}

export interface SchedulingStatus {
  scheduler_active: boolean;
  current_strategy: LoadBalancingStrategy;
  system_overloaded: boolean;
  available_workers: number;
  can_accept_tasks: boolean;
  recommendation: string | null;
  timestamp: string;
}

export interface ApiError {
  detail: string;
}
