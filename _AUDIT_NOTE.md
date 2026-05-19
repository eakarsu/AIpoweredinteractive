# Audit Note — AIpoweredinteractive

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_06.md` section #28.

## Original Recommendations

### Gaps — AI Counterparts
- `/maintenance-predict` (added)
- `/recall-impact-assess` (added)
- `/service-quality-predict`

### Gaps — Non-AI Features
- Vehicle API integration (BMW ConnectedDrive, Tesla, OBD2)
- Parts ordering (retailer integration)
- Service shop scheduling
- Appointment booking

### Custom Feature Suggestions
1. Agentic vehicle health monitoring (OBD2)
2. Computer vision damage assessment
3. Recall proactive management
4. Smart maintenance scheduling
5. Parts compatibility optimization

## Implemented (Mechanical)
- `POST /api/ai/maintenance-predict` — added in `backend/routes/ai.js`. Pulls maintenance history (or accepts inline) and returns next-service predictions with mileage/day windows, urgency, and cost estimates. Persists to `ai_conversations`.
- `POST /api/ai/recall-impact-assess` — added in `backend/routes/ai.js`. Pulls recalls (or accepts inline list) and returns affected/non-applicable recalls with urgency. Persists to `ai_conversations`.

Both follow the existing OpenRouter pattern + `ai_conversations` persistence.

## Backlog (deferred)

### NEEDS-CREDS / NEW-DEPS
- OBD2 / vehicle telematics (Tesla, BMW, Ford APIs).
- NHTSA recall feed scraper.
- Parts-retailer APIs (RockAuto, AutoZone).
- Service-shop appointment APIs (manufacturer dealer networks).

### NEEDS-PRODUCT-DECISION
- `/service-quality-predict` — needs labor-time data source (Mitchell, Chilton).
- Parts compatibility model (data licensing).

### TOO-RISKY
- Computer vision damage assessment (cost + accuracy claims).
- Agentic vehicle health monitor (real-time stream + alert routing).

## Apply pass 3 (frontend)

- **Stack:** React frontend / Express backend.
- **Backend endpoints in scope:** `POST /api/ai/maintenance-predict`, `POST /api/ai/recall-impact-assess` (added in pass 2).
- **Action:** LEFT-AS-IS — FE already wired.
- **Evidence:** `frontend/src/pages/MaintenancePredict.js` and `RecallImpactAssess.js` already submit forms with JWT Bearer header (`localStorage.getItem('token')`), render parsed/markdown responses, and are routed at `/ai-maintenance-predict` and `/ai-recall-impact` in `frontend/src/App.js`.
- **Files written/modified:** none.
