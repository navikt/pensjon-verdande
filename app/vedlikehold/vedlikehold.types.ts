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

export type ManglendeForeignKeyIndex = {
  tableName: string
  foreignKeyName: string
  foreignKeyColumns: string
  referencedTableName: string
  referencedColumns: string
}

export type ManglendeForeignKeyIndexResponse = {
  manglendeForeignKeyIndexer: ManglendeForeignKeyIndex[]
}