// --- Oppsummering ---

export type BehandlingOppsummeringResponse = {
  behandlingType: string
  totaltAntall: number
  statusFordeling: Record<string, number>
  varighet: VarighetStatistikkDTO | null
}

// --- Tidsserie ---

export type TidsserieResponse = {
  behandlingType: string | null
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  datapunkter: TidsserieDatapunkt[]
}

export type TidsserieDatapunkt = {
  periodeFra: string
  status: string
  antall: number
}

// --- Varighet ---

export type VarighetAnalyseResponse = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  datapunkter: VarighetTidsseriePunkt[]
}

export type VarighetTidsseriePunkt = {
  periodeFra: string
  antall: number
  varighet: VarighetStatistikkDTO
}

export type VarighetStatistikkDTO = {
  gjennomsnittSekunder: number
  medianSekunder: number
  p90Sekunder: number
  p95Sekunder: number
  minSekunder: number
  maxSekunder: number
}

// --- Aktiviteter ---

export type AktivitetAnalyseResponse = {
  behandlingType: string
  aktiviteter: AktivitetStatistikk[]
}

export type AktivitetStatistikk = {
  aktivitetType: string
  antallBehandlinger: number
  antallFullfort: number
  antallFeilet: number
  antallManuell: number
  gjennomsnittKjoringer: number
  gjennomsnittVarighetSekunder: number | null
  totalKjoringer: number
  totalFeiledeKjoringer: number
  feilrate: number | null
}

// --- Manuelle oppgaver ---

export type ManuellOppgaveAnalyseResponse = {
  behandlingType: string
  oppgaver: ManuellOppgaveStatistikk[]
}

export type ManuellOppgaveStatistikk = {
  aktivitetType: string
  oppgaveKategori: string
  antall: number
  kontrollpunktTyper: KontrollpunktTelling[]
}

export type KontrollpunktTelling = {
  kontrollpunktType: string
  antall: number
  antallKritiske: number
}

// --- Kontrollpunkter ---

export type KontrollpunktAnalyseResponse = {
  behandlingType: string
  fom: string
  tom: string
  kontrollpunkter: KontrollpunktTypeStatistikk[]
}

export type KontrollpunktTypeStatistikk = {
  kontrollpunktType: string
  kravStatus: string
  antall: number
  antallKritiske: number
  statusFordeling: Record<string, number>
}

export type KontrollpunktTidsserieResponse = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  datapunkter: KontrollpunktTidsserieDatapunkt[]
}

export type KontrollpunktTidsserieDatapunkt = {
  periodeFra: string
  kontrollpunktType: string
  kravStatus: string
  antall: number
}

// --- Ende-til-ende ---

export type EndeTilEndeAnalyseResponse = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  faseStatistikkPerKravStatus: EndeTilEndeFaseStatistikk[]
  datapunkter: EndeTilEndeDatapunkt[]
}

export type EndeTilEndeFaseStatistikk = {
  kravStatus: string
  antall: number
  totalVarighetDager: VarighetDagerDTO
  mottakTilOpprettetDager: VarighetDagerDTO
  opprettetTilFerdigDager: VarighetDagerDTO
  ferdigTilIverksattDager: VarighetDagerDTO
}

export type EndeTilEndeDatapunkt = {
  periodeFra: string
  kravStatus: string
  antall: number
  totalVarighetDager: VarighetDagerDTO
}

export type VarighetDagerDTO = {
  gjennomsnittDager: number
  medianDager: number
  p90Dager: number
  p95Dager: number
  minDager: number
  maxDager: number
}

// --- Felles ---

export type Aggregeringsniva = 'MINUTT' | 'TIME' | 'DAG' | 'UKE' | 'MAANED' | 'KVARTAL' | 'AAR'

// --- Automatiseringsgrad ---

export type AutomatiseringsAnalyseResponse = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  totaltAntall: number
  automatiskFullfort: number
  manuellBehandlet: number
  automatiseringsgrad: number | null
  datapunkter: AutomatiseringDatapunkt[]
}

export type AutomatiseringDatapunkt = {
  periodeFra: string
  totalt: number
  automatisk: number
  manuell: number
  automatiseringsgrad: number | null
}

// --- Feilanalyse ---

export type FeilAnalyseResponse = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  totaltFeiledeKjoringer: number
  toppFeilmeldinger: FeilmeldingStatistikk[]
  datapunkter: FeilTidsserieDatapunkt[]
}

export type FeilmeldingStatistikk = {
  feilmelding: string
  antall: number
  sisteOpptreden: string
}

export type FeilTidsserieDatapunkt = {
  periodeFra: string
  antallFeil: number
  antallUnikeFeilmeldinger: number
}

// --- Køanalyse ---

export type KoAnalyseResponse = {
  behandlingType: string
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  datapunkter: KoDatapunkt[]
}

export type KoDatapunkt = {
  periodeFra: string
  opprettet: number
  fullfort: number
  gjennomsnittVentetidSekunder: number | null
}

// --- Gjenforsøksanalyse ---

export type GjenforsokAnalyseResponse = {
  behandlingType: string
  aktiviteter: GjenforsokStatistikk[]
  fordeling: GjenforsokFordelingPunkt[]
}

export type GjenforsokStatistikk = {
  aktivitetType: string
  antallAktiviteter: number
  gjennomsnittKjoringer: number
  maxKjoringer: number
  antallMedRetry: number
  antallFullfortEtterRetry: number
  retryRate: number | null
  suksessEtterRetryRate: number | null
}

export type GjenforsokFordelingPunkt = {
  antallKjoringer: number
  antallAktiviteter: number
}

