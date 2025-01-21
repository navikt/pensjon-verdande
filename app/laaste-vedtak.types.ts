export type LaasteVedtakUttrekkSummary = {
  behandlingId: string,
  sistKjoert: string,
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
  endretAv: string | null,
  vedtaksType: string | null,
  kravStatus: string | null,
  behandlinger: LaasteVedtakBehandlingSummary[]
}

export type LaasteVedtakBehandlingSummary = {
  behandlingId: string,
  type: string,
  isFeilet: boolean,
  isFerdig: boolean,
  isUnderBehandling: boolean,
}

export type LaasteVedtakUttrekkStatus = {
  behandlingId: string,
  aktivitet: string,
  isFerdig: boolean,
  isFeilet: boolean,
  feilmelding: string,
  stackTrace: string,
}