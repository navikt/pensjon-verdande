/**
 * Server-side cache for `/api/behandling/sok/metadata/{behandlingType}`.
 *
 * - TTL 60s — etter det refetcher vi alltid for å plukke opp ny `metadataVersion`.
 * - In-flight Promise-dedupe for å hindre thundering herd ved samtidige cache-miss.
 * - Per server-instans (best-effort i NAIS-multi-pod-deploy).
 */

import { apiGet } from '~/services/api.server'
import { logger } from '~/services/logger.server'

export type Kontrollpunkt = { kode: string; dekodeTekst: string }

export type BehandlingMetadata = {
  schemaVersion: string
  metadataVersion: string
  generatedAt: string
  behandlingType: string
  supportedAktivitetTyper: string[]
  observedAktivitetTyper: string[]
  behandlingStatuser: string[]
  ansvarligeTeam: string[]
  kravStatuser: string[]
  kontrollpunktTyper: Kontrollpunkt[]
  kravGjelderKoder: string[]
  sakstyper: string[]
  eierenheter: string[]
  kravhodeBehandlingTyper: string[]
}

const TTL_MS = 60_000

const cache = new Map<string, { data: BehandlingMetadata; fetchedAt: number }>()
const inFlight = new Map<string, Promise<BehandlingMetadata>>()

export async function hentBehandlingMetadata(behandlingType: string, request: Request): Promise<BehandlingMetadata> {
  const now = Date.now()
  const cached = cache.get(behandlingType)
  if (cached && now - cached.fetchedAt < TTL_MS) {
    return cached.data
  }

  const eksisterende = inFlight.get(behandlingType)
  if (eksisterende) return eksisterende

  const promise = apiGet<BehandlingMetadata>(
    `/api/behandling/sok/metadata/${encodeURIComponent(behandlingType)}`,
    request,
  )
    .then((data) => {
      cache.set(behandlingType, { data, fetchedAt: Date.now() })
      return data
    })
    .finally(() => {
      inFlight.delete(behandlingType)
    })

  inFlight.set(behandlingType, promise)
  return promise
}

export type BehandlingstyperResponse = {
  schemaVersion?: string
  metadataVersion?: string
  generatedAt?: string
  behandlingTyper: string[]
}

const TYPER_TTL_MS = 60_000
let typerCache: { data: string[]; fetchedAt: number } | null = null
let typerInFlight: Promise<string[]> | null = null

export async function hentBehandlingstyper(request: Request): Promise<string[]> {
  const now = Date.now()
  if (typerCache && now - typerCache.fetchedAt < TYPER_TTL_MS) {
    return typerCache.data
  }
  if (typerInFlight) return typerInFlight

  typerInFlight = apiGet<BehandlingstyperResponse>('/api/behandling/sok/metadata/typer', request)
    .then((res) => {
      const data = res?.behandlingTyper ?? []
      logger.info(`behandling-sok: hentet ${data.length} behandlingstyper`)
      typerCache = { data, fetchedAt: Date.now() }
      return data
    })
    .finally(() => {
      typerInFlight = null
    })

  return typerInFlight
}

/** Test-helper for å nullstille cache mellom tester. */
export function _resetCache() {
  cache.clear()
  inFlight.clear()
  typerCache = null
  typerInFlight = null
}
