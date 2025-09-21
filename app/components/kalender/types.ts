export type KalenderHendelser = {
  offentligeFridager: OffentligFridag[]
  kalenderBehandlinger: KalenderBehandling[]
}

export type KalenderBehandling = {
  behandlingId: number
  type: string
  kjoreDato: string
}

export type OffentligFridag = {
  dato: string
  navn: string
}

export type KalenderHendelserDTO = {
  offentligeFridager: OffentligFridag[]
  kalenderBehandlinger: KalenderBehandlingDTO[]
}

export type KalenderBehandlingDTO = {
  behandlingId: number
  type: string
  opprettet: string
  planlagtStartet?: string
}
