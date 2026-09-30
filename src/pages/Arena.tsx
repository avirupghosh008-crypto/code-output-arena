import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  questionsForTrack,
  TRACKS,
  type Question,
  type TrackId,
} from "../data/questions";
import { awardXp, COMBO_MULTIPLIER, ROUND_SECONDS, STREAK_TRIGGER } from "../lib/scoring";
import { pushAttempt, useAuth } from "../lib/auth";
import { ComboBurst } from "../components/ComboBurst";
import { sfxCombo, sfxCorrect, sfxTick, sfxWrong } from "../lib/sfx";

export function Arena() {
  const { trackId } = useParams();
  const track = TRACKS_SAFE(trackId);
  const bank = useMemo(() => (track ? questionsForTrack(track.id) : []), [track]);
  if (!track) {
    return (
      <p>
        Unknown track. <Link to="/">Back</Link>
      </p>
    );
  }
  return <PlayQueue key={track.id} questions={bank} trackId={track.id} title={track.label} />;
}

function TRACKS_SAFE(id?: string) {
  return TRACKS.find((t) => t.id === id) ?? null;
}

export function PlayQueue({
  questions,
  trackId,
  title,
  daily = false,
}: {
  questions: Question[];
  trackId: TrackId | "daily";
  title: string;
  daily?: boolean;
}) {
  const { displayName, user } = useAuth();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [streak, setStreak] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);
  const [xp, setXp] = useState(0);
  const [log, setLog] = useState<{ correct: boolean; xp: number }[]>([]);
  const started = useRef(Date.now());
  const resolving = useRef(false);
  const q = questions[index];
  const locked = picked !== null || left <= 0;

  useEffect(() => {
    started.current = Date.now();
    resolving.current = false;
    setLeft(ROUND_SECONDS);
    setPicked(null);
  }, [index]);

  useEffect(() => {
    if (locked) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) return 0;
        if (s <= 11) sfxTick();
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [locked, index]);

  useEffect(() => {
    if (left === 0 && picked === null && q) {
      void resolve(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  async function resolve(choice: number) {
    if (resolving.current || picked !== null) return;
    resolving.current = true;
    setPicked(choice);
    const correct = choice === q.correctIndex;
    const nextStreak = correct ? streak + 1 : 0;
    const gained = awardXp(correct, left, nextStreak);
    const timeMs = Math.min(ROUND_SECONDS * 1000, Date.now() - started.current);
    setStreak(nextStreak);
    setXp((v) => v + gained);
    setLog((l) => [...l, { correct, xp: gained }]);
    if (correct) sfxCorrect();
    else sfxWrong();
    if (correct && nextStreak > 0 && nextStreak % STREAK_TRIGGER === 0) {
      setComboFlash(true);
      sfxCombo();
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#d6ff3f", "#5ce1ff", "#ff8a3d"] });
      setTimeout(() => setComboFlash(false), 1200);
    }
    await pushAttempt({
      userId: user?.id,
      displayName,
      questionId: q.id,
      track: daily ? "daily" : String(trackId),
      correct,
      timeMs,
      xp: gained,
    });
  }

  if (!q) {
    const correct = log.filter((l) => l.correct).length;
    return (
      <ResultCard
        title={daily ? "Daily workout complete" : `${title} complete`}
        correct={correct}
        total={questions.length}
        xp={xp}
        daily={daily}
      />
    );
  }

  const correct = picked === q.correctIndex;
  const comboOn = streak >= STREAK_TRIGGER;

  return (
    <div className="space-y-4">
      <ComboBurst show={comboFlash} />
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-widest">
        <span className="text-acid">{title}</span>
        <span>
          Q {index + 1}/{questions.length} · XP {xp} · streak {streak}
          {comboOn ? ` · x${COMBO_MULTIPLIER}` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <motion.div
          className={`h-full ${left <= 10 ? "bg-ember" : "bg-acid"}`}
          initial={false}
          animate={{ width: `${(left / ROUND_SECONDS) * 100}%` }}
          transition={{ duration: 0.25, ease: "linear" }}
        />
      </div>
      <p className="text-right font-display text-3xl text-white">{left}s</p>
      <motion.section
        key={q.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-line bg-panel p-4 md:p-5"
      >
        <p className="text-sm text-mist/80">{q.prompt}</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-4 text-[12px] leading-5 text-acid">
          <code>{q.snippet}</code>
        </pre>
      </motion.section>
      <div className="grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const show = picked !== null || left === 0;
          const isRight = i === q.correctIndex;
          const isPick = i === picked;
          let cls = "border-line bg-ink hover:border-acid/60";
          if (show && isRight) cls = "border-acid bg-acid/15 text-acid";
          else if (show && isPick && !isRight) cls = "border-ember bg-ember/15 text-ember";
          return (
            <button
              key={opt}
              disabled={locked}
              onClick={() => void resolve(i)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${cls}`}
            >
              <span className="mr-2 text-[11px] text-mist/50">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {(picked !== null || left === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-line bg-ink p-4"
          >
            <p className="text-[11px] uppercase tracking-widest text-ice">
              {correct ? "Correct" : "Miss"} · compiler / runtime output
            </p>
            <pre className="mt-2 rounded-lg bg-panel p-3 text-sm text-sand">{q.compilerOutput}</pre>
            <ul className="mt-3 space-y-2 text-sm">
              {q.explanation.map((e) => (
                <li key={e.line}>
                  <span className="text-acid">{e.line}</span>
                  <span className="text-mist/80"> — {e.why}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIndex((n) => n + 1)}
              className="mt-4 rounded-full bg-acid px-5 py-2 text-sm font-semibold text-ink"
            >
              {index + 1 === questions.length ? "See results" : "Next snippet"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({
  title,
  correct,
  total,
  xp,
  daily,
}: {
  title: string;
  correct: number;
  total: number;
  xp: number;
  daily: boolean;
}) {
  const share = `I scored ${correct}/${total} (${xp} XP) in Output Arena${daily ? " Daily Challenge" : ""}. Beat me: ${window.location.origin}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(share)}`;
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-line bg-panel p-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-acid">{title}</p>
      <p className="mt-3 font-display text-6xl font-extrabold text-white">
        {correct}/{total}
      </p>
      <p className="mt-1 text-sm text-mist/70">{xp} XP this run</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={wa} target="_blank" rel="noreferrer" className="rounded-full bg-acid px-5 py-2 text-sm font-semibold text-ink">
          Share on WhatsApp
        </a>
        <Link to="/board" className="rounded-full border border-line px-5 py-2 text-sm">
          Live leaderboard
        </Link>
        <Link to="/" className="rounded-full border border-line px-5 py-2 text-sm">
          Tracks
        </Link>
      </div>
    </div>
  );
}
