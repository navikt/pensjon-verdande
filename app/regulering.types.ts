import type { Behandlingstatus } from '~/types'


export type ReguleringDetaljer =  {
  steg: number
  uttrekk: ReguleringUttrekk | null;
  orkestreringer: ReguleringOrkestrering[];
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


export type StatistikkNode = {
  navn: string;
  antall: number;
}

