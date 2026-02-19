import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import LaasOppSakSakIdPage from './laas-opp-sak.$sakId'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Lås opp sak',
  component: LaasOppSakSakIdPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(LaasOppSakSakIdPage, {
      sak: {
        sakId: '12345678',
        sakStatus: 'TIL_BEHANDLING',
        sakType: 'ALDER',
        vedtak: [
          {
            vedtakId: 'vedtak-1',
            kravId: 'krav-1',
            kravGjelder: 'AP',
            vedtaksType: 'Endring',
            vedtakStatus: 'Til iverksettelse',
            behandlinger: [
              {
                behandlingId: 'beh-1',
                type: 'FamiliebehandlingRegulering',
                isFeilet: false,
                isFerdig: true,
                isUnderBehandling: false,
                isStoppet: false,
              },
            ],
            isLaast: true,
            opplaasVedtakInformasjon: { harBehandling: true, erAutomatisk: true, sammenstotendeVedtak: null },
          },
        ],
        automatiskeKravUtenVedtak: [],
      },
    }),
}

export const IngentingAaLaaseOpp: Story = {
  render: () =>
    renderWithLoader(LaasOppSakSakIdPage, {
      sak: {
        sakId: '12345678',
        sakStatus: 'LOPENDE',
        sakType: 'ALDER',
        vedtak: [],
        automatiskeKravUtenVedtak: [],
      },
    }),
}

export const MedFeiletBehandling: Story = {
  render: () =>
    renderWithLoader(LaasOppSakSakIdPage, {
      sak: {
        sakId: '87654321',
        sakStatus: 'TIL_BEHANDLING',
        sakType: 'UFOREP',
        vedtak: [
          {
            vedtakId: 'vedtak-2',
            kravId: 'krav-2',
            kravGjelder: 'UT',
            vedtaksType: 'Endring',
            vedtakStatus: 'Til iverksettelse',
            behandlinger: [
              {
                behandlingId: 'beh-2',
                type: 'FamiliebehandlingRegulering',
                isFeilet: true,
                isFerdig: false,
                isUnderBehandling: false,
                isStoppet: true,
              },
            ],
            isLaast: true,
            opplaasVedtakInformasjon: { harBehandling: true, erAutomatisk: true, sammenstotendeVedtak: null },
          },
        ],
        automatiskeKravUtenVedtak: [],
      },
    }),
}

export const MedIverksettVedtakBehandling: Story = {
  render: () =>
    renderWithLoader(LaasOppSakSakIdPage, {
      sak: {
        sakId: '11223344',
        sakStatus: 'TIL_BEHANDLING',
        sakType: 'ALDER',
        vedtak: [
          {
            vedtakId: 'vedtak-3',
            kravId: 'krav-3',
            kravGjelder: 'AP',
            vedtaksType: 'Ny rettighet',
            vedtakStatus: 'Til attestering',
            behandlinger: [
              {
                behandlingId: 'beh-3',
                type: 'IverksettVedtakBehandling',
                isFeilet: false,
                isFerdig: false,
                isUnderBehandling: true,
                isStoppet: false,
              },
            ],
            isLaast: true,
            opplaasVedtakInformasjon: { harBehandling: true, erAutomatisk: false, sammenstotendeVedtak: null },
          },
        ],
        automatiskeKravUtenVedtak: [],
      },
    }),
}
