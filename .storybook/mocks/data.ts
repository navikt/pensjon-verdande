import type { MeResponse } from '~/brukere/brukere'
import type {
  AktivitetDTO,
  BehandlingAntall,
  BehandlingDto,
  BehandlingerPage,
  BehandlingKjoringDTO,
  DashboardResponse,
  DatoAntall,
  PageResponse,
} from '~/types'

export function mockMeResponse(overrides?: Partial<MeResponse>): MeResponse {
  return {
    brukernavn: 'P123456',
    fornavn: 'Kari',
    etternavn: 'Nordmann',
    tilganger: ['LESE', 'SKRIVE'],
    tilgangsHistorikk: [
      {
        brukernavn: 'P123456',
        fra: '2024-01-15T08:00:00',
        til: null,
        operasjon: 'LESE',
        gittAvBruker: 'A100000',
        fjernetAvBruker: null,
      },
    ],
    verdandeRoller: ['SAKSBEHANDLER'],
    ...overrides,
  }
}

export function mockBehandlingDto(overrides?: Partial<BehandlingDto>): BehandlingDto {
  return {
    level: 0,
    behandlingSerieId: null,
    behandlingId: 100001,
    type: 'ForstegangsbehandlingAlder',
    uuid: 'b1e4d2a3-5f6c-7890-abcd-ef1234567890',
    funksjonellIdentifikator: 'FGA-100001',
    forrigeBehandlingId: null,
    sisteKjoring: '2024-06-15T10:30:00',
    utsattTil: null,
    ferdig: null,
    slettes: null,
    stoppet: null,
    stoppBegrunnelse: null,
    stoppetAv: null,
    opprettet: '2024-06-15T09:00:00',
    opprettetAv: 'BATCH',
    planlagtStartet: '2024-06-15T09:00:00',
    ansvarligTeam: 'Team Pensjon',
    status: 'UNDER_BEHANDLING',
    prioritet: 5,
    behandlingKjoringer: [],
    aktiviteter: [],
    muligeKontrollpunkt: [],
    fnr: '12345678901',
    sakId: 50001,
    kravId: 60001,
    vedtakId: null,
    journalpostId: null,
    feilmelding: null,
    gruppeId: null,
    parametere: {},
    debugJson: null,
    erAldeBehandling: false,
    ...overrides,
  }
}

export function mockAktivitetDto(overrides?: Partial<AktivitetDTO>): AktivitetDTO {
  return {
    aktivitetId: 200001,
    type: 'HentGrunnlag',
    opprettet: '2024-06-15T09:05:00',
    uuid: 'a2c3d4e5-6f78-9012-bcde-f12345678901',
    funksjonellIdentifikator: 'AKT-200001',
    antallGangerKjort: 1,
    sisteAktiveringsdato: '2024-06-15T09:10:00',
    status: 'FULLFORT',
    utsattTil: null,
    ventPaForegaendeAktiviteter: false,
    ...overrides,
  }
}

export function mockBehandlingKjoringDto(overrides?: Partial<BehandlingKjoringDTO>): BehandlingKjoringDTO {
  return {
    behandlingKjoringId: 300001,
    traceId: 'trace-abc123',
    behandlingId: 100001,
    aktivitetId: 200001,
    startet: '2024-06-15T10:00:00',
    avsluttet: '2024-06-15T10:00:05',
    correlationId: 'corr-def456',
    feilmelding: null,
    stackTrace: null,
    aktivitetType: 'HentGrunnlag',
    aldeStartState: null,
    aldeEndState: null,
    ...overrides,
  }
}

export function mockPageResponse<T>(items: T[], overrides?: Partial<PageResponse<T>>): PageResponse<T> {
  return {
    content: items,
    pageable: {
      pageNumber: 0,
      pageSize: 20,
    },
    last: true,
    totalElements: items.length,
    totalPages: 1,
    first: true,
    size: 20,
    number: 0,
    numberOfElements: items.length,
    ...overrides,
  }
}

export function mockDashboardResponse(overrides?: Partial<DashboardResponse>): DashboardResponse {
  const behandlingAntall: BehandlingAntall[] = [
    { navn: 'Førstegangsbehandling Alder', behandlingType: 'ForstegangsbehandlingAlder', antall: 42 },
    { navn: 'Omregning', behandlingType: 'Omregning', antall: 128 },
    { navn: 'Regulering', behandlingType: 'Regulering', antall: 15 },
  ]

  const opprettetPerDag: DatoAntall[] = [
    { dato: '2024-06-10', antall: 12 },
    { dato: '2024-06-11', antall: 18 },
    { dato: '2024-06-12', antall: 9 },
    { dato: '2024-06-13', antall: 25 },
    { dato: '2024-06-14', antall: 14 },
    { dato: '2024-06-15', antall: 7 },
  ]

  return {
    totaltAntallBehandlinger: 185,
    feilendeBehandlinger: 3,
    antallUferdigeBehandlinger: 47,
    ukjenteBehandlingstyper: [],
    behandlingAntall,
    opprettetPerDag,
    ...overrides,
  }
}

export function mockBehandlingerPage(
  behandlinger?: BehandlingDto[],
  overrides?: Partial<BehandlingerPage>,
): BehandlingerPage {
  const content = behandlinger ?? [mockBehandlingDto()]
  return {
    content,
    pageable: 'INSTANCE',
    totalPages: 1,
    totalElements: content.length,
    last: true,
    first: true,
    numberOfElements: content.length,
    number: 0,
    size: 20,
    empty: content.length === 0,
    behandlingStatuser: ['OPPRETTET', 'UNDER_BEHANDLING', 'FULLFORT', 'STOPPET'],
    behandlingTyper: ['ForstegangsbehandlingAlder', 'Omregning', 'Regulering'],
    sort: { unsorted: true, sorted: false, empty: true },
    ...overrides,
  }
}
