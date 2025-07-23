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