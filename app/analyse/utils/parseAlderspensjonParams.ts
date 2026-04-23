import { sub } from 'date-fns'
import { toIsoDate } from '~/common/date'
import type { Aggregeringsniva } from '../types'

export type AlderspensjonParams = {
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  /** Query string: `fom=...&tom=...&aggregering=...` */
  paramsAgg: URLSearchParams
}

const GYLDIGE_AGGREGERINGER: Aggregeringsniva[] = ['DAG', 'UKE', 'MAANED', 'KVARTAL', 'AAR']

/**
 * Parser for parametre til /api/sak/analyse/alderspensjon-mottakere.
 *
 * Endepunktet tar kun fom, tom og aggregering. Default er siste 24 måneder med
 * MAANED-aggregering, som passer typisk månedstidsserie-bruk fra Utbetaling.
 *
 * Ugyldig aggregering (eller verdier endepunktet ikke støtter, f.eks. MINUTT/TIME)
 * faller tilbake til MAANED. Hvis fom > tom, byttes de om for å unngå tom respons.
 */
export function parseAlderspensjonParams(request: Request): AlderspensjonParams {
  const url = new URL(request.url)
  const now = new Date()

  let fom = url.searchParams.get('fom') || toIsoDate(sub(now, { months: 24 }))
  let tom = url.searchParams.get('tom') || toIsoDate(now)
  if (fom > tom) {
    ;[fom, tom] = [tom, fom]
  }

  const rawAgg = url.searchParams.get('aggregering') as Aggregeringsniva | null
  const aggregering: Aggregeringsniva = rawAgg && GYLDIGE_AGGREGERINGER.includes(rawAgg) ? rawAgg : 'MAANED'

  const fomTimestamp = fom.includes('T') ? fom : `${fom}T00:00:00.000`
  const tomTimestamp = tom.includes('T') ? tom : `${tom}T23:59:59.999`

  const paramsAgg = new URLSearchParams({ fom: fomTimestamp, tom: tomTimestamp, aggregering })

  return { fom, tom, aggregering, paramsAgg }
}
