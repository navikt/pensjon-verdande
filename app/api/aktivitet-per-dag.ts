import { asLocalDateString } from '~/common/date'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/aktivitet-per-dag'

type TidsserieDatapunkt = {
  periodeFra: string
  status: string
  antall: number
}

type TidsserieResponse = {
  behandlingType: string | null
  fom: string
  tom: string
  aggregering: string
  datapunkter: TidsserieDatapunkt[]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const parsed = Number.parseInt(searchParams.get('dager') ?? '30', 10)
  const dager = Number.isFinite(parsed) && parsed > 0 && parsed <= 3650 ? parsed : 30

  const fom = new Date()
  fom.setDate(fom.getDate() - dager)
  const fomStr = asLocalDateString(fom)
  const tomStr = asLocalDateString(new Date())

  const params = new URLSearchParams({
    fom: `${fomStr}T00:00:00.000`,
    tom: `${tomStr}T23:59:59.999`,
    aggregering: 'DAG',
  })

  return await apiGet<TidsserieResponse>(`/api/behandling/analyse/tidsserie?${params}`, request)
}
