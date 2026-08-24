import type { AktivitetStatusFordelingDto } from '../types'

/**
 * Bygger dag-for-dag-serien for opprettede notater.
 *
 * Teller kun aktiviteter med status FULLFORT — det er en fullført notat-aktivitet som betyr at et
 * notat faktisk er opprettet. Alle dager mellom første og siste dato fylles ut med 0, slik at
 * x-aksen blir sammenhengende. Uten utfylling ville dager uten notater falt bort, og to dager langt
 * fra hverandre ville framstått som nabodager i grafen.
 *
 * Returnerer `null` når det ikke finnes fullførte notater i perioden, slik at komponenten kan vise
 * en tom tilstand i stedet for en tom graf.
 */
export const byggNotatSerie = (data: AktivitetStatusFordelingDto[]): { datoer: string[]; antall: number[] } | null => {
  const antallPerDato = new Map<string, number>()

  for (const rad of data) {
    if (rad.status !== 'FULLFORT' || !rad.dato) continue
    // Summer heller enn å overskrive: backend kan i prinsippet returnere flere rader per dato.
    antallPerDato.set(rad.dato, (antallPerDato.get(rad.dato) ?? 0) + rad.antall)
  }

  if (antallPerDato.size === 0) {
    return null
  }

  const sorterteDatoer = [...antallPerDato.keys()].sort()
  const datoer: string[] = []
  const currentDate = new Date(sorterteDatoer[0])
  const endDate = new Date(sorterteDatoer[sorterteDatoer.length - 1])

  while (currentDate <= endDate) {
    datoer.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    datoer,
    antall: datoer.map((dato) => antallPerDato.get(dato) ?? 0),
  }
}
