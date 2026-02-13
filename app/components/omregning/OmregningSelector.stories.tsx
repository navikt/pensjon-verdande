import type { Meta, StoryObj } from '@storybook/react'
import OmregningSelector from './OmregningSelector'

const meta = {
  title: 'Komponenter/OmregningSelector',
  component: OmregningSelector,
} satisfies Meta<typeof OmregningSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Krav gjelder',
    navn: 'kravGjelder',
    value: 'ALDER',
    setSelectedValue: () => {},
    optionsmap: [
      { value: 'ALDER', label: 'Alderspensjon' },
      { value: 'UFORE', label: 'Uføretrygd' },
      { value: 'BARNEP', label: 'Barnepensjon' },
    ],
  },
}

export const Small: Story = {
  args: {
    label: 'Prioritet',
    navn: 'prioritet',
    value: '5',
    setSelectedValue: () => {},
    optionsmap: [
      { value: '1', label: '1 - Høyest' },
      { value: '5', label: '5 - Normal' },
      { value: '10', label: '10 - Lavest' },
    ],
    size: 'small',
  },
}
