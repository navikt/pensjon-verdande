import type { LoaderFunctionArgs } from 'react-router';
import { Await, useLoaderData } from 'react-router';

import {
  getIkkeFullforteAktiviteter,
} from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { Suspense } from 'react'
import { Skeleton } from '@navikt/ds-react'
import IkkeFullforteAktiviteter from '~/components/behandling/IkkeFullforteAktiviteter'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const ikkeFullforteAktiviteter = getIkkeFullforteAktiviteter(
    accessToken,
    +params.behandlingId,
  )

  return {
    ikkeFullforteAktiviteter: ikkeFullforteAktiviteter
  }
}

export default function AvhengigeBehandlinger() {
  const { ikkeFullforteAktiviteter } = useLoaderData<typeof loader>()

  return (
    <Suspense fallback={<Skeleton variant="text" width="100%" />}>
      <Await resolve={ikkeFullforteAktiviteter}>
        {(it) => <IkkeFullforteAktiviteter ikkeFullforteAktiviteter={it}/>}
      </Await>
    </Suspense>
  )
}
