import { Heading, Table } from '@navikt/ds-react'
import { statusLabels } from './StatusfordelingOverTidBarChart/utils'
import type { AldeFordelingStatusMedAktivitet } from './types'

interface Props {
  data: AldeFordelingStatusMedAktivitet[]
}

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

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.antall, 0)

  return (
    <div>
      <Heading as="h2" size="medium" spacing>
        Statusfordeling med aktivitet
      </Heading>
      <Table size="medium" zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Aktivitet</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Andel</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(groupedByStatus).map(([status, items]) =>
            items.map((item, idx) => (
              <Table.Row key={`${status}-${item.aktivitet}`}>
                {idx === 0 && <Table.DataCell rowSpan={items.length}>{statusLabels[status] || status}</Table.DataCell>}
                <Table.DataCell>{item.aktivitet || '(Ingen aktivitet)'}</Table.DataCell>
                <Table.DataCell align="right">{item.antall}</Table.DataCell>
                <Table.DataCell align="right">
                  {total > 0 ? `${((item.antall / total) * 100).toFixed(1)}%` : '0%'}
                </Table.DataCell>
              </Table.Row>
            )),
          )}
        </Table.Body>
      </Table>
    </div>
  )
}
