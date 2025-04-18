import type { Behandlingstatus } from '~/types'


export type ReguleringDetaljer =  {
  steg: number
  uttrekk: ReguleringUttrekk | null;
  orkestreringer: ReguleringOrkestrering[];
  avviksgrenser: AvviksGrense[];
}

export type ReguleringUttrekk = {
  behandlingId: string;
  status: Behandlingstatus,
  feilmelding: string | null,
  steg: string
  progresjon: number,
  satsDato:string,
  uttrekkDato: string,
  arbeidstabellSize: number,
  familierTabellSize: number,
  antallUbehandlende: number,
  kjoretidAktiviteter: KjoretidForAktivitet[],
}

export type ReguleringOrkestrering = {
  behandlingId: string;
  status: Behandlingstatus;
  kjoringsdato: string;
  opprettAntallFamilier: number | null;
}

export type OrkestreringStatistikk = {
  familierStatistikk: ReguleringFamilieStatus;
  iverksettVedtakStatistikk: IverksettVedtakStats;
}

export type ReguleringFamilieStatus = {
  opprettet: number;
  fullfort: number;
  underBehandling: number;
  feilende: number;
}

export type IverksettVedtakStats = {
  opprettet: number;
  fullfort: number;
  underBehandling: number;
  feilende: number;
}


export type ReguleringStatistikk = {
  arbeidstabellStatistikk: ArbeidstabellStatistikk;
  faktoromregningerMedAarsak: FaktoromregningMedAarsak[];
  beregningsavvikStatistikk: BeregningsavvikStatistikk[];
  antallVenterPaaRune: number;
  antallFeilendeBeregnytelser: number;
  antallFeilendeFamiliebehandlinger: number;
  antallFeilendeIverksettVedtak: number;
}

export type AggregerteFeilmeldinger = {
  aggregerteFeilmeldinger: AntallFeilForKjoring[];
  antallVenterPaaRune: number;
}


export type ArbeidstabellStatistikk = {
  antallOversendesOppdrag: number;
  antallFaktoromregnet: number;
  antallFaktoromregnetDirekte: number;
}

export type AntallFeilForKjoring = {
  feilmelding: string;
  aktivitet: string;
  antall: number;
}

export type FaktoromregningMedAarsak = {
  aarsak: string;
  antall: number;
}

export type BeregningsavvikStatistikk = {
  typeAvvik: string;
  sakType: string;
  antall: number;
}


export type StatistikkNode = {
  navn: string;
  antall: number;
}

export type KjoretidForAktivitet = {
  aktivitet: string;
  sekunder: number;
  minutter: number;
}

export type AvviksGrense = {
  avvikParamId: number;
  sakType: string;
  positivLavProsent: number;
  positivHoyProsent: number;
  negativLavProsent: number;
  negativHoyProsent: number;
  positivBelop: number;
  negativBelop: number;
  underkategori: string;
}

export type EkskluderteSakerResponse = {
  erOppdatert?: boolean;
  ekskluderteSaker: number[];
}
