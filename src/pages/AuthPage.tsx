import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabaseEnabled } from "../lib/supabase";

export function AuthPage() {
  const { signIn, signUp, enterGuest, signOut, user, guest, displayName } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const err =
      mode === "in"
        ? await signIn(email, password)
        : await signUp(email, password, name || email.split("@")[0]);
    if (err) setError(err);
    else nav("/");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-line bg-panel p-6">
      <h1 className="font-display text-3xl font-extrabold text-white">Play as anyone</h1>
      <p className="text-sm text-mist/70">
        You already have a guest handle. Change it below — the arena is public, no email
        required.
      </p>
      {(user || guest) && (
        <div className="flex items-center justify-between text-sm">
          <span>Signed in as {displayName}</span>
          <button className="text-ember" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "up" && (
          <input
            className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm"
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={supabaseEnabled}
        />
        <input
          className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={supabaseEnabled}
        />
        {error && <p className="text-sm text-ember">{error}</p>}
        <button className="w-full rounded-full bg-acid py-2 text-sm font-semibold text-ink" disabled={!supabaseEnabled}>
          {mode === "in" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="w-full text-[12px] uppercase tracking-widest text-mist/70"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? "Need an account?" : "Have an account?"}
        </button>
      </form>
      <div className="border-t border-line pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-ice">Guest / club night</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-line bg-ink px-3 py-2 text-sm"
            placeholder="Handle"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="rounded-full border border-acid px-4 text-sm text-acid"
            onClick={() => {
              enterGuest(name);
              nav("/");
            }}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
