import invariant from 'tiny-invariant'
import { BehandlingKjoringerTable } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { getBehandling, getBehandlingKjoringer } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId._index'

const DEFAULT_PAGE_SIZE = 100

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const url = new URL(request.url)
  const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10) || 0)
  const size = Math.max(
    1,
    Math.min(parseInt(url.searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE, 1000),
  )
  const sortKey = url.searchParams.get('sortKey') ?? 'startet'
  const sortDir = url.searchParams.get('sortDir')
  const sort = `${sortKey},${sortDir === 'ascending' ? 'asc' : 'desc'}`

  const [behandling, kjoringerPage] = await Promise.all([
    getBehandling(request, params.behandlingId),
    getBehandlingKjoringer(request, params.behandlingId, page, size, sort),
  ])

  return {
    kjoringerPage,
    erAldeKjoring: !!behandling.erAldeBehandling,
  }
}

export default function BehandlingKjoringer({ loaderData }: Route.ComponentProps) {
  const { kjoringerPage, erAldeKjoring } = loaderData

  return <BehandlingKjoringerTable kjoringerPage={kjoringerPage} erAldeKjoring={erAldeKjoring} />
}
