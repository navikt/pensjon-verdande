import type { Meta, StoryObj } from '@storybook/react'
import OmregningBrevCheckbox from './OmregningBrevCheckbox'

const meta = {
  title: 'Komponenter/OmregningBrevCheckbox',
  component: OmregningBrevCheckbox,
} satisfies Meta<typeof OmregningBrevCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    navn: 'brevkodeAlder',
    skalVises: true,
    tekst: 'Batchbrev for Alder',
    selectedBrevKode: undefined,
    setselectedBrevKode: () => {},
    optionBatchbrevtyper: [
      { value: 'PE_BA_01_001', label: 'PE_BA_01_001 - Vedtak alderspensjon' },
      { value: 'PE_BA_01_002', label: 'PE_BA_01_002 - Endring alderspensjon' },
    ],
  },
}

export const MedValgtBrevkode: Story = {
  args: {
    navn: 'brevkodeAlder',
    skalVises: true,
    tekst: 'Batchbrev for Alder',
    selectedBrevKode: { value: 'PE_BA_01_001', label: 'PE_BA_01_001 - Vedtak alderspensjon' },
    setselectedBrevKode: () => {},
    optionBatchbrevtyper: [
      { value: 'PE_BA_01_001', label: 'PE_BA_01_001 - Vedtak alderspensjon' },
      { value: 'PE_BA_01_002', label: 'PE_BA_01_002 - Endring alderspensjon' },
    ],
  },
}
