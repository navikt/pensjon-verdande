import { apiPost } from '~/services/api.server'
import { getBehandling } from '~/services/behandling.server'
import type { Route } from './+types/send-behandlinger-til-manuell'

type SendBehandlingerTilManuellPayload = {
  behandlingIder: number[]
  kontrollpunkt?: string
  oppgavetekst?: string
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const behandlingIder = url.searchParams.getAll('behandlingId').map(Number)

  if (
    behandlingIder.length === 0 ||
    behandlingIder.length > 100 ||
    behandlingIder.some((id) => !Number.isSafeInteger(id) || id <= 0)
  ) {
    throw new Response('Ugyldig liste med behandlinger.', { status: 400 })
  }

  const unikeBehandlingIder = [...new Set(behandlingIder)]
  const behandlinger = await Promise.all(
    unikeBehandlingIder.map((behandlingId) => getBehandling(request, String(behandlingId))),
  )

  return {
    behandlingIder: unikeBehandlingIder,
    kanSendesTilManuell: behandlinger
      .filter((behandling) => behandling._links?.sendTilManuellMedKontrollpunkt)
      .map((behandling) => behandling.behandlingId),
    kontrollpunkter: (behandlinger[0].muligeKontrollpunkt ?? []).filter((kontrollpunkt) =>
      behandlinger.every((behandling) =>
        behandling.muligeKontrollpunkt?.some((mulig) => mulig.kontrollpunkt === kontrollpunkt.kontrollpunkt),
      ),
    ),
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const behandlingIderRaw = formData.get('behandlingIder')
  const modusRaw = formData.get('modus')
  const kontrollpunktRaw = formData.get('kontrollpunkt')
  const oppgavetekstRaw = formData.get('oppgavetekst')

  if (typeof behandlingIderRaw !== 'string' || typeof modusRaw !== 'string') {
    return { success: false, error: 'Velg behandlinger og oppgavetype.' }
  }

  let behandlingIder: unknown
  try {
    behandlingIder = JSON.parse(behandlingIderRaw)
  } catch {
    return { success: false, error: 'Ugyldig liste med behandlinger.' }
  }

  if (
    !Array.isArray(behandlingIder) ||
    behandlingIder.length === 0 ||
    !behandlingIder.every((id) => Number.isSafeInteger(id) && id > 0)
  ) {
    return { success: false, error: 'Velg minst én gyldig behandling.' }
  }

  if (modusRaw !== 'kontrollpunkt' && modusRaw !== 'egendefinert') {
    return { success: false, error: 'Ugyldig oppgavetype.' }
  }

  const unikeBehandlingIder = [...new Set(behandlingIder)]
  const oppgavetekst = typeof oppgavetekstRaw === 'string' ? oppgavetekstRaw.trim() : ''
  const kontrollpunkt = typeof kontrollpunktRaw === 'string' ? kontrollpunktRaw.trim() : ''

  if (modusRaw === 'kontrollpunkt' && !kontrollpunkt) {
    return { success: false, error: 'Velg et kontrollpunkt.' }
  }
  if (modusRaw === 'egendefinert' && !oppgavetekst) {
    return { success: false, error: 'Skriv inn oppgavetekst.' }
  }

  const behandlinger = await Promise.all(
    unikeBehandlingIder.map((behandlingId) => getBehandling(request, String(behandlingId))),
  )

  if (behandlinger.some((behandling) => !behandling._links?.sendTilManuellMedKontrollpunkt)) {
    return { success: false, error: 'Alle valgte behandlinger må kunne sendes til manuell behandling.' }
  }

  let payload: SendBehandlingerTilManuellPayload
  if (modusRaw === 'kontrollpunkt') {
    if (
      behandlinger.some(
        (behandling) => !behandling.muligeKontrollpunkt?.some((mulig) => mulig.kontrollpunkt === kontrollpunkt),
      )
    ) {
      return { success: false, error: 'Kontrollpunktet kan ikke brukes på alle valgte behandlinger.' }
    }
    payload = { behandlingIder: unikeBehandlingIder, kontrollpunkt }
  } else {
    payload = { behandlingIder: unikeBehandlingIder, oppgavetekst }
  }

  await apiPost<void>('/api/behandling/opprett-oppgaver', payload, request)

  return { success: true, antall: unikeBehandlingIder.length }
}
