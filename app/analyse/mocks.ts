/**
 * Mock data for Storybook stories in the analyse module.
 * Provides realistic sample data for all tab components.
 */
import type {
  AktivitetAnalyseResponse,
  AktivitetsvarighetResponse,
  AutomatiseringsAnalyseResponse,
  BehandlingOppsummeringResponse,
  EndeTilEndeAnalyseResponse,
  FeilAnalyseResponse,
  FeilklassifiseringResponse,
  GjenforsokAnalyseResponse,
  GruppeAnalyseResponse,
  KoAnalyseResponse,
  KontrollpunktAnalyseResponse,
  KontrollpunktTidsserieResponse,
  KravtypeAnalyseResponse,
  ManuellOppgaveAnalyseResponse,
  PlanlagtAnalyseResponse,
  PrioritetAnalyseResponse,
  SakstypeAnalyseResponse,
  StoppetAnalyseResponse,
  TeamytelseResponse,
  TidspunktAnalyseResponse,
  TidsserieDatapunkt,
  TidsserieResponse,
  VedtakstypeAnalyseResponse,
} from './types'

const fom = '2026-01-01T00:00:00.000'
const tom = '2026-03-01T23:59:59.999'
const behandlingType = 'FleksibelApSak'

function dates(count: number, start = '2026-01-01'): string[] {
  const d = new Date(start)
  return Array.from({ length: count }, (_, i) => {
    const dt = new Date(d)
    dt.setDate(dt.getDate() + i * 7)
    return dt.toISOString().split('T')[0]
  })
}

export function mockTidsserieResponse(): TidsserieResponse {
  const perioder = dates(9)
  const datapunkter: TidsserieDatapunkt[] = []
  for (const p of perioder) {
    datapunkter.push({ periodeFra: p, status: 'FULLFORT', antall: 30 + Math.floor(Math.random() * 40) })
    datapunkter.push({ periodeFra: p, status: 'FEILET', antall: 2 + Math.floor(Math.random() * 8) })
    datapunkter.push({ periodeFra: p, status: 'UNDER_BEHANDLING', antall: 5 + Math.floor(Math.random() * 10) })
  }
  return { behandlingType, fom, tom, aggregering: 'UKE', datapunkter }
}

export function mockOppsummering(): BehandlingOppsummeringResponse {
  return {
    behandlingType,
    totaltAntall: 1234,
    statusFordeling: { FULLFORT: 1100, FEILET: 80, UNDER_BEHANDLING: 54 },
    varighet: {
      gjennomsnittSekunder: 245.3,
      medianSekunder: 180.0,
      p90Sekunder: 520.0,
      p95Sekunder: 750.0,
      minSekunder: 2.1,
      maxSekunder: 3600.0,
    },
  }
}

export function mockStatustrendData(): { tidsserie: TidsserieDatapunkt[] } {
  return { tidsserie: mockTidsserieResponse().datapunkter }
}

export function mockVarighetData() {
  const perioder = dates(9)
  return {
    varighet: perioder.map((p) => ({
      periodeFra: p,
      antall: 40 + Math.floor(Math.random() * 30),
      varighet: {
        gjennomsnittSekunder: 150 + Math.random() * 200,
        medianSekunder: 120 + Math.random() * 150,
        p90Sekunder: 400 + Math.random() * 200,
        p95Sekunder: 600 + Math.random() * 200,
        minSekunder: 1 + Math.random() * 5,
        maxSekunder: 2000 + Math.random() * 2000,
      },
    })),
  }
}

export function mockAutomatiseringData(): AutomatiseringsAnalyseResponse {
  const perioder = dates(9)
  return {
    behandlingType,
    fom,
    tom,
    aggregering: 'UKE',
    totaltAntall: 1234,
    automatiskFullfort: 1050,
    manuellBehandlet: 184,
    automatiseringsgrad: 0.851,
    datapunkter: perioder.map((p) => ({
      periodeFra: p,
      totalt: 130 + Math.floor(Math.random() * 30),
      automatisk: 110 + Math.floor(Math.random() * 20),
      manuell: 15 + Math.floor(Math.random() * 10),
      automatiseringsgrad: 0.8 + Math.random() * 0.15,
    })),
  }
}

export function mockKoData(): KoAnalyseResponse {
  const perioder = dates(9)
  return {
    behandlingType,
    fom,
    tom,
    aggregering: 'UKE',
    datapunkter: perioder.map((p) => ({
      periodeFra: p,
      opprettet: 100 + Math.floor(Math.random() * 60),
      fullfort: 90 + Math.floor(Math.random() * 50),
      gjennomsnittVentetidSekunder: 180 + Math.random() * 300,
    })),
  }
}

