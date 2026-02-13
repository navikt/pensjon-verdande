import { BodyShort, Heading, Table } from '@navikt/ds-react'
import React from 'react'
import { statusLabels } from './StatusfordelingOverTidBarChart/utils'
import type { AldeFordelingStatusMedAktivitet } from './types'

interface Props {
  data: AldeFordelingStatusMedAktivitet[]
}

// Predefined order for consistent display - must match statusLabels mapping
const statusOrder = ['FULLFORT', 'UNDER_BEHANDLING', 'AVBRUTT', 'FEILENDE', 'DEBUG', 'STOPPET']

export default function FordelingStatusMedAktivitet({ data }: Props) {
  // Group data by status
  const groupedByStatus = data.reduce(
    (acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = []
      }
      acc[item.status].push(item)
      return acc
    },
    {} as Record<string, AldeFordelingStatusMedAktivitet[]>,
  )

  const sortedEntries = Object.entries(groupedByStatus)
    .sort(([statusA], [statusB]) => {
      const indexA = statusOrder.indexOf(statusA)
      const indexB = statusOrder.indexOf(statusB)
      if (indexA === -1 && indexB === -1) return statusA.localeCompare(statusB)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
    .map(([status, items]) => {
      const sortedItems = [...items].sort((a, b) => b.antall - a.antall)
      return [status, sortedItems] as const
    })

  const total = data.reduce((sum, item) => sum + item.antall, 0)

  if (data.length === 0) {
    return (
      <div>
        <Heading as="h2" size="medium" spacing>
          Statusfordeling med aktivitet
        </Heading>
        <BodyShort>Ingen data tilgjengelig for valgt periode.</BodyShort>
      </div>
    )
  }

  return (
    <div>
      <Heading as="h2" size="medium" spacing>
        Statusfordeling med aktivitet
      </Heading>
      <Table size="medium" zebraStripes>
        <BodyShort as="caption" visuallyHidden>
          Statusfordeling med aktivitet
        </BodyShort>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Aktivitet</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Andel</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedEntries.map(([status, items]) => {
            const statusTotal = items.reduce((sum, item) => sum + item.antall, 0)
            return (
              <React.Fragment key={status}>
                {items.map((item, idx) => (
                  <Table.Row
                    key={`${status}-${item.aktivitet || 'ingen'}-${idx}`}
                    aria-label={
                      idx === 0
                        ? `${statusLabels[status] || status} - ${item.aktivitet || 'Ingen aktivitet'}`
                        : undefined
                    }
                  >
                    {idx === 0 && (
                      <Table.DataCell rowSpan={items.length + 1} style={{ fontWeight: 500 }}>
                        {statusLabels[status] || status}
                      </Table.DataCell>
                    )}
                    <Table.DataCell>{item.aktivitet || '(Ingen aktivitet)'}</Table.DataCell>
                    <Table.DataCell align="right">{item.antall}</Table.DataCell>
                    <Table.DataCell align="right">
                      {total > 0 ? `${((item.antall / total) * 100).toFixed(1)}%` : '0%'}
                    </Table.DataCell>
                  </Table.Row>
                ))}
                <Table.Row
                  key={`${status}-subtotal`}
                  style={{ fontWeight: 'bold', backgroundColor: 'var(--ax-bg-neutral-soft)' }}
                  aria-label={`Sum ${statusLabels[status] || status}`}
                >
                  <Table.DataCell>Sum {statusLabels[status] || status}</Table.DataCell>
                  <Table.DataCell align="right">{statusTotal}</Table.DataCell>
                  <Table.DataCell align="right">
                    {total > 0 ? `${((statusTotal / total) * 100).toFixed(1)}%` : '0%'}
                  </Table.DataCell>
                </Table.Row>
              </React.Fragment>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
