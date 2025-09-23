import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import BehandlingAktivitetTable from '~/components/aktiviteter-table/BehandlingAktivitetTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling } from '~/services/behandling.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)
  const behandling = await getBehandling(accessToken, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandling,
  }
}

export default function BehandlingAktiviteter() {
  const { behandling } = useLoaderData<typeof loader>()

  return <BehandlingAktivitetTable behandling={behandling} />
}
