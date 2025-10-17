import { type LoaderFunctionArgs, useLoaderData, useLocation } from 'react-router'
import invariant from 'tiny-invariant'
import AktivitetCard from '~/behandling/AktivitetCard'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling } from '~/services/behandling.server'
import type { BehandlingDto } from '~/types'

export function finnAktivitet(behandling: BehandlingDto, aktivitetId: number | string) {
  if (typeof aktivitetId === 'string') {
    return behandling.aktiviteter.find((it) => it.aktivitetId.toString() === aktivitetId)
  } else {
    return behandling.aktiviteter.find((it) => it.aktivitetId.toString() === aktivitetId.toString())
  }
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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

export default function Behandling() {
  const { behandling, aktivitet } = useLoaderData<typeof loader>()
  const location = useLocation()

  return <AktivitetCard behandling={behandling} aktivitet={aktivitet} pathname={location.pathname} />
}
