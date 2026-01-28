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

export interface AldeAvbrutteBehandlingerDto {
  avbrutteBehandlinger: {
    opprettet: string // date
    begrunnelse: string
  }[]
}

export interface AldeFordelingStatusOverTidDto {
  dato: string
  fordeling: AldeFordelingStatusDto['statusFordeling']
}

export interface AldeFordelingStatusMedAktivitet {
  status: string
  aktivitet: string
  antall: number
}

export interface AldeBehandlingNavn {
  friendlyName: string
  handlerName: string
  behandlingType: string
}

export interface KontrollpunktElement {
  type: string
  antall: number
  enhet: string
}

export interface AldeFordelingSamboerKontrollpunktBehandlingDto {
  dato: string
  data?: KontrollpunktElement[]
}

export interface AldeFordelingKontrollpunktOverTidDto {
  fordeling: AldeFordelingSamboerKontrollpunktBehandlingDto[]
}
