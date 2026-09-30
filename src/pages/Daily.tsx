import { dailyQuestions } from "../data/questions";
import { PlayQueue } from "./Arena";

export function Daily() {
  const qs = dailyQuestions();
  const label = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ice">FR-6 daily challenge</p>
        <h1 className="font-display text-3xl font-extrabold text-white">Five-question workout</h1>
        <p className="mt-1 text-sm text-mist/70">{label} · mixed tracks · shareable scorecard</p>
      </div>
      <PlayQueue questions={qs} trackId="daily" title="Daily Challenge" daily />
    </div>
  );
}
