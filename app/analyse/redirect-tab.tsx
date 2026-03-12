import { redirect } from 'react-router'
import type { Route } from './+types/redirect-tab'

/** Maps old flat tab paths to their new section */
const tabToSection: Record<string, string> = {
  nokkeltall: 'ytelse',
  statustrend: 'ytelse',
  varighet: 'ytelse',
  ko: 'ytelse',
  automatisering: 'ytelse',
  'ende-til-ende': 'ytelse',
  feilanalyse: 'kvalitet',
  gjenforsok: 'kvalitet',
  stoppet: 'kvalitet',
  kontrollpunkter: 'kvalitet',
  manuelle: 'kvalitet',
  aktivitetsvarighet: 'aktiviteter-og-tid',
  kalendertid: 'aktiviteter-og-tid',
  aktiviteter: 'aktiviteter-og-tid',
  tidspunkt: 'aktiviteter-og-tid',
  planlagt: 'aktiviteter-og-tid',
  teamytelse: 'dimensjoner',
  prioritet: 'dimensjoner',
  gruppe: 'dimensjoner',
  sakstype: 'dimensjoner',
  kravtype: 'dimensjoner',
  vedtakstype: 'dimensjoner',
  'auto-brev': 'dimensjoner',
}

export function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const tab = params['*'] || ''
  const section = tabToSection[tab]
  if (section) {
    throw redirect(`/analyse/${section}/${tab}${url.search}`)
  }
  throw redirect(`/analyse/ytelse${url.search}`)
}
