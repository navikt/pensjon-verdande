import { LoaderFunctionArgs, SetURLSearchParams, useLoaderData, useSearchParams } from 'react-router'

import { BodyShort, Box, CopyButton, Heading, SortState, Table, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { ManglendeForeignKeyIndex } from '~/types/vedlikehold'
import { requireAccessToken } from '~/services/auth.server'
import { finnManglendeForeignKeyIndexer } from '~/services/vedlikehold.server'

interface ScopedSortState extends SortState {
  orderBy: keyof ManglendeForeignKeyIndex;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const manglendeForeignKeyIndexer = await finnManglendeForeignKeyIndexer(accessToken)

  const url = new URL(request.url)
  const fkParam = url.searchParams.get('fk')

  const valgtManglendeForeignKeyIndex = fkParam
    ? manglendeForeignKeyIndexer.find(fk => fk.foreignKeyName === fkParam) ?? null
    : null

  return {
    manglendeForeignKeyIndexer,
    valgtManglendeForeignKeyIndex,
  }
}

function ManglendeForeignKeyIndexerTable({ manglendeForeignKeyIndexer, selectedRow, searchParams, setSearchParams }: {
  manglendeForeignKeyIndexer: ManglendeForeignKeyIndex[]
  selectedRow: ManglendeForeignKeyIndex | null,
  searchParams: URLSearchParams
  setSearchParams: SetURLSearchParams
}) {
  const [sort, setSort] = useState<ScopedSortState | undefined>({ 'orderBy': 'tableName', 'direction': 'ascending' })

  const handleSort = (sortKey: ScopedSortState['orderBy']) => {
    setSort(
      sort && sortKey === sort.orderBy && sort.direction === 'descending'
        ? undefined
        : {
          orderBy: sortKey,
          direction:
            sort && sortKey === sort.orderBy && sort.direction === 'ascending'
              ? 'descending'
              : 'ascending',
        },
    )
  }

  function comparator<T>(a: T, b: T, orderBy: keyof T): number {
    const aVal = a[orderBy]
    const bVal = b[orderBy]
    if (aVal == null && bVal != null) return -1
    if (aVal != null && bVal == null) return 1
    if (aVal == null && bVal == null) return 0
    return String(aVal).localeCompare(String(bVal))
  }

  const sortedData = [...manglendeForeignKeyIndexer].sort((a, b) => {
    if (!sort) return 0

    return sort.direction === 'ascending'
      ? comparator(a, b, sort.orderBy)
      : comparator(b, a, sort.orderBy)
  })

  return (
    <Table sort={sort}
           onSortChange={(sortKey) =>
             handleSort(sortKey as ScopedSortState['orderBy'])
           }>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortKey="tableName" sortable>Tabell</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="foreignKeyName" sortable>Fjernnøkkel</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="foreignKeyColumns" sortable>Kolonner</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="referencedTableName" sortable>Referert tabell</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="referencedColumns" sortable>Refererte kolonner</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map((it) => {
          return (
            <Table.Row
              key={`${it.tableName}-${it.foreignKeyName}`}
              onClick={() => {
                if (it === selectedRow) {
                  searchParams.delete("fk")
                  setSearchParams(searchParams)
                } else {
                  setSearchParams({ fk: it.foreignKeyName })
                }
              }}
              selected={it.foreignKeyName === selectedRow?.foreignKeyName}
            >
              <Table.DataCell>{it.tableName}</Table.DataCell>
              <Table.DataCell>{it.foreignKeyName}</Table.DataCell>
              <Table.DataCell>{it.foreignKeyColumns}</Table.DataCell>
              <Table.DataCell>{it.referencedTableName}</Table.DataCell>
              <Table.DataCell>{it.referencedColumns}</Table.DataCell>
            </Table.Row>)
        })}
      </Table.Body>
    </Table>
  )
}

function IndexBox({ index }: { index: ManglendeForeignKeyIndex }) {
  const indexDdl = `CREATE INDEX ${index.tableName}_${index.foreignKeyColumns.replace(/,/g, '_')}_IDX ON ${index.tableName} (${index.foreignKeyColumns}) ONLINE;`

  return (
    <Box.New
      background={'sunken'}
      borderRadius="medium"
      padding="2"
    >
      <VStack gap="5">
        <Heading size="medium">
          Opprett indeks for {index.tableName} – {index.foreignKeyName}
        </Heading>
        <BodyShort>
          For å opprette en indeks for en fjernnøkkel som mangler én, kan du bruke følgende SQL-kommando i et
          Flyway-skript. Husk å endre indeksnavnet dersom du ønsker et annet navn.
        </BodyShort>
        <Box.New
          background={'raised'}
        >
          <pre>{indexDdl}</pre>
          <CopyButton copyText={indexDdl} text="Kopier SQL" />
        </Box.New>
      </VStack>
    </Box.New>
  )
}

export default function ManglendeForeignKeyIndexer() {
  const { manglendeForeignKeyIndexer, valgtManglendeForeignKeyIndex } = useLoaderData<typeof loader>()

  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <VStack gap="5">

      <Box.New
        background={'sunken'}
        borderRadius="medium"
        padding="2"
      >
        <VStack gap="5">
          <Heading size="large">
            Manglende indekser for fjernnøkler
          </Heading>

          {manglendeForeignKeyIndexer.length > 0 ? (
            <>
              <BodyShort>
                Tabellen under viser alle tabeller og kolonner som inngår i en fjernnøkkel (foreign key), men som
                mangler en tilhørende indeks.
                Dette kan føre til dårlig ytelse ved sletting av rader i de refererte tabellene.
                For å sikre god ytelse bør det opprettes indekser på disse kolonnene.
              </BodyShort>
              <Box.New
                background={'raised'}
                >


              <ManglendeForeignKeyIndexerTable
                manglendeForeignKeyIndexer={manglendeForeignKeyIndexer}
                selectedRow={valgtManglendeForeignKeyIndex}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              ></ManglendeForeignKeyIndexerTable>
              </Box.New>
            </>
          ) : (
            <BodyShort>
              Ingen manglende indekser ble funnet 🎉. Alle fjernnøkler har tilhørende indekser.
            </BodyShort>
          )}
        </VStack>
      </Box.New>
      {valgtManglendeForeignKeyIndex ? <IndexBox index={valgtManglendeForeignKeyIndex}/> : manglendeForeignKeyIndexer.length > 0 ? (
        <Box.New
          background={'sunken'}
          borderRadius="medium"
          padding="2"
        >
          <BodyShort>
            Trykk på en rad i tabellen for å se forslag til hvordan du kan opprette manglende indeks for den valgte
            raden.
          </BodyShort>
        </Box.New>
      ) : null}
    </VStack>
  )
}