export function mockFeilanalyseData(): FeilAnalyseResponse {
  const perioder = dates(9)
  return {
    behandlingType,
    fom,
    tom,
    aggregering: 'UKE',
    totaltFeiledeKjoringer: 245,
    toppFeilmeldinger: [
      {
        feilmelding: 'NullPointerException: Cannot invoke method on null',
        antall: 85,
        sisteOpptreden: '2026-02-28T15:00:00',
      },
      {
        feilmelding: 'TimeoutException: Database connection timeout',
        antall: 42,
        sisteOpptreden: '2026-02-27T10:30:00',
      },
      {
        feilmelding: 'IllegalStateException: Behandling in unexpected state',
        antall: 28,
        sisteOpptreden: '2026-02-26T08:15:00',
      },
    ],
    datapunkter: perioder.map((p) => ({
      periodeFra: p,
      antallFeil: 10 + Math.floor(Math.random() * 30),
      antallUnikeFeilmeldinger: 2 + Math.floor(Math.random() * 5),
    })),
  }
}

export function mockFeilklassifiseringData(): FeilklassifiseringResponse {
  return {
    behandlingType,
    totaltFeiledeKjoringer: 245,
    exceptionTyper: [
      {
        exceptionType: 'NullPointerException',
        antall: 85,
        sisteOpptreden: '2026-02-28T15:00:00',
        eksempelMelding: 'Cannot invoke method on null reference',
      },
      {
        exceptionType: 'TimeoutException',
        antall: 42,
        sisteOpptreden: '2026-02-27T10:30:00',
        eksempelMelding: 'Database connection timeout after 30s',
      },
      {
        exceptionType: 'IllegalStateException',
        antall: 28,
        sisteOpptreden: '2026-02-26T08:15:00',
        eksempelMelding: 'Behandling FEILET cannot transition to FULLFORT',
      },
      {
        exceptionType: 'PesysBusinessException',
        antall: 15,
        sisteOpptreden: '2026-02-25T14:00:00',
        eksempelMelding: 'Vedtak mangler for sak ***',
      },
    ],
  }
}

export function mockGjenforsokData(): GjenforsokAnalyseResponse {
  return {
    behandlingType,
    aktiviteter: [
      {
        aktivitetType: 'HentGrunnlag',
        antallAktiviteter: 500,
        gjennomsnittKjoringer: 1.3,
        maxKjoringer: 5,
        antallMedRetry: 80,
        antallFullfortEtterRetry: 72,
        retryRate: 0.16,
        suksessEtterRetryRate: 0.9,
      },
      {
        aktivitetType: 'Beregning',
        antallAktiviteter: 480,
        gjennomsnittKjoringer: 1.1,
        maxKjoringer: 3,
        antallMedRetry: 30,
        antallFullfortEtterRetry: 28,
        retryRate: 0.063,
        suksessEtterRetryRate: 0.93,
      },
      {
        aktivitetType: 'OpprettVedtak',
        antallAktiviteter: 450,
        gjennomsnittKjoringer: 1.05,
        maxKjoringer: 4,
        antallMedRetry: 15,
        antallFullfortEtterRetry: 12,
        retryRate: 0.033,
        suksessEtterRetryRate: 0.8,
      },
    ],
    fordeling: [
      { antallKjoringer: 1, antallAktiviteter: 1200 },
      { antallKjoringer: 2, antallAktiviteter: 100 },
      { antallKjoringer: 3, antallAktiviteter: 20 },
      { antallKjoringer: 4, antallAktiviteter: 5 },
      { antallKjoringer: 5, antallAktiviteter: 2 },
    ],
  }
}

export function mockAktivitetsvarighetData(): AktivitetsvarighetResponse {
  return {
    behandlingType,
    aktiviteter: [
      {
        aktivitetType: 'HentGrunnlag',
        antall: 500,
        gjennomsnittSekunder: 45.2,
        medianSekunder: 30.0,
        p90Sekunder: 90.0,
        p95Sekunder: 120.0,
        minSekunder: 0.5,
        maxSekunder: 300.0,
        andelAvTotal: 0.35,
      },
      {
        aktivitetType: 'Beregning',
        antall: 480,
        gjennomsnittSekunder: 25.8,
        medianSekunder: 20.0,
        p90Sekunder: 50.0,
        p95Sekunder: 70.0,
        minSekunder: 1.0,
        maxSekunder: 180.0,
        andelAvTotal: 0.2,
      },
      {
        aktivitetType: 'OpprettVedtak',
        antall: 450,
        gjennomsnittSekunder: 18.5,
        medianSekunder: 15.0,
        p90Sekunder: 35.0,
        p95Sekunder: 45.0,
        minSekunder: 2.0,
        maxSekunder: 120.0,
        andelAvTotal: 0.14,
      },
      {
        aktivitetType: 'IverksettVedtak',
        antall: 430,
        gjennomsnittSekunder: 12.0,
        medianSekunder: 10.0,
        p90Sekunder: 25.0,
        p95Sekunder: 30.0,
        minSekunder: 1.5,
        maxSekunder: 60.0,
        andelAvTotal: 0.09,
      },
    ],
  }
}

