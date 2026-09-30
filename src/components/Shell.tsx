import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabaseEnabled } from "../lib/supabase";

export function Shell() {
  const { displayName, user, guest } = useAuth();
  const tagged = user || guest;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-ink text-mist">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,255,63,0.12),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(92,225,255,0.08),transparent_28%)]" />
      <div className="scan absolute inset-0" />
      <header className="relative z-10 border-b border-line/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-acid">
              OUTPUT
            </span>
            <span className="text-[11px] uppercase tracking-[0.28em] text-mist/60">
              // arena
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-[12px] uppercase tracking-widest sm:flex">
            <NavLink to="/" className={navClass}>
              Tracks
            </NavLink>
            <NavLink to="/daily" className={navClass}>
              Daily
            </NavLink>
            <NavLink to="/board" className={navClass}>
              Live Board
            </NavLink>
          </nav>
          <Link
            to="/auth"
            className="rounded-full border border-line bg-panel px-3 py-1 text-[12px] text-acid"
          >
            {tagged ? displayName : "Sign in"}
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6">
        {!supabaseEnabled && (
          <p className="mb-4 rounded-lg border border-acid/25 bg-acid/10 px-3 py-2 text-[11px] text-acid">
            Public live mode — no account needed. Pick a handle anytime. Scores land on the
            shared campus board.
          </p>
        )}
        <Outlet />
      </main>
      <nav className="sticky bottom-0 z-20 grid grid-cols-3 border-t border-line bg-ink/95 sm:hidden">
        <Link to="/" className="py-3 text-center text-[11px] uppercase tracking-widest">
          Tracks
        </Link>
        <Link to="/daily" className="py-3 text-center text-[11px] uppercase tracking-widest">
          Daily
        </Link>
        <Link to="/board" className="py-3 text-center text-[11px] uppercase tracking-widest">
          Board
        </Link>
      </nav>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-acid" : "text-mist/70 hover:text-mist";
}
