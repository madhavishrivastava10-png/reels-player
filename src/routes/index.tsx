import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReelsCollect — Instagram reels yahin dekhein" },
      { name: "description", content: "Instagram reel ka link daalein aur video isi website par play karein." },
      { property: "og:title", content: "ReelsCollect" },
      { property: "og:description", content: "Instagram reels ko ek jagah collect karein aur yahin play karein." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Reel = { code: string; kind: string };

function parse(url: string): Reel | null {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m || !m[1] || !m[2]) return null;
  return { kind: m[1] === "reels" ? "reel" : m[1], code: m[2] };
}

function Index() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      setReels(JSON.parse(localStorage.getItem("reels") || "[]"));
    } catch {}
  }, []);

  const save = (r: Reel[]) => {
    setReels(r);
    localStorage.setItem("reels", JSON.stringify(r));
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parse(url.trim());
    if (!r) return setErr("Sahi Instagram reel/post link daalein");
    setErr("");
    setUrl("");
    if (!reels.some((x) => x.code === r.code)) save([r, ...reels]);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">ReelsCollect</h1>
        <p className="mt-2 text-muted-foreground">Instagram reel ka link paste karein — video yahin play hogi.</p>
        <form onSubmit={add} className="mt-6 flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1 rounded-md border border-input bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
            Add
          </button>
        </form>
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
        {reels.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">Abhi koi reel nahi hai. Upar link daalein.</p>
        )}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((r) => (
            <div key={r.code} className="overflow-hidden rounded-lg border border-border bg-card">
              <iframe
                src={`https://www.instagram.com/${r.kind}/${r.code}/embed`}
                className="h-[560px] w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title={r.code}
              />
              <button
                onClick={() => save(reels.filter((x) => x.code !== r.code))}
                className="w-full border-t border-border py-2 text-sm text-muted-foreground hover:text-destructive"
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
