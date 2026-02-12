import { requireAccessToken } from '~/services/auth.server'
import { fortsettBehandling } from '~/services/behandling.server'
import type { Route } from './+types/behandlinger.$status.fortsett'

export async function action({ request }: Route.ActionArgs) {
  const accessToken = await requireAccessToken(request)

  const body = await request.formData()
  const behandlingIder = body.get('behandlingIder') as string

  await Promise.all(
    behandlingIder.split(',').map((behandlingId) => fortsettBehandling(accessToken, behandlingId, false)),
  )
}
