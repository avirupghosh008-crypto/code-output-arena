import { useEffect, useMemo, useState } from "react";
import { accuracy, avgMs, rankScore, supabase, type LeaderRow } from "../lib/supabase";
import { fetchPublicBoard } from "../lib/publicBoard";

export function Leaderboard() {
  const [rows, setRows] = useState<LeaderRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (supabase) {
        const { data } = await supabase.from("leaderboard").select("*");
        if (!cancelled) setRows((data as LeaderRow[]) ?? []);
      } else {
        setRows(await fetchPublicBoard());
      }
    }
    void load();

    const client = supabase;
    if (!client) {
      const t = setInterval(() => {
        void fetchPublicBoard().then((rows) => {
          if (!cancelled) setRows(rows);
        });
      }, 2500);
      return () => {
        cancelled = true;
        clearInterval(t);
      };
    }

    const channel = client
      .channel("campus-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void client.removeChannel(channel);
    };
  }, []);

  const ranked = useMemo(
    () => [...rows].sort((a, b) => rankScore(b) - rankScore(a)),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-acid">FR-5 campus live</p>
        <h1 className="font-display text-3xl font-extrabold text-white">Weekly leaderboard</h1>
        <p className="mt-1 text-sm text-mist/70">
          Open campus board — ranked by XP, then accuracy, then average speed. Anyone can play;
          scores sync live across browsers.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto] gap-2 bg-panel px-4 py-2 text-[10px] uppercase tracking-widest text-mist/50">
          <span>#</span>
          <span>Cadet</span>
          <span>XP</span>
          <span>Acc</span>
          <span>Avg</span>
        </div>
        {ranked.length === 0 && (
          <p className="px-4 py-8 text-sm text-mist/60">No runs this week yet. Be first.</p>
        )}
        {ranked.map((r, i) => (
          <div
            key={r.user_id}
            className="grid grid-cols-[2.5rem_1fr_auto_auto_auto] items-center gap-2 border-t border-line px-4 py-3 text-sm"
          >
            <span className="text-acid">{i + 1}</span>
            <span className="truncate text-white">{r.display_name}</span>
            <span>{r.weekly_xp}</span>
            <span>{Math.round(accuracy(r) * 100)}%</span>
            <span>{Math.round(avgMs(r) / 100) / 10}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
