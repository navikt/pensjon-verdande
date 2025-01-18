import type { ActionFunctionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import {
  getBehandling,
  patchBehandling,
} from '~/services/behandling.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  let formData = Object.fromEntries(await request.formData())

  const accessToken = await requireAccessToken(request)

  await patchBehandling(
    accessToken,
    params.behandlingId,
    {
      ansvarligTeam: formData.ansvarligTeam as string,
    }
  )

  return getBehandling(accessToken, params.behandlingId)
}
