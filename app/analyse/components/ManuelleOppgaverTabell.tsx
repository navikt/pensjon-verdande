import { BodyShort, Box, Heading, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { decodeAktivitet } from '~/common/decodeBehandling'
import type { ManuellOppgaveStatistikk } from '../types'
import { formaterTall } from '../utils/formattering'
import { useSortableTable } from '../utils/useSortableTable'

interface Props {
  data: ManuellOppgaveStatistikk[]
}

export default function ManuelleOppgaverTabell({ data }: Props) {
  const getValue = useCallback((item: ManuellOppgaveStatistikk, key: string) => {
    switch (key) {
      case 'aktivitet':
        return decodeAktivitet(item.aktivitetType)
      case 'oppgaveKategori':
        return item.oppgaveKategori
      case 'antall':
        return item.antall
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(data, 'antall', 'descending', getValue)

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
      <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader />
            <Table.ColumnHeader sortable sortKey="aktivitet">
              Aktivitet
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="oppgaveKategori">
              Oppgavekategori
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="antall" align="right">
              Antall
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((oppgave) => (
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
