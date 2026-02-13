import type { Meta, StoryObj } from '@storybook/react'
import DateTimePicker from './DateTimePicker'

const meta = {
  title: 'Komponenter/DateTimePicker',
  component: DateTimePicker,
} satisfies Meta<typeof DateTimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    selectedDate: new Date(2024, 5, 15, 10, 30),
    setSelectedDate: () => {},
    label: 'Velg dato og tid',
  },
}

export const UtenValgtDato: Story = {
  args: {
    selectedDate: null,
    setSelectedDate: () => {},
    label: 'Omregningstidspunkt',
    placeholderText: 'Velg omregningstidspunkt',
  },
}
