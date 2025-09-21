import { Heading, HGrid, VStack } from '@navikt/ds-react'
import type { ActionFunctionArgs } from 'react-router'
import { redirect, useLoaderData } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import EndreKjoreLopTilBehandlinger from '~/components/regulering/regulering-endre-kjore-lop'
import FortsettAvhengigeReguleringBehandlinger from '~/components/regulering/regulering-fortsett-avhengige'
import ReguleringOrkestrering from '~/components/regulering/regulering-orkestrering'
import ReguleringUttrekk from '~/components/regulering/regulering-uttrekk'
import {
  endreKjorelopIverksettVedtakBehandlinger,
  fortsettAvhengigeBehandling,
  startReguleringOrkestrering,
  startReguleringUttrekk,
} from '~/regulering/batch.bpen068.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'

export const startReguleringUttrekkFormAction = 'startReguleringUttrekk'
export const startReguleringOrkestreringFormAction = 'startReguleringOrkestrering'
export const fortsettAvhengigeFormAction = 'fortsettAvhengige'
export const endreKjorelopFormAction = 'endreKjorelop'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  if (updates.formType === startReguleringUttrekkFormAction) {
    await startReguleringUttrekk(
      accessToken,
      updates.satsDato as string,
      updates.reguleringsDato as string,
      updates.iDebug === 'on',
    )
    return redirect(`/batch/regulering`)
  } else if (updates.formType === startReguleringOrkestreringFormAction) {
    await startReguleringOrkestrering(
      accessToken,
      updates.satsDato as string,
      updates.reguleringsDato as string,
      updates.maxFamiliebehandlinger as string,
    )
    return redirect(`/batch/regulering`)
  } else if (updates.formType === fortsettAvhengigeFormAction) {
    await fortsettAvhengigeBehandling(
      accessToken,
      updates.behandlingIdRegulering as string,
      updates.reguleringBehandlingType as string,
      updates.antallBehandlinger as string,
      updates.behandlingStatusType as string,
    )

    return redirect(`/behandling/${updates.behandlingIdRegulering}`)
  } else if (updates.formType === endreKjorelopFormAction) {
    await endreKjorelopIverksettVedtakBehandlinger(
      accessToken,
      updates.behandlingIdRegulering as string,
      updates.velgKjoreLop as string,
    )
    return redirect(`/batch/regulering`)
  }

  return redirect('/error')
}

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlingerUttrekk = await getBehandlinger(accessToken, {
    behandlingType: 'ReguleringUttrekk',
    status: searchParams.get('status'),
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    isBatch: true,
    page: page ? +page : 0,
    size: size ? +size : 3,
    sort: null,
  })
  const behandlingerOrkestrering = await getBehandlinger(accessToken, {
    behandlingType: 'ReguleringOrkestrering',
    status: searchParams.get('status'),
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    isBatch: true,
    page: page ? +page : 0,
    size: size ? +size : 3,
  })
  if (!behandlingerUttrekk) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandlingerUttrekk, behandlingerOrkestrering }
}

export default function OpprettReguleringBatchRoute() {
  const { behandlingerUttrekk, behandlingerOrkestrering } = useLoaderData<typeof loader>()

  return (
    <VStack gap="8">
      <Heading level="1" size="medium">
        Regulering
      </Heading>

      <HGrid columns={2} gap="8">
        <ReguleringUttrekk />
        <ReguleringOrkestrering />
        <EndreKjoreLopTilBehandlinger />
        <FortsettAvhengigeReguleringBehandlinger />
      </HGrid>

      <VStack>
        <Heading size="medium" level="2">
          Orkestrering
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlingerOrkestrering as BehandlingerPage}
        />
      </VStack>

      <VStack>
        <Heading size="medium" level="2">
          Uttrekk
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlingerUttrekk as BehandlingerPage}
        />
      </VStack>
    </VStack>
  )
}
