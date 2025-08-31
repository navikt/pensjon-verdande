import { Table } from '@navikt/ds-react'
import { formatIsoTimestamp } from '~/common/date'
import { type BrukerResponse, decodeOperasjon, type Tilgangsmeta } from '~/brukere/brukere'

export interface Props {
  tilgangskontrollmeta: Tilgangsmeta[],
  bruker: BrukerResponse
}

export const BrukersTilgangsLogg = (props: Props) => {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Operasjon</Table.HeaderCell>
          <Table.HeaderCell>Fra</Table.HeaderCell>
          <Table.HeaderCell>Til</Table.HeaderCell>
          <Table.HeaderCell>Gitt av</Table.HeaderCell>
          <Table.HeaderCell>Fjernet av</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {props.bruker.tilgangsHistorikk.sort((a, b) => Date.parse(b.fra) - Date.parse(a.fra)).map((endring, index) => (
          <Table.Row key={index}>
            <Table.DataCell>{decodeOperasjon(props.tilgangskontrollmeta, endring.operasjon)}</Table.DataCell>
            <Table.DataCell>{formatIsoTimestamp(endring.fra)}</Table.DataCell>
            <Table.DataCell>{endring.til ? formatIsoTimestamp(endring.til) : 'Nåværende'}</Table.DataCell>
            <Table.DataCell>{endring.gittAvBruker}</Table.DataCell>
            <Table.DataCell>{endring.fjernetAvBruker}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}