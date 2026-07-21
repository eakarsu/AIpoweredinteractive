# Authoritative vehicle workflow runbook

Copy `.env.example`, install from lockfiles, and run `npm run migrate` from `backend/`. Start with `./start.sh backend`; it never installs, seeds, kills processes, or changes schema and refuses to run without `vehicle_cases`. The launcher derives a loopback-only CORS origin from `FRONTEND_PORT` when none is supplied. `VEHICLE_WEBHOOK_SECRET` remains mandatory outside `NODE_ENV=test`; the disposable test runtime receives a test-only value when one is absent.

Use `/api/authoritative/vehicle`. Users are tenant- and vehicle-scoped; consequential commands require recorded human approval. Configure BMW ConnectedDrive, service-shop, parts, recall, and notification adapters independently. Webhooks require the HMAC secret, provider event IDs are deduplicated, and outbound receipts must echo payload hashes.

Alert on safety-evaluation failure, stale queued work, retry spikes, dead letters, missing acknowledgements, recall webhook lag, and recovery failures. Fix the underlying adapter issue before replay and retain the same idempotency key. Legacy/generated/direct-AI endpoints are quarantined.

An owner or administrator can revoke processing consent on a case; revocation closes the case and dead-letters all undelivered commands. Expired records are excluded from reads, transitions, and execution. Administrators apply the approved retention schedule with the bounded, tenant-scoped `POST /api/authoritative/vehicle/retention/purge` operation.
