import { redirect } from 'react-router'
import type { Route } from './+types/redirect-tab'

/** Maps old flat tab paths to their new section-based paths */
const tabRedirect: Record<string, string> = {
  nokkeltall: 'ytelse/nokkeltall',
  statustrend: 'ytelse/statustrend',
  varighet: 'ytelse/varighet',
  ko: 'ytelse/ko',
  'ende-til-ende': 'ytelse/ende-til-ende',
  automatisering: 'automatisering/oversikt',
  stoppet: 'automatisering/stoppet',
  feilanalyse: 'automatisering/feilanalyse',
  gjenforsok: 'automatisering/gjenforsok',
  kontrollpunkter: 'automatisering/kontrollpunkter',
  manuelle: 'automatisering/manuelle',
  aktivitetsvarighet: 'aktiviteter-og-tid/aktivitetsvarighet',
  kalendertid: 'aktiviteter-og-tid/kalendertid',
  aktiviteter: 'aktiviteter-og-tid/aktiviteter',
  tidspunkt: 'aktiviteter-og-tid/tidspunkt',
  planlagt: 'aktiviteter-og-tid/planlagt',
  teamytelse: 'dimensjoner/teamytelse',
  prioritet: 'dimensjoner/prioritet',
  gruppe: 'dimensjoner/gruppe',
  sakstype: 'dimensjoner/sakstype',
  kravtype: 'dimensjoner/kravtype',
  vedtakstype: 'dimensjoner/vedtakstype',
  'auto-brev': 'dimensjoner/auto-brev',
}

export function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const tab = params['*'] || ''
  const path = tabRedirect[tab]
  if (path) {
    throw redirect(`/analyse/${path}${url.search}`)
  }
  throw redirect(`/analyse/ytelse${url.search}`)
}
