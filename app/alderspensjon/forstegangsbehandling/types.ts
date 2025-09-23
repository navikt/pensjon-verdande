export type BehandlingStatus = 'OPPRETTET' | 'UNDER_BEHANDLING' | 'FULLFORT' | 'STOPPET' | 'FEILENDE' | 'DEBUG'

export type BehandlingTypeCode = 'AUTO' | 'DEL_AUTO' | 'MAN'

export type AldeBehandlingStatus = 'VENTER_SAKSBEHANDLER' | 'VENTER_MASKINELL' | 'VENTER_ATTESTERING' | 'FULLFORT'

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
  feilmelding: string | null
  stackTrace: string | null
  sakId: number
  kravId: number
  behandlingstype: BehandlingTypeCode
  onsketVirkningsdato: string // LocalDate ISO
  erAldeBehandling: boolean
  erMuligAldeBehandling: boolean
  isVurderSamboerUnderBehandling: boolean
}
