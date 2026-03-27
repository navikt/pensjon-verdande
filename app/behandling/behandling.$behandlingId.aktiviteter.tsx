import invariant from 'tiny-invariant'
import BehandlingAktivitetTable from '~/components/aktiviteter-table/BehandlingAktivitetTable'
import { apiGet } from '~/services/api.server'
import type { AktivitetDTO, PageResponse } from '~/types'
import type { Route } from './+types/behandling.$behandlingId.aktiviteter'

const DEFAULT_PAGE_SIZE = 100

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const url = new URL(request.url)
  const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10) || 0)
  const size = Math.max(
    1,
    Math.min(parseInt(url.searchParams.get('size') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE, 1000),
  )
  const sortKey = url.searchParams.get('sortKey') ?? 'aktivitetId'
  const sortDir = url.searchParams.get('sortDir')
  const sort = `${sortKey},${sortDir === 'ascending' ? 'asc' : 'desc'}`

  const aktiviteterPage = await apiGet<PageResponse<AktivitetDTO>>(
    `/api/behandling/${params.behandlingId}/aktiviteter?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`,
    request,
  )

  return {
    behandlingId: params.behandlingId,
    aktiviteterPage,
  }
}

export default function BehandlingAktiviteter({ loaderData }: Route.ComponentProps) {
  const { behandlingId, aktiviteterPage } = loaderData

  return <BehandlingAktivitetTable behandlingId={behandlingId} aktiviteterPage={aktiviteterPage} />
}
