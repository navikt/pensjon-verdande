import type { ActionFunctionArgs} from '@remix-run/node';
import { json, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { fortsettAvhengigeBehandling, startReguleringOrkestrering, startReguleringUttrekk, } from '~/services/batch.bpen068.server'
import ReguleringUttrekk from '~/components/regulering/regulering-uttrekk'
import FortsettAvhengigeReguleringBehandlinger from '~/components/regulering/regulering-fortsett-avhengige'
import { useLoaderData } from '@remix-run/react'
import { getBehandlinger } from '~/services/behandling.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import type { BehandlingerPage } from '~/types'
import ReguleringOrkestrering from '~/components/regulering/regulering-orkestrering'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  if (updates.formType === 'startReguleringUttrekk') {
    await startReguleringUttrekk(
      accessToken,
      updates.satsDato as string,
      updates.reguleringsDato as string,
      updates.sisteAktivitet as string,
      updates.iDebug === 'on',
    )
    return redirect(`/batch/regulering`)

  } else if (updates.formType === 'startReguleringOrkestrering') {
    await startReguleringOrkestrering(
      accessToken,
      updates.satsDato as string,
      updates.reguleringsDato as string,
      updates.sisteAktivitet as string,
      updates.maxFamiliebehandlinger as string,
    )
    await fortsettAvhengigeBehandling(
      accessToken,
      updates.behandlingIdRegulering as string,
      updates.reguleringBehandlingType as string,
      updates.antallBehandlinger as string,
      updates.fortsettTilAktivitet as string,
      updates.behandlingStatusType as string,
    )

    return redirect(`/batch/regulering`)
  } else if (updates.formType === 'fortsettAvhengige') {
    return redirect(`/behandling/${updates.behandlingIdRegulering}`)

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
    null,
    true,
    page ? +page : 0,
    size ? +size : 3,
    null
  )
  if (!behandlingerUttrekk) {
    throw new Response('Not Found', { status: 404 })
  }

  return json({ behandlingerUttrekk, behandlingerOrkestrering })
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
            <td></td>
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
