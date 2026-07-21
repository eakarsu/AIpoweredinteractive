BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
CREATE INDEX IF NOT EXISTS vehicle_users_tenant_idx ON users (tenant_id, id);
CREATE TABLE IF NOT EXISTS vehicle_cases (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, vehicle_id TEXT NOT NULL, vin TEXT NOT NULL, owner_id TEXT NOT NULL, assigned_to TEXT,
 state TEXT NOT NULL, request_type TEXT NOT NULL, manual_version TEXT NOT NULL, input_hash CHAR(64) NOT NULL, evidence JSONB NOT NULL,
 consent JSONB NOT NULL, approval_id TEXT, recovery JSONB, expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS vehicle_provider_deliveries (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, case_id TEXT NOT NULL REFERENCES vehicle_cases(id), adapter TEXT NOT NULL,
 operation TEXT NOT NULL, idempotency_key TEXT NOT NULL, payload_hash CHAR(64) NOT NULL, payload JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','leased','retrying','confirmed','dead_letter')),
 attempts INTEGER NOT NULL DEFAULT 0, max_attempts INTEGER NOT NULL DEFAULT 5, next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 last_error TEXT, receipt JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(tenant_id, adapter, idempotency_key)
);
CREATE INDEX IF NOT EXISTS vehicle_cases_retention_idx ON vehicle_cases (tenant_id, expires_at);
CREATE TABLE IF NOT EXISTS vehicle_webhook_receipts (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, adapter TEXT NOT NULL, provider_event_id TEXT NOT NULL, payload_hash CHAR(64) NOT NULL,
 received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), processed_at TIMESTAMPTZ, UNIQUE(tenant_id, adapter, provider_event_id)
);
CREATE TABLE IF NOT EXISTS vehicle_evaluations (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, suite_version TEXT NOT NULL, fixture_version TEXT NOT NULL, metrics JSONB NOT NULL,
 limits JSONB NOT NULL, accepted BOOLEAN NOT NULL, failures JSONB NOT NULL, result_hash CHAR(64) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS vehicle_audit (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, vehicle_id TEXT NOT NULL, actor_id TEXT NOT NULL, actor_role TEXT NOT NULL,
 action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, before_hash CHAR(64), after_hash CHAR(64),
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb, occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION vehicle_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'vehicle_audit is append-only'; END; $$;
DROP TRIGGER IF EXISTS vehicle_audit_no_update ON vehicle_audit;
CREATE TRIGGER vehicle_audit_no_update BEFORE UPDATE OR DELETE ON vehicle_audit FOR EACH ROW EXECUTE FUNCTION vehicle_audit_immutable();
COMMIT;
