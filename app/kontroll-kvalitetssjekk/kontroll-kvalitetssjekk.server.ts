import { apiPost } from '~/services/api.server'

type StartBatchResponse = {
  behandlingId: number
}

type OpprettKontrollKvalitetssjekkBody = {
  fomDato: string
  tomDato: string
  antallPerEnhet: number
  vedtakType: string
  kravGjelder: string[]
}

export async function opprettKontrollKvalitetssjekk(body: OpprettKontrollKvalitetssjekkBody, request: Request) {
  return await apiPost<StartBatchResponse>('/api/behandling/kontroll-kvalitetssjekk', body, request)
}
