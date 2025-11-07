export interface AldeOppsummeringDto {
  antallBehandlinger: number
  antallAldeBehandlinger: number
  aldeBehandlingerUnderBehandling: number
  fullforteAldeBehandlinger: number
  avbrutteAldeBehandlinger: number
}

export interface AldeFordelingStatusDto {
  statusFordeling: {
    status: string
    antall: number
  }[]
}
