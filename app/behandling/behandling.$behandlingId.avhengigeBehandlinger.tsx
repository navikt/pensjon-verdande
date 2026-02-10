import { Skeleton } from '@navikt/ds-react'
import { Suspense } from 'react'
import { Await, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import AvhengigeBehandlingerElement from '~/components/behandling/avhengige-behandlinger/AvhengigeBehandlingerElement'
import { requireAccessToken } from '~/services/auth.server'
import { getAvhengigeBehandlinger } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.avhengigeBehandlinger'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const { searchParams } = new URL(request.url)

  const accessToken = await requireAccessToken(request)

  const page = searchParams.get('page')
  const size = searchParams.get('size')
  const avhengigeBehandlinger = getAvhengigeBehandlinger(
    accessToken,
    +params.behandlingId,
    searchParams.get('behandlingType'),
    searchParams.get('status'),
    searchParams.get('ansvarligTeam'),
    page ? +page : 0,
    size ? +size : 10,
    searchParams.get('sort'),
  )

  return {
    avhengigeBehandlinger,
  }
}

export default function AvhengigeBehandlinger() {
  const { avhengigeBehandlinger } = useLoaderData<typeof loader>()

  return (
    <Suspense fallback={<Skeleton variant="text" width="100%" />}>
      <Await resolve={avhengigeBehandlinger}>
        {(it) => <AvhengigeBehandlingerElement avhengigeBehandlinger={it} />}
      </Await>
    </Suspense>
  )
}
