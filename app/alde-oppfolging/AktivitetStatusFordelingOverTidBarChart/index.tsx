import { BodyShort, Heading, Link, Table, VStack } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo, useRef } from 'react'
import { Bar, getElementAtEvent } from 'react-chartjs-2'
import { Link as RouterLink, useNavigate } from 'react-router'
import { byggAktivitetStatusSokUrl } from '../lib/drilldown'
import type { AktivitetStatusFordelingDto } from '../types'
import { aktivitetStatusColors, aktivitetStatusLabels, byggAktivitetSerie, summerPerStatus } from './utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: AktivitetStatusFordelingDto[]
  behandlingstype: string
  aktivitetCode: string
  aktivitetNavn: string
  fomDato: string
  tomDato: string
}

function formaterDato(iso: string): string {
  const [aar, maaned, dag] = iso.split('-')
  return `${dag}.${maaned}.${aar}`
}

export default function AktivitetStatusFordelingOverTidBarChart({
  data,
  behandlingstype,
  aktivitetCode,
  aktivitetNavn,
  fomDato,
  tomDato,
}: Props) {
  const navigate = useNavigate()
  // biome-ignore lint/suspicious/noExplicitAny: Chart-ref-typen fra react-chartjs-2 er generisk
  const chartRef = useRef<any>(null)
  const serie = useMemo(() => byggAktivitetSerie(data), [data])

  const chartData = useMemo<ChartData<'bar'> | null>(() => {
    if (!serie) return null
    return {
      labels: serie.datoer,
      datasets: serie.perStatus.map(({ status, antall }) => ({
        label: aktivitetStatusLabels[status] || status,
        data: antall,
        backgroundColor: aktivitetStatusColors[status]?.backgroundColor || 'var(--ax-bg-neutral-soft)',
        borderColor: aktivitetStatusColors[status]?.borderColor || 'var(--ax-border-neutral)',
        borderWidth: 1,
      })),
    }
  }, [serie])

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      plugins: {
        title: { display: true, text: `Aktivitetstatus per dag – ${aktivitetNavn}` },
        legend: { display: true, position: 'bottom' },
      },
      responsive: true,
      scales: {
        x: { stacked: true, ticks: { callback: (value) => formaterDato(serie?.datoer[value as number] ?? '') } },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
      },
    }),
    [aktivitetNavn, serie],
  )

  if (!serie || !chartData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <BodyShort>Ingen aktiviteter av typen {aktivitetNavn} i valgt periode.</BodyShort>
      </div>
    )
  }

  const totaler = summerPerStatus(serie)

  return (
    <VStack gap="space-24">
      <div style={{ maxHeight: '500px' }}>
        <Bar
          ref={chartRef}
          options={options}
          data={chartData}
          onClick={(event) => {
            const elementer = getElementAtEvent(chartRef.current, event)
            if (elementer.length === 0) return
            const { datasetIndex, index } = elementer[0]
            const status = serie.perStatus[datasetIndex]?.status
            const dato = serie.datoer[index]
            if (!status || !dato) return
            navigate(
              byggAktivitetStatusSokUrl({
                behandlingType: behandlingstype,
                aktivitetCode,
                aktivitetStatus: status,
                fomDato: dato,
                tomDato: dato,
              }),
            )
          }}
        />
      </div>

      <VStack gap="space-8">
        <Heading level="3" size="xsmall">
          Vis behandlinger per aktivitetstatus
        </Heading>
        <BodyShort size="small" textColor="subtle">
          Tallene teller aktiviteter i perioden {formaterDato(fomDato)}–{formaterDato(tomDato)}. Søket viser
          behandlinger, så antallet kan bli lavere hvis en behandling har aktiviteten flere ganger.
        </BodyShort>
        <Table size="small">
          <BodyShort as="caption" visuallyHidden>
            Aktivitetstatus for {aktivitetNavn} med lenke til behandlingssøk
          </BodyShort>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Aktivitetstatus</Table.ColumnHeader>
              <Table.ColumnHeader align="right">Antall aktiviteter</Table.ColumnHeader>
              <Table.ColumnHeader>Drilldown</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {totaler.map(({ status, antall }) => (
              <Table.Row key={status}>
                <Table.DataCell>{aktivitetStatusLabels[status] || status}</Table.DataCell>
                <Table.DataCell align="right">{antall}</Table.DataCell>
                <Table.DataCell>
                  {antall > 0 ? (
                    <Link
                      as={RouterLink}
                      to={byggAktivitetStatusSokUrl({
                        behandlingType: behandlingstype,
                        aktivitetCode,
                        aktivitetStatus: status,
                        fomDato,
                        tomDato,
                      })}
                      aria-label={`Vis behandlinger med aktiviteten ${aktivitetNavn} i aktivitetstatus ${
                        aktivitetStatusLabels[status] || status
                      }, ${formaterDato(fomDato)} til ${formaterDato(tomDato)}`}
                    >
                      Vis behandlinger
                    </Link>
                  ) : (
                    <BodyShort size="small" textColor="subtle">
                      –
                    </BodyShort>
                  )}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </VStack>
    </VStack>
  )
}
