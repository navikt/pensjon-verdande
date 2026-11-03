import { redirect } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { ReguleringsomregningRequest } from '~/types'
import type { Route } from './+types/reguleringsomregning.reguleringsomregning'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const reguleringsomregningRequest = {
    reguleringsdato: updates.reguleringsdato,
    prioritet: updates.prioritet,
    fullstendigUttrekk: updates.fullstendigUttrekk === 'true',
  } as ReguleringsomregningRequest

  const response = (await apiPost<{ behandlingId: number }>(
    '/api/behandling/reguleringsomregning/opprett',
    reguleringsomregningRequest,
    request,
  )) as { behandlingId: number }

  return redirect(`/behandling/${response.behandlingId}`)
}
