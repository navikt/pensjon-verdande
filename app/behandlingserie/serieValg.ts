import { parseYmd, toYearMonth } from './seriekalenderUtils'

type DagIMaanedRegelType = 'BEFORE' | 'AFTER' | 'BEFORE_OR_EQUAL' | 'AFTER_OR_EQUAL'

type DagIMaanedRegel = {
    type: DagIMaanedRegelType
    dag: number
}

export type SerieValg = {
    dagIMaanedRegler: DagIMaanedRegel[]
    maksBehandlingerPerMnd: number
    ekskluderteMaaneder: number[]
    enableRangeVelger: boolean
}

export const DEFAULT_SERIE_VALG: SerieValg = {
    dagIMaanedRegler: [],
    maksBehandlingerPerMnd: 31,
    ekskluderteMaaneder: [],
    enableRangeVelger: true,
}

function erTillattAvDagIMaanedRegel(date: Date, regel: DagIMaanedRegel): boolean {
    const dayOfMonth = date.getDate()

    switch (regel.type) {
        case 'BEFORE':
            return dayOfMonth < regel.dag
        case 'BEFORE_OR_EQUAL':
            return dayOfMonth <= regel.dag
        case 'AFTER':
            return dayOfMonth > regel.dag
        case 'AFTER_OR_EQUAL':
            return dayOfMonth >= regel.dag
        default:
            return true
    }
}

export function erDatoEkskludertAvRegler(date: Date, regler: SerieValg): boolean {
    if (!regler.dagIMaanedRegler.length) return false
    const tillattAvAlleRegler = regler.dagIMaanedRegler.every((regel) => erTillattAvDagIMaanedRegel(date, regel))
    return !tillattAvAlleRegler
}

export function erDatoIEkskludertMnd(date: Date, regler: SerieValg): boolean {
    if (!regler.ekskluderteMaaneder.length) return false
    return regler.ekskluderteMaaneder.includes(date.getMonth() + 1)
}

export function erMaanedFull(
    date: Date,
    antallPerMaaned: Map<string, number>,
    maksPerMnd: number,
): boolean {
    const yearMonth = toYearMonth(date)
    const antallIMaaned = antallPerMaaned.get(yearMonth) ?? 0
    return antallIMaaned >= maksPerMnd
}

export function getMaksBehandlingerPerMnd(serieValg: SerieValg): number {
    return serieValg.maksBehandlingerPerMnd
}

export function tellDatoerPerMaaned(datoer: string[], base?: Map<string, number>): Map<string, number> {
    const map = new Map(base)
    for (const ymd of datoer) {
        const yearMonth = ymd.slice(0, 7)
        map.set(yearMonth, (map.get(yearMonth) ?? 0) + 1)
    }
    return map
}

type FiltrerDatoerOptions = {
    datoer: string[]
    booketYmdSet: Set<string>
    antallPerMaaned: Map<string, number>
    serieValg: SerieValg
}

export function filtrerDatoerMedRegler({
  datoer,
  booketYmdSet,
  antallPerMaaned,
  serieValg,
}: FiltrerDatoerOptions): string[] {
  const maksPerMnd = getMaksBehandlingerPerMnd(serieValg)
  const antallValgt = new Map(antallPerMaaned)

  return datoer.filter((ymd) => {
    if (booketYmdSet.has(ymd)) return false
    if (erDatoEkskludertAvRegler(parseYmd(ymd), serieValg)) return false

    const yearMonth = ymd.slice(0, 7)
    const count = antallValgt.get(yearMonth) ?? 0
    if (count >= maksPerMnd) return false

    antallValgt.set(yearMonth, count + 1)
    return true
  })
}

function beskrivelseForDagIMaanedRegel(regel: DagIMaanedRegel): string {
    switch (regel.type) {
        case 'BEFORE':
            return `Må være før den ${regel.dag}. i måneden`
        case 'BEFORE_OR_EQUAL':
            return `Må være senest den ${regel.dag}. i måneden`
        case 'AFTER':
            return `Må være etter den ${regel.dag}. i måneden`
        case 'AFTER_OR_EQUAL':
            return `Må være tidligst den ${regel.dag}. i måneden`
    }
}

export function byggRegelAdvarsler(serieValg: SerieValg): string[] {
    const advarsler: string[] = []

    if (serieValg.dagIMaanedRegler.length) {
        for (const regel of serieValg.dagIMaanedRegler) {
            advarsler.push(beskrivelseForDagIMaanedRegel(regel))
        }
    }

    if (serieValg.ekskluderteMaaneder.length > 0) {
        const navn = serieValg.ekskluderteMaaneder
            .map((m) => new Date(2000, m - 1, 1).toLocaleString('nb-NO', {month: 'long'}))
            .join(', ')
        advarsler.push(`Kan ikke planlegges i månedene: ${navn}`)
    }

    if (serieValg.maksBehandlingerPerMnd < 31) {
        advarsler.push(
            `Maks ${serieValg.maksBehandlingerPerMnd} behandling${serieValg.maksBehandlingerPerMnd === 1 ? '' : 'er'} per måned`,
        )
    }

    return advarsler
}
