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
  icon: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> &
      SVGRProps &
      React.RefAttributes<SVGSVGElement>
  >
}

export function DashboardCard(props: Props) {
  return (
    <Box.New
      background={"raised"}
      borderRadius="medium"
      shadow="dialog"
      style={{ padding: '6px' }}
    >
      <HStack>
        <Box.New
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
              color: 'var(--ax-text-neutral)',
            }}
          />
        </Box.New>
        <VStack gap="4">
          <Box.New>{props.title}</Box.New>
          <Box.New>{props.value}</Box.New>
        </VStack>
      </HStack>
    </Box.New>
  )
}
