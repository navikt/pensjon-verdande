import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import {
  endreKjorelopIverksettVedtakBehandlinger,
  fortsettAvhengigeBehandling,
  startReguleringOrkestrering,
  startReguleringUttrekk,
} from '~/services/batch.bpen068.server'
import ReguleringUttrekk from '~/components/regulering/regulering-uttrekk'
import FortsettAvhengigeReguleringBehandlinger from '~/components/regulering/regulering-fortsett-avhengige'
import { useLoaderData } from 'react-router';
import { getBehandlinger } from '~/services/behandling.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import type { BehandlingerPage } from '~/types'
import ReguleringOrkestrering from '~/components/regulering/regulering-orkestrering'
import EndreKjoreLopTilBehandlinger from '~/components/regulering/regulering-endre-kjore-lop'

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

  return redirect('/error');
}

export const loader = async ({ request }: ActionFunctionArgs) => {
  let { searchParams } = new URL(request.url);
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlingerUttrekk = await getBehandlinger(
    accessToken,
    "ReguleringUttrekk",
    searchParams.get('status'),
    searchParams.get('ansvarligTeam'),
    null,
    null,
    null,
    true,
    page ? +page : 0,
    size ? +size : 3,
    null
  )
  const behandlingerOrkestrering = await getBehandlinger(
    accessToken,
    "ReguleringOrkestrering",
    searchParams.get('status'),
    searchParams.get('ansvarligTeam'),
    null,
    null,
    null,
    true,
    page ? +page : 0,
    size ? +size : 3,
    null
  )
  if (!behandlingerUttrekk) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandlingerUttrekk, behandlingerOrkestrering }
}

export default function OpprettReguleringBatchRoute() {
  const { behandlingerUttrekk, behandlingerOrkestrering } =
    useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Regulering</h1>
      <div>
        <table width="100%">
          <tr>
            <td><ReguleringUttrekk /></td>
            <td><ReguleringOrkestrering /></td>
          </tr>
          <tr>
            <td><EndreKjoreLopTilBehandlinger /></td>
            <td><FortsettAvhengigeReguleringBehandlinger /></td>
          </tr>
        </table>
      </div>

      <div id="behandlinger">
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
