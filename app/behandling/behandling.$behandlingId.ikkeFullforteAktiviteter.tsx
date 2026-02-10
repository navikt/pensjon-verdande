import { Skeleton } from '@navikt/ds-react'
import { Suspense } from 'react'
import { Await } from 'react-router'
import invariant from 'tiny-invariant'
import IkkeFullforteAktiviteter from '~/components/behandling/IkkeFullforteAktiviteter'
import { getIkkeFullforteAktiviteter } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.ikkeFullforteAktiviteter'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const ikkeFullforteAktiviteter = getIkkeFullforteAktiviteter(request, +params.behandlingId)

  return {
    ikkeFullforteAktiviteter: ikkeFullforteAktiviteter,
  }
}

export default function AvhengigeBehandlinger({ loaderData }: Route.ComponentProps) {
  const { ikkeFullforteAktiviteter } = loaderData

  return (
    <Suspense fallback={<Skeleton variant="text" width="100%" />}>
      <Await resolve={ikkeFullforteAktiviteter}>
        {(it) => <IkkeFullforteAktiviteter ikkeFullforteAktiviteter={it} />}
      </Await>
    </Suspense>
  )
}
