import { apiGet } from '~/services/api.server'
import type { DetaljertFremdriftDTO } from '~/types'

export const hentOrkestreringsStatistikk = async (
  request: Request,
  behandlingId: string,
): Promise<DetaljertFremdriftDTO> => {
  return await apiGet<DetaljertFremdriftDTO>(`/api/vedtak/regulering/orkestrering/${behandlingId}/detaljer`, request)
}
