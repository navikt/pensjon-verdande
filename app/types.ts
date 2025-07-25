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
  ferdig: string | null
  slettes: string | null
  stoppet: string | null
  opprettet: string
  ansvarligTeam: string | null
  status: string
  prioritet: number
  behandlingKjoringer: BehandlingKjoringDTO[]
  aktiviteter: AktivitetDTO[]
  muligeKontrollpunkt: KontrollpunktDecode[]

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

export type KontrollpunktDecode = {
  kontrollpunkt: string
  decode: string
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

export type IkkeFullforteAktiviteterDTO = {
  aktivitetOppsummering: GjenværendeAktivitetOppsummering[];
};

export type GjenværendeAktivitetOppsummering = {
  behandling: string;
  aktivitet: string;
  status: string;
  antall: number;
};
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

export type BehandlingManuellDto = {
  id: string; // UUID
  aktivitetId: number;
  opprettet: string;

  sakId: number;
  kravId?: number | null;
  kategori: string;
  beskrivelse: string;

  fagomrade: string;
  fagomradeDekode: string;
  oppgavekode: string;
  oppgavekodeDekode: string;

  aktivFra: string;

  oppgaveId?: number | null;
  oppgaveOpprettet: string | null;

  isFerdig: boolean;
};

export type BehandlingManuellPage = {
  content: BehandlingManuellDto[]

  pageable: string
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  numberOfElements: number
  number: number
  size: number
  empty: boolean

  sort: PageSort
}

export type PageSort = {
  unsorted: boolean
  sorted: boolean
  empty: boolean
}

export type BehandlingAntall = {
  navn: string
  behandlingType: string | undefined | null
  antall: number
}

export type DatoAntall = {
  dato: string
  antall: number
}

export type SchedulerStatusResponse = {
  schedulerEnabled: boolean
  schedulerLocal: boolean
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
  opprettAlleOppgaver: boolean
  sjekkYtelseFraAvtaleland: boolean
  kravGjelder: string
  kravArsak: string
  toleransegrenseSett: string
  oppgaveSett: string
  oppgavePrefiks: string
  skalIverksettOnline: boolean
  skalBestilleBrev: string
  skalSletteIverksettingsoppgaver: boolean
  skalSamordne: boolean
  skalDistribuereUforevedtak: boolean
  sendBrevBerorteSaker: boolean

  brevkoderSoker: {[key: string]: string}
  brevkoderBerorteSaker: {[key: string]: string}
}
export type OmregningInit = {
  toleransegrenser: string[],
  oppgaveSett: string[],
  batchbrevtyper: string[],
}
export type OmregningInput = {
  saker: string[]
}
export type OmregningSakerPage = {
  content: OmregningInputSaker[] | null
  pageable: {
    pageNumber: number
  },
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: 0
  first: boolean
  numberOfElements: number
  empty: boolean
}
export type OmregningInputSaker = {
  sakId: string,
  sakType: string,
}
export type OmregningBehandlingsnoekler = {
  behandlingsnoekkel: string[]
}
export type OmregningStatistikk = {
  behandlingsnoekkel: string,
  vedtakId: number | undefined,
  behandlingsrekkefolge: number | undefined,
  behandlingstype: string | undefined,
  berortSakBegrunnelser: string | undefined,
  status: string,
  sorteringsregel: string | undefined,
  kontrollpunkter: string,
  sakId: string,
  familieId: string,
}
export type OmregningStatistikkPage = {
  content: OmregningStatistikk[] | null
  pageable: {
    pageNumber: number
  },
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: 0
  first: boolean
  numberOfElements: number
  empty: boolean
}