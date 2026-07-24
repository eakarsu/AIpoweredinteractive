BEGIN;
CREATE TABLE IF NOT EXISTS vehicle_ai_interactions (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vehicle_ai_interactions_history_idx
  ON vehicle_ai_interactions(tenant_id,actor_id,created_at DESC);
COMMIT;
