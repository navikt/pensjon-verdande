export type BehandlingStatus = 'OPPRETTET' | 'UNDER_BEHANDLING' | 'FULLFORT' | 'STOPPET' | 'FEILENDE' | 'DEBUG'

export type BehandlingTypeCode = 'AUTO' | 'DEL_AUTO' | 'MAN'

export type AldeBehandlingStatus = 'VENTER_SAKSBEHANDLER' | 'VENTER_MASKINELL' | 'VENTER_ATTESTERING' | 'FULLFORT'

export type Kontrollpunkt = {
  type: string
  status: string
}

export interface AlderspensjonssoknadDto {
  behandlingId: number
  uuid: string
  sisteKjoring: string // LocalDateTime ISO
  utsattTil: string | null
  opprettet: string // LocalDateTime ISO
  stoppet: string | null
  ferdig: string | null
  status: BehandlingStatus
  aldeStatus: AldeBehandlingStatus
  nesteAktiviteter: string[]
  kontrollpunkter: Kontrollpunkt[]
  feilmelding: string | null
  stackTrace: string | null
  sakId: number
  kravId: number
  enhetId: string | null
  enhetsNavn: string | null
  behandlingstype: BehandlingTypeCode
  onsketVirkningsdato: string // LocalDate ISO
  erAldeBehandling: boolean
  erMuligAldeBehandling: boolean
  isVurderSamboerUnderBehandling: boolean
}

export interface AldeOppsummeringDto {
  antallBehandlinger: number
  antallAldeBehandlinger: number
  aldeBehandlingerUnderBehandling: number
  fullforteAldeBehandlinger: number
  avbrutteAldeBehandlingr: number
}
