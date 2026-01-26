import { Heading, VStack } from '@navikt/ds-react'
import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  invariant(params.behandlingManuellKategori, 'Missing behandlingManuellKategori param')

  const { searchParams } = new URL(request.url)

  const accessToken = await requireAccessToken(request)

  const page = searchParams.get('page')
  const size = searchParams.get('size')
  const manuellKategoriBehandlinger = await getBehandlinger(accessToken, {
    behandlingType: searchParams.get('behandlingType'),
    status: params.status,
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    behandlingManuellKategori: params.behandlingManuellKategori,
    forrigeBehandlingId: +params.behandlingId,
    page: page ? +page : 0,
    size: size ? +size : 100,
    sort: searchParams.get('sort'),
  })

  return {
    behandlingManuellKategori: params.behandlingManuellKategori,
    manuellKategoriBehandlinger,
  }
}

export default function ManuellKategoriBehandlinger() {
  const { behandlingManuellKategori, manuellKategoriBehandlinger } = useLoaderData<typeof loader>()

  return (
    <VStack gap={'space-4'}>
      <Heading size={'medium'} level={'2'}>
        {behandlingManuellKategori}
      </Heading>
      <BehandlingerTable visStatusSoek={false} behandlingerResponse={manuellKategoriBehandlinger} />
    </VStack>
  )
}
