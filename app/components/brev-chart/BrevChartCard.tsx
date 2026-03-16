import { EnvelopeClosedFillIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Button, HStack, Spacer } from '@navikt/ds-react'
import type { BrevTidsserieDatapunkt, BrevTidsserieResponse } from '~/analyse/types'
import { BrevChart } from '~/components/brev-chart/BrevChart'
import { DEFAULT_ANTALL_TIMER, tidsvalgAlternativer } from '~/components/chart-utils/tidsvalgAlternativer'
import { useTidsserieCache } from '~/components/chart-utils/useTidsserieCache'

type Props = {
  datapunkter: BrevTidsserieDatapunkt[]
  chartHeight?: number
}

export function BrevChartCard(props: Props) {
  const { antallTimer, setAntallTimer, datapunkter, isLoading } = useTidsserieCache<
    BrevTidsserieDatapunkt,
    BrevTidsserieResponse
  >(props.datapunkter, '/api/brev-per-periode', DEFAULT_ANTALL_TIMER)

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <EnvelopeClosedFillIcon
          title="Brev opprettet"
          fontSize="1.5rem"
          style={{ verticalAlign: 'middle', marginRight: '6px' }}
        />
        <BodyShort weight="semibold">Brev opprettet</BodyShort>
        <Spacer />
        {tidsvalgAlternativer.map(({ timer, label }) => (
          <Button
            key={timer}
            size="xsmall"
            variant={antallTimer === timer ? 'primary' : 'tertiary'}
            onClick={() => setAntallTimer(timer)}
          >
            {label}
          </Button>
        ))}
      </HStack>
      {props.chartHeight !== undefined ? (
        <div
          style={{
            position: 'relative',
            height: `${props.chartHeight}px`,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <BrevChart datapunkter={datapunkter} antallTimer={antallTimer} maintainAspectRatio={false} />
        </div>
      ) : (
        <div style={{ opacity: isLoading ? 0.5 : 1 }}>
          <BrevChart datapunkter={datapunkter} antallTimer={antallTimer} />
        </div>
      )}
    </Box>
  )
}
