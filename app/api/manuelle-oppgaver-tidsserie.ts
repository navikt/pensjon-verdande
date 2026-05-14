import type { ManuellOppgaveTidsserieResponse } from '~/analyse/types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/manuelle-oppgaver-tidsserie'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''
  const aggregering = searchParams.get('aggregering') || 'UKE'
  const oppgaveKategori = searchParams.get('oppgaveKategori') || ''
  const kravBehandlingType = searchParams.get('kravBehandlingType') || ''

  const params = new URLSearchParams({ behandlingType, fom, tom, aggregering, oppgaveKategori })
  if (kravBehandlingType) {
    params.set('kravBehandlingType', kravBehandlingType)
  }

  return await apiGet<ManuellOppgaveTidsserieResponse>(
    `/api/behandling/analyse/manuelle-oppgaver/tidsserie?${params}`,
    request,
  )
}
