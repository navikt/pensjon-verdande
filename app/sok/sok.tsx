import type { ActionFunctionArgs } from 'react-router'
import { Search, VStack } from '@navikt/ds-react'
import { requireAccessToken } from '~/services/auth.server'
import { search } from '~/services/behandling.server'
import { useLoaderData } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { BehandlingerPage } from '~/types'

export const loader = async ({ request }: ActionFunctionArgs) => {
  let { searchParams } = new URL(request.url)

  let behandlinger: BehandlingerPage | null

  let query = searchParams.get('query')
  if (query) {
    const accessToken = await requireAccessToken(request)

    let page = searchParams.get('page')
    let size = searchParams.get('size')

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

export default function Sok() {
  const { behandlinger } = useLoaderData<typeof loader>()

  return (
    <VStack gap="4">
      {
        behandlinger ?
          <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger} />
          : <></>
      }
    </VStack>
  )
}
