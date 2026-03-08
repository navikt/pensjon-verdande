import { BodyShort, Box, Heading, Table, VStack } from '@navikt/ds-react'
import { decodeAktivitet } from '~/common/decodeBehandling'
import type { ManuellOppgaveStatistikk } from '../types'
import { formaterTall } from '../utils/formattering'

interface Props {
  data: ManuellOppgaveStatistikk[]
}

export default function ManuelleOppgaverTabell({ data }: Props) {
  if (data.length === 0) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen manuelle oppgaver i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  return (
    <VStack gap="space-16">
      <Heading level="3" size="small">
        Manuelle oppgaver per aktivitet
      </Heading>
      <Table size="small" zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader />
            <Table.ColumnHeader>Aktivitet</Table.ColumnHeader>
            <Table.ColumnHeader>Oppgavekategori</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((oppgave) => (
            <Table.ExpandableRow
              key={`${oppgave.aktivitetType}-${oppgave.oppgaveKategori}`}
              content={
                <Table size="small">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Kontrollpunkttype</Table.ColumnHeader>
                      <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
                      <Table.ColumnHeader align="right">Kritiske</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {oppgave.kontrollpunktTyper.map((kp) => (
                      <Table.Row key={kp.kontrollpunktType}>
                        <Table.DataCell>{kp.kontrollpunktType}</Table.DataCell>
                        <Table.DataCell align="right">{formaterTall(kp.antall)}</Table.DataCell>
                        <Table.DataCell align="right">{formaterTall(kp.antallKritiske)}</Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              }
            >
              <Table.DataCell>{decodeAktivitet(oppgave.aktivitetType)}</Table.DataCell>
              <Table.DataCell>{oppgave.oppgaveKategori}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(oppgave.antall)}</Table.DataCell>
            </Table.ExpandableRow>
          ))}
        </Table.Body>
      </Table>
    </VStack>
  )
}
