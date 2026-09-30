import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && anon && !url.includes("YOUR_PROJECT"));

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url!, anon!)
  : null;

export function mondayOf(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export type LeaderRow = {
  user_id: string;
  display_name: string;
  weekly_xp: number;
  weekly_correct: number;
  weekly_answered: number;
  weekly_time_ms: number;
  week_start: string;
};

export function accuracy(row: LeaderRow): number {
  if (!row.weekly_answered) return 0;
  return row.weekly_correct / row.weekly_answered;
}

export function avgMs(row: LeaderRow): number {
  if (!row.weekly_answered) return 0;
  return row.weekly_time_ms / row.weekly_answered;
}

export function rankScore(row: LeaderRow): number {
  return row.weekly_xp * 1000 + accuracy(row) * 100 - avgMs(row) / 1000;
}
