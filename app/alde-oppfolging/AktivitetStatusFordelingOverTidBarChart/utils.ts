import type { AktivitetStatusFordelingDto } from '../types'

export const aktivitetStatusLabels: Record<string, string> = {
  OPPRETTET: 'Opprettet',
  UNDER_BEHANDLING: 'Under behandling',
  FULLFORT: 'Fullført',
  FEILET: 'Feilet',
}

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
  perStatus: { status: string; antall: number[] }[]
}

export const byggAktivitetSerie = (data: AktivitetStatusFordelingDto[]): AktivitetSerie | null => {
  const antallPerDatoOgStatus = new Map<string, Map<string, number>>()
  const observerteStatuser = new Set<string>()

  for (const rad of data) {
    if (!rad.dato) continue
    observerteStatuser.add(rad.status)
    const perStatus = antallPerDatoOgStatus.get(rad.dato) ?? new Map<string, number>()
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

export const summerPerStatus = (serie: AktivitetSerie): { status: string; antall: number }[] =>
  serie.perStatus.map(({ status, antall }) => ({
    status,
    antall: antall.reduce((sum, n) => sum + n, 0),
  }))
