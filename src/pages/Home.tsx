import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TRACKS } from "../data/questions";

export function Home() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-line bg-panel/80 p-6 md:p-8"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-acid">ED-01 · 60s rounds</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-extrabold leading-[0.95] text-white md:text-6xl">
            Predict the output.
            <span className="text-acid"> Climb the board.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-mist/80">
            Open to everyone — no sign-up. Tricky C, Java, Python, and JS snippets. Four
            choices. A ticking bar. Combo streaks double XP. Climb the live campus board.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/play/c-pointers"
              className="rounded-full bg-acid px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Start C arena
            </Link>
            <Link
              to="/daily"
              className="rounded-full border border-line px-5 py-2.5 text-sm"
            >
              Daily 5-question workout
            </Link>
          </div>
        </motion.div>
        <div className="rounded-3xl border border-line bg-ink p-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ice">How a round works</p>
          <ol className="mt-4 space-y-3 text-sm">
            <li>01 · 60-second countdown, 4 output options</li>
            <li>02 · Instant compiler output + line-by-line why</li>
            <li>03 · 3 correct in a row = Combo Streak 2x XP</li>
            <li>04 · Weekly rank by XP, accuracy, and speed</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-white">Topic tracks</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TRACKS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/play/${t.id}`}
                className="block rounded-2xl border border-line bg-panel p-5 transition hover:border-acid/50"
              >
                <p className="text-[11px] uppercase tracking-widest" style={{ color: t.accent }}>
                  {t.language}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">{t.label}</h3>
                <p className="mt-2 text-sm text-mist/70">5 interview-style output traps.</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
