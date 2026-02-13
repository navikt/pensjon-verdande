import type { StartEtteroppgjorResponse } from '~/afp-etteroppgjor/types'
import { apiPost } from '~/services/api.server'

export async function startAfpEtteroppgjor(
  request: Request,
  {
    kjøreår,
  }: {
    kjøreår: number
  },
): Promise<StartEtteroppgjorResponse> {
  const response = await apiPost<StartEtteroppgjorResponse>(
    '/api/afpoffentlig/etteroppgjor/behandling/start',
    { kjorear: kjøreår },
    request,
  )
  return response!
}
