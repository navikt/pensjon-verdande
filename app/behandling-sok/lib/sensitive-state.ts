/**
 * sessionStorage-lagring av sensitive kriterier (NAV-identer, behandlingsserie-UUID-er).
 * Sensitive kriterier holdes ute av URL for å unngå at de havner i historikk, deling, og logger.
 *
 * - Lagres keyed på en query-hash slik at de bare assosieres med eksakt samme søk.
 * - Begrenset volum (siste 20 query-hash) for å hindre uendelig vekst.
 * - Tømmes automatisk ved sessionStorage-utløp (slutt på fane / browser).
 */

import type { Kriterium } from './kriterier'

const STORAGE_KEY = 'verdande:behandling-sok:sensitive'
const MAX_ENTRIES = 20

type Lagring = Record<string, { kriterier: Kriterium[]; seq: number }>

let nesteSeq = 0
let nesteSeqInitialized = false

function initNesteSeqFraStorage(data: Lagring): void {
  if (nesteSeqInitialized) return
  let max = 0
  for (const entry of Object.values(data)) {
    if (typeof entry?.seq === 'number' && entry.seq > max) max = entry.seq
  }
  nesteSeq = max + 1
  nesteSeqInitialized = true
}
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function lesAlle(): Lagring {
  const s = getStorage()
  if (!s) return {}
  const raw = s.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Lagring
  } catch {
    // ignore corrupt data
  }
  return {}
}

function skrivAlle(data: Lagring): void {
  const s = getStorage()
  if (!s) return
  // Behold de MAX_ENTRIES nyeste — eldste forsvinner først (LRU på seq).
  const sortert = Object.entries(data).sort(([, a], [, b]) => b.seq - a.seq)
  const beholdt = Object.fromEntries(sortert.slice(0, MAX_ENTRIES))
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(beholdt))
  } catch {
    // QuotaExceeded — gi opp stille; ikke kritisk.
  }
}

export function lagreSensitive(queryHash: string, kriterier: Kriterium[]): void {
  if (kriterier.length === 0) {
    fjernSensitive(queryHash)
    return
  }
  const data = lesAlle()
  initNesteSeqFraStorage(data)
  const seq = nesteSeq++
  data[queryHash] = { kriterier, seq }
  skrivAlle(data)
}

export function hentSensitive(queryHash: string): Kriterium[] {
  const data = lesAlle()
  return data[queryHash]?.kriterier ?? []
}

export function fjernSensitive(queryHash: string): void {
  const data = lesAlle()
  delete data[queryHash]
  skrivAlle(data)
}

export function tomAlleSensitive(): void {
  const s = getStorage()
  if (s) s.removeItem(STORAGE_KEY)
  nesteSeq = 0
  nesteSeqInitialized = false
}
