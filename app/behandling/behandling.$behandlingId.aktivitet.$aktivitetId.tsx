import { useLocation } from 'react-router'
import invariant from 'tiny-invariant'
import AktivitetCard from '~/behandling/AktivitetCard'
import { getAktivitet, getBehandling } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.aktivitet.$aktivitetId'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const aktivitetId = params.aktivitetId
  invariant(aktivitetId, 'Missing aktivitetId param')

  const [behandling, aktivitet] = await Promise.all([
    getBehandling(request, params.behandlingId),
    getAktivitet(request, params.behandlingId, aktivitetId),
  ])

  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }
  if (!aktivitet) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandling, aktivitet }
}

export default function Behandling({ loaderData }: Route.ComponentProps) {
  const { behandling, aktivitet } = loaderData
  const location = useLocation()

  return <AktivitetCard behandling={behandling} aktivitet={aktivitet} pathname={location.pathname} />
}
