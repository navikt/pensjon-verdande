import { Table } from '@navikt/ds-react'
import { formaterBucketLabel } from '../lib/formatters'
import type { Aggregering } from '../lib/url-state'
import type { Bucket } from './AntallOverTidChart'

type Props = {
  buckets: Bucket[]
  aggregering: Aggregering
}

export function AntallOverTidDataTabell({ buckets, aggregering }: Props) {
  return (
    <Table size="small">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Periode</Table.HeaderCell>
          <Table.HeaderCell align="right">Antall</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {buckets.map((b) => (
          <Table.Row key={b.periodeStart}>
            <Table.DataCell>{formaterBucketLabel(b.periodeStart, aggregering)}</Table.DataCell>
            <Table.DataCell align="right">{b.antall.toLocaleString('nb-NO')}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
