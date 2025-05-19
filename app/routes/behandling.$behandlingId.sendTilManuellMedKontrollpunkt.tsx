import type { ActionFunctionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { sendTilManuellMedKontrollpunkt, getBehandling } from '~/services/behandling.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  let formData = Object.fromEntries(await request.formData())

  const accessToken = await requireAccessToken(request)

  await sendTilManuellMedKontrollpunkt(
    accessToken,
    params.behandlingId,
    formData.kontrollpunkt as string,
  )

  return getBehandling(accessToken, params.behandlingId)
}
