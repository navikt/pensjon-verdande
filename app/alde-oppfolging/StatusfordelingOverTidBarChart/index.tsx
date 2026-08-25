import { BodyShort, Link, ReadMore, Table, VStack } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo, useRef } from 'react'
import { Bar, getElementAtEvent } from 'react-chartjs-2'
import { Link as RouterLink, useNavigate } from 'react-router'
import { byggBehandlingStatusSokUrl } from '../lib/drilldown'
import type { AldeFordelingStatusOverTidDto } from '../types'
import { parseToChartData, statusColors, statusLabels } from './utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface StatusfordelingOverTidBarChartProps {
  data: AldeFordelingStatusOverTidDto[]
  fomDate: string
  tomDate: string
  hiddenStatuses?: string[]
  /** Drilldown aktiveres kun når disse er satt. */
  behandlingstype?: string
  avbruddAktivitetCode?: string
}

export const options: ChartOptions<'bar'> = {
  plugins: {
    title: {
      display: true,
      text: 'Alde statusfordeling over tid',
    },
    legend: {
      display: false,
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
      ticks: {
        callback: function (value) {
          const label = this.getLabelForValue(value as number)
          // Convert from yyyy-MM-dd to dd.MM.yyyy
          const [year, month, day] = label.split('-')
          return `${day}.${month}.${year}`
        },
      },
    },
    y: {
      stacked: true,
    },
  },
}

function formaterDato(iso: string): string {
  const [aar, maaned, dag] = iso.split('-')
  return `${dag}.${maaned}.${aar}`
}

const StatusfordelingOverTidBarChart: React.FC<StatusfordelingOverTidBarChartProps> = ({
  data,
  hiddenStatuses = [],
  behandlingstype,
  avbruddAktivitetCode,
}) => {
  const navigate = useNavigate()
  // biome-ignore lint/suspicious/noExplicitAny: Chart-ref-typen fra react-chartjs-2 er generisk
  const chartRef = useRef<any>(null)
  const drilldownAktiv = Boolean(behandlingstype && avbruddAktivitetCode)

  // Datasettenes rekkefølge må matche `parseToChartData`-nøklene for at klikk skal treffe
  // riktig status. Utledes fra samme kilde i stedet for å gjentas som konstant.
  const { labels: datoer, statusNokler } = useMemo(() => {
    const [labels, parsed] = parseToChartData(data)
    return { labels, statusNokler: parsed?.[0] ? Object.keys(parsed[0]) : [] }
  }, [data])

  const chartData = useMemo(() => {
    const [labels, parsedData] = parseToChartData(data)

    // Handle empty data
    if (!parsedData || parsedData.length === 0 || !parsedData[0]) {
      return null
    }

    const result: ChartData<'bar'> = {
      labels,
      datasets: Object.entries(parsedData[0]).map(([status, counts]) => {
        const colors = statusColors[status] || {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderColor: 'rgb(0, 0, 0)',
        }

        return {
          label: statusLabels[status] || status,
          data: counts,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: 1,
          hidden: hiddenStatuses.includes(status),
        }
      }),
    }

    return result
  }, [data, hiddenStatuses])

  if (!chartData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <BodyShort>Ingen behandlinger i tidsrommet</BodyShort>
      </div>
    )
  }

  const drilldownUrl = (status: string, dato: string) =>
    byggBehandlingStatusSokUrl({
      behandlingType: behandlingstype as string,
      behandlingStatus: status,
      // Én dags søyle: perioden er nøyaktig den dagen.
      fomDato: dato,
      tomDato: dato,
      avbruddAktivitetCode: avbruddAktivitetCode as string,
    })

  return (
    <VStack gap="space-16">
      <div style={{ maxHeight: '500px' }}>
        <Bar
          ref={chartRef}
          options={options}
          data={chartData}
          onClick={(event) => {
            if (!drilldownAktiv) return
            const elementer = getElementAtEvent(chartRef.current, event)
            if (elementer.length === 0) return
            const { datasetIndex, index } = elementer[0]
            const status = statusNokler[datasetIndex]
            const dato = datoer[index]
            if (!status || !dato) return
            navigate(drilldownUrl(status, dato))
          }}
        />
      </div>

      {/* Chart.js-søyler kan ikke tastaturnavigeres. Denne lista gir samme drilldown for
          tastatur- og skjermleserbrukere. */}
      {drilldownAktiv && datoer.length > 0 && (
        <ReadMore header="Vis behandlinger per dag og status">
          <Table size="small">
            <BodyShort as="caption" visuallyHidden>
              Behandlingsstatus per dag med lenke til behandlingssøk
            </BodyShort>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Dato</Table.ColumnHeader>
                {statusNokler.map((status) => (
                  <Table.ColumnHeader key={status}>{statusLabels[status] || status}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {datoer.map((dato) => (
                <Table.Row key={dato}>
                  <Table.DataCell>{formaterDato(dato)}</Table.DataCell>
                  {statusNokler.map((status) => (
                    <Table.DataCell key={status}>
                      <Link
                        as={RouterLink}
                        to={drilldownUrl(status, dato)}
                        aria-label={`Vis behandlinger med behandlingsstatus ${
                          statusLabels[status] || status
                        } opprettet ${formaterDato(dato)}`}
                      >
                        Vis
                      </Link>
                    </Table.DataCell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ReadMore>
      )}
    </VStack>
  )
}

export default StatusfordelingOverTidBarChart
