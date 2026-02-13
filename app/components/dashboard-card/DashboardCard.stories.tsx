import { BriefcaseIcon, BugIcon, ClockDashedIcon } from '@navikt/aksel-icons'
import type { Meta, StoryObj } from '@storybook/react'
import { DashboardCard } from './DashboardCard'

const meta = {
  title: 'Komponenter/DashboardCard',
  component: DashboardCard,
} satisfies Meta<typeof DashboardCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Totalt antall behandlinger',
    value: '185',
    iconBackgroundColor: 'var(--ax-bg-brand-blue-moderate)',
    icon: BriefcaseIcon,
  },
}

export const Feilende: Story = {
  args: {
    title: 'Feilende behandlinger',
    value: '3',
    iconBackgroundColor: 'var(--ax-bg-danger-moderate)',
    icon: BugIcon,
  },
}

export const Uferdige: Story = {
  args: {
    title: 'Uferdige behandlinger',
    value: '47',
    iconBackgroundColor: 'var(--ax-bg-warning-moderate)',
    icon: ClockDashedIcon,
  },
}
