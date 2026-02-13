import { apiPost } from '~/services/api.server'

export async function oppdaterSisteOmsorgGodskrivingsaar(
  request: Request,
  godskrivingsaar: number,
): Promise<string> {
  await apiPost('/api/opptjening/omsorggodskrivingsaar/oppdater?godskrivingsaar=' + godskrivingsaar, {}, request)
  return `Siste omsorg godskrivår er endret til ${godskrivingsaar}`
}
