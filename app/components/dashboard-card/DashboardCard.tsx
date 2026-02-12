import { Box, HStack, VStack } from '@navikt/ds-react'
import type { Property } from 'csstype'
import type React from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

type Props = {
  title: string
  value: string
  iconBackgroundColor: Property.BackgroundColor
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & SVGRProps & React.RefAttributes<SVGSVGElement>>
}

export function DashboardCard(props: Props) {
  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <HStack>
        <Box
          style={{
            height: '70px',
            width: '70px',
            backgroundColor: props.iconBackgroundColor,
            marginRight: '12px',
          }}
          borderRadius="4"
        >
          <props.icon
            fontSize="1.5rem"
            style={{
              width: '100%',
              height: '100%',
              padding: '12px',
              color: 'var(--ax-text-neutral)',
            }}
          />
        </Box>
        <VStack gap="space-16">
          <Box>{props.title}</Box>
          <Box>{props.value}</Box>
        </VStack>
      </HStack>
    </Box>
  )
}
