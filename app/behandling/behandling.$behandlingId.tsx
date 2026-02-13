import { useOutletContext } from 'react-router'
import invariant from 'tiny-invariant'
import BehandlingCard from '~/behandling/BehandlingCard'
import type { MeResponse } from '~/brukere/brukere'
import { replaceTemplates } from '~/common/replace-templates'
import { subdomain } from '~/common/utils'
import { apiPost } from '~/services/api.server'
import { requireAccessToken } from '~/services/auth.server'
import {
  bekreftStoppBehandling,
  endrePlanlagtStartet,
  fjernFraDebug,
  fortsettAvhengigeBehandlinger,
  fortsettBehandling,
  getBehandling,
  getDetaljertFremdrift,
  godkjennOpprettelse,
  patchBehandling,
  runBehandling,
  sendTilManuellMedKontrollpunkt,
  stopp,
  taTilDebug,
} from '~/services/behandling.server'
import { env, isAldeLinkEnabled } from '~/services/env.server'
import type { DetaljertFremdriftDTO } from '~/types'
import type { Route } from './+types/behandling.$behandlingId'

export const OPERATION = {
  fjernFraDebug: 'fjernFraDebug',
  fortsett: 'fortsett',
  fortsettAvhengigeBehandlinger: 'fortsettAvhengigeBehandlinger',
  godkjennOpprettelse: 'godkjennOpprettelse',
  bekreftStoppBehandling: 'bekreftStoppBehandling',
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

const getBool = (v: FormDataEntryValue | null) => v === 'true' || v === 'on' || v === '1'

function getField(form: FormData, name: string): { value: string; error?: never } | { value?: never; error: string } {
  const v = form.get(name)
  if (typeof v !== 'string' || v.length === 0) {
    return { error: `Påkrevd felt mangler: ${name}` }
  }
  return { value: v }
}

function operationHandlers(
  accessToken: string,
  request: Request,
  behandlingId: string,
  operation: Operation,
  form: FormData,
): { errors: Record<string, string>; handler?: () => Promise<void> } {
  const errors: Record<string, string> = {}

  const ansvarligTeam = getField(form, 'ansvarligTeam')
  if (operation === OPERATION.oppdaterAnsvarligTeam && ansvarligTeam.error) {
    errors.ansvarligTeam = ansvarligTeam.error
  }
  const kontrollpunkt = getField(form, 'kontrollpunkt')
  if (operation === OPERATION.sendTilManuellMedKontrollpunkt && kontrollpunkt.error) {
    errors.kontrollpunkt = kontrollpunkt.error
  }
  const beskrivelse = form.get('begrunnelse')
  let trimmedBegrunnelse = ''
  if (operation === OPERATION.stopp) {
    if (typeof beskrivelse !== 'string' || beskrivelse.trim().length === 0) {
      errors.begrunnelse = 'Du må fylle ut en begrunnelse for å stoppe behandlingen.'
    } else if (beskrivelse.trim().length < 10) {
      errors.begrunnelse = 'Begrunnelsen er for kort.'
    } else {
      trimmedBegrunnelse = beskrivelse.trim()
    }
  }

  let handler: (() => Promise<void>) | undefined
  if (Object.keys(errors).length === 0) {
    switch (operation) {
      case OPERATION.fjernFraDebug:
        handler = () => fjernFraDebug(accessToken, behandlingId)
        break
      case OPERATION.fortsett:
        handler = () => fortsettBehandling(accessToken, behandlingId, getBool(form.get('nullstillPlanlagtStartet')))
        break
      case OPERATION.fortsettAvhengigeBehandlinger:
        handler = () => fortsettAvhengigeBehandlinger(accessToken, behandlingId)
        break
      case OPERATION.oppdaterAnsvarligTeam:
        if (ansvarligTeam.value)
          handler = () => patchBehandling(accessToken, behandlingId, { ansvarligTeam: ansvarligTeam.value })
        break
      case OPERATION.runBehandling:
        handler = () => runBehandling(accessToken, behandlingId)
        break
      case OPERATION.sendTilManuellMedKontrollpunkt:
        if (kontrollpunkt.value)
          handler = () => sendTilManuellMedKontrollpunkt(accessToken, behandlingId, kontrollpunkt.value)
        break
      case OPERATION.sendTilOppdragPaNytt:
        handler = () =>
          apiPost(`/api/vedtak/iverksett/${behandlingId}/sendtiloppdragpanytt`, undefined, request).then(() => {})
        break
      case OPERATION.stopp:
        handler = () => stopp(accessToken, behandlingId, trimmedBegrunnelse)
        break
      case OPERATION.godkjennOpprettelse:
        handler = () => godkjennOpprettelse(accessToken, behandlingId)
        break
      case OPERATION.bekreftStoppBehandling:
        handler = () => bekreftStoppBehandling(accessToken, behandlingId)
        break
      case OPERATION.endrePlanlagtStartet:
        handler = () => endrePlanlagtStartet(accessToken, behandlingId, String(form.get('nyPlanlagtStartet')))
        break
      case OPERATION.taTilDebug:
        handler = () => taTilDebug(accessToken, behandlingId)
        break
    }
  }
  return { errors, handler }
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
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
    psakSakUrlTemplate: replaceTemplates(env.psakSakUrlTemplate, { subdomain: subdomain(url) }),
  }
}

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.behandlingId, 'Mangler parameter: behandlingId')
  const behandlingId = params.behandlingId
  const accessToken = await requireAccessToken(request)

  const form = await request.formData()
  const operation = form.get('operation')
  if (!isOperation(operation)) {
    return { errors: { operation: `Operasjon mangler eller er ukjent: ${String(operation)}` } }
  }

  const { errors, handler } = operationHandlers(accessToken, request, behandlingId, operation, form)
  if (Object.keys(errors).length > 0 || !handler) {
    return { errors }
  }
  await handler()
  return null
}

export default function Behandling({ loaderData }: Route.ComponentProps) {
  const { aldeBehandlingUrlTemplate, behandling, detaljertFremdrift, psakSakUrlTemplate } = loaderData

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
