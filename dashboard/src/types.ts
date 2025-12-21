// Task record type
export type TaskRecord = {
  sheet: string;
  job: string | null;
  phase: string | null;
  crew: string | null;
  description: string | null;
  status: string | null;
  weeks: number | null;
  start: string | null;
  end: string | null;
};

export type StatusCode = 'A' | 'S' | 'D' | 'P' | 'L' | 'E' | 'C';

export const STATUS_LABELS: Record<string, string> = {
  'A': 'Actual',
  'S': 'Scheduled',
  'D': 'Done',
  'P': 'Potential',
  'L': 'Late',
  'E': 'Early',
  'C': 'Clearance',
};

export const STATUS_COLORS: Record<string, string> = {
  'A': '#22c55e',
  'S': '#3b82f6',
  'D': '#6b7280',
  'P': '#f59e0b',
  'L': '#ef4444',
  'E': '#8b5cf6',
  'C': '#14b8a6',
};
