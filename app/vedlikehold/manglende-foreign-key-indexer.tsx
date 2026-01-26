import { BodyLong, BodyShort, Box, CopyButton, Heading, type SortState, Table, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type LoaderFunctionArgs, useLoaderData } from 'react-router'
import { apiGet } from '~/services/api.server'
import type { ManglendeForeignKeyIndex, ManglendeForeignKeyIndexResponse } from '~/vedlikehold/vedlikehold.types'

interface ScopedSortState extends SortState {
  orderBy: keyof ManglendeForeignKeyIndex
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const manglendeForeignKeyIndexer: ManglendeForeignKeyIndexResponse = await apiGet(
    '/api/vedlikehold/manglende-fk-index',
    request,
  )

  return {
    manglendeForeignKeyIndexer: manglendeForeignKeyIndexer.manglendeForeignKeyIndexer,
  }
}

function getIndexDdl(index: ManglendeForeignKeyIndex) {
  return `CREATE INDEX ${index.tableName}_${index.foreignKeyColumns.replace(/,/g, '_')}_IDX ON ${index.tableName} (${index.foreignKeyColumns}) ONLINE;`
}

function ManglendeForeignKeyIndexerTable({
  manglendeForeignKeyIndexer,
}: {
  manglendeForeignKeyIndexer: ManglendeForeignKeyIndex[]
}) {
  const [sort, setSort] = useState<ScopedSortState | undefined>({ orderBy: 'tableName', direction: 'ascending' })

  const handleSort = (sortKey: ScopedSortState['orderBy']) => {
    setSort(
      sort && sortKey === sort.orderBy && sort.direction === 'descending'
        ? undefined
        : {
            orderBy: sortKey,
            direction: sort && sortKey === sort.orderBy && sort.direction === 'ascending' ? 'descending' : 'ascending',
          },
    )
  }

  function comparator<T>(a: T, b: T, orderBy: keyof T): number {
    const aVal = a[orderBy]
    const bVal = b[orderBy]
    if (aVal == null && bVal != null) return -1
    if (aVal != null && bVal == null) return 1
    if (aVal == null && bVal == null) return 0
    return String(aVal).localeCompare(String(bVal), 'nb', { sensitivity: 'base' })
  }

  const sortedData = [...manglendeForeignKeyIndexer].sort((a, b) => {
    if (!sort) return 0

    return sort.direction === 'ascending' ? comparator(a, b, sort.orderBy) : comparator(b, a, sort.orderBy)
  })

  return (
    <Table sort={sort} onSortChange={(sortKey) => handleSort(sortKey as ScopedSortState['orderBy'])}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortKey="tableName" sortable>
            Tabell
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="foreignKeyName" sortable>
            Fjernnøkkel
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="foreignKeyColumns" sortable>
            Kolonner
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="referencedTableName" sortable>
            Referert tabell
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="referencedColumns" sortable>
            Refererte kolonner
          </Table.ColumnHeader>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map((it) => {
          const indexDdl = getIndexDdl(it)
          return (
            <Table.ExpandableRow
              content={
                <BodyShort weight={'semibold'}>
                  {indexDdl}
                  <CopyButton copyText={indexDdl} />
                </BodyShort>
              }
              key={`${it.tableName}-${it.foreignKeyName}`}
              togglePlacement="right"
              expandOnRowClick={true}
            >
              <Table.DataCell>{it.tableName}</Table.DataCell>
              <Table.DataCell>{it.foreignKeyName}</Table.DataCell>
              <Table.DataCell>{it.foreignKeyColumns}</Table.DataCell>
              <Table.DataCell>{it.referencedTableName}</Table.DataCell>
              <Table.DataCell>{it.referencedColumns}</Table.DataCell>
            </Table.ExpandableRow>
          )
        })}
      </Table.Body>
    </Table>
  )
}

export default function ManglendeForeignKeyIndexer() {
  const { manglendeForeignKeyIndexer } = useLoaderData<typeof loader>()

  return (
    <VStack gap="space-5">
      <Heading size="large">Manglende indekser for fjernnøkler</Heading>

      {manglendeForeignKeyIndexer.length > 0 ? (
        <>
          <BodyLong>
            Tabellen viser alle tabeller og kolonner som inngår i en fjernnøkkel (foreign key), men som mangler en
            tilhørende indeks. Dette kan gi dårlig ytelse ved sletting av rader i de refererte tabellene. For å sikre
            god ytelse bør det opprettes indekser på disse kolonnene.
          </BodyLong>
          <BodyShort weight={'semibold'}>
            Trykk på en rad for å se forslag til SQL-kommando for opprettelse av manglende indeks
          </BodyShort>
          <Box.New background={'raised'}>
            <ManglendeForeignKeyIndexerTable
              manglendeForeignKeyIndexer={manglendeForeignKeyIndexer}
            ></ManglendeForeignKeyIndexerTable>
          </Box.New>
        </>
      ) : (
        <BodyLong>Ingen manglende indekser ble funnet 🎉. Alle fjernnøkler har tilhørende indekser</BodyLong>
      )}
    </VStack>
  )
}
