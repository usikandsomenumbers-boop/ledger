-- Run this once in your new Neon project's SQL editor before first deploy.

CREATE TABLE IF NOT EXISTS entries (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('income','permanent','temporary')),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kv (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
