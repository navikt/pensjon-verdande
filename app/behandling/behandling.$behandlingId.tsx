import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import {
  fjernFraDebug,
  fortsettAvhengigeBehandlinger,
  fortsettBehandling,
  getBehandling,
  getDetaljertFremdrift,
  runBehandling,
  sendTilManuellMedKontrollpunkt,
  stopp,
  taTilDebug,
} from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import BehandlingCard from '~/components/behandling/BehandlingCard'
import type { BehandlingerPage, DetaljertFremdriftDTO } from '~/types'
import { sendTilOppdragPaNytt } from '~/behandling/iverksettVedtak.server'

const OPERATIONS = [
  "fjernFraDebug",
  "fortsett",
  "fortsettAvhengigeBehandlinger",
  "runBehandling",
  "sendTilManuellMedKontrollpunkt",
  "sendTilOppdragPaNytt",
  "stopp",
  "taTilDebug",
] as const

type Operation = (typeof OPERATIONS)[number]
const OperationSet = new Set<string>(OPERATIONS)

function isOperation(x: unknown): x is Operation {
  return typeof x === "string" && OperationSet.has(x)
}

function requireField(form: FormData, name: string): string {
  const v = form.get(name)
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Påkrevd felt mangler: ${name}`)
  }
  return v
}

const getBool = (v: FormDataEntryValue | null) =>
  v === "true" || v === "on" || v === "1"

function operationHandlers(accessToken: string, behandlingId: string, form: FormData): Record<Operation, () => Promise<void>> {
  return {
    fjernFraDebug: () =>
      fjernFraDebug(accessToken, behandlingId),

    fortsett: () =>
      fortsettBehandling(accessToken, behandlingId, getBool(form.get('nullstillPlanlagtStartet'))),

    fortsettAvhengigeBehandlinger: () =>
      fortsettAvhengigeBehandlinger(accessToken, behandlingId),

    runBehandling: () =>
      runBehandling(accessToken, behandlingId),

    sendTilManuellMedKontrollpunkt: () =>
      sendTilManuellMedKontrollpunkt(accessToken, behandlingId, requireField(form, 'kontrollpunkt')),

    sendTilOppdragPaNytt: () =>
      sendTilOppdragPaNytt(accessToken, behandlingId),

    stopp: () =>
      stopp(accessToken, behandlingId),

    taTilDebug: () =>
      taTilDebug(accessToken, behandlingId),
  } satisfies Record<Operation, () => Promise<void>>
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, "Mangler parameter: behandlingId")
  const behandlingId = params.behandlingId

  const form = await request.formData()
  const operation = form.get("operation")
  if (!isOperation(operation)) {
    throw new Error(`Operasjon mangler eller er ukjent: ${String(operation)}`)
  }

  const accessToken = await requireAccessToken(request)

  const handlers = operationHandlers(accessToken, behandlingId, form);
  await handlers[operation]();
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)
  const behandling = await getBehandling(accessToken, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  let avhengigeBehandlinger: Promise<BehandlingerPage | null> | null = null
  let detaljertFremdrift: Promise<DetaljertFremdriftDTO | null> | null = null
  if (behandling._links && behandling._links['avhengigeBehandlinger']) {
    detaljertFremdrift = getDetaljertFremdrift(
      accessToken,
      behandling.behandlingId,
    )
  }

  return {
      behandling,
      avhengigeBehandlinger: avhengigeBehandlinger,
      detaljertFremdrift: detaljertFremdrift,
    }
}

export default function Behandling() {
  const { behandling, detaljertFremdrift } = useLoaderData<typeof loader>()

  return (
    <BehandlingCard
      behandling={behandling}
      detaljertFremdrift={detaljertFremdrift}
    />
  )
}
