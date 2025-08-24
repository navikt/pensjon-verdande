export type ActionData = {
  antall: string | null
  error: string | null
}

export type Infobanner = {
  validToDate: string | null
  variant: InfobannerVariant | null
  description: string | null
  url: string | null
  urlText: string | null
}

export type OppdaterInfoBannerResponse = {
  erOppdatert: boolean
}

export type InfobannerVariant = 'INFO' | 'WARNING' | 'ERROR'
