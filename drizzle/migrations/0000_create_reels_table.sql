CREATE TABLE public.reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('reel','p','tv')),
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.reels TO authenticated;
GRANT ALL ON public.reels TO service_role;

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own reels"
  ON public.reels FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users can insert own reels"
  ON public.reels FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can delete own reels"
  ON public.reels FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE UNIQUE INDEX reels_user_code_idx ON public.reels (user_id, code);