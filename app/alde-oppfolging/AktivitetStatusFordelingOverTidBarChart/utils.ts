import type { AktivitetStatusFordelingDto } from '../types'

/**
 * Aktivitetens EGEN status (`T_AKTIVITET.STATUS`) — annet verdisett enn behandlingens status.
 * Bevisst adskilt fra `statusLabels` så de to begrepene ikke blandes i UI-et.
 */
export const aktivitetStatusLabels: Record<string, string> = {
  OPPRETTET: 'Opprettet',
  UNDER_BEHANDLING: 'Under behandling',
  FULLFORT: 'Fullført',
  FEILET: 'Feilet',
}

/** Visningsrekkefølge som følger aktivitetens livsløp, ikke alfabetisk. */
export const AKTIVITET_STATUS_REKKEFOLGE = ['OPPRETTET', 'UNDER_BEHANDLING', 'FULLFORT', 'FEILET']

export const aktivitetStatusColors: Record<string, { backgroundColor: string; borderColor: string }> = {
  OPPRETTET: {
    backgroundColor: 'rgba(236, 243, 153, 0.5)',
    borderColor: 'rgba(127, 137, 0, 1)',
  },
  UNDER_BEHANDLING: {
    backgroundColor: 'rgba(204, 225, 255, 0.5)',
    borderColor: 'rgba(51, 134, 224, 1)',
  },
  FULLFORT: {
    backgroundColor: 'rgba(153, 222, 173, 0.5)',
    borderColor: 'rgba(42, 167, 88, 1)',
  },
  FEILET: {
    backgroundColor: 'rgba(255, 194, 194, 0.5)',
    borderColor: 'rgba(195, 0, 0, 1)',
  },
}

export type AktivitetSerie = {
  datoer: string[]
  /** Status → antall per dato, i samme rekkefølge som `datoer`. */
  perStatus: { status: string; antall: number[] }[]
}

/**
 * Bygger dag-for-dag-serien per aktivitetstatus.
 *
 * I motsetning til den tidligere notat-serien filtreres det ikke på FULLFORT — hele poenget med
 * den generiske aktivitet-taben er å se hvordan et steg fordeler seg på sine egne statuser.
 * Alle dager mellom første og siste dato fylles ut med 0, ellers ville dager uten aktivitet falt
 * bort og fjerntliggende datoer framstått som nabodager.
 *
 * Returnerer `null` når perioden er tom, slik at komponenten kan vise tom-tilstand.
 */
export const byggAktivitetSerie = (data: AktivitetStatusFordelingDto[]): AktivitetSerie | null => {
  const antallPerDatoOgStatus = new Map<string, Map<string, number>>()
  const observerteStatuser = new Set<string>()

  for (const rad of data) {
    if (!rad.dato) continue
    observerteStatuser.add(rad.status)
    const perStatus = antallPerDatoOgStatus.get(rad.dato) ?? new Map<string, number>()
    // Summer heller enn å overskrive: backend kan returnere flere rader per (dato, status).
    perStatus.set(rad.status, (perStatus.get(rad.status) ?? 0) + rad.antall)
    antallPerDatoOgStatus.set(rad.dato, perStatus)
  }

  if (antallPerDatoOgStatus.size === 0) return null

  const sorterteDatoer = [...antallPerDatoOgStatus.keys()].sort()
  const datoer: string[] = []
  const currentDate = new Date(sorterteDatoer[0])
  const endDate = new Date(sorterteDatoer[sorterteDatoer.length - 1])
  while (currentDate <= endDate) {
    datoer.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Kjente statuser først i livsløpsrekkefølge, deretter ukjente alfabetisk, slik at en ny
  // Aktivitetstatus i backend ikke forsvinner stille fra diagrammet.
  const kjente = AKTIVITET_STATUS_REKKEFOLGE.filter((s) => observerteStatuser.has(s))
  const ukjente = [...observerteStatuser].filter((s) => !AKTIVITET_STATUS_REKKEFOLGE.includes(s)).sort()

  return {
    datoer,
    perStatus: [...kjente, ...ukjente].map((status) => ({
      status,
      antall: datoer.map((dato) => antallPerDatoOgStatus.get(dato)?.get(status) ?? 0),
    })),
  }
}

/** Totalt antall per status over hele perioden — brukes i den tilgjengelige lenketabellen. */
export const summerPerStatus = (serie: AktivitetSerie): { status: string; antall: number }[] =>
  serie.perStatus.map(({ status, antall }) => ({
    status,
    antall: antall.reduce((sum, n) => sum + n, 0),
  }))
