import type { Meta, StoryObj } from '@storybook/react'
import IkkeFullforteAktiviteter from './IkkeFullforteAktiviteter'

const meta = {
  title: 'Komponenter/IkkeFullforteAktiviteter',
  component: IkkeFullforteAktiviteter,
} satisfies Meta<typeof IkkeFullforteAktiviteter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ikkeFullforteAktiviteter: {
      aktivitetOppsummering: [
        { behandling: 'ForstegangsbehandlingAlder', aktivitet: 'HentGrunnlag', status: 'FEILENDE', antall: 3 },
        { behandling: 'Omregning', aktivitet: 'BeregnYtelse', status: 'UNDER_BEHANDLING', antall: 12 },
        { behandling: 'Regulering', aktivitet: 'Iverksett', status: 'OPPRETTET', antall: 5 },
      ],
    },
  },
}

export const Tom: Story = {
  args: {
    ikkeFullforteAktiviteter: {
      aktivitetOppsummering: [],
    },
  },
}
