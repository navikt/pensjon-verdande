import { BodyShort, Box, Heading, HStack, VStack } from '@navikt/ds-react'
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
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '12px 16px' }}>
      <HStack gap="space-16" align="center">
        <Box
          style={{
            height: '56px',
            width: '56px',
            backgroundColor: props.iconBackgroundColor,
            flexShrink: 0,
          }}
          borderRadius="4"
        >
          <props.icon
            aria-hidden
            fontSize="1.5rem"
            style={{
              width: '100%',
              height: '100%',
              padding: '12px',
              color: 'var(--ax-text-neutral)',
            }}
          />
        </Box>
        <VStack gap="space-4">
          <BodyShort size="small" textColor="subtle">
            {props.title}
          </BodyShort>
          <Heading as="p" size="large">
            {props.value}
          </Heading>
        </VStack>
      </HStack>
    </Box>
  )
}
