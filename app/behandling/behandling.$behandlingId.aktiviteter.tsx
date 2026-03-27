import invariant from 'tiny-invariant'
import BehandlingAktivitetTable from '~/components/aktiviteter-table/BehandlingAktivitetTable'
import { getBehandlingAktiviteter } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.aktiviteter'

const DEFAULT_PAGE_SIZE = 100

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '0')
  const size = Number(url.searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE))
  const sortKey = url.searchParams.get('sortKey')
  const sortDir = url.searchParams.get('sortDir')
  const sort = sortKey ? `${sortKey},${sortDir === 'ascending' ? 'asc' : 'desc'}` : null

  const aktiviteterPage = await getBehandlingAktiviteter(request, params.behandlingId, page, size, sort)

  return {
    behandlingId: params.behandlingId,
    aktiviteterPage,
  }
}

export default function BehandlingAktiviteter({ loaderData }: Route.ComponentProps) {
  const { behandlingId, aktiviteterPage } = loaderData

  return <BehandlingAktivitetTable behandlingId={behandlingId} aktiviteterPage={aktiviteterPage} />
}
