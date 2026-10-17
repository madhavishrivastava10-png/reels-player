import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reel Grid — Aapke reels, ek jagah" },
      { name: "description", content: "Instagram reel ka link daalein aur video isi website par play karein — sab kuch saved permanently." },
      { property: "og:title", content: "Reel Grid" },
      { property: "og:description", content: "Bring your videos, reels and posts together in one grid — saved permanently, so nothing disappears." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Reel = { id: string; kind: string; code: string };

function parse(url: string): { kind: string; code: string } | null {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m || !m[1] || !m[2]) return null;
  return { kind: m[1] === "reels" ? "reel" : m[1], code: m[2] };
}

function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const load = async () => {
    const { data, error } = await supabase
      .from("reels")
      .select("id, kind, code")
      .order("created_at", { ascending: false });
    if (!error && data) setReels(data);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = parse(url.trim());
    if (!r) return setErr("Sahi Instagram reel/post link daalein");
    setErr("");
    setBusy(true);
    const { error } = await supabase
      .from("reels")
      .insert({ user_id: user!.id, kind: r.kind, code: r.code });
    setBusy(false);
    if (error) {
      if (error.code === "23505") setErr("Yeh reel pehle se aapki list me hai.");
      else setErr("Reel save nahi hui — dobara try karein.");
      return;
    }
    setUrl("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("reels").delete().eq("id", id);
    setReels(reels.filter((x) => x.id !== id));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fdf0f6] to-[#fbe3ef]">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fdf0f6] via-[#fdeaf3] to-[#fbe3ef] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-md shadow-pink-500/30">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Reel Grid</h1>
              <p className="text-sm text-muted-foreground">Instagram reel ka link paste karein — video yahin play hogi.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground sm:block">{user.email}</span>
            <button
              onClick={logout}
              className="rounded-full border border-pink-200 bg-card px-4 py-2 text-sm font-semibold text-pink-700 transition hover:bg-accent"
            >
              Log out
            </button>
          </div>
        </header>

        <form onSubmit={add} className="mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1 rounded-full border border-input bg-card px-5 py-3 text-foreground outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            disabled={busy}
            className="rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 px-8 py-3 font-semibold text-white shadow-md shadow-pink-500/30 transition hover:opacity-95 disabled:opacity-60"
          >
            Add
          </button>
        </form>
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}

        {reels.length === 0 && !err && (
          <p className="mt-16 text-center text-muted-foreground">Abhi koi reel nahi hai. Upar link daalein.</p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-pink-100 bg-card shadow-sm">
              <iframe
                src={`https://www.instagram.com/${r.kind}/${r.code}/embed`}
                className="h-[560px] w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title={r.code}
              />
              <button
                onClick={() => remove(r.id)}
                className="w-full border-t border-border py-2 text-sm font-medium text-muted-foreground transition hover:text-destructive"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
