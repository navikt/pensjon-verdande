

export type SakOppsummeringLaasOpp = {
  sakId: string,
  sakStatus: string,
  sakType: string,
  vedtak: VedtakLaasOpp[],
  automatiskeKravUtenVedtak: AutomatiskKravUtenVedtak[],
}

export type VedtakLaasOpp = {
  vedtakId: string,
  kravId: string,
  kravGjelder: string,
  vedtaksType: string,
  vedtakStatus: string,
  behandlinger: LaasOppBehandlingSummary[],
  isLaast: boolean,
  opplaasVedtakInformasjon: OpplaasVedtakInformasjon | null,
}

export type AutomatiskKravUtenVedtak = {
  kravId: string,
  kravGjelder: string,
  kravStatus: string,
  behandlinger: LaasOppBehandlingSummary[],
}

export type LaasOppBehandlingSummary = {
  behandlingId: string,
  type: string,
  isFeilet: boolean,
  isFerdig: boolean,
  isUnderBehandling: boolean,
  isStoppet: boolean,
}

export type OpplaasVedtakInformasjon = {
  harBehandling: boolean,
  erAutomatisk: boolean,
  sammenstotendeVedtak: SammenstoendeVedtak | null,
}

export type SammenstoendeVedtak = {
  sakId: string,
}

export type LaasOppResultat = {
  success: boolean
}



