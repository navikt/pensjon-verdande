import { Box, Detail, Heading, HStack, Table, VStack } from '@navikt/ds-react'

export interface KildeOppsummering {
  kilde: string
  innsenderType: string
  antall: number
}

function decodeKilde(kilde: string): string {
  if (kilde === 'PSAK') {
    return 'Psak'
  } else if (kilde === 'SOKNAD') {
    return 'nav.no'
  } else {
    return kilde
  }
}

export function KildeOppsummeringVisning({ data }: { data: KildeOppsummering[] }) {
  if (!data || data.length === 0) return null

  const total = data.reduce((sum, row) => sum + row.antall, 0)

  return (
    <Box.New borderWidth="1" borderRadius="large" borderColor="neutral-subtleA" padding={{ xs: '4', md: '5' }}>
      <VStack gap="4">
        <HStack justify="space-between" align="center" wrap={false}>
          <Heading level="2" size="small">
            Kildeoppsummering
          </Heading>
          <Detail>
            Totalt: <strong>{Intl.NumberFormat('nb-NO').format(total)}</strong>
          </Detail>
        </HStack>
        <Table size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Kilde</Table.HeaderCell>
              <Table.HeaderCell>Innsender</Table.HeaderCell>
              <Table.HeaderCell style={{ textAlign: 'right' }}>Antall</Table.HeaderCell>
              <Table.HeaderCell style={{ textAlign: 'right' }}>Andel</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((row) => (
              <Table.Row key={`${row.kilde}-${row.innsenderType}`}>
                <Table.DataCell>{decodeKilde(row.kilde)}</Table.DataCell>
                <Table.DataCell>{row.innsenderType}</Table.DataCell>
                <Table.DataCell style={{ textAlign: 'right' }}>
                  {Intl.NumberFormat('nb-NO').format(row.antall)}
                </Table.DataCell>
                <Table.DataCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {((row.antall * 100) / total).toFixed(1)} %
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Body>
            <Table.Row>
              <Table.DataCell colSpan={2}>
                <strong>Totalt</strong>
              </Table.DataCell>
              <Table.DataCell style={{ textAlign: 'right' }}>
                <strong>{Intl.NumberFormat('nb-NO').format(total)}</strong>
              </Table.DataCell>
            </Table.Row>
          </Table.Body>
        </Table>
      </VStack>
    </Box.New>
  )
}
