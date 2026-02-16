import type { Meta, StoryObj } from '@storybook/react'
import IkkeTilgang from './IkkeTilgang'

const meta = {
  title: 'Komponenter/IkkeTilgang',
  component: IkkeTilgang,
} satisfies Meta<typeof IkkeTilgang>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    error: {
      status: 403,
      statusText: 'Forbidden',
      data: 'Du mangler tilgang til denne ressursen',
    },
  },
}