export function mockTidspunktData(): TidspunktAnalyseResponse {
  const datapunkter = []
  for (let dag = 1; dag <= 7; dag++) {
    for (let time = 0; time < 24; time++) {
      const erArbeidstid = dag <= 5 && time >= 6 && time <= 20
      datapunkter.push({
        ukedag: dag,
        time,
        antall: erArbeidstid ? 10 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 5),
        antallFeilet: erArbeidstid ? Math.floor(Math.random() * 5) : 0,
        antallBatch: dag <= 5 && (time === 6 || time === 22) ? 20 + Math.floor(Math.random() * 30) : 0,
      })
    }
  }
  return { behandlingType, datapunkter }
}

export function mockTeamytelseData(): TeamytelseResponse {
  return {
    behandlingType,
    team: [
      {
        ansvarligTeam: 'team-pensjon-behandling',
        antall: 800,
        antallFullfort: 750,
        antallFeilet: 30,
        antallStoppet: 20,
        gjennomsnittVarighetSekunder: 200.0,
        medianVarighetSekunder: 150.0,
        fullforingsrate: 0.94,
        feilrate: 0.038,
      },
      {
        ansvarligTeam: 'team-pensjon-vedtak',
        antall: 300,
        antallFullfort: 270,
        antallFeilet: 20,
        antallStoppet: 10,
        gjennomsnittVarighetSekunder: 350.0,
        medianVarighetSekunder: 280.0,
        fullforingsrate: 0.9,
        feilrate: 0.067,
      },
    ],
  }
}

export function mockPrioritetData(): PrioritetAnalyseResponse {
  return {
    behandlingType,
    prioriteter: [
      {
        prioritet: 1,
        antall: 50,
        antallFullfort: 48,
        antallFeilet: 2,
        gjennomsnittVarighetSekunder: 100.0,
        medianVarighetSekunder: 80.0,
        feilrate: 0.04,
      },
      {
        prioritet: 5,
        antall: 800,
        antallFullfort: 750,
        antallFeilet: 30,
        gjennomsnittVarighetSekunder: 250.0,
        medianVarighetSekunder: 180.0,
        feilrate: 0.038,
      },
      {
        prioritet: 10,
        antall: 384,
        antallFullfort: 350,
        antallFeilet: 20,
        gjennomsnittVarighetSekunder: 400.0,
        medianVarighetSekunder: 300.0,
        feilrate: 0.052,
      },
    ],
  }
}

export function mockStoppetData(): StoppetAnalyseResponse {
  const perioder = dates(9)
  return {
    behandlingType,
    totaltAntall: 1234,
    antallStoppet: 45,
    stopprate: 0.036,
    stoppetPerAktivitet: [
      { aktivitetType: 'HentGrunnlag', antall: 20 },
      { aktivitetType: 'Beregning', antall: 15 },
      { aktivitetType: 'OpprettVedtak', antall: 10 },
    ],
    datapunkter: perioder.map((p) => ({
      periodeFra: p,
      antallStoppet: 3 + Math.floor(Math.random() * 5),
      antallTotalt: 130 + Math.floor(Math.random() * 30),
      stopprate: 0.02 + Math.random() * 0.04,
    })),
  }
}

export function mockPlanlagtData(): PlanlagtAnalyseResponse {
  const perioder = dates(9)
  return {
    behandlingType,
    antallMedPlanlagt: 950,
    antallUtenPlanlagt: 284,
    gjennomsnittForsinkelseSekunder: 3600.0,
    medianForsinkelseSekunder: 1800.0,
    datapunkter: perioder.map((p) => ({
      periodeFra: p,
      antallPlanlagt: 90 + Math.floor(Math.random() * 30),
      antallIkkePlanlagt: 20 + Math.floor(Math.random() * 15),
      gjennomsnittForsinkelseSekunder: 2000 + Math.random() * 3000,
    })),
  }
}

