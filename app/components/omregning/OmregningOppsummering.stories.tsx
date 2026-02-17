import type { Meta, StoryObj } from '@storybook/react'
import { OmregningOppsummering } from './OmregningOppsummering'

const meta = {
  title: 'Komponenter/OmregningOppsummering',
  component: OmregningOppsummering,
} satisfies Meta<typeof OmregningOppsummering>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandlingsnokkel: 'REG-2024-001',
    omregningstidspunkt: '2024-06-15T09:00:00',
    kravGjelder: 'Alderspensjon',
    kravArsak: 'Regulering',
    toleransegrenseSett: 'Standard',
    oppgaveSett: 'Regulering 2024',
    oppgavePrefiks: 'REG',
    behandleApneKrav: false,
    brukFaktoromregning: true,
    opprettAlleOppgaver: false,
    sjekkYtelseFraAvtaleland: false,
    omregneAFP: false,
    prioritet: '5',
    skalSamordne: true,
    skalSletteIverksettingsoppgaver: false,
    skalDistribuereUforevedtak: false,
    regelendringUt2026: false,
    skalBestilleBrev: 'ALLE',
    selectedBrevkodeSokerAlderGammeltRegelverk: { value: 'PE_BA_01_001', label: 'Vedtak alderspensjon' },
    selectedBrevkodeSokerAlderNyttRegelverk: undefined,
    selectedBrevkodeSokerUforetrygd: undefined,
    selectedBrevkodeSokerBarnepensjon: undefined,
    selectedBrevkodeSokerAFP: undefined,
    selectedBrevkodeSokerGjenlevendepensjon: undefined,
    selectedBrevkodeSokerAFPPrivat: undefined,
    skalSendeBrevBerorteSaker: false,
    selectedBrevkoderBerorteSakerAlderGammeltRegelverk: undefined,
    selectedBrevkoderBerorteSakerAlderNyttRegelverk: undefined,
    selectedBrevkoderBerorteSakerUforetrygd: undefined,
    selectedBrevkoderBerorteSakerBarnepensjon: undefined,
    selectedBrevkoderBerorteSakerAFP: undefined,
    selectedBrevkoderBerorteSakerGjenlevendepensjon: undefined,
    selectedBrevkodeBerorteSakerAFPPrivat: undefined,
  },
}

export const IngenBrev: Story = {
  args: {
    ...Default.args,
    skalBestilleBrev: 'INGEN',
    selectedBrevkodeSokerAlderGammeltRegelverk: undefined,
  },
}
