import { ActionFunctionArgs } from 'react-router';
import { fortsettBehandling } from '~/services/behandling.server'
import { requireAccessToken } from '~/services/auth.server'

export async function action({
                               request,
                             }: ActionFunctionArgs) {
  const accessToken = await requireAccessToken(request)

  let body = await request.formData()
  let behandlingIder = body.get('behandlingIder') as string

  await Promise.all(behandlingIder.split(',').map((behandlingId) => {
    fortsettBehandling(accessToken, behandlingId, false)
  }))

  return null
}
