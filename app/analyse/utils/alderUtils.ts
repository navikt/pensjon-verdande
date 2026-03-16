export type AlderVisning = 'aar' | 'gruppe'

export function tilAldersgruppe(alder: number): string {
  if (alder < 0) return 'Ukjent'
  if (alder < 18) return 'Under 18'
  if (alder <= 29) return '18-29'
  if (alder <= 39) return '30-39'
  if (alder <= 49) return '40-49'
  if (alder <= 59) return '50-59'
  if (alder <= 66) return '60-66'
  if (alder <= 74) return '67-74'
  return '75+'
}

export const aldersgruppeSortering: Record<string, number> = {
  Ukjent: -1,
  'Under 18': 0,
  '18-29': 1,
  '30-39': 2,
  '40-49': 3,
  '50-59': 4,
  '60-66': 5,
  '67-74': 6,
  '75+': 7,
}

export function alderLabel(alder: number): string {
  return alder < 0 ? 'Ukjent' : `${alder} år`
}
