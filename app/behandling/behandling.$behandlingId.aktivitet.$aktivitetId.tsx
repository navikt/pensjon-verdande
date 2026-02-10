import { useLocation } from 'react-router'
import invariant from 'tiny-invariant'
import AktivitetCard from '~/behandling/AktivitetCard'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling } from '~/services/behandling.server'
import type { BehandlingDto } from '~/types'
import type { Route } from './+types/behandling.$behandlingId.aktivitet.$aktivitetId'

export function finnAktivitet(behandling: BehandlingDto, aktivitetId: number | string) {
  if (typeof aktivitetId === 'string') {
    return behandling.aktiviteter.find((it) => it.aktivitetId.toString() === aktivitetId)
  } else {
    return behandling.aktiviteter.find((it) => it.aktivitetId.toString() === aktivitetId.toString())
  }
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const aktivitetId = params.aktivitetId
  invariant(aktivitetId, 'Missing aktivitetId param')

  const accessToken = await requireAccessToken(request)
  const behandling = await getBehandling(accessToken, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  const aktivitet = finnAktivitet(behandling, aktivitetId)
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