export function mockGruppeData(): GruppeAnalyseResponse {
  return {
    behandlingType,
    totaltGrupper: 42,
    gjennomsnittStorrelse: 5.3,
    grupper: [
      {
        gruppeId: 'GRP-001',
        antallBehandlinger: 12,
        antallFullfort: 11,
        antallFeilet: 1,
        gjennomsnittVarighetSekunder: 300.0,
      },
      {
        gruppeId: 'GRP-002',
        antallBehandlinger: 8,
        antallFullfort: 8,
        antallFeilet: 0,
        gjennomsnittVarighetSekunder: 180.0,
      },
      {
        gruppeId: 'GRP-003',
        antallBehandlinger: 5,
        antallFullfort: 4,
        antallFeilet: 1,
        gjennomsnittVarighetSekunder: 450.0,
      },
    ],
  }
}

export function mockSakstypeData(): SakstypeAnalyseResponse {
  return {
    behandlingType,
    sakstyper: [
      {
        sakstype: 'ALDER',
        antall: 600,
        antallFullfort: 570,
        antallFeilet: 20,
        gjennomsnittVarighetSekunder: 200.0,
        medianVarighetSekunder: 150.0,
        feilrate: 0.033,
      },
      {
        sakstype: 'UFOREP',
        antall: 300,
        antallFullfort: 270,
        antallFeilet: 18,
        gjennomsnittVarighetSekunder: 350.0,
        medianVarighetSekunder: 280.0,
        feilrate: 0.06,
      },
      {
        sakstype: 'GJENLEV',
        antall: 200,
        antallFullfort: 185,
        antallFeilet: 10,
        gjennomsnittVarighetSekunder: 250.0,
        medianVarighetSekunder: 200.0,
        feilrate: 0.05,
      },
    ],
  }
}

export function mockKravtypeData(): KravtypeAnalyseResponse {
  return {
    behandlingType,
    kravtyper: [
      {
        kravGjelder: 'NY_RETT',
        kravStatus: 'FERDIG',
        antall: 500,
        antallFullfort: 480,
        antallFeilet: 15,
        gjennomsnittVarighetSekunder: 220.0,
        feilrate: 0.03,
      },
      {
        kravGjelder: 'ENDRING',
        kravStatus: 'FERDIG',
        antall: 300,
        antallFullfort: 280,
        antallFeilet: 12,
        gjennomsnittVarighetSekunder: 180.0,
        feilrate: 0.04,
      },
      {
        kravGjelder: 'NY_RETT',
        kravStatus: 'MOTTATT',
        antall: 50,
        antallFullfort: 0,
        antallFeilet: 5,
        gjennomsnittVarighetSekunder: null,
        feilrate: 0.1,
      },
    ],
  }
}

export function mockVedtakstypeData(): VedtakstypeAnalyseResponse {
  return {
    behandlingType,
    vedtakstyper: [
      { vedtakType: 'INNVILGELSE', vedtakStatus: 'IVERKSATT', antall: 800, gjennomsnittDagerTilIverksatt: 2.5 },
      { vedtakType: 'AVSLAG', vedtakStatus: 'IVERKSATT', antall: 120, gjennomsnittDagerTilIverksatt: 5.0 },
      { vedtakType: 'ENDRING', vedtakStatus: 'IVERKSATT', antall: 250, gjennomsnittDagerTilIverksatt: 3.2 },
      { vedtakType: 'INNVILGELSE', vedtakStatus: 'ATTESTERT', antall: 30, gjennomsnittDagerTilIverksatt: null },
    ],
  }
}

export function mockAktivitetData(): { aktiviteter: AktivitetAnalyseResponse['aktiviteter'] } {
  return {
    aktiviteter: [
      {
        aktivitetType: 'HentGrunnlag',
        antallBehandlinger: 500,
        antallFullfort: 490,
        antallFeilet: 5,
        antallManuell: 5,
        gjennomsnittKjoringer: 1.3,
        gjennomsnittVarighetSekunder: 45.2,
        totalKjoringer: 650,
        totalFeiledeKjoringer: 15,
        feilrate: 0.023,
      },
      {
        aktivitetType: 'Beregning',
        antallBehandlinger: 480,
        antallFullfort: 470,
        antallFeilet: 8,
        antallManuell: 2,
        gjennomsnittKjoringer: 1.1,
        gjennomsnittVarighetSekunder: 25.8,
        totalKjoringer: 528,
        totalFeiledeKjoringer: 12,
        feilrate: 0.023,
      },
      {
        aktivitetType: 'OpprettVedtak',
        antallBehandlinger: 450,
        antallFullfort: 440,
        antallFeilet: 3,
        antallManuell: 7,
        gjennomsnittKjoringer: 1.05,
        gjennomsnittVarighetSekunder: 18.5,
        totalKjoringer: 473,
        totalFeiledeKjoringer: 5,
        feilrate: 0.011,
      },
    ],
  }
}

