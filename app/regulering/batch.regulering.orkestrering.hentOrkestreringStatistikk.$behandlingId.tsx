import invariant from 'tiny-invariant'
import { apiGet } from '~/services/api.server'
import type { DetaljertFremdriftDTO } from '~/types'
import type { Route } from './+types/batch.regulering.orkestrering.hentOrkestreringStatistikk.$behandlingId'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  return await apiGet<DetaljertFremdriftDTO>(
    `/api/vedtak/regulering/orkestrering/${params.behandlingId}/detaljer`,
    request,
  )
}
