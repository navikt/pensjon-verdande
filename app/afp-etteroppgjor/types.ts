import { Behandlingstatus } from '~/types'

export type HentAlleResponse = {
  etteroppgjor: AfpEtteroppgjorResponse[]
}

export type AfpEtteroppgjorResponse = {
  behandlingId: number,
  kjorear: number,
  opprettet: string,
  sisteKjoring?: string,
  planlagtStartet?: string,
  utsattTil?: string,
  stoppet?: string,
  ferdig?: string,
  status: Behandlingstatus,
}

export type StartEtteroppgjorResponse = {
  behandlingId: number,
}
