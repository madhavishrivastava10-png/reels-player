import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Reel Grid — Log in" },
      { name: "description", content: "Apne reels ek jagah collect karein — saved permanently." },
      { property: "og:title", content: "Reel Grid" },
      { property: "og:description", content: "Bring your videos, reels and posts together in one grid — saved permanently, so nothing disappears." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

type Mode = "login" | "signup" | "forgot";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const google = async () => {
    setBusy(true);
    setErr("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) setErr(result.error.message);
    // On success the browser redirects on its own.
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) setErr(translate(error.message));
      else navigate({ to: "/" });
    } else if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) setErr(translate(error.message));
      else if (data.session) navigate({ to: "/" });
      else setMsg("Account ban gaya! Email par bheja confirm link kholein, phir log in karein.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setBusy(false);
      if (error) setErr(translate(error.message));
      else setMsg("Password reset ka link aapke email par bhej diya hai.");
    }
  };

  const translate = (m: string) =>
    m.includes("Invalid login credentials")
      ? "Email ya password galat hai."
      : m.includes("Password should be at least")
        ? "Password kam se kam 6 characters ka hona chahiye."
        : m.includes("already registered")
          ? "Yeh email pehle se registered hai — Log in karein."
          : m.includes("rate limit")
            ? "Bahut baar koshish ho gayi. Thodi der baad try karein."
            : m;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#fdf0f6] via-[#fdeaf3] to-[#fbe3ef] px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-pink-100 bg-card/95 p-8 shadow-xl shadow-pink-500/10 backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/30">
            <Play className="h-7 w-7 fill-white text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">Reel Grid</h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Bring your videos, reels and posts together in one grid — saved permanently, so nothing disappears.
          </p>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-md shadow-pink-500/30 transition hover:opacity-95 disabled:opacity-60"
        >
          🔊 Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        {mode === "forgot" ? (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              Send reset link
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <button type="button" onClick={() => { setMode("login"); setErr(""); }} className="font-semibold text-pink-600 hover:underline">
                Log in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label={mode === "signup" ? "Email" : "Username (email)"} value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
            <div>
              <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
              {mode === "login" && (
                <div className="mt-1 text-right">
                  <button type="button" onClick={() => { setMode("forgot"); setErr(""); }} className="text-sm font-semibold text-pink-600 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {mode === "signup" ? "Create account" : "Log in"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }}
                className="font-semibold text-pink-600 hover:underline"
              >
                {mode === "signup" ? "Log in" : "Create an account"}
              </button>
            </p>
          </form>
        )}

        {err && <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">{err}</p>}
        {msg && <p className="mt-3 rounded-lg bg-pink-500/10 px-3 py-2 text-center text-sm text-pink-700">{msg}</p>}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        required
        className="w-full rounded-full border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-pink-400"
      />
    </div>
  );
}
