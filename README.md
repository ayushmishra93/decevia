# Decevia

Next.js App Router, JavaScript, Tailwind, NextAuth v4 (Auth.js), Prisma and PostgreSQL. Existing dashboard telemetry is demonstration data; authentication and profile records are database-backed.

## Setup

1. Use Node.js 20+ and PostgreSQL 14+; create an empty `ghostshield` database and an application database user.
2. `npm ci`
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (PostgreSQL connection string), a random `AUTH_SECRET` (`openssl rand -base64 32`), and `NEXTAUTH_URL` (`http://localhost:3000` locally). Never commit `.env`.
4. `npm run db:generate` then `npm run db:migrate`. The checked-in initial migration creates all tables and unique indexes. For subsequent development schema changes use `npx prisma migrate dev --name descriptive_name`.
5. `npm run dev`. For production, run `npm run build` then `npm start` behind HTTPS. Use the actual HTTPS origin for `NEXTAUTH_URL`.

## OAuth setup

Create a Google OAuth web client, configure the consent screen/test users, and set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.

Create a GitHub OAuth App with callback `http://localhost:3000/api/auth/callback/github`; set `GITHUB_ID` / `GITHUB_SECRET`. Replace origins with your HTTPS deployment origin in production. Restart after changing environment variables. Provider buttons are disabled with a configuration label until both credentials exist.

Google must return `email_verified=true`. GitHub email addresses are checked server-side against `/user/emails` and must be verified. A missing verified address opens `/verify-email`, which directs the user to add and verify an email on GitHub, then retry. GitHub usernames are saved when compatible and available. All OAuth users must accept terms through `/complete-profile`; users without usernames select one there. Completion opens `/profile` with a welcome message. Returning OAuth sign-in opens `/dashboard`.

Auth.js's default rejection of automatic email-only account linking remains enabled. To connect a provider to an existing account, first sign in with the existing method and choose Connect on `/profile`. An account already attached to a different user cannot be connected. Disconnect cannot remove the last available sign-in method. Disconnecting locally does not revoke consent at the provider; users can revoke consent in provider settings.

## Sessions and validation

NextAuth Credentials requires JWT session strategy. Users and account connections are persisted with Prisma. The encrypted, HTTP-only, SameSite=Lax session cookie references a PostgreSQL Session row. Server-side decoding checks that row before authentication or OAuth linking. Logout deletes it, so replaying an old cookie cannot restore access. Remember me grants 30 days; otherwise server expiry is 8 hours. Cookies use Secure in production (HTTPS required). Password changes revoke all sessions.

Middleware provides early redirects; server layouts/pages and API handlers enforce database-validated authorization. Profile APIs whitelist editable fields and never return hashes or OAuth tokens. Zod validates requests server-side; names and profile text reject markup/control characters, image URLs require HTTPS. bcrypt cost is 12, with a 72-byte password maximum. Registration handles database uniqueness races. Signup navigates to the profile only after registration and a successful NextAuth sign-in; if sign-in fails, the user is told their account exists and to sign in again.

Rate limits use atomic PostgreSQL counters, including a per-email password-attempt limit. Requests share an IP bucket by default because arbitrary forwarded headers cannot be trusted. Behind a trusted proxy that overwrites `X-Forwarded-For`, optionally set `TRUST_PROXY=true`. Tune limits for deployment traffic. Periodically delete expired `RateLimit` and `Session` rows; counters use fixed windows and do not require deletion to reset. Add infrastructure request-size limits. OAuth tokens are stored only server-side; restrict database access and encrypt storage/backups.

Profile photographs use user-supplied HTTPS image URLs. The browser loads them directly; the server does not fetch arbitrary URLs. Terms/privacy pages provide basic deployment text; replace with your organization's approved policy. Forgot password provides connected-provider and administrator recovery guidance. Self-service email password reset is not implemented because no email delivery service is configured.

## Verification

`npm run build` checks compilation. With a development server on port 3100 (`npm run dev -- --port 3100`), run `npm run test:auth`. Set `TEST_BASE_URL` for another port. Tests use the configured database, create one uniquely named test account and delete it afterward. They verify server validation, hashed storage, duplicate email/username rejection, invalid and valid login, profile/dashboard access, persistent edits, anonymous route redirects, logout deletion, and rejection of a replayed revoked cookie. Tests consume rate-limit attempts; repeated runs within 15 minutes may be throttled.

