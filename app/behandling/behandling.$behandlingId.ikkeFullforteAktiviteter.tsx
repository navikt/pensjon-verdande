import { Skeleton } from '@navikt/ds-react'
import { Suspense } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { Await, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import IkkeFullforteAktiviteter from '~/components/behandling/IkkeFullforteAktiviteter'
import { requireAccessToken } from '~/services/auth.server'
import { getIkkeFullforteAktiviteter } from '~/services/behandling.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const ikkeFullforteAktiviteter = getIkkeFullforteAktiviteter(accessToken, +params.behandlingId)

  return {
    ikkeFullforteAktiviteter: ikkeFullforteAktiviteter,
  }
}

export default function AvhengigeBehandlinger() {
  const { ikkeFullforteAktiviteter } = useLoaderData<typeof loader>()

  return (
    <Suspense fallback={<Skeleton variant="text" width="100%" />}>
      <Await resolve={ikkeFullforteAktiviteter}>
        {(it) => <IkkeFullforteAktiviteter ikkeFullforteAktiviteter={it} />}
      </Await>
    </Suspense>
  )
}