// --- Aktivitetsvarighet (flaskehals) ---

export type AktivitetsvarighetResponse = {
  behandlingType: string
  aktiviteter: AktivitetsvarighetStatistikk[]
}

export type AktivitetsvarighetStatistikk = {
  aktivitetType: string
  antall: number
  gjennomsnittSekunder: number
  medianSekunder: number
  p90Sekunder: number
  p95Sekunder: number
  minSekunder: number
  maxSekunder: number
  andelAvTotal: number | null
}

// --- Aktivitet kalendertid ---

export type AktivitetKalendertidResponse = {
  behandlingType: string
  aktiviteter: AktivitetKalendertidStatistikk[]
}

export type AktivitetKalendertidStatistikk = {
  aktivitetType: string
  antall: number
  gjennomsnittSekunder: number
  medianSekunder: number
  p90Sekunder: number
  p95Sekunder: number
  minSekunder: number
  maxSekunder: number
  andelAvTotal: number | null
}

// --- Tidspunktanalyse ---

export type TidspunktAnalyseResponse = {
  behandlingType: string
  datapunkter: TidspunktDatapunkt[]
}

export type TidspunktDatapunkt = {
  ukedag: number
  time: number
  antall: number
  antallFeilet: number
  antallBatch: number
}

// --- Teamytelse ---

export type TeamytelseResponse = {
  behandlingType: string
  team: TeamStatistikk[]
}

export type TeamStatistikk = {
  ansvarligTeam: string
  antall: number
  antallFullfort: number
  antallFeilet: number
  antallStoppet: number
  gjennomsnittVarighetSekunder: number | null
  medianVarighetSekunder: number | null
  fullforingsrate: number | null
  feilrate: number | null
}

// --- Prioritetsanalyse ---

export type PrioritetAnalyseResponse = {
  behandlingType: string
  prioriteter: PrioritetStatistikk[]
}

export type PrioritetStatistikk = {
  prioritet: number
  antall: number
  antallFullfort: number
  antallFeilet: number
  gjennomsnittVarighetSekunder: number | null
  medianVarighetSekunder: number | null
  feilrate: number | null
}

// --- Stoppede behandlinger ---

export type StoppetAnalyseResponse = {
  behandlingType: string
  totaltAntall: number
  antallStoppet: number
  stopprate: number | null
  stoppetPerAktivitet: StoppetPerAktivitet[]
  datapunkter: StoppetDatapunkt[]
}

export type StoppetPerAktivitet = {
  aktivitetType: string
  antall: number
}

export type StoppetDatapunkt = {
  periodeFra: string
  antallStoppet: number
  antallTotalt: number
  stopprate: number | null
}

// --- Planlagt vs. faktisk ---

export type PlanlagtAnalyseResponse = {
  behandlingType: string
  antallMedPlanlagt: number
  antallUtenPlanlagt: number
  gjennomsnittForsinkelseSekunder: number | null
  medianForsinkelseSekunder: number | null
  datapunkter: PlanlagtDatapunkt[]
}

export type PlanlagtDatapunkt = {
  periodeFra: string
  antallPlanlagt: number
  antallIkkePlanlagt: number
  gjennomsnittForsinkelseSekunder: number | null
}

// --- Gruppeanalyse ---

export type GruppeAnalyseResponse = {
  behandlingType: string
  totaltGrupper: number
  gjennomsnittStorrelse: number | null
  grupper: GruppeStatistikk[]
}

export type GruppeStatistikk = {
  gruppeId: string
  antallBehandlinger: number
  antallFullfort: number
  antallFeilet: number
  gjennomsnittVarighetSekunder: number | null
}

// --- Sakstypefordeling ---

export type SakstypeAnalyseResponse = {
  behandlingType: string
  sakstyper: SakstypeStatistikk[]
}

export type SakstypeStatistikk = {
  sakstype: string
  antall: number
  antallFullfort: number
  antallFeilet: number
  gjennomsnittVarighetSekunder: number | null
  medianVarighetSekunder: number | null
  feilrate: number | null
}

// --- Kravtypeanalyse ---

export type KravtypeAnalyseResponse = {
  behandlingType: string
  kravtyper: KravtypeStatistikk[]
}

export type KravtypeStatistikk = {
  kravGjelder: string
  kravStatus: string
  antall: number
  antallFullfort: number
  antallFeilet: number
  gjennomsnittVarighetSekunder: number | null
  feilrate: number | null
}

// --- Feilklassifisering ---

export type FeilklassifiseringResponse = {
  behandlingType: string
  totaltFeiledeKjoringer: number
  exceptionTyper: ExceptionTypeStatistikk[]
}

export type ExceptionTypeStatistikk = {
  exceptionType: string
  antall: number
  sisteOpptreden: string
  eksempelMelding: string | null
}

// --- Vedtakstype ---

export type VedtakstypeAnalyseResponse = {
  behandlingType: string
  vedtakstyper: VedtakstypeStatistikk[]
}

export type VedtakstypeStatistikk = {
  vedtakType: string
  vedtakStatus: string
  antall: number
  gjennomsnittDagerTilIverksatt: number | null
}

// --- Auto-brev ---

export type AutoBrevAnalyseResponse = {
  behandlingType: string
  brevStatistikk: AutoBrevStatistikk[]
}

export type AutoBrevStatistikk = {
  brevkode: string
  antall: number
}

// --- Brev-tidsserie ---

export type BrevTidsserieResponse = {
  fom: string
  tom: string
  aggregering: Aggregeringsniva
  datapunkter: BrevTidsserieDatapunkt[]
}

export type BrevTidsserieDatapunkt = {
  periodeFra: string
  antall: number
}
