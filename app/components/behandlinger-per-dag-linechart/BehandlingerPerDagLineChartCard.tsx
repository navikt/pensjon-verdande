import { AreaChartFillIcon } from '@navikt/aksel-icons'
import { Box, Button, HStack, Spacer } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { BehandlingerPerDagLineChart } from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChart'
import type { DatoAntall } from '~/types'

type Props = {
  opprettetPerDag: DatoAntall[]
  chartHeight?: number
}

const DEFAULT_ANTALL_DAGER = 30

export function BehandlingerPerDagLineChartCard(props: Props) {
  const [antallDager, setAntallDager] = useState(DEFAULT_ANTALL_DAGER)
  const fetcher = useFetcher<{ opprettetPerDag: DatoAntall[] }>()
  const fetcherLoad = fetcher.load

  useEffect(() => {
    if (antallDager !== DEFAULT_ANTALL_DAGER) {
      fetcherLoad(`/api/opprettet-per-dag?dager=${antallDager}`)
    }
  }, [antallDager, fetcherLoad])

  const opprettetPerDag =
    antallDager === DEFAULT_ANTALL_DAGER && !fetcher.data
      ? props.opprettetPerDag
      : (fetcher.data?.opprettetPerDag ?? props.opprettetPerDag)

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <AreaChartFillIcon
          title="Antall behandlinger"
          fontSize="1.5rem"
          style={{ verticalAlign: 'middle', marginRight: '6px' }}
        />
        Antall behandlinger
        <Spacer></Spacer>
        <Button
          size="xsmall"
          variant={antallDager === 365 ? 'primary' : 'tertiary'}
          onClick={() => setAntallDager(365)}
        >
          365 dager
        </Button>
        <Button size="xsmall" variant={antallDager === 90 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(90)}>
          90 dager
        </Button>
        <Button
          style={{ marginRight: '6px' }}
          size="xsmall"
          variant={antallDager === 30 ? 'primary' : 'tertiary'}
          onClick={() => setAntallDager(30)}
        >
          30 dager
        </Button>
        <Button size="xsmall" variant={antallDager === 7 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(7)}>
          7 dager
        </Button>
      </HStack>
      {props.chartHeight !== undefined ? (
        <div
          style={{
            position: 'relative',
            height: `${props.chartHeight}px`,
            opacity: fetcher.state === 'loading' ? 0.5 : 1,
          }}
        >
          <BehandlingerPerDagLineChart
            opprettetPerDag={opprettetPerDag}
            antallDager={antallDager}
            maintainAspectRatio={false}
          />
        </div>
      ) : (
        <div style={{ opacity: fetcher.state === 'loading' ? 0.5 : 1 }}>
          <BehandlingerPerDagLineChart opprettetPerDag={opprettetPerDag} antallDager={antallDager} />
        </div>
      )}
    </Box>
  )
}
