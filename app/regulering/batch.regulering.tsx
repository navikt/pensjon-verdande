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

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  if (updates.formType === 'startReguleringUttrekk') {
    await startReguleringUttrekk(
      accessToken,
      updates.satsDato as string,
      updates.reguleringsDato as string,
      updates.iDebug === 'on',
    )
    return redirect(`/batch/regulering`)
  } else if (updates.formType === 'startReguleringOrkestrering') {
    await startReguleringOrkestrering(
      accessToken,
      updates.satsDato as string,
      updates.reguleringsDato as string,
      updates.maxFamiliebehandlinger as string,
    )
    return redirect(`/batch/regulering`)
  } else if (updates.formType === 'fortsettAvhengige') {
    await fortsettAvhengigeBehandling(
      accessToken,
      updates.behandlingIdRegulering as string,
      updates.reguleringBehandlingType as string,
      updates.antallBehandlinger as string,
      updates.behandlingStatusType as string,
    )

    return redirect(`/behandling/${updates.behandlingIdRegulering}`)
  } else if (updates.formType === 'endreKjorelop') {
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
    <div>
      <h1>Regulering</h1>
      <div>
        <table width="100%">
          <tr>
            <td>
              <ReguleringUttrekk />
            </td>
            <td>
              <ReguleringOrkestrering />
            </td>
          </tr>
          <tr>
            <td>
              <EndreKjoreLopTilBehandlinger />
            </td>
            <td>
              <FortsettAvhengigeReguleringBehandlinger />
            </td>
          </tr>
        </table>
      </div>

      <div>
        <h2>Orkestrering</h2>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlingerOrkestrering as BehandlingerPage}
        />
        <h2>Uttrekk</h2>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlingerUttrekk as BehandlingerPage}
        />
      </div>
    </div>
  )
}
