import type { Meta, StoryObj } from '@storybook/react'
import OmregningCheckbox from './OmregningCheckbox'

const meta = {
  title: 'Komponenter/OmregningCheckbox',
  component: OmregningCheckbox,
} satisfies Meta<typeof OmregningCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checked: Story = {
  args: {
    defaultChecked: true,
    name: 'behandleApneKrav',
    value: true,
    onChange: () => {},
    children: 'Behandle åpne krav',
  },
}

export const Unchecked: Story = {
  args: {
    defaultChecked: false,
    name: 'brukFaktoromregning',
    value: false,
    onChange: () => {},
    children: 'Bruk faktoromregning',
  },
}
