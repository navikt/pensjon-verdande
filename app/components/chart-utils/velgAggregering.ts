/** Velg passende aggregeringsnivå basert på antall timer i tidsperioden */
export function velgAggregering(timer: number): string {
  const dager = timer / 24
  if (timer <= 3) return 'MINUTT'
  if (dager <= 3) return 'TIME'
  if (dager <= 31) return 'DAG'
  if (dager <= 180) return 'UKE'
  if (dager <= 730) return 'MAANED'
  if (dager <= 1825) return 'KVARTAL'
  return 'AAR'
}
