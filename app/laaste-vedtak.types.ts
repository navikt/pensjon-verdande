export type LaasteVedtakUttrekkSummary = {
  behandlingId: string | null,
  sistKjoert: string | null,
  uttrekkStatus: LaasteVedtakUttrekkStatus | null,
  laasteVedtak: LaasteVedtakRow[],
}

export type LaasteVedtakRow = {
  datoRegistrert: string,
  kommentar: string,
  sakId: string,
  kravId: string,
  vedtakId: string | null,
  sakType: string,
  isAutomatisk: boolean,
  team: string,
  kanIverksettes: boolean,
  virkFom: string,
  vedtakStatus: string | null,
  kravGjelder: string,
  opprettetAv: string,
  opprettetDato: string,
  endretDato: string | null,
  endretAv: string | null,
  vedtaksType: string | null,
  kravStatus: string | null,
  opplaasVedtakInformasjon: OpplaasVedtakInformasjon | null,
  behandlinger: LaasteVedtakBehandlingSummary[]
}

export type OpplaasVedtakInformasjon = {
  harBehandling: boolean,
  erAutomatisk: boolean,
  sammenstotendeVedtak: SammenstoendeVedtak | null,
}

export type SammenstoendeVedtak = {
  sakId: string,
}

export type LaasteVedtakBehandlingSummary = {
  behandlingId: string,
  type: string,
  isFeilet: boolean,
  isFerdig: boolean,
  isUnderBehandling: boolean,
  isStoppet: boolean,
}

export type LaasteVedtakUttrekkStatus = {
  behandlingId: string,
  aktivitet: string,
  isFerdig: boolean,
  isFeilet: boolean,
  feilmelding: string,
  stackTrace: string,
}