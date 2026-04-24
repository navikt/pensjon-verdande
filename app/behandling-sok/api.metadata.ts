/**
 * Resource route for å hente metadata for en behandlingstype on demand.
 * Kalles fra hovedsiden via useFetcher når brukeren bytter behandlingstype i draft,
 * slik at editorene viser dropdowns for valgt type uten at brukeren må kjøre søk først.
 */
import { data } from 'react-router'
import { hentBehandlingMetadata } from './metadata-cache.server'

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const behandlingType = url.searchParams.get('type')
  if (!behandlingType) {
    return data({ error: 'type-parameter mangler' }, { status: 400 })
  }
  try {
    const metadata = await hentBehandlingMetadata(behandlingType, request)
    return data(metadata)
  } catch (e) {
    const status = (e as { data?: { status?: number } })?.data?.status ?? 500
    if (status === 401 || status === 403) throw e
    const msg = (e as { data?: { detail?: string } })?.data?.detail ?? 'Kunne ikke hente metadata'
    return data({ error: msg }, { status })
  }
}
