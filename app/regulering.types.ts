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


/*
    data class AggregertStatistikk(
        val arbeidstabellStatistikk: ReguleringUttrekkArbTabRepository.ArbeidstabellStatistikk,
        val aggregerteFeilmeldinger: List<ReguleringAvhengigeBehandlingerService.AntallFeilForKjoring>,
        val faktoromregningerMedAarsak: List<ReguleringUttrekkArbTabRepository.FaktoromregningMedAarsak>,
        val antallVenterPaaRune: Int
    )
 */

export type AggregertStatistikk = {
  arbeidstabellStatistikk: ArbeidstabellStatistikk;
  aggregerteFeilmeldinger: FeiletAktivitet[];
  faktoromregningerMedAarsak: FaktoromregningMedAarsak[];
  antallVenterPaaRune: number;
  antallFeilendeBeregnytelser: number;
  antallFeilendeFamiliebehandlinger: number;
  antallIFeilendeverksettVedtak: number;
}


export type ArbeidstabellStatistikk = {
  antallOversendesOppdrag: number;
  antallFaktoromregnet: number;
  antallFaktoromregnetDirekte: number;
  antallReguleringsfeil: number;
}

export type AntallFeilForKjoring = {
  feilmelding: string;
  aktivitet: string;
  antall: number;
}

export type FeiletAktivitet = {
  aktivitet: string;
  feilmeldinger: Feilmelding[];
}

export type  Feilmelding = {
  feilmelding: string;
  antall: number;
}

/*
    data class FeiletAktivitet(
        val aktivitet: String,
        val feilmeldinger: List<Feilmelding>
    )

    data class Feilmelding(
        val feilmelding: String,
        val antall: Int
    )
 */

export type FaktoromregningMedAarsak = {
  aarsak: string;
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
