import { VStack } from '@navikt/ds-react'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { search } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import type { Route } from './+types/sok'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Søk | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)

  let behandlinger: BehandlingerPage | null

  const query = searchParams.get('query')
  if (query) {
    const accessToken = await requireAccessToken(request)

    const page = searchParams.get('page')
    const size = searchParams.get('size')

    behandlinger = await search(
      accessToken,
      query,
      searchParams.get('behandlingType'),
      searchParams.get('status'),
      searchParams.get('ansvarligTeam'),
      page ? +page : 0,
      size ? +size : 10,
      searchParams.get('sort'),
    )
  } else {
    behandlinger = null
  }

  return {
    behandlinger,
  }
}

export default function Sok({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData

  return (
    <VStack gap="4">
      {behandlinger && <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger} />}
    </VStack>
  )
}
