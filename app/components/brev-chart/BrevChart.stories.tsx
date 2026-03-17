import type { Meta, StoryObj } from '@storybook/react'
import type { BrevTidsserieDatapunkt } from '~/analyse/types'
import { BrevChart } from './BrevChart'

const meta = {
  title: 'Komponenter/BrevChart',
  component: BrevChart,
} satisfies Meta<typeof BrevChart>

export default meta
type Story = StoryObj<typeof meta>

const mockDatapunkter: BrevTidsserieDatapunkt[] = [
  { periodeFra: '2024-06-15T00:00:00', antall: 2 },
  { periodeFra: '2024-06-15T02:00:00', antall: 1 },
  { periodeFra: '2024-06-15T04:00:00', antall: 5 },
  { periodeFra: '2024-06-15T06:00:00', antall: 3 },
  { periodeFra: '2024-06-15T08:00:00', antall: 8 },
  { periodeFra: '2024-06-15T10:00:00', antall: 12 },
  { periodeFra: '2024-06-15T12:00:00', antall: 18 },
  { periodeFra: '2024-06-15T14:00:00', antall: 7 },
  { periodeFra: '2024-06-15T16:00:00', antall: 4 },
]

export const Siste24Timer: Story = {
  args: {
    datapunkter: mockDatapunkter,
    antallTimer: 24,
  },
}

export const Siste7Dager: Story = {
  args: {
    datapunkter: mockDatapunkter,
    antallTimer: 168,
  },
}

export const TomtDatasett: Story = {
  args: {
    datapunkter: [],
    antallTimer: 24,
  },
}
