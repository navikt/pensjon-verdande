import type { Behandlingstatus } from '~/types'


export type ReguleringStatus =  {
  steg: number
  uttrekk: ReguleringUttrekk | null;
  orkestrering: ReguleringOrkestrering | null;
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
}

export type ReguleringOrkestrering = {
  behandlingId: string;
  status: Behandlingstatus;
  antall: number;
  antallOpprettet: number
  isFerdig: boolean;
  feilmelding: string | null;
}

export type ReguleringStatistikk = {
  orkestrering: StatistikkNode[];
  familie: StatistikkNode[];
  iverksettVedtak: StatistikkNode[];
}

export type StatistikkNode = {
  navn: string;
  antall: number;
}

