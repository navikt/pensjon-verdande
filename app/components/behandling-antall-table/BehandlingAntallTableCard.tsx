import { ChevronDownIcon, ChevronUpIcon, NumberListIcon } from '@navikt/aksel-icons'
import { Box, Button, HStack, Spacer } from '@navikt/ds-react'
import { useState } from 'react'
import BehandlingAntallTable from '~/components/behandling-antall-table/BehandlingAntallTable'
import type { BehandlingAntall } from '~/types'

type Props = {
  behandlingAntall: BehandlingAntall[]
}

export function BehandlingAntallTableCard(props: Props) {
  const [expanded, setExpanded] = useState(false)
  const visibleData = expanded ? props.behandlingAntall : props.behandlingAntall.slice(0, 10)
  const hasMore = props.behandlingAntall.length > 10

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack align="center">
        <div style={{ textAlign: 'center' }}>
          <NumberListIcon
            title="a11y-title"
            fontSize="1.5rem"
            style={{ verticalAlign: 'middle', marginRight: '6px' }}
          />
          Antall etter type
        </div>
        <Spacer />
        {hasMore && (
          <Button
            size="xsmall"
            variant="tertiary"
            icon={expanded ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Vis topp 10' : `Vis alle (${props.behandlingAntall.length})`}
          </Button>
        )}
      </HStack>
      <BehandlingAntallTable oppsummering={visibleData} />
    </Box>
  )
}
