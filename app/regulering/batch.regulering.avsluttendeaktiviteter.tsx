import { Button, HStack, InlineMessage, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { useSubmit } from 'react-router'
import { ConfirmationModal } from '~/components/confirmation-modal/ConfirmationModal'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.avsluttendeaktiviteter'

export const loader = async () => {
  return {}
}

export const action = async ({ request }: Route.ActionArgs) => {
  const data = (await request.json()) as FormType

  let urlPostfix: string

  switch (data.action) {
    case 'avbrytBehandlingerFeiletIBeregnYtelse':
      urlPostfix = '/avbryt/beregnytelser'
      break
    case 'avbrytBehandlingerFeiletMotPOPP':
      urlPostfix = '/avbryt/oppdaterpopp'
      break
    case 'avbrytBehandlingerFeiletIOppdaterVedtakstatus':
      urlPostfix = '/avbryt/oppdatervedtakstatus'
      break
    default:
      urlPostfix = ''
      break
  }

  await apiPost(`/api/vedtak/regulering${urlPostfix}`, {}, request)

  return { success: true, action: data.action }
}

export default function Avsluttendeaktiviteter({ actionData }: Route.ComponentProps) {
  const [openConfirmationModal, setOpenConfirmationModal] = useState<ActionType | null>(null)
  const submit = useSubmit()

  function avbrytBehandlerFeiletIBeregnYtelse() {
    submit({ action: 'avbrytBehandlingerFeiletIBeregnYtelse' }, { method: 'post', encType: 'application/json' })
    setOpenConfirmationModal(null)
  }

  function avbrytBehandlingerFeiletMotPopp() {
    submit({ action: 'avbrytBehandlingerFeiletMotPOPP' }, { method: 'post', encType: 'application/json' })
    setOpenConfirmationModal(null)
  }

  function avbrytBehandlingerFeiletIOppdaterVedtakstatus() {
    submit({ action: 'avbrytBehandlingerFeiletIOppdaterVedtakstatus' }, { method: 'post', encType: 'application/json' })
    setOpenConfirmationModal(null)
  }

  return (
    <VStack gap="space-20">
      {actionData?.success && actionData.action === 'avbrytBehandlingerFeiletIBeregnYtelse' && (
        <InlineMessage status="success">Behandlinger avbrutt i Beregn Ytelser</InlineMessage>
      )}
      {actionData?.success && actionData.action === 'avbrytBehandlingerFeiletMotPOPP' && (
        <InlineMessage status="success">Behandlinger avbrutt i Oppdater Popp</InlineMessage>
      )}
      {actionData?.success && actionData.action === 'avbrytBehandlingerFeiletIOppdaterVedtakstatus' && (
        <InlineMessage status="success">Behandlinger avbrutt i Oppdater Vedtakstatus</InlineMessage>
      )}
      <HStack gap="space-20">
        <Button onClick={() => setOpenConfirmationModal('avbrytBehandlingerFeiletIBeregnYtelse')}>
          Avbryt behandlinger feilet i Beregn Ytelser
        </Button>
        <Button onClick={() => setOpenConfirmationModal('avbrytBehandlingerFeiletMotPOPP')}>
          Avbryt behandlinger feilet mot POPP
        </Button>
        <Button onClick={() => setOpenConfirmationModal('avbrytBehandlingerFeiletIOppdaterVedtakstatus')}>
          Avbryt behandlinger feilet i Oppdater Vedtakstatus
        </Button>
        <ConfirmationModal
          text="Er du sikker på at du vil avbryte behandlinger som har feilet i Beregn Ytelser? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt."
          open={openConfirmationModal === 'avbrytBehandlingerFeiletIBeregnYtelse'}
          onOk={() => {
            avbrytBehandlerFeiletIBeregnYtelse()
          }}
          onCancel={() => setOpenConfirmationModal(null)}
        />
        <ConfirmationModal
          text="Er du sikker på at du vil avbryte behandlinger som har feilet mot POPP? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt."
          open={openConfirmationModal === 'avbrytBehandlingerFeiletMotPOPP'}
          onOk={() => {
            avbrytBehandlingerFeiletMotPopp()
          }}
          onCancel={() => setOpenConfirmationModal(null)}
        />
        <ConfirmationModal
          text="Er du sikker på at du vil avbryte behandlinger som har feilet i Oppdater Vedtakstatus? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt."
          open={openConfirmationModal === 'avbrytBehandlingerFeiletIOppdaterVedtakstatus'}
          onOk={() => {
            avbrytBehandlingerFeiletIOppdaterVedtakstatus()
          }}
          onCancel={() => setOpenConfirmationModal(null)}
        />
      </HStack>
    </VStack>
  )
}

type FormType = {
  action: ActionType
}

type ActionType =
  | 'avbrytBehandlingerFeiletIBeregnYtelse'
  | 'avbrytBehandlingerFeiletMotPOPP'
  | 'avbrytBehandlingerFeiletIOppdaterVedtakstatus'
  | null
