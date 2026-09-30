import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  mondayOf,
  supabase,
  supabaseEnabled,
  type LeaderRow,
} from "./supabase";
import {
  guestUserId,
  readLocalBoard,
  upsertPublicScore,
  writeLocalBoard,
} from "./publicBoard";

type AuthState = {
  user: User | null;
  displayName: string;
  loading: boolean;
  guest: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  enterGuest: (name: string) => void;
};

const AuthContext = createContext<AuthState | null>(null);

const GUEST_KEY = "oa-guest-name";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("Cadet");
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    if (!supabase) {
      const stored = localStorage.getItem(GUEST_KEY);

      if (stored) {
        setDisplayName(stored);
      } else {
        const n = `Cadet-${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem(GUEST_KEY, n);
        setDisplayName(n);
      }

      setGuest(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;

      setUser(sessionUser);

      if (sessionUser) {
        const meta = sessionUser.user_metadata?.display_name as
          | string
          | undefined;

        setDisplayName(
          meta ||
            sessionUser.email?.split("@")[0] ||
            "User",
        );

        setGuest(false);
        localStorage.removeItem(GUEST_KEY);
      } else {
        const stored = localStorage.getItem(GUEST_KEY);

        if (stored) {
          setDisplayName(stored);
        } else {
          const n = `Cadet-${Math.floor(1000 + Math.random() * 9000)}`;
          localStorage.setItem(GUEST_KEY, n);
          setDisplayName(n);
        }

        setGuest(true);
      }

      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;

        setUser(sessionUser);

        if (sessionUser) {
          const meta = sessionUser.user_metadata?.display_name as
            | string
            | undefined;

          setDisplayName(
            meta ||
              sessionUser.email?.split("@")[0] ||
              "User",
          );

          setGuest(false);
          localStorage.removeItem(GUEST_KEY);
        } else {
          setGuest(true);

          const stored = localStorage.getItem(GUEST_KEY);

          if (stored) {
            setDisplayName(stored);
          }
        }
      },
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      displayName,
      loading,
      guest,

      async signIn(email, password) {
        if (!supabase) {
          return "Supabase is not configured. Use guest mode or add .env keys.";
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) return error.message;

        setGuest(false);
        localStorage.removeItem(GUEST_KEY);

        return null;
      },

      async signUp(email, password, name) {
        if (!supabase) {
          return "Supabase is not configured. Use guest mode or add .env keys.";
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });

        if (error) return error.message;

        setDisplayName(name);
        setGuest(false);
        localStorage.removeItem(GUEST_KEY);

        if (data.user) {
          setUser(data.user);
        }

        return null;
      },

      async signOut() {
        if (supabase) {
          await supabase.auth.signOut();
        }

        setUser(null);
        setGuest(true);

        const n = `Cadet-${Math.floor(1000 + Math.random() * 9000)}`;

        localStorage.setItem(GUEST_KEY, n);
        setDisplayName(n);
      },

      enterGuest(name) {
        const n = name.trim() || "Guest";

        localStorage.setItem(GUEST_KEY, n);

        setDisplayName(n);
        setGuest(true);
        setUser(null);
      },
    }),
    [user, displayName, loading, guest],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth outside provider");
  }

  return ctx;
}

export async function pushAttempt(opts: {
  userId?: string;
  displayName: string;
  questionId: string;
  track: string;
  correct: boolean;
  timeMs: number;
  xp: number;
}) {
  if (supabase && opts.userId) {
    await supabase.from("attempts").insert({
      user_id: opts.userId,
      question_id: opts.questionId,
      track: opts.track,
      correct: opts.correct,
      time_ms: opts.timeMs,
      xp: opts.xp,
    });

    const week = mondayOf();

    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("user_id", opts.userId)
      .maybeSingle();

    const row = data as LeaderRow | null;

    const reset = !row || row.week_start !== week;

    const next: LeaderRow = {
      user_id: opts.userId,
      display_name: opts.displayName,
      week_start: week,
      weekly_xp: (reset ? 0 : row.weekly_xp) + opts.xp,
      weekly_correct:
        (reset ? 0 : row.weekly_correct) +
        (opts.correct ? 1 : 0),
      weekly_answered:
        (reset ? 0 : row.weekly_answered) + 1,
      weekly_time_ms:
        (reset ? 0 : row.weekly_time_ms) + opts.timeMs,
    };

    await supabase.from("leaderboard").upsert(next);

    return;
  }

  const local = readLocalBoard();
  const id = guestUserId();
  const week = mondayOf();

  const existing = local.find(
    (r) => r.user_id === id,
  );

  const reset =
    !existing || existing.week_start !== week;

  const next: LeaderRow = {
    user_id: id,
    display_name: opts.displayName,
    week_start: week,
    weekly_xp:
      (reset ? 0 : existing.weekly_xp) + opts.xp,
    weekly_correct:
      (reset ? 0 : existing.weekly_correct) +
      (opts.correct ? 1 : 0),
    weekly_answered:
      (reset ? 0 : existing.weekly_answered) + 1,
    weekly_time_ms:
      (reset ? 0 : existing.weekly_time_ms) + opts.timeMs,
  };

  writeLocalBoard([
    next,
    ...local.filter((r) => r.user_id !== id),
  ]);

  await upsertPublicScore(next);
}

export { readLocalBoard, supabaseEnabled };
