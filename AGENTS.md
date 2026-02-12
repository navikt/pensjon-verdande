# AGENTS.md (pensjon-verdande)

Denne filen beskriver hvordan en automatisert kodeagent (og mennesker) bør jobbe i `pensjon-verdande`.

## Prosjektoversikt
- App: React Router 7 (Framework Mode / data routers) + TypeScript
- UI: Nav Designsystem (Aksel, Darkside) `@navikt/ds-react` / `@navikt/ds-css`
- Server: Node/Express (`server.ts`), React Router server build
- Tester: `vitest`

## Viktige mapper
- `app/` – React Router routes, komponenter, services og felleskode
  - `app/behandling/` – behandling-relatert UI og routes
  - `app/services/` – server-side API-klienter, auth, env
  - `app/common/` – delte util-funksjoner (bl.a. feilnormalisering)
- `public/` – statiske assets
- `build/` – generert build-output (skal normalt ikke endres manuelt)

## Kjøring lokalt
Fra repo-roten:

```zsh
npm install
npm run dev
```

### Node-versjon
Prosjektet forventer Node-versjon i henhold til `package.json -> engines`.
Hvis du får rare build/typecheck-feil, sjekk at du kjører riktig Node.

## Bygg og kvalitetssjekker
Kjør alltid disse før du leverer større endringer:

```zsh
npm run typecheck
npm run test
npm run build
```

### Typegen / `+types`
`npm run typecheck` kjører `react-router typegen`. Typene under `app/**/+types/*` kan være genererte og er ikke nødvendigvis sjekket inn.

## Linting og formattering (Biome)
Prosjektet bruker **Biome** for både linting og formattering (se `biome.json`).

Vanlige kommandoer:

```zsh
npm run check
npm run lint
npm run format
```

Auto-fix:

```zsh
npm run check:fix
npm run lint:fix
npm run format:fix
```

### Tips ved feilsøking
- Mange feil fra backend blir kastet via React Router `throw data(...)` og kan komme som `DataWithResponseInit`.
  - Bruk helperne i `app/common/error.ts`, spesielt `toNormalizedError(err)`.
  - Merk: status kan ligge i både `e.data.status` og/eller `e.init.status` (avhengig av hvor feilen kommer fra).

### Pre-commit hooks (Lefthook)
Repoet bruker Lefthook (`lefthook.yml`). Hvis hooks feiler: kjør samme kommando lokalt (typisk `npm run check` og/eller `npm run typecheck`).

## Kodekonvensjoner
- Foretrekk små, isolerte endringer i eksisterende filer. Unngå store refactors uten behov.
- Bevar eksisterende stil (semi: false, singleQuote: true) og imports.
- Unngå å sende sensitiv info i URL (query params). Bruk POST body ved behov.

## React Router patterns

### Typegen (auto-genererte typer)
Kodebasen bruker React Router typegen for typesikre route-moduler. Bruk alltid typegen-typene:

```tsx
// ✅ Riktig — bruk Route-typer fra +types
import type { Route } from './+types/min-route'

export const loader = async ({ request }: Route.LoaderArgs) => { ... }
export const action = async ({ request }: Route.ActionArgs) => { ... }

export default function MinSide({ loaderData, actionData }: Route.ComponentProps) { ... }

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [{ title: 'Sidenavn | Verdande' }]
}
```

```tsx
// ❌ Feil — IKKE bruk generiske typer eller hooks
import type { LoaderFunctionArgs } from 'react-router'
const data = useLoaderData<typeof loader>()  // Ikke bruk dette
```

### root.tsx og Layout
- `root.tsx` har en `Layout`-export som wrapper hele HTML-dokumentet (inkl. `<head>`, `<Scripts>`, etc.)
- `Layout` bruker `useRouteLoaderData('root')` (returnerer `undefined` når loader feiler — trygt for ErrorBoundary)
- `ErrorBoundary` i root.tsx rendres automatisk innenfor `Layout`

### Sidetitler (meta)
- Alle routes har `meta()`-eksport med format `'Sidenavn | Verdande'`
- Bruk `Route.MetaArgs` for typesikker tilgang til `loaderData` i meta

### Loading-indikator
- `layout.tsx` har en global loading-bar som vises ved navigasjon (`useNavigation()`)
- Ikke legg til egne loading-indikatorer for sidenavigasjon — den globale dekker dette

### Loaders og actions
- `loader` henter data server-side
- `action` håndterer POST/sideeffekter
- Foretrekk vanlig form submit (`<Form method="post">`) når submit skal navigere/refresh'e data naturlig.
- Bruk `useFetcher()` når du eksplisitt ønsker submit uten navigasjon (f.eks. inline-knapper, modaler, autosave).
- For on-demand data i UI (f.eks. når en modal åpnes):
  - Foretrekk `fetcher.load()` mot en **resource route** (en route som kun har `loader` og returnerer data).
  - La resource-routen kalle backend via `api.server.ts` så auth/timeout/feilnormalisering blir lik resten av appen.
- Ved HTTP-feil (f.eks. 422) som skal håndteres i UI:
  - Fang i `loader` via `try/catch`
  - Bruk `toNormalizedError(e)?.status` for å avgjøre flyt

### Imports (unngå dynamisk import i routes)
- **Unngå** `await import(...)` inne i `loader`/`action` med mindre du har en tydelig, dokumentert grunn.
  - I praksis gir det ofte **ingen** chunk-/bundle-gevinst i dette repoet, og kan trigge Vite-advarsel om at en modul er både dynamisk og statisk importert.
- Foretrekk **statiske imports** på toppnivå:
  - `import { requireAccessToken } from '~/services/auth.server'`
  - `import { someServerFn } from '~/.../*.server'`
- Unntak: Moduler som *må* lazy-loades og som **ikke** er statisk importert andre steder (må verifiseres), eller spesielle runtime-behov.

## API-kall (server-side)
- Foretrekk metodene i `app/services/api.server.ts` (`apiGet`, `apiPost`, `apiGetOrUndefined`, `apiGetRawStringOrUndefined`) fremfor å bruke `fetch` direkte.
  - Gir konsistent auth (`requireAccessToken`), tidsavbrudd, headers og feilnormalisering via `normalizeAndThrow`.
  - Bruk kun `fetch` direkte når du har en god grunn (f.eks. streaming/binary eller helt spesielle behov), og sørg da for samme nivå av timeout og feilhåndtering.

## Nav Designsystem (Aksel)
- Bruk komponenter fra `@navikt/ds-react`.
- Bruk Darkside versjonen
- Legg til rette for at utseende fungerer både med darkmode og lightmode

## Når du legger til nye avhengigheter
- Bekreft med lead på driftsplattform at det er greit å innføre den nye avhengigheten.
- Foretrekk egne metoder enn å innføre en avhengighet for å løse et lite behov.
- Hold deg til prosjektets `npm`-økosystem.
- Oppdater `package.json` og la lockfil (hvis tilstede) oppdateres konsekvent.
- Unngå store nye deps hvis en liten util kan løse behovet.

## Sikkerhet
- Ikke logg tokens/hemmeligheter.
- Ikke legg sensitive data i URL eller klient-side storage.

## Definition of Done (DoD)
- Typecheck er grønn
- Tester er grønne (der det finnes)
- `npm run build` er grønn
- Endringen er dokumentert kort i PR-beskrivelse (hva/hvorfor) og evt. i README/kommentar ved behov
