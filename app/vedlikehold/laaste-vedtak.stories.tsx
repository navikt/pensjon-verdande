import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import LaasteVedtakPage from './laaste-vedtak'

const mockData = {
  behandlingId: 'beh-001',
  sistKjoert: '2024-06-01T10:00:00',
  uttrekkStatus: {
    behandlingId: 'beh-001',
    aktivitet: 'Henter vedtak',
    isFerdig: true,
    isFeilet: false,
    feilmelding: '',
    stackTrace: '',
  },
  laasteVedtak: [
    {
      datoRegistrert: '2024-05-20',
      kommentar: 'Venter på avklaring',
      sakId: '12345678',
      kravId: 'krav-1',
      vedtakId: 'vedtak-1',
      sakType: 'ALDER',
      isAutomatisk: true,
      team: '',
      kanIverksettes: false,
      virkFom: '2024-06-01',
      vedtakStatus: 'Til iverksettelse',
      kravGjelder: 'AP',
      opprettetAv: 'REGULERING',
      opprettetDato: '2024-05-15',
      endretDato: '2024-05-20',
      endretAv: 'system',
      vedtaksType: 'Endring',
      kravStatus: 'Opprettet',
      aksjonspunkt: null,
      opplaasVedtakInformasjon: null,
      behandlinger: [],
    },
  ],
}

const meta: Meta = {
  title: 'Sider/Vedlikehold/Låste vedtak',
  component: LaasteVedtakPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(LaasteVedtakPage, mockData),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(LaasteVedtakPage, {
      ...mockData,
      laasteVedtak: [],
    }),
}

export const MedFeilVedtak: Story = {
  render: () =>
    renderWithLoader(LaasteVedtakPage, {
      ...mockData,
      uttrekkStatus: {
        behandlingId: 'beh-001',
        aktivitet: '',
        isFerdig: false,
        isFeilet: true,
        feilmelding: 'Uttrekk feilet: Kunne ikke koble til databasen',
        stackTrace: 'java.sql.SQLException: Connection refused\n  at db.connect(Database.java:42)',
      },
    }),
}

export const UnderBehandling: Story = {
  render: () =>
    renderWithLoader(LaasteVedtakPage, {
      ...mockData,
      uttrekkStatus: {
        behandlingId: 'beh-001',
        aktivitet: 'Henter vedtak fra databasen',
        isFerdig: false,
        isFeilet: false,
        feilmelding: '',
        stackTrace: '',
      },
    }),
}
