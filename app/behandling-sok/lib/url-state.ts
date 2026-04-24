/**
 * Serialisering av committed søk-tilstand til/fra URL.
 *
 * Sensitive kriterier (NAV-identer, behandlingsserie-UUID-er) holdes utenfor URL og lagres i
 * sessionStorage; se `sensitive-state.ts`.
 */

import { erKjentKriterieType, KRITERIE_DEFINISJONER, type KriterieType, type Kriterium } from './kriterier'

export type Visning = 'treff' | 'antall-over-tid'
export type Aggregering = 'DAG' | 'UKE' | 'MAANED' | 'KVARTAL' | 'AAR'
export type Tidsdimensjon = 'OPPRETTET' | 'FULLFORT' | 'STOPPET' | 'SISTE_KJORING'

export const ALLE_AGGREGERINGER: Aggregering[] = ['DAG', 'UKE', 'MAANED', 'KVARTAL', 'AAR']
export const ALLE_TIDSDIMENSJONER: Tidsdimensjon[] = ['OPPRETTET', 'FULLFORT', 'STOPPET', 'SISTE_KJORING']

export type CommittedState = {
  behandlingType: string | null
  /** Kun ikke-sensitive kriterier — sensitive merges inn fra sessionStorage. */
  ikkeSensitiveKriterier: Kriterium[]
  visning: Visning
  aggregering: Aggregering
  tidsdimensjon: Tidsdimensjon
}

export type DeserializeResult = {
  state: CommittedState
  ukjenteKriterier: { type: string; raw: unknown }[]
  feil: string | null
}

export const DEFAULT_STATE: CommittedState = {
  behandlingType: null,
  ikkeSensitiveKriterier: [],
  visning: 'treff',
  aggregering: 'MAANED',
  tidsdimensjon: 'OPPRETTET',
}

/** Maks lengde på `?q=`-payload før vi advarer. */
export const MAX_Q_LENGTH = 1500

function base64UrlEncode(str: string): string {
  // btoa krever Latin1; bruk Buffer for å være safe i node (server-side).
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  // biome-ignore lint/suspicious/noExplicitAny: btoa typed as global in browser
  const b64 = (globalThis as any).btoa(unescape(encodeURIComponent(str)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): string | null {
  try {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((str.length + 2) % 4)
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8')
    }
    // biome-ignore lint/suspicious/noExplicitAny: atob typed as global in browser
    return decodeURIComponent(escape((globalThis as any).atob(padded)))
  } catch {
    return null
  }
}

export function fjernSensitive(kriterier: Kriterium[]): Kriterium[] {
  return kriterier.filter((k) => !KRITERIE_DEFINISJONER[k.type].sensitiv)
}

export function plukkSensitive(kriterier: Kriterium[]): Kriterium[] {
  return kriterier.filter((k) => KRITERIE_DEFINISJONER[k.type].sensitiv)
}

/**
 * Per-type runtime-validering for å hindre at crafted URL-er gir kriterier med feil shape
 * (f.eks. `{ type: 'OPPRETTET_AV', identer: 'noe' }` der `identer.map` ville krasje editoren).
 * Returnerer null hvis raw ikke matcher forventet shape.
 */
// biome-ignore lint/suspicious/noExplicitAny: validerer ukjent shape — `any` er tilsiktet her
function validateKriteriumShape(raw: any): Kriterium | null {
  if (!raw || typeof raw !== 'object' || typeof raw.type !== 'string') return null
  const isStr = (v: unknown): v is string => typeof v === 'string'
  const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
  const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)
  const isNumArr = (v: unknown): v is number[] => Array.isArray(v) && v.every(isNum)
  const isOp = (v: unknown): v is 'AND' | 'OR' => v === 'AND' || v === 'OR'

  switch (raw.type as KriterieType) {
    case 'OPPRETTET_I_PERIODE':
    case 'FULLFORT_I_PERIODE':
    case 'STOPPET_I_PERIODE':
    case 'SIST_KJORT_I_PERIODE':
      return isStr(raw.fom) && isStr(raw.tom) ? { type: raw.type, fom: raw.fom, tom: raw.tom } : null
    case 'HAR_STATUS':
    case 'KRAVHODE_HAR_STATUS':
      return isStrArr(raw.statuser) ? { type: raw.type, statuser: raw.statuser } : null
    case 'HAR_PRIORITET':
      return isNumArr(raw.prioriteter) ? { type: 'HAR_PRIORITET', prioriteter: raw.prioriteter } : null
    case 'HAR_ANSVARLIG_TEAM':
      return isStrArr(raw.team) ? { type: 'HAR_ANSVARLIG_TEAM', team: raw.team } : null
    case 'OPPRETTET_AV':
      return isStrArr(raw.identer) ? { type: 'OPPRETTET_AV', identer: raw.identer } : null
    case 'ER_BATCH':
      return isBool(raw.verdi) ? { type: 'ER_BATCH', verdi: raw.verdi } : null
    case 'TILHORER_BEHANDLINGSSERIE':
      return isStr(raw.uuid) ? { type: 'TILHORER_BEHANDLINGSSERIE', uuid: raw.uuid } : null
    case 'HAR_AKTIVITET_AV_TYPE':
      return isStrArr(raw.aktivitetTyper) && isOp(raw.operator)
        ? { type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: raw.aktivitetTyper, operator: raw.operator }
        : null
    case 'AKTIVITET_KJORT_FLERE_GANGER_ENN':
      return isNum(raw.terskel) ? { type: 'AKTIVITET_KJORT_FLERE_GANGER_ENN', terskel: raw.terskel } : null
    case 'HAR_AAPEN_MANUELL_BEHANDLING':
      return { type: 'HAR_AAPEN_MANUELL_BEHANDLING' }
    case 'HAR_AAPEN_BREVBESTILLING':
      return { type: 'HAR_AAPEN_BREVBESTILLING' }
    case 'HAR_FEILET_KJORING':
      return raw.siden === null || raw.siden === undefined || isStr(raw.siden)
        ? { type: 'HAR_FEILET_KJORING', siden: raw.siden ?? null }
        : null
    case 'KRAVHODE_HAR_KONTROLLPUNKT':
      return isStrArr(raw.kontrollpunktTyper) && isOp(raw.operator)
        ? { type: 'KRAVHODE_HAR_KONTROLLPUNKT', kontrollpunktTyper: raw.kontrollpunktTyper, operator: raw.operator }
        : null
    case 'KRAVHODE_HAR_BEHANDLINGTYPE':
      return isStrArr(raw.behandlingTyper)
        ? { type: 'KRAVHODE_HAR_BEHANDLINGTYPE', behandlingTyper: raw.behandlingTyper }
        : null
    case 'KONTROLLPUNKT_ER_KRITISK':
      return { type: 'KONTROLLPUNKT_ER_KRITISK' }
    case 'KRAV_GJELDER':
      return isStrArr(raw.koder) ? { type: 'KRAV_GJELDER', koder: raw.koder } : null
    case 'SAK_HAR_TYPE':
      return isStrArr(raw.sakstyper) ? { type: 'SAK_HAR_TYPE', sakstyper: raw.sakstyper } : null
    case 'KRAV_HAR_EIERENHET':
      return isStrArr(raw.eierenheter) ? { type: 'KRAV_HAR_EIERENHET', eierenheter: raw.eierenheter } : null
    default:
      return null
  }
}

