import { sub } from 'date-fns'
import { toIsoDate } from '~/common/date'
import type { Aggregeringsniva } from '../types'

export type AnalyseParams = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  kravBehandlingType: string | null
  /** Query string: `behandlingType=...&fom=...&tom=...` */
  params: URLSearchParams
  /** Query string med aggregering: `behandlingType=...&fom=...&tom=...&aggregering=...` */
  paramsAgg: URLSearchParams
}

export function parseAnalyseParams(request: Request): AnalyseParams {
  const url = new URL(request.url)
  const now = new Date()

  const behandlingType = url.searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = url.searchParams.get('fom') || toIsoDate(sub(now, { days: 30 }))
  const tom = url.searchParams.get('tom') || toIsoDate(now)
  const aggregering = (url.searchParams.get('aggregering') || 'UKE') as Aggregeringsniva
  const kravBehandlingType = url.searchParams.get('kravBehandlingType') || null

  // Send timestamps to backend: append time component only if not already present
  const fomTimestamp = fom.includes('T') ? fom : `${fom}T00:00:00.000`
  const tomTimestamp = tom.includes('T') ? tom : `${tom}T23:59:59.999`

  const params = new URLSearchParams({ behandlingType, fom: fomTimestamp, tom: tomTimestamp })
  const paramsAgg = new URLSearchParams({ behandlingType, fom: fomTimestamp, tom: tomTimestamp, aggregering })

  if (kravBehandlingType) {
    params.set('kravBehandlingType', kravBehandlingType)
    paramsAgg.set('kravBehandlingType', kravBehandlingType)
  }

  return { behandlingType, fom, tom, aggregering, kravBehandlingType, params, paramsAgg }
}