Manual OAuth acceptance checks (require real provider credentials and browser consent):

- New Google and GitHub accounts persist User and Account rows, complete profile, then show the welcome profile.
- Returning accounts open the dashboard; cancelled consent displays a safe error.
- A matching existing email is rejected until the owner signs in and connects explicitly.
- Missing/unverified GitHub email reaches the verification guidance; retry after provider verification succeeds.
- Connect/disconnect works and the last sign-in method cannot be removed.
- Mobile layout, password visibility, error announcements, keyboard focus and profile dropdown work in a browser.

References: [NextAuth Credentials](https://next-auth.js.org/providers/credentials), [OAuth account linking](https://next-auth.js.org/configuration/providers/oauth).

## Functional dashboard

The dashboard reuses `lib/auth.js`, the existing NextAuth session and the existing `User`, `Account` and `Session` tables. The additive migration `20260930000100_dashboard` introduces tenant-owned security records. It does not alter existing users or their roles. Original UI files replaced during implementation are saved locally under `.implementation-backup/` (ignored by Git).

### Start and migrate

```sh
npm install
npm run db:validate
npm run db:generate
npm run db:migrate
npm run dev
```

Use `SIMULATION_MODE=true` to enable the administrator simulation controls. The implementation added that setting without changing existing environment values. Keep it `false` in deployments that must not permit demonstrations. After login and any required existing profile completion, users enter `/dashboard`. The existing Google/GitHub configuration and account-linking protections remain unchanged.

Canonical routes are `/dashboard`, `/live-traffic`, `/attack-sessions`, `/ghost-environments`, `/threat-intelligence`, `/alerts`, `/system-architecture`, `/reports`, `/settings`, and `/profile`. Existing `/dashboard/*` links continue to work. API implementations live in `lib/platform/api.js`, served by `app/api/[...path]/route.js`; existing authentication/profile/account/signup routes keep their handlers.

### Assign the first administrator explicitly

No existing account is automatically promoted. Existing lowercase roles are interpreted case-insensitively; the current default `analyst` is preserved. In a trusted PostgreSQL console, inspect and select the exact existing user ID, then run a targeted update:

```sql
BEGIN;
SELECT id, email, role FROM users WHERE id = 'EXACT_EXISTING_USER_ID';
UPDATE users SET role = 'ADMIN' WHERE id = 'EXACT_EXISTING_USER_ID';
SELECT id, email, role FROM users WHERE id = 'EXACT_EXISTING_USER_ID';
COMMIT;
```

Verify the selected account before committing; use `ROLLBACK` if it is wrong. Use `ANALYST` for session/alert/report management or `VIEWER` for read-only dashboard access. Administrators manage assets, environments, API keys, detection settings and simulation. This is a **personal-workspace** ownership model: even administrators cannot access another user's records, and analyst assignment is to the current owner. Shared teams are not configured.

### Safe demonstration and seed

Start Simulation generates fictional documentation-range IP addresses and fictional locations. State is stored in PostgreSQL; advisory transaction locks prevent duplicate concurrent ticks. An open administrator dashboard requests a bounded tick every five seconds. Generation pauses when all administrator dashboards are closed; it is not a background sensor daemon. Stop Simulation stops future generation. Environment start/stop manages simulated environment availability; the main simulation controls generate traffic.

Every generated business record is marked `simulated: true`. Clear Simulated Data requires confirmation, stops generation and deletes only the current user's simulated records. It retains simulated parents that still have real dependents and records the cleanup itself in the audit log. Mixed reports remain; reports explicitly generated with simulated-only scope are eligible for cleanup. Commands and output are always inert stored text; replay does not execute them. No containers, shells or networking rules are deployed.

For deterministic historical charts, seed an **existing** administrator in development:

```sh
SIMULATION_MODE=true npm run db:seed -- --user EXISTING_ADMIN_ID --confirm
```

This creates 90 fictional events and related records over approximately seven days, without creating users. Repeated seeding is rejected until simulated data is cleared.

### Sensor ingestion and filtering

Create a real protected asset and an API key in Settings. The key is displayed once and stored only as a SHA-256 hash of a cryptographically random 256-bit secret. Revocation takes effect immediately. Use HTTPS outside localhost. The sensor supplies the owner's real asset ID:

```http
POST /api/traffic/ingest
Authorization: Bearer YOUR_INGESTION_KEY
Content-Type: application/json
Idempotency-Key: UNIQUE_REQUEST_ID_AT_LEAST_EIGHT_CHARACTERS

{"protectedAssetId":"YOUR_ASSET_ID","sourceIp":"198.51.100.24","sourceCountry":"Example","requestPath":"/login","requestMethod":"POST","protocol":"HTTPS","userAgent":"Sensor browser","eventType":"FAILED_LOGIN","metadata":{}}
```

All dashboard mutations require an `Idempotency-Key` header. Session-based mutations also require the application's same-origin `Origin` header. Request bodies are size-limited and validated with strict Zod schemas; roles and ownership are checked server-side. Reusing an idempotency key with different input returns 409. Generated key secrets are never stored in mutation receipts.

Traffic decisions are `ALLOW`, `MONITOR`, `DIVERT` or `BLOCK`. Sensor event status is `RECOMMENDED`: this version records the recommendation; it does not modify a real firewall or divert live network connections. Only simulated successful diversions count toward “Threats Diverted.” The success rate is successful diversions divided by DIVERT decisions in the selected range, or zero when there are no candidates. Protected Systems is the current count of active asset configurations. Health percentages indicate backend/simulator availability derived from stored observations, not a measured production uptime SLA.

List endpoints accept bounded `page`/`pageSize`, `q`, `range=today|7d|30d|custom|all`, ISO `from`/`to`, and page-specific filters. Ranges use UTC. Traffic additionally supports `riskMin`, `riskMax`, `decision`, `country`, `status`, `sort=timestamp|riskScore|sourceIp`, and `order=asc|desc`. CSV export is capped at 10,000 matching events; narrow the date range for larger datasets. Charts aggregate database records; time charts return up to 366 day buckets. Session timelines return up to 1,000 actions and report whether truncated. The dashboard polls safely, retries after errors and allows visual updates to be paused. `/api/traffic/stream` also returns an authenticated SSE snapshot with a five-second reconnect interval.

Reports save immutable JSON snapshots with separate PDF and CSV downloads. Each report type has its own sections; current health is explicitly labelled as captured at generation time. Recent-record sections are bounded; aggregate charts cover the selected date range. PDFs are self-contained text documents and fetch no external resources. CSV cells are protected against spreadsheet formula injection.

### Retention

Settings persist a per-user retention policy. Saving settings never deletes records. Schedule the maintenance command separately after reviewing its dry run:

```sh
npm run db:retention -- --user EXISTING_ADMIN_ID
# Explicitly apply only after reviewing the counts:
npm run db:retention -- --user EXISTING_ADMIN_ID --apply
```

It expires traffic, resolved alerts, completed sessions with no remaining references, read notifications and old idempotency receipts for that user. Reports, assets, users, authentication sessions and audit logs are retained. The maintenance command is not run automatically by this implementation.

### Verification

Use an isolated test server to avoid sharing the IDE development server's build output:

```sh
NEXT_DIST_DIR=.next-dashboard-test SIMULATION_MODE=true npm run dev -- --port 3100
# In another terminal:
npm run test:origin
npm run test:auth
npm run test:platform
npm run test:seed
npm run test:browser
npm run db:validate
npm run build
```

Tests use `TEST_BASE_URL` (default `http://localhost:3100`), create temporary accounts and clean up only their records. Platform tests verify that pre-existing identities, roles and password hashes remain unchanged. Browser tests use installed Google Chrome through Playwright and save screenshots under `test-results/`. Production builds must run separately from the test server's isolated output. Live Google/GitHub OAuth round-trips still require the configured provider accounts and user consent; automated tests exercise existing credentials login, database-backed session validation and logout without changing OAuth settings.
