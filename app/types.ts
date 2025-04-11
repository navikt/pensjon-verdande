export enum Behandlingstatus {
  OPPRETTET= 'OPPRETTET',
  UNDER_BEHANDLING="UNDER_BEHANDLING",
  FULLFORT="FULLFORT",
  STOPPET="STOPPET",
  DEBUG="DEBUG",
}

export enum Aktivitetstatus {
  OPPRETTET='OPPRETTET',
  FEILENDE='FEILENDE',
  FULLFORT='FULLFORT',
  UNDER_BEHANDLING='UNDER_BEHANDLING',
}

export type BehandlingDto = {
  level: number | null
  behandlingId: number
  type: string
  uuid: string
  funksjonellIdentifikator: string
  forrigeBehandlingId: number | null
  sisteKjoring: string
  utsattTil: string | null
  stoppet: string | null
  opprettet: string
  ansvarligTeam: string | null
  status: string
  prioritet: number
  behandlingKjoringer: BehandlingKjoringDTO[]
  aktiviteter: AktivitetDTO[]

  fnr: string | null
  sakId: number | null
  kravId: number | null
  vedtakId: number | null
  journalpostId: string | null
  kibanaUrl?: string
  feilmelding: string | null

  parametere: any | null

  debugJson: string | null

  _links?: HalLinks
}

export type DetaljertFremdriftDTO = {
  ferdig: number
  totalt: number
  behandlingerDetaljertFremdrift: BehandlingDetaljertFremdriftDTO[],
}

export type BehandlingDetaljertFremdriftDTO = {
  level: number
  behandlingCode: string
  ferdig: number
  totalt: number
  debug: number
  fullfort: number
  opprettet: number
  stoppet: number
  underBehandling: number
  feilende: number
}

export type BehandlingKjoringDTO = {
  behandlingKjoringId: number
  behandlingId: number
  aktivitetId: number | null
  startet: string
  avsluttet: string
  correlationId: string
  feilmelding: string | null
  stackTrace: string | null

  _links?: HalLinks
}

export type AktivitetDTO = {
  aktivitetId: number
  type: string
  opprettet: string
  uuid: string
  funksjonellIdentifikator: string
  antallGangerKjort: number
  sisteAktiveringsdato: string
  status: string
  utsattTil: string | null
  ventPaForegaendeAktiviteter: boolean
}

export type BehandlingerPage = {
  content: BehandlingDto[]

  pageable: string
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  numberOfElements: number
  number: number
  size: number
  empty: boolean

  behandlingStatuser: string[],
  behandlingTyper: string[],

  sort: PageSort
}

export type PageSort = {
  unsorted: boolean
  sorted: boolean
  empty: boolean
}

export type BehandlingAntall = {
  navn: string
  antall: number
}

export type DatoAntall = {
  dato: string
  antall: number
}

export type DashboardResponse = {
  totaltAntallBehandlinger: number
  feilendeBehandlinger: number
  antallUferdigeBehandlinger: number
  ukjenteBehandlingstyper: string[]
  behandlingAntall: BehandlingAntall[]
  opprettetPerDag: DatoAntall[]
}

export interface HalLink {
  href: string
  type: string
}

export interface HalLinks {
  [s: string]: HalLink | HalLink[]
}

export type StartBatchResponse = {
  behandlingId: number
}
export type FortsettBatchResponse = {
  behandlingId: number[]
}
export type EndreKjorelopIverksettVedtakResponse = {
  behandlingId: number[]
}

export type OmregningRequest = {
  behandlingsnokkel: string
  omregningstidspunkt: string
  omregneAFP: boolean
  behandleApneKrav: boolean
  brukFaktoromregning: boolean
  brukKjoreplan: boolean
  opprettAlleOppgaver: boolean
  sjekkYtelseFraAvtaleland: boolean
  kravGjelder: string
  kravArsak: string
  toleransegrenseSett: string
  oppgaveSett: string
  brukPpen015: boolean
  oppgavePrefiks: string
  utsattTil: string
}