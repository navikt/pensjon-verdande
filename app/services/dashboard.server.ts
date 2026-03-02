import NodeCache from 'node-cache'
import { apiGet } from '~/services/api.server'
import type { DashboardResponse } from '~/types'

const dashboardCache = new NodeCache({ stdTTL: 30 })

const CACHE_KEY = 'dashboard-summary'

export async function getDashboardSummary(request: Request): Promise<DashboardResponse> {
  const cached = dashboardCache.get<DashboardResponse>(CACHE_KEY)
  if (cached) {
    return cached
  }

  const response = await apiGet<DashboardResponse>('/api/behandling/dashboard-summary', request)
  dashboardCache.set(CACHE_KEY, response)
  return response
}
