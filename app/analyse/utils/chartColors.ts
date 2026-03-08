export const statusColors: Record<string, { backgroundColor: string; borderColor: string }> = {
  FULLFORT: {
    backgroundColor: 'rgba(153, 222, 173, 0.5)',
    borderColor: 'rgba(42, 167, 88, 1)',
  },
  UNDER_BEHANDLING: {
    backgroundColor: 'rgba(204, 225, 255, 0.5)',
    borderColor: 'rgba(51, 134, 224, 1)',
  },
  AVBRUTT: {
    backgroundColor: 'rgba(255, 194, 194, 0.5)',
    borderColor: 'rgba(195, 0, 0, 1)',
  },
  DEBUG: {
    backgroundColor: 'rgba(192, 178, 210, 0.5)',
    borderColor: 'rgba(130, 105, 162, 1)',
  },
  FEILENDE: {
    backgroundColor: 'rgba(255, 193, 102, 0.5)',
    borderColor: 'rgba(199, 115, 0, 1)',
  },
  FEILET: {
    backgroundColor: 'rgba(255, 140, 140, 0.5)',
    borderColor: 'rgba(195, 0, 0, 1)',
  },
  STOPPET: {
    backgroundColor: 'rgba(236, 243, 153, 0.5)',
    borderColor: 'rgba(127, 137, 0, 1)',
  },
}

export const statusLabels: Record<string, string> = {
  FULLFORT: 'Fullført',
  UNDER_BEHANDLING: 'Under behandling',
  AVBRUTT: 'Avbrutt',
  DEBUG: 'Debug',
  FEILENDE: 'Feilende',
  FEILET: 'Feilet',
  STOPPET: 'Stoppet',
}

export const faseColors = {
  mottakTilOpprettet: {
    backgroundColor: 'rgba(51, 134, 224, 0.6)',
    borderColor: 'rgba(51, 134, 224, 1)',
  },
  opprettetTilFerdig: {
    backgroundColor: 'rgba(42, 167, 88, 0.6)',
    borderColor: 'rgba(42, 167, 88, 1)',
  },
  ferdigTilIverksatt: {
    backgroundColor: 'rgba(255, 163, 51, 0.6)',
    borderColor: 'rgba(199, 115, 0, 1)',
  },
}

export const varighetColors = {
  gjennomsnitt: {
    backgroundColor: 'rgba(51, 134, 224, 0.2)',
    borderColor: 'rgba(51, 134, 224, 1)',
  },
  median: {
    backgroundColor: 'rgba(42, 167, 88, 0.2)',
    borderColor: 'rgba(42, 167, 88, 1)',
  },
  p90: {
    backgroundColor: 'rgba(255, 163, 51, 0.15)',
    borderColor: 'rgba(255, 163, 51, 0.8)',
  },
  p95: {
    backgroundColor: 'rgba(195, 0, 0, 0.1)',
    borderColor: 'rgba(195, 0, 0, 0.6)',
  },
}

const paletteColors = [
  { backgroundColor: 'rgba(51, 134, 224, 0.5)', borderColor: 'rgba(51, 134, 224, 1)' },
  { backgroundColor: 'rgba(42, 167, 88, 0.5)', borderColor: 'rgba(42, 167, 88, 1)' },
  { backgroundColor: 'rgba(255, 163, 51, 0.5)', borderColor: 'rgba(199, 115, 0, 1)' },
  { backgroundColor: 'rgba(195, 0, 0, 0.5)', borderColor: 'rgba(195, 0, 0, 1)' },
  { backgroundColor: 'rgba(130, 105, 162, 0.5)', borderColor: 'rgba(130, 105, 162, 1)' },
  { backgroundColor: 'rgba(0, 163, 163, 0.5)', borderColor: 'rgba(0, 130, 130, 1)' },
  { backgroundColor: 'rgba(204, 102, 153, 0.5)', borderColor: 'rgba(163, 51, 112, 1)' },
  { backgroundColor: 'rgba(153, 153, 51, 0.5)', borderColor: 'rgba(112, 112, 0, 1)' },
  { backgroundColor: 'rgba(102, 153, 204, 0.5)', borderColor: 'rgba(51, 112, 163, 1)' },
  { backgroundColor: 'rgba(204, 153, 102, 0.5)', borderColor: 'rgba(163, 112, 51, 1)' },
]

export function getPaletteColor(index: number) {
  return paletteColors[index % paletteColors.length]
}
