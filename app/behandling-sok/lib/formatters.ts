import type { Aggregering } from './url-state'

const NB_MND = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']

/**
 * Formaterer et bucket-startpunkt (ISO-dato/tid) etter hvilken aggregering som er valgt.
 * Returnerer en kort, lesbar etikett for graf-x-aksen og tabellvisning.
 */
export function formaterBucketLabel(periodeStartIso: string, aggregering: Aggregering): string {
  // Godta både YYYY-MM-DD og YYYY-MM-DDTHH:mm:ss
  const datoDel = periodeStartIso.slice(0, 10)
  const [aar, mnd, dag] = datoDel.split('-').map(Number)
  if (!aar || !mnd || !dag) return periodeStartIso

  switch (aggregering) {
    case 'DAG':
      return `${dag}. ${NB_MND[mnd - 1]} ${aar}`
    case 'UKE':
      return `${dag}. ${NB_MND[mnd - 1]} ${aar} (uke)`
    case 'MAANED':
      return `${NB_MND[mnd - 1]} ${aar}`
    case 'KVARTAL': {
      const kv = Math.floor((mnd - 1) / 3) + 1
      return `Q${kv} ${aar}`
    }
    case 'AAR':
      return String(aar)
    default:
      return periodeStartIso
  }
}

export function tidsdimensjonLabel(td: string): string {
  switch (td) {
    case 'OPPRETTET':
      return 'opprettet'
    case 'FULLFORT':
      return 'fullført'
    case 'STOPPET':
      return 'stoppet'
    case 'SISTE_KJORING':
      return 'sist kjørt'
    default:
      return td
  }
}
