export type EkskluderteSakerResponse = {
  ekskluderteSaker: EkskludertSak[]
}
export type EkskludertSak = {
  sakId: string
  kommentar: string | undefined
}

export type StartBatchResponse = {
  behandlingId: number
}
