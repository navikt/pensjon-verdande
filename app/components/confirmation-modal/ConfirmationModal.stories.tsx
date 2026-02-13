import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmationModal } from './ConfirmationModal'

const meta = {
  title: 'Komponenter/ConfirmationModal',
  component: ConfirmationModal,
} satisfies Meta<typeof ConfirmationModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: 'Er du sikker på at du vil stoppe behandlingen?',
    showModal: false,
    onOk: () => {},
    onCancel: () => {},
  },
}

export const Open: Story = {
  args: {
    text: 'Er du sikker på at du vil slette alle feilende behandlinger?',
    showModal: true,
    onOk: () => {},
    onCancel: () => {},
  },
}
