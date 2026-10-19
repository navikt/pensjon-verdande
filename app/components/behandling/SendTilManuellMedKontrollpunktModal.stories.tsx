import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { mockBehandlingDto } from '../../../.storybook/mocks/data'
import SendTilManuellMedKontrollpunktModal from './SendTilManuellMedKontrollpunktModal'

const meta = {
  title: 'Komponenter/SendTilManuellMedKontrollpunktModal',
  component: SendTilManuellMedKontrollpunktModal,
  parameters: {
    docs: {
      description: {
        component:
          'Forslag: Velg kontrollpunkt eller egendefinert oppgavetekst. Fritekst sendes som { oppgavetekst } til samme endepunkt og krever kommende backend-støtte.',
      },
    },
  },
} satisfies Meta<typeof SendTilManuellMedKontrollpunktModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandling: mockBehandlingDto({
      muligeKontrollpunkt: [
        { kontrollpunkt: 'KONTROLL_PUNKT_1', decode: 'Kontrollpunkt for manuell vurdering' },
        { kontrollpunkt: 'KONTROLL_PUNKT_2', decode: 'Kontrollpunkt for saksbehandler' },
      ],
    }),
    sendTilManuellMedKontrollpunkt: fn(),
    isSubmitting: false,
  },
}

export const Kontrollpunkt: Story = {
  args: { ...Default.args },
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Fortsett videre behandling manuelt/ }))
    const dialog = within(await page.findByRole('dialog'))
    await userEvent.click(dialog.getByRole('button', { name: 'Manuell behandling' }))
    await expect(dialog.getByText('Velg et kontrollpunkt.')).toBeVisible()
    await userEvent.click(dialog.getByRole('combobox', { name: 'Velg kontrollpunkt' }))
    await userEvent.click(await page.findByRole('option', { name: /Kontrollpunkt for manuell vurdering/ }))
    await userEvent.click(dialog.getByRole('button', { name: 'Manuell behandling' }))
    await expect(args.sendTilManuellMedKontrollpunkt).toHaveBeenLastCalledWith({ kontrollpunkt: 'KONTROLL_PUNKT_1' })
  },
}

export const EgendefinertOppgavetekst: Story = {
  args: {
    ...Default.args,
    behandling: mockBehandlingDto({ muligeKontrollpunkt: [] }),
  },
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Fortsett videre behandling manuelt/ }))
    const dialog = within(await page.findByRole('dialog'))
    await userEvent.click(dialog.getByRole('radio', { name: 'Egendefinert oppgavetekst' }))
    const tekst = 'Manuell behandling: Overlappende trygdetidsperioder, kravet lar seg ikke behandle automatisk.'
    await userEvent.type(dialog.getByRole('textbox', { name: 'Oppgavetekst' }), '   ')
    await userEvent.click(dialog.getByRole('button', { name: 'Manuell behandling' }))
    await expect(dialog.getByText('Skriv inn oppgavetekst.')).toBeVisible()
    await expect(args.sendTilManuellMedKontrollpunkt).not.toHaveBeenCalled()
    await userEvent.clear(dialog.getByRole('textbox', { name: 'Oppgavetekst' }))
    await userEvent.type(dialog.getByRole('textbox', { name: 'Oppgavetekst' }), ` ${tekst} `)
    await userEvent.click(dialog.getByRole('radio', { name: /^Kontrollpunkt$/ }))
    await expect(dialog.queryByRole('textbox', { name: 'Oppgavetekst' })).not.toBeInTheDocument()
    await userEvent.click(dialog.getByRole('button', { name: 'Manuell behandling' }))
    await expect(dialog.getByText('Velg et kontrollpunkt.')).toBeVisible()
    await expect(args.sendTilManuellMedKontrollpunkt).not.toHaveBeenCalled()
    await userEvent.click(dialog.getByRole('radio', { name: 'Egendefinert oppgavetekst' }))
    await userEvent.click(dialog.getByRole('button', { name: 'Manuell behandling' }))
    await expect(args.sendTilManuellMedKontrollpunkt).toHaveBeenLastCalledWith({ oppgavetekst: tekst })
  },
}

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
}
