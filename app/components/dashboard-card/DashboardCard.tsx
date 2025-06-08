import { Box, HStack, VStack } from '@navikt/ds-react'
import type { Property } from 'csstype'
import React from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

type Props = {
  title: string
  value: string
  iconBackgroundColor: Property.BackgroundColor
  icon: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> &
      SVGRProps &
      React.RefAttributes<SVGSVGElement>
  >
}

export function DashboardCard(props: Props) {
  return (
    <Box
      background={'surface-default'}
      borderRadius="medium"
      shadow="medium"
      style={{ padding: '6px' }}
    >
      <HStack>
        <Box
          style={{
            height: '70px',
            width: '70px',
            backgroundColor: props.iconBackgroundColor,
            marginRight: '12px',
          }}
          borderRadius="medium"
        >
          <props.icon
            fontSize="1.5rem"
            style={{
              width: '100%',
              height: '100%',
              padding: '12px',
              color: 'var(--a-icon-on-neutral)',
            }}
          />
        </Box>
        <VStack gap="4">
          <Box>{props.title}</Box>
          <Box>{props.value}</Box>
        </VStack>
      </HStack>
    </Box>
  )
}
