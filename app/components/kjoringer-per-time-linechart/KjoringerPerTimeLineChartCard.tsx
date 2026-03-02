import { ClockDashedIcon } from '@navikt/aksel-icons'
import { Box, Button, HStack, Spacer } from '@navikt/ds-react'
import { useState } from 'react'
import { KjoringerPerTimeLineChart } from '~/components/kjoringer-per-time-linechart/KjoringerPerTimeLineChart'
import type { TidspunktAntall } from '~/types'

type Props = {
  kjoringerPerTime: TidspunktAntall[]
}

export function KjoringerPerTimeLineChartCard(props: Props) {
  const [antallDager, setAntallDager] = useState(1)

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <ClockDashedIcon
          title="Behandlingsaktivitet"
          fontSize="1.5rem"
          style={{ verticalAlign: 'middle', marginRight: '6px' }}
        />
        Behandlingsaktivitet
        <Spacer />
        <Button size="xsmall" variant={antallDager === 7 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(7)}>
          7 dager
        </Button>
        <Button size="xsmall" variant={antallDager === 3 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(3)}>
          3 dager
        </Button>
        <Button size="xsmall" variant={antallDager === 1 ? 'primary' : 'tertiary'} onClick={() => setAntallDager(1)}>
          24 timer
        </Button>
      </HStack>
      <KjoringerPerTimeLineChart kjoringerPerTime={props.kjoringerPerTime} antallDager={antallDager} />
    </Box>
  )
}
