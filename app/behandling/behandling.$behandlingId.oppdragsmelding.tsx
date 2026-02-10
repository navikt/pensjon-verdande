import invariant from 'tiny-invariant'
import xmlFormat from 'xml-formatter'
import { requireAccessToken } from '~/services/auth.server'
import { getOppdragsmelding } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.oppdragsmelding'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const output = await getOppdragsmelding(await requireAccessToken(request), params.behandlingId)

  if (!output) {
    throw new Response('Not Found', { status: 404 })
  } else {
    return {
      output,
    }
  }
}

export default function Oppdragsmelding({ loaderData }: Route.ComponentProps) {
  const { output } = loaderData

  return <pre>{xmlFormat(output)}</pre>
}