export function mockManuelleData(): { manuelleOppgaver: ManuellOppgaveAnalyseResponse['oppgaver'] } {
  return {
    manuelleOppgaver: [
      {
        aktivitetType: 'Beregning',
        oppgaveKategori: 'GRUNNLAGSDATA',
        antall: 25,
        kontrollpunktTyper: [
          { kontrollpunktType: 'INNTOPP_EKTEF', antall: 15, antallKritiske: 3 },
          { kontrollpunktType: 'TRYGDETID_MANGLER', antall: 10, antallKritiske: 0 },
        ],
      },
      {
        aktivitetType: 'OpprettVedtak',
        oppgaveKategori: 'VEDTAK',
        antall: 12,
        kontrollpunktTyper: [{ kontrollpunktType: 'VEDTAK_BEREGNING_AVVIK', antall: 12, antallKritiske: 5 }],
      },
    ],
  }
}

export function mockKontrollpunktData(): {
  kontrollpunkter: KontrollpunktAnalyseResponse['kontrollpunkter']
  kontrollpunktTidsserie: KontrollpunktTidsserieResponse['datapunkter']
  tidsserieFeil: string | null
} {
  const perioder = dates(9)
  return {
    kontrollpunkter: [
      {
        kontrollpunktType: 'INNTOPP_EKTEF',
        kravStatus: 'FERDIG',
        antall: 150,
        antallKritiske: 30,
        statusFordeling: { OPPRETTET: 100, BEHANDLET: 50 },
      },
      {
        kontrollpunktType: 'TRYGDETID_MANGLER',
        kravStatus: 'FERDIG',
        antall: 80,
        antallKritiske: 0,
        statusFordeling: { OPPRETTET: 50, BEHANDLET: 30 },
      },
      {
        kontrollpunktType: 'VEDTAK_BEREGNING_AVVIK',
        kravStatus: 'MOTTATT',
        antall: 45,
        antallKritiske: 20,
        statusFordeling: { OPPRETTET: 30, BEHANDLET: 15 },
      },
    ],
    kontrollpunktTidsserie: perioder.flatMap((p) => [
      {
        periodeFra: p,
        kontrollpunktType: 'INNTOPP_EKTEF',
        kravStatus: 'FERDIG',
        antall: 15 + Math.floor(Math.random() * 10),
      },
      {
        periodeFra: p,
        kontrollpunktType: 'TRYGDETID_MANGLER',
        kravStatus: 'FERDIG',
        antall: 5 + Math.floor(Math.random() * 8),
      },
    ]),
    tidsserieFeil: null,
  }
}

export function mockEndeTilEndeData(): { endeTilEnde: EndeTilEndeAnalyseResponse } {
  const perioder = dates(9)
  const mkVarighet = (base: number) => ({
    gjennomsnittDager: base + Math.random() * 2,
    medianDager: base - 0.5 + Math.random(),
    p90Dager: base * 2 + Math.random() * 3,
    p95Dager: base * 2.5 + Math.random() * 3,
    minDager: 0.1 + Math.random() * 0.5,
    maxDager: base * 5 + Math.random() * 10,
  })
  return {
    endeTilEnde: {
      behandlingType,
      fom,
      tom,
      aggregering: 'MAANED',
      faseStatistikkPerKravStatus: [
        {
          kravStatus: 'FERDIG',
          antall: 900,
          totalVarighetDager: mkVarighet(5),
          mottakTilOpprettetDager: mkVarighet(1),
          opprettetTilFerdigDager: mkVarighet(2),
          ferdigTilIverksattDager: mkVarighet(2),
        },
      ],
      datapunkter: perioder.map((p) => ({
        periodeFra: p,
        kravStatus: 'FERDIG',
        antall: 80 + Math.floor(Math.random() * 40),
        totalVarighetDager: mkVarighet(5),
      })),
    },
  }
}

/** Mock data for the route layout loader */
export function mockRouteLoaderData() {
  return {
    behandlingType: 'FleksibelApSak',
    fom: '2026-01-01',
    tom: '2026-03-01',
    aggregering: 'UKE' as const,
    tidsserie: mockTidsserieResponse(),
  }
}
