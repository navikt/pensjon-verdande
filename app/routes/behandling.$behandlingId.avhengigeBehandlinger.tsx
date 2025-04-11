import type { LoaderFunctionArgs } from '@remix-run/node'
import { defer } from '@remix-run/node'
import { Await, useLoaderData } from '@remix-run/react'

import { getAvhengigeBehandlinger } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import AvhengigeBehandlingerElement from '~/components/behandling/avhengige-behandlinger/AvhengigeBehandlingerElement'
import React, { Suspense } from 'react'
import { Skeleton } from '@navikt/ds-react'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  let { searchParams } = new URL(request.url);

  const accessToken = await requireAccessToken(request)

  let page = searchParams.get('page')
  let size = searchParams.get('size')
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

  return defer(
    {
      avhengigeBehandlinger,
    })
}

export default function AvhengigeBehandlinger() {
  const { avhengigeBehandlinger } = useLoaderData<typeof loader>()

  return (
    <Suspense fallback={<Skeleton variant="text" width="100%" />}>
      <Await resolve={avhengigeBehandlinger}>
        {(it) => <AvhengigeBehandlingerElement avhengigeBehandlinger={it}/>}
      </Await>
    </Suspense>
  )
}
