import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getBehandling } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import AktivitetCard from '~/components/aktivitet/AktivitetCard'

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

  return <AktivitetCard behandling={behandling} aktivitet={aktivitet} />
}
