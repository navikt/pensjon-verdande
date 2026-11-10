import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import OmregningCheckbox from './OmregningCheckbox'

const meta = {
  title: 'Komponenter/OmregningCheckbox',
  component: OmregningCheckbox,
  render: function Render(args) {
    const [checked, setChecked] = useState(args.value)
    return <OmregningCheckbox {...args} value={checked} onChange={setChecked} />
  },
} satisfies Meta<typeof OmregningCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checked: Story = {
  args: {
    name: 'behandleApneKrav',
    value: true,
    onChange: () => {},
    children: 'Behandle åpne krav',
  },
}

export const Unchecked: Story = {
  args: {
    name: 'brukFaktoromregning',
    value: false,
    onChange: () => {},
    children: 'Bruk faktoromregning',
  },
}
