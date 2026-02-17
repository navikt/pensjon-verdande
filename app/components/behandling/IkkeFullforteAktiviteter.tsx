import { BodyShort, Table } from '@navikt/ds-react'
import type { IkkeFullforteAktiviteterDTO } from '~/types'

export interface Props {
  ikkeFullforteAktiviteter: IkkeFullforteAktiviteterDTO
}

export default function IkkeFullforteAktiviteter(props: Props) {
  return (
    <Table>
      <BodyShort as="caption" visuallyHidden>
        Ikke fullførte aktiviteter
      </BodyShort>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Behandling</Table.HeaderCell>
          <Table.HeaderCell>Aktivitet</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Antall</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {props.ikkeFullforteAktiviteter.aktivitetOppsummering.map((it) => (
          <Table.Row key={it.behandling + it.aktivitet + it.status}>
            <Table.DataCell>{it.behandling}</Table.DataCell>
            <Table.DataCell>{it.aktivitet}</Table.DataCell>
            <Table.DataCell>{it.status}</Table.DataCell>
            <Table.DataCell>{it.antall}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
