import { type LoaderFunctionArgs, useLocation } from 'react-router'
import { useLoaderData } from 'react-router';

import { getBehandling } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import AktivitetCard from '~/behandling/AktivitetCard'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  invariant(params.aktivitetId, 'Missing aktivitetId param')

  const accessToken = await requireAccessToken(request)
  const behandling = await getBehandling(accessToken, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  const aktivitet = behandling.aktiviteter.find(
    (it) => it.aktivitetId.toString() === params.aktivitetId,
  )
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
