import { sub } from 'date-fns'
import { toIsoDate } from '~/common/date'

export type SakAnalyseParams = {
  fom: string
  tom: string
  aggregering: string
  sakTyper: string[]
  kravGjelderListe: string[]
  behandlingstyper: string[]
  /** Query string: `fom=...&tom=...` + evt. sakType/kravGjelder */
  params: URLSearchParams
  /** Query string med aggregering: `fom=...&tom=...&aggregering=...` + evt. sakType/kravGjelder */
  paramsAgg: URLSearchParams
}

export function parseSakAnalyseParams(request: Request): SakAnalyseParams {
  const url = new URL(request.url)
  const now = new Date()

  const fom = url.searchParams.get('fom') || toIsoDate(sub(now, { days: 30 }))
  const tom = url.searchParams.get('tom') || toIsoDate(now)
  const aggregering = url.searchParams.get('aggregering') || 'MAANED'
  const sakTyper = url.searchParams.getAll('sakType')
  const kravGjelderListe = url.searchParams.getAll('kravGjelder')
  const behandlingstyper = url.searchParams.getAll('behandlingType')

  const fomTimestamp = fom.includes('T') ? fom : `${fom}T00:00:00.000`
  const tomTimestamp = tom.includes('T') ? tom : `${tom}T23:59:59.999`

  const params = new URLSearchParams({ fom: fomTimestamp, tom: tomTimestamp })
  const paramsAgg = new URLSearchParams({ fom: fomTimestamp, tom: tomTimestamp, aggregering })

  for (const st of sakTyper) {
    params.append('sakType', st)
    paramsAgg.append('sakType', st)
  }
  for (const kg of kravGjelderListe) {
    params.append('kravGjelder', kg)
    paramsAgg.append('kravGjelder', kg)
  }

  return { fom, tom, aggregering, sakTyper, kravGjelderListe, behandlingstyper, params, paramsAgg }
}
