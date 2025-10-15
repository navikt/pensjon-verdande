import { type ActionFunctionArgs, type LoaderFunctionArgs, useLoaderData, useOutletContext } from 'react-router'
import invariant from 'tiny-invariant'
import BehandlingCard from '~/behandling/BehandlingCard'
import { sendTilOppdragPaNytt } from '~/behandling/iverksettVedtak.server'
import type { MeResponse } from '~/brukere/brukere'
import { replaceTemplates } from '~/common/replace-templates'
import { subdomain } from '~/common/utils'
import { requireAccessToken } from '~/services/auth.server'
import {
  endrePlanlagtStartet,
  fjernFraDebug,
  fortsettAvhengigeBehandlinger,
  fortsettBehandling,
  getBehandling,
  getDetaljertFremdrift,
  patchBehandling,
  runBehandling,
  sendTilManuellMedKontrollpunkt,
  stopp,
  taTilDebug,
} from '~/services/behandling.server'
import { env, isAldeLinkEnabled } from '~/services/env.server'
import type { DetaljertFremdriftDTO } from '~/types'

export const OPERATION = {
  fjernFraDebug: 'fjernFraDebug',
  fortsett: 'fortsett',
  fortsettAvhengigeBehandlinger: 'fortsettAvhengigeBehandlinger',
  oppdaterAnsvarligTeam: 'oppdaterAnsvarligTeam',
  runBehandling: 'runBehandling',
  sendTilManuellMedKontrollpunkt: 'sendTilManuellMedKontrollpunkt',
  sendTilOppdragPaNytt: 'sendTilOppdragPaNytt',
  stopp: 'stopp',
  endrePlanlagtStartet: 'endrePlanlagtStartet',
  taTilDebug: 'taTilDebug',
} as const

export type Operation = (typeof OPERATION)[keyof typeof OPERATION]
export const OPERATIONS = Object.values(OPERATION) as Operation[]
export const OperationSet = new Set<string>(OPERATIONS)

function isOperation(x: unknown): x is Operation {
  return typeof x === 'string' && OperationSet.has(x)
}

function requireField(form: FormData, name: string): string {
  const v = form.get(name)
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`Påkrevd felt mangler: ${name}`)
  }
  return v
}

const getBool = (v: FormDataEntryValue | null) => v === 'true' || v === 'on' || v === '1'

function operationHandlers(
  accessToken: string,
  behandlingId: string,
  form: FormData,
): Record<Operation, () => Promise<void>> {
  return {
    fjernFraDebug: () => fjernFraDebug(accessToken, behandlingId),

    fortsett: () => fortsettBehandling(accessToken, behandlingId, getBool(form.get('nullstillPlanlagtStartet'))),

    fortsettAvhengigeBehandlinger: () => fortsettAvhengigeBehandlinger(accessToken, behandlingId),

    oppdaterAnsvarligTeam: () =>
      patchBehandling(accessToken, behandlingId, {
        ansvarligTeam: requireField(form, 'ansvarligTeam'),
      }),

    runBehandling: () => runBehandling(accessToken, behandlingId),

    sendTilManuellMedKontrollpunkt: () =>
      sendTilManuellMedKontrollpunkt(accessToken, behandlingId, requireField(form, 'kontrollpunkt')),

    sendTilOppdragPaNytt: () => sendTilOppdragPaNytt(accessToken, behandlingId),

    stopp: () => stopp(accessToken, behandlingId),

    endrePlanlagtStartet: () => endrePlanlagtStartet(accessToken, behandlingId, String(form.get('nyPlanlagtStartet'))),

    taTilDebug: () => taTilDebug(accessToken, behandlingId),
  } satisfies Record<Operation, () => Promise<void>>
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Mangler parameter: behandlingId')
  const behandlingId = params.behandlingId

  const form = await request.formData()
  const operation = form.get('operation')
  if (!isOperation(operation)) {
    throw new Error(`Operasjon mangler eller er ukjent: ${String(operation)}`)
  }

  const accessToken = await requireAccessToken(request)

  const handlers = operationHandlers(accessToken, behandlingId, form)
  await handlers[operation]()
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const url = new URL(request.url)

  const accessToken = await requireAccessToken(request)
  const behandling = await getBehandling(accessToken, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  let detaljertFremdrift: Promise<DetaljertFremdriftDTO | undefined> | undefined
  if (behandling._links?.avhengigeBehandlinger) {
    detaljertFremdrift = getDetaljertFremdrift(request, behandling.behandlingId)
  }

  return {
    aldeBehandlingUrlTemplate: isAldeLinkEnabled
      ? replaceTemplates(env.aldeBehandlingUrlTemplate, { subdomain: subdomain(url) })
      : undefined,
    behandling,
    detaljertFremdrift: detaljertFremdrift,
    psakSakUrlTemplate: env.psakSakUrlTemplate,
  }
}

export default function Behandling() {
  const { aldeBehandlingUrlTemplate, behandling, detaljertFremdrift, psakSakUrlTemplate } =
    useLoaderData<typeof loader>()

  const me = useOutletContext<MeResponse>()

  return (
    <BehandlingCard
      aldeBehandlingUrlTemplate={aldeBehandlingUrlTemplate}
      behandling={behandling}
      detaljertFremdrift={detaljertFremdrift}
      me={me}
      psakSakUrlTemplate={psakSakUrlTemplate}
    />
  )
}
