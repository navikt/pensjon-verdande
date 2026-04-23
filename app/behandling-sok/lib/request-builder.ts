/**
 * Bygger backend-request body fra (behandlingType + kriterier + visnings-parametre).
 * Filtrerer bort tomme kriterier slik at backend ikke får meningsløse felter.
 */

import type { Kriterium } from './kriterier'
import type { Aggregering, Tidsdimensjon } from './url-state'

export const SCHEMA_VERSION = '1'

function harInnhold(k: Kriterium): boolean {
  switch (k.type) {
    case 'HAR_STATUS':
    case 'KRAVHODE_HAR_STATUS':
      return k.statuser.length > 0
    case 'HAR_PRIORITET':
      return k.prioriteter.length > 0
    case 'HAR_ANSVARLIG_TEAM':
      return k.team.length > 0
    case 'OPPRETTET_AV':
      return k.identer.length > 0
    case 'HAR_AKTIVITET_AV_TYPE':
      return k.aktivitetTyper.length > 0
    case 'KRAVHODE_HAR_KONTROLLPUNKT':
      return k.kontrollpunktTyper.length > 0
    case 'KRAV_GJELDER':
      return k.koder.length > 0
    case 'SAK_HAR_TYPE':
      return k.sakstyper.length > 0
    case 'KRAV_HAR_EIERENHET':
      return k.eierenheter.length > 0
    case 'TILHORER_BEHANDLINGSSERIE':
      return k.uuid.length > 0
    case 'OPPRETTET_I_PERIODE':
    case 'FULLFORT_I_PERIODE':
    case 'STOPPET_I_PERIODE':
    case 'SIST_KJORT_I_PERIODE':
      return k.fom.length > 0 && k.tom.length > 0
    default:
      return true
  }
}

export function rensKriterier(kriterier: Kriterium[]): Kriterium[] {
  return kriterier.filter(harInnhold)
}

export type TreffRequest = {
  schemaVersion: string
  behandlingType: string
  kriterier: Kriterium[]
  limit: number
  cursor: { opprettet: string; behandlingId: number } | null
}

export function buildTreffRequest(
  behandlingType: string,
  kriterier: Kriterium[],
  cursor: { opprettet: string; behandlingId: number } | null,
  limit = 100,
): TreffRequest {
  return {
    schemaVersion: SCHEMA_VERSION,
    behandlingType,
    kriterier: rensKriterier(kriterier),
    limit,
    cursor,
  }
}

export type AntallOverTidRequest = {
  schemaVersion: string
  behandlingType: string
  kriterier: Kriterium[]
  aggregering: Aggregering
  tidsdimensjon: Tidsdimensjon
}

export function buildAntallOverTidRequest(
  behandlingType: string,
  kriterier: Kriterium[],
  aggregering: Aggregering,
  tidsdimensjon: Tidsdimensjon,
): AntallOverTidRequest {
  return {
    schemaVersion: SCHEMA_VERSION,
    behandlingType,
    kriterier: rensKriterier(kriterier),
    aggregering,
    tidsdimensjon,
  }
}