export function serializeStateToSearchParams(state: {
  behandlingType: string | null
  kriterier: Kriterium[]
  visning: Visning
  aggregering: Aggregering
  tidsdimensjon: Tidsdimensjon
}): URLSearchParams {
  const sp = new URLSearchParams()
  if (state.behandlingType) sp.set('behandlingType', state.behandlingType)
  if (state.visning !== DEFAULT_STATE.visning) sp.set('visning', state.visning)
  if (state.visning === 'antall-over-tid') {
    if (state.aggregering !== DEFAULT_STATE.aggregering) sp.set('aggregering', state.aggregering)
    if (state.tidsdimensjon !== DEFAULT_STATE.tidsdimensjon) sp.set('tidsdimensjon', state.tidsdimensjon)
  }
  const ikkeSensitive = fjernSensitive(state.kriterier)
  if (ikkeSensitive.length > 0) {
    const json = JSON.stringify(ikkeSensitive)
    sp.set('q', base64UrlEncode(json))
  }
  return sp
}

export function deserializeStateFromSearchParams(sp: URLSearchParams): DeserializeResult {
  const ukjente: { type: string; raw: unknown }[] = []
  let feil: string | null = null

  const behandlingType = sp.get('behandlingType') || null
  const visningRaw = sp.get('visning')
  const visning: Visning = visningRaw === 'antall-over-tid' ? 'antall-over-tid' : 'treff'
  const aggregeringRaw = sp.get('aggregering')
  const aggregering: Aggregering = ALLE_AGGREGERINGER.includes(aggregeringRaw as Aggregering)
    ? (aggregeringRaw as Aggregering)
    : DEFAULT_STATE.aggregering
  const tidsdimensjonRaw = sp.get('tidsdimensjon')
  const tidsdimensjon: Tidsdimensjon = ALLE_TIDSDIMENSJONER.includes(tidsdimensjonRaw as Tidsdimensjon)
    ? (tidsdimensjonRaw as Tidsdimensjon)
    : DEFAULT_STATE.tidsdimensjon

  const ikkeSensitiveKriterier: Kriterium[] = []
  const q = sp.get('q')
  if (q) {
    const decoded = base64UrlDecode(q)
    if (!decoded) {
      feil = 'Søkeparameteren q kunne ikke dekodes'
    } else {
      try {
        const parsed = JSON.parse(decoded)
        if (!Array.isArray(parsed)) {
          feil = 'Søkeparameteren q er ikke et array'
        } else {
          for (const raw of parsed) {
            if (raw && typeof raw === 'object' && 'type' in raw) {
              const type = String((raw as { type: unknown }).type)
              if (erKjentKriterieType(type)) {
                const validert = validateKriteriumShape(raw)
                if (validert) {
                  ikkeSensitiveKriterier.push(validert)
                } else {
                  // Kjent type, men shape er feil — fail loud (crafted URL).
                  ukjente.push({ type, raw })
                }
              } else {
                ukjente.push({ type, raw })
              }
            } else {
              feil = 'Et kriterium mangler type-felt'
            }
          }
        }
      } catch {
        feil = 'Søkeparameteren q er ikke gyldig JSON'
      }
    }
  }

  return {
    state: {
      behandlingType,
      ikkeSensitiveKriterier,
      visning,
      aggregering,
      tidsdimensjon,
    },
    ukjenteKriterier: ukjente,
    feil,
  }
}

/**
 * Stabil hash av committed-state for bruk som key i sessionStorage og useEffect-deps.
 * Bruker JSON.stringify med sortert array-order; ikke kryptografisk sikker.
 */
export function hashCommittedState(state: CommittedState): string {
  const normalized = {
    bt: state.behandlingType,
    v: state.visning,
    a: state.aggregering,
    t: state.tidsdimensjon,
    k: state.ikkeSensitiveKriterier,
  }
  return JSON.stringify(normalized)
}
