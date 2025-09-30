import {
  Box,
  Button,
  DatePicker,
  Detail,
  Heading,
  HStack,
  Label,
  Table,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'

export interface KildeOppsummering {
  kilde: string
  innsenderType: string
  antall: number
}

function decodeInnsender(kilde: string): string {
  if (kilde === 'SAKSBEHANDLER') {
    return 'Saksbehandler'
  } else if (kilde === 'DOLLY') {
    return 'System'
  } else if (kilde === 'ALDERSOVERGANG') {
    return 'System'
  } else if (kilde === 'EN_PERSON') {
    return 'Søker eller verge'
  } else if (kilde === 'EESSI_PENSJON') {
    return 'System'
  } else if (kilde === 'srveessipensjon') {
    return 'System'
  } else {
    return kilde
  }
}

function decodeKilde(kilde: string): string {
  if (kilde === 'PSAK') {
    return 'psak'
  } else if (kilde === 'DOLLY') {
    return 'dolly'
  } else if (kilde === 'ALDERSOVERGANG') {
    return 'aldersovergang'
  } else if (kilde === 'SOKNAD') {
    return 'nav.no'
  } else if (kilde === 'EESSI_PENSJON') {
    return 'eessi-pensjon'
  } else {
    return kilde
  }
}

export function KildeOppsummeringVisning({
  fomDato,
  tomDato,
  data,
}: {
  fomDato: string
  tomDato: string
  data: KildeOppsummering[]
}) {
  const now = new Date()
  const [searchParams, setSearchParams] = useSearchParams()

  function updateSearchParams(nextFrom: string, nextTo: string) {
    const next = new URLSearchParams(searchParams)

    next.set('fomDato', nextFrom)
    next.set('tomDato', nextTo)

    setSearchParams(next)
  }

  function onRangeChange(val?: DateRange) {
    if (val?.from && val.to) {
      updateSearchParams(toIsoDate(val.from), toIsoDate(val.to))
    }
  }

  const { datepickerProps, fromInputProps, toInputProps, setSelected } = useRangeDatepicker({
    defaultSelected: {
      from: new Date(fomDato),
      to: new Date(tomDato),
    },
    required: true,
    onRangeChange: onRangeChange,
  })

  function applyPeriod(nextFrom: string, nextTo: string) {
    setSelected({
      from: new Date(nextFrom),
      to: new Date(nextTo),
    })
    updateSearchParams(nextFrom, nextTo)
  }

  function presetLastNDays(n: number) {
    const to = toIsoDate(now)
    const from = toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1)))
    applyPeriod(from, to)
  }

  function presetThisYear() {
    const from = `${now.getFullYear()}-01-01`
    const to = toIsoDate(new Date())
    applyPeriod(from, to)
  }

  const total = data.reduce((sum, row) => sum + row.antall, 0)

  return (
    <Box.New borderWidth="1" borderRadius="large" borderColor="neutral-subtleA" padding={{ xs: '4', md: '5' }}>
      <VStack gap="4">
        <HStack justify="space-between" align="center" wrap={false}>
          <Heading level="2" size="small">
            Kilde for førstegangsbehandlingskrav
          </Heading>
          <Detail>
            Totalt: <strong>{Intl.NumberFormat('nb-NO').format(total)}</strong>
          </Detail>
        </HStack>

        <HStack gap="3" align="end" wrap>
          <DatePicker {...datepickerProps}>
            <HStack wrap gap="space-16" justify="center">
              <DatePicker.Input size="small" {...fromInputProps} label="Fra" />
              <DatePicker.Input size="small" {...toInputProps} label="Til" />
            </HStack>
          </DatePicker>

          <VStack gap="space-8">
            <Label size="small">Periode</Label>
            <HStack gap="1" wrap>
              <Button size="small" variant="secondary" onClick={() => presetLastNDays(7)}>
                7 d
              </Button>
              <Button size="small" variant="secondary" onClick={() => presetLastNDays(30)}>
                30 d
              </Button>
              <Button size="small" variant="secondary" onClick={presetThisYear}>
                I år
              </Button>
            </HStack>
          </VStack>
        </HStack>

        <Table size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Innsender</Table.HeaderCell>
              <Table.HeaderCell>Kilde</Table.HeaderCell>
              <Table.HeaderCell style={{ textAlign: 'right' }}>Antall</Table.HeaderCell>
              <Table.HeaderCell style={{ textAlign: 'right' }}>Andel</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data
              .sort((a, b) => b.antall - a.antall)
              .map((row) => (
                <Table.Row key={`${row.kilde}-${row.innsenderType}`}>
                  <Table.DataCell>{decodeInnsender(row.innsenderType)}</Table.DataCell>
                  <Table.DataCell>{decodeKilde(row.kilde)}</Table.DataCell>
                  <Table.DataCell style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat('nb-NO').format(row.antall)}
                  </Table.DataCell>
                  <Table.DataCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {((row.antall * 100) / total).toFixed(1)} %
                  </Table.DataCell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </VStack>
    </Box.New>
  )
}
