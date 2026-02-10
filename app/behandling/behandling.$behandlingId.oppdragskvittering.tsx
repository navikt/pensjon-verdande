import { useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import xmlFormat from 'xml-formatter'
import { requireAccessToken } from '~/services/auth.server'
import { getOppdragskvittering } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.oppdragskvittering'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const output = await getOppdragskvittering(await requireAccessToken(request), params.behandlingId)

  if (!output) {
    throw new Response('Not Found', { status: 404 })
  } else {
    return {
      output,
    }
  }
}

export default function Oppdragskvittering() {
  const { output } = useLoaderData<typeof loader>()

  return <pre>{xmlFormat(output)}</pre>
}
