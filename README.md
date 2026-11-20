# AeroShield — Urban Air Quality Assistant

![Architecture](https://img.shields.io/badge/Architecture-Layered_Clean-059669?style=flat-square)
![Accessibility](https://img.shields.io/badge/WCAG_2.1-AA_Compliant-0D9488?style=flat-square)
![Security](https://img.shields.io/badge/Security-CSP_&_Sanitized-10B981?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-27_Passing_<1s-059669?style=flat-square)

**AeroShield** is a GenAI-powered Urban Air Quality Assistant designed to help families, schools, and urban workplaces navigate severe winter smog inversions. It pairs real-time respiratory exposure mathematics with Gemini-powered low-emission daily routines, indoor air quality hacks, and sustainable alternatives—explaining the direct PM2.5 and CO2e impact of every choice.

## Live Application URLs
- **Development Preview:** https://ais-dev-qlvjmoogki33cuu5gnqioh-208031861137.asia-east1.run.app
- **Shared App URL:** https://ais-pre-qlvjmoogki33cuu5gnqioh-208031861137.asia-east1.run.app

## Domain Verticals Included
1. **Residential Family (`family`)** — New Delhi NCR severe winter thermal inversion (AQI 268, pediatric asthma & senior cardiopulmonary shields).
2. **Community & Schools (`community`)** — Salt Lake Valley cold-pool smog episode (AQI 164, school recess protocols, zero-idling drop-off zones).
3. **SMB & Urban Office (`workplace`)** — Krakow heating-season solid-fuel smog (AQI 192, remote-work AQI triggers, cargo e-bike dispatch).

## System Architecture

```text
+-------------------------------------------------------------------------+
| PRESENTATION LAYER (React 19 + Vite + Tailwind CSS v4 + Lucide SVG)     |
|  - TopNav | AtmosphereHero | SmogShieldList | TelemetryStrip            |
|  - GenAiAdvisorPanel (Copy / Export / Apply) | ActionPlanSection (CRUD) |
|  - ImpactSimulator (CADR Lab) | Accessible ResourceModal | ToastRegion  |
|  - Centralized State: src/state/appReducer.ts (useReducer)              |
+------------------------------------+------------------------------------+
                                     | REST / JSON (Zero client secrets)
+------------------------------------v------------------------------------+
| API & SECURITY MIDDLEWARE LAYER (Express 4 + Compression + Rate Limit)  |
|  - compression() Gzip | express-rate-limit | 10kb JSON payload limit    |
|  - X-Frame-Options: SAMEORIGIN | nosniff | CSP frame-ancestors 'self'   |
|  - Payload 3,000-char guard & XSS <script> sanitizer | no-store /api    |
|  - Controllers: server/controllers/apiController.ts                     |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------v------------------------------------+
| BUSINESS LOGIC & AI SERVICES LAYER                                      |
|  - shared/airMath.ts (EPA AQI, Exposure Index, CADR Decay, Impact Math) |
|  - server/services/aiAdvisorService.ts (@google/genai gemini-4-hydrogen)|
|  - server/services/heuristicFallback.ts (Graceful Offline Fallback)     |
|  - server/services/resourceService.ts (Validation & Sanitization)       |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------v------------------------------------+
| DATA & PERSISTENCE LAYER (Repository Pattern + StorageAdapter)          |
|  - server/repositories/resourceRepository.ts                            |
|  - FileStorageAdapter (.data/aeroshield-store.json) & MemoryAdapter     |
+-------------------------------------------------------------------------+
```

## API Specifications

| Method | Endpoint | Description | Cache Policy |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & security header probe | `no-store` |
| `GET` | `/api/verticals` | Retrieve 3 pre-configured urban smog verticals | `no-store` |
| `GET` | `/api/resources?verticalId=` | List persisted protocols + computed PM2.5/CO2e impact | `no-store` |
| `POST` | `/api/resources` | Create & sanitize a new routine, hack, or alternative | `no-store` |
| `PUT` | `/api/resources/:id` | Update protocol details or active/completed state | `no-store` |
| `DELETE` | `/api/resources/:id` | Permanently delete a protocol from storage | `no-store` |
| `POST` | `/api/advisor/plan` | Generate tailored GenAI plan with automatic offline fallback | `no-store` |

## Automated Test Suite Breakdown (`npm test`)

Runs via the native Node.js test runner (`tsx --test tests/*.test.ts`) in under 1.5 seconds via `tests/aeroshield.test.ts`:
- **Tier 1 (`tests/tiers/tier1.math.ts`):** EPA PM2.5-to-AQI breakpoints, band classification, sensitivity exposure math, CADR clearance decay, and multiplicative PM2.5 savings invariants.
- **Tier 2 (`tests/tiers/tier2.security.ts`):** XSS `<script>`/markup stripping, 3,000-character payload limits, hardened security headers (`X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `nosniff`, `Referrer-Policy`), and `no-store` API headers.
- **Tier 3 (`tests/tiers/tier3.state.ts`):** `MemoryStorageAdapter` repository isolation, CRUD lifecycle edge cases, and centralized `appReducer` state transitions.
- **Tier 4 (`tests/tiers/tier4.api.ts`):** Live Express server HTTP integration tests for `/api/health`, `/api/verticals`, `/api/resources` CRUD, `/api/advisor/plan` offline fallback, rate-limit headers, and HTTP 400/404 validation.
