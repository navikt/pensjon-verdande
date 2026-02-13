import type { Meta, StoryObj } from '@storybook/react'
import { Entry } from './Entry'

const meta = {
  title: 'Komponenter/Entry',
  component: Entry,
} satisfies Meta<typeof Entry>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    as: 'div',
    labelText: 'Fødselsnummer',
    children: '12345678901',
  },
}

export const MedHjelpetekst: Story = {
  args: {
    as: 'div',
    labelText: 'Behandlingsstatus',
    helpText: 'Viser nåværende status for behandlingen i systemet.',
    children: 'Under behandling',
  },
}

export const UtenLabel: Story = {
  args: {
    as: 'div',
    children: 'Bare innhold uten label',
  },
}
