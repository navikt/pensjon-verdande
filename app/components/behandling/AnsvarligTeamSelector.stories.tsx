import type { Meta, StoryObj } from '@storybook/react'
import { Team } from '~/common/decodeTeam'
import AnsvarligTeamSelector from './AnsvarligTeamSelector'

const meta = {
  title: 'Komponenter/AnsvarligTeamSelector',
  component: AnsvarligTeamSelector,
} satisfies Meta<typeof AnsvarligTeamSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ansvarligTeam: null,
    onAnsvarligTeamChange: () => {},
  },
}

export const MedValgtTeam: Story = {
  args: {
    ansvarligTeam: Team.PESYS_ALDER,
    onAnsvarligTeamChange: () => {},
  },
}
