import { requireAccessToken } from '~/services/auth.server'
import { search } from '~/services/behandling.server'
import { logger } from '~/services/logger.server'
import type { BehandlingerPage } from '~/types'
import type { Route } from './+types/sok'

function getStringValue(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function getIntValue(formData: FormData, key: string, defaultValue: number, max?: number): number {
  const str = getStringValue(formData, key)
  if (!str) return defaultValue
  const parsed = Number.parseInt(str, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return defaultValue
  if (max !== undefined && parsed > max) return max
  return parsed
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const query = getStringValue(formData, 'query')
  let behandlinger: BehandlingerPage | null

  if (query) {
    try {
      const accessToken = await requireAccessToken(request)

      const page = getIntValue(formData, 'page', 0)
      const size = getIntValue(formData, 'size', 10, 100)

      behandlinger = await search(
        accessToken,
        query,
        getStringValue(formData, 'behandlingType'),
        getStringValue(formData, 'status'),
        getStringValue(formData, 'ansvarligTeam'),
        page,
        size,
        getStringValue(formData, 'sort'),
      )
    } catch (error) {
      if (error instanceof Response) {
        throw error
      }
      logger.error('Søk feilet: %s', error instanceof Error ? error.message : 'Ukjent feil')
      return { behandlinger: null, error: 'Søk feilet, prøv igjen senere' }
    }
  } else {
    behandlinger = null
  }

  return { behandlinger, error: null }
}
