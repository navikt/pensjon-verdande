import invariant from 'tiny-invariant'
import { BehandlingKjoringerTable } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { getBehandling, getBehandlingKjoringer } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId._index'

const DEFAULT_PAGE_SIZE = 100

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '0')
  const size = Number(url.searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE))
  const sort = url.searchParams.get('sort')

  const [behandling, kjoringerPage] = await Promise.all([
    getBehandling(request, params.behandlingId),
    getBehandlingKjoringer(request, params.behandlingId, page, size, sort),
  ])

  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandling,
    kjoringerPage,
  }
}

export default function BehandlingKjoringer({ loaderData }: Route.ComponentProps) {
  const { behandling, kjoringerPage } = loaderData

  return (
    <BehandlingKjoringerTable
      behandling={behandling}
      kjoringerPage={kjoringerPage}
      erAldeKjoring={!!behandling.erAldeBehandling}
    />
  )
}
