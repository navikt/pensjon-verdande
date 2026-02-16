# Copilot Instructions for pensjon-verdande

## Repository Overview
Verdande is a web application for monitoring, debugging, and developing treatments in NAV's pension and disability benefits system (pensjon-pen). Built with React Router 7 (Framework Mode), TypeScript, Node.js/Express, and Nav Designsystem (Aksel). The codebase has ~18,000 lines of TypeScript/TSX.

**Tech Stack:**
- **Frontend**: React Router 7 (data routers), React 19, TypeScript
- **UI**: Nav Designsystem (`@navikt/ds-react`, `@navikt/ds-css` Darkside)
- **Backend**: Node.js/Express, React Router SSR
- **Testing**: Vitest
- **Linting/Formatting**: Biome
- **Build**: Vite, React Router build system
- **Deployment**: NAIS (NAV's Kubernetes platform), Docker

## Critical Setup Requirements

### Node Version Requirement (CRITICAL)
**ALWAYS use Node.js >= 24.11.0**. The project has `engine-strict=true` in `.npmrc`, making this non-negotiable.
- Check Node version: `node --version`
- Package.json engines field: `"node": ">=24.11.0"`
- CI uses Node 24
- **npm install WILL FAIL** with Node < 24.11.0

### Environment Setup
Local development requires secrets from Kubernetes:
```bash
npm install
./fetch-secrets.sh  # Creates .env file with Azure AD & backend URLs
npm run dev
```
The `fetch-secrets.sh` script requires `kubectl`, `gcloud`, `base64`, and NAIS device connection.

## Build and Validation Commands

### Installation
```bash
npm ci  # Use in CI or for clean install
npm install  # For local development
```

### Development
```bash
npm run dev  # Start dev server on http://localhost:3000
```

### Type Checking
```bash
npm run typecheck  # MUST run before builds
```
This command:
1. Runs `node scripts/copy-server-dts.ts` (copies `types/build-server.d.ts` to `build/server/index.d.ts`)
2. Runs `react-router typegen` (generates types in `.react-router/types/`)
3. Runs `tsc` for TypeScript compilation check

**Important**: Generated types in `.react-router/types/` and `app/**/+types/` may not be checked in. ALWAYS run `typecheck` before build.

### Building
```bash
npm run build  # Builds client and server bundles to build/
```
Production build creates:
- `build/client/` - Client-side assets
- `build/server/` - Server bundle

### Testing
```bash
npm test  # Run Vitest tests
```
Only 2 test files exist currently:
- `app/common/decodeBehandling.test.ts`
- `app/alde-oppfolging/StatusfordelingOverTidBarChart/utils.test.ts`

### Linting and Formatting (Biome)
Biome is configured in `biome.json` and handles both linting and formatting:
```bash
npm run check      # Check linting + formatting
npm run check:fix  # Auto-fix issues
npm run lint       # Lint only
npm run lint:fix   # Auto-fix lint issues
npm run format     # Check formatting
npm run format:fix # Auto-fix formatting
```

**Biome Config Highlights:**
- Only checks `app/**` directory
- Quote style: single quotes
- Semicolons: as needed (minimal)
- Trailing commas: always
- Line width: 120

### Pre-commit Hooks (Lefthook)
Lefthook (`lefthook.yml`) runs on pre-commit:
1. `biome check --write` on staged files
2. `npm run typecheck`

If hooks fail locally, run the same commands manually.

### CI/CD Pipeline
GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. **Build job**: `npm ci && npm run typecheck && npm run build && npm prune --omit=dev`
2. Docker build and push to NAIS registry
3. Deploy to dev (q0, q1, q2, q5) and prod environments

**To replicate CI locally**:
```bash
npm ci
npm run typecheck
npm run build
```

## Project Structure

### Key Directories
```
.
├── app/                       # Main application code
│   ├── routes.ts              # Route definitions (React Router file-based)
│   ├── root.tsx               # Root layout component
│   ├── entry.client.tsx       # Client entry
│   ├── entry.server.tsx       # Server entry
│   ├── layout.tsx             # Main layout wrapper
│   ├── services/              # Server-side services (auth, API clients, env)
│   │   ├── api.server.ts      # API client with auth/timeout/error handling
│   │   ├── auth.server.ts     # Azure AD authentication
│   │   ├── env.server.ts      # Environment configuration
│   ├── common/                # Shared utilities
│   │   ├── error.ts           # Error normalization helpers
│   │   └── utils.ts           # Common utilities
│   ├── components/            # Shared React components
│   ├── behandling/            # Treatment-related routes and UI
│   └── [feature-folders]/     # Feature-specific code (alderspensjon, audit, etc.)
├── server.ts                  # Express server entry point
├── public/                    # Static assets (favicon, images)
├── build/                     # Generated build output (DO NOT edit manually)
├── .react-router/             # Generated React Router types (DO NOT edit)
├── types/                     # Type definitions
│   └── build-server.d.ts      # Server build types
├── scripts/
│   └── copy-server-dts.ts     # Copies types for typecheck
├── .nais/                     # NAIS deployment configs
├── biome.json                 # Biome config
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── react-router.config.ts     # React Router config
└── lefthook.yml               # Git hooks config
```

### TypeScript Path Aliases
`tsconfig.json` defines `~/` as alias for `./app/`:
```typescript
import { apiGet } from '~/services/api.server'
```

### Server-Side vs Client-Side Code
Files ending in `.server.ts` are server-only. Use `~/services/api.server.ts` for backend API calls.

## Coding Patterns and Conventions

### React Router Patterns

#### Typegen (auto-generated types)
The codebase uses React Router typegen for type-safe route modules. **Always use typegen types:**

```tsx
// ✅ Correct — use Route types from +types
import type { Route } from './+types/my-route'

export const loader = async ({ request }: Route.LoaderArgs) => { ... }
export const action = async ({ request }: Route.ActionArgs) => { ... }

export default function MyPage({ loaderData, actionData }: Route.ComponentProps) { ... }

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [{ title: 'Page Name | Verdande' }]
}
```

```tsx
// ❌ Wrong — do NOT use generic types or hooks
import type { LoaderFunctionArgs } from 'react-router'
const data = useLoaderData<typeof loader>()  // Don't use this
```

#### root.tsx Layout Export
- `root.tsx` exports a `Layout` component that wraps the entire HTML document (`<head>`, `<Scripts>`, etc.)
- `Layout` uses `useRouteLoaderData('root')` (returns `undefined` when loader fails — safe for ErrorBoundary)
- `ErrorBoundary` in root.tsx renders automatically within `Layout`

#### Page Titles (meta)
- All routes export `meta()` with format `'Page Name | Verdande'`
- Use `Route.MetaArgs` for type-safe access to `loaderData` in meta

#### Global Loading Indicator
- `layout.tsx` has a global loading bar shown during navigation (`useNavigation()`)
- Do not add per-page loading indicators for navigation — the global one handles this

#### Loaders and Actions
- **Loaders**: Fetch data server-side (`loader` function)
- **Actions**: Handle form submissions/mutations (`action` function)
- **Resource Routes**: Routes with only `loader` for on-demand data fetching
- **Form Submission**: Use `<Form method="post">` for navigation-based submits
- **Fetcher**: Use `useFetcher()` for non-navigation submits (modals, inline actions)

### API Calls (Server-Side) — CRITICAL
**ALWAYS use `app/services/api.server.ts` functions for ALL HTTP calls to the backend (pensjon-pen). NEVER use `fetch` directly or create custom fetch wrappers.**

Available functions:
- `apiGet<T>(path, requestCtx)` — GET with JSON response
- `apiGetOrUndefined<T>(path, requestCtx)` — GET where 404 returns `undefined`
- `apiGetRawStringOrUndefined(path, requestCtx)` — GET with text response
- `apiPost<T>(path, body, requestCtx)` — POST with JSON body
- `apiPut<T>(path, body, requestCtx)` — PUT with JSON body
- `apiPatch<T>(path, body, requestCtx)` — PATCH with JSON body
- `apiDelete<T>(path, requestCtx)` — DELETE without body
- `apiDelete<T>(path, body, requestCtx)` — DELETE with JSON body

`requestCtx` can be either `Request` (from loader/action args) or `{ accessToken: string }`.

**What NOT to do:**
- **Do NOT use `fetch()` directly** for backend calls.
- **Do NOT create custom fetch wrappers** (e.g., local `req()` functions). Use the `api.server.ts` functions instead.
- **Do NOT create thin `.server.ts` wrapper files** that just forward to `apiGet`/`apiPost`. Call `api.server.ts` directly in loader/action.
- **Avoid calling `requireAccessToken()` manually when you already have a `Request`** — prefer passing the `Request` directly to `api.server.ts`. Only obtain/pass `{ accessToken }` (via `requireAccessToken`) in helpers/services that don't have access to a `Request`.

**Why:** `api.server.ts` provides consistent auth, 15s timeout, error normalization via `normalizeAndThrow`, and network error handling (ECONNREFUSED → 503, timeout → 504). Direct `fetch` or custom wrappers typically lack timeout and proper error normalization.

**Exception:** Only use `fetch` directly with a documented reason (e.g., streaming, binary data, or calls to services other than pensjon-pen), and ensure equivalent timeout and error handling.

```tsx
// ✅ Correct — call api.server.ts directly in loader/action
import type { Route } from './+types/my-route'
import { apiGet, apiPost } from '~/services/api.server'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const data = await apiGet<MyType>('/api/my-endpoint', request)
  return { data }
}
```

```tsx
// ❌ Wrong — do NOT create custom fetch wrappers
async function req(url: string, init: RequestInit & { accessToken: string }) {
  const res = await fetch(url, { ... })  // Missing timeout, error normalization
  return res
}

// ❌ Wrong — do NOT use fetch directly for backend calls
const res = await fetch(`${env.penUrl}/api/...`, {
  headers: { Authorization: `Bearer ${token}` },
})

// ❌ Wrong — do NOT create thin .server.ts wrappers around api.server.ts
// (e.g., my-feature.server.ts that just forwards to apiGet/apiPost)
// Call apiGet/apiPost directly in loader/action instead.
export async function getData(request: Request) {
  return apiGet<MyType>('/api/my-endpoint', request)  // Unnecessary layer
}
```

> **Rule of thumb:** Call `apiGet`/`apiPost`/`apiPut` etc. directly in loader/action. Only extract to a `.server.ts` file when there is significant business logic (transformation, combining multiple calls, etc.) — not for simple pass-through calls.

Benefits: Consistent auth via `requireAccessToken`, 15s timeout, error normalization via `normalizeAndThrow`.

### Error Handling
Use helpers in `app/common/error.ts`:
- `toNormalizedError(err)` - Normalizes errors from various sources
- Check `e.data.status` and/or `e.init.status` for HTTP status codes
- Errors from React Router can be `DataWithResponseInit` or `ErrorResponse`

### Imports (CRITICAL)
**AVOID `await import(...)` in loaders/actions** unless absolutely necessary. Use static imports:
```typescript
import { requireAccessToken } from '~/services/auth.server'
```
Dynamic imports can trigger Vite warnings about modules being both dynamically and statically imported.

### Code Style
- **Semi**: false (no semicolons unless required)
- **Quotes**: single
- **Trailing commas**: always
- **Line width**: 120
- **Comments**: Only add if matching existing style or necessary for complex logic
- **Nav Designsystem**: Use components from `@navikt/ds-react`, support dark/light mode

### Security
- DO NOT log tokens/secrets
- DO NOT put sensitive data in URLs (use POST body)
- Use `requireAccessToken` for authenticated requests

## Common Issues and Workarounds

### Build/Typecheck Failures
1. **Always run `npm run typecheck` before `npm run build`**
2. If typecheck fails with missing types, ensure `.react-router/types/` is generated
3. Node version mismatch: Verify `node --version` >= 24.11.0

### Test Failures
- Only 2 test files exist; most features lack tests
- If adding features, tests are not strictly required but recommended

### Environment Issues
- Missing `.env` file: Run `./fetch-secrets.sh`
- Requires NAV infrastructure access (kubectl, gcloud, NAIS device)

## Definition of Done
Before submitting changes:
1. `npm run typecheck` passes
2. `npm run check` (Biome) passes
3. `npm run test` passes (if tests exist)
4. `npm run build` succeeds
5. Changes documented in PR description

## Additional Notes
- **AGENTS.md** contains team-specific Norwegian instructions (complementary to this file)
- Deployment targets: dev-gcp (q0, q1, q2, q5) and prod-gcp
- Server runs on port 8080 in production, 3000 in development
- Uses SSR by default (`ssr: true` in `react-router.config.ts`)
