import { Alert, Button, HStack, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { useSubmit } from 'react-router'
import { ConfirmationModal } from '~/components/confirmation-modal/ConfirmationModal'
import { avbrytBehandlinger } from '~/regulering/regulering.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/batch.regulering.avsluttendeaktiviteter'

export const loader = async () => {
  return {}
}

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = (await request.json()) as FormType

  const res = await avbrytBehandlinger(data.action, accessToken)

  if (res.status !== 200) {
    throw new Error(await res.text())
  }

  return { success: true, action: data.action }
}

export default function Avsluttendeaktiviteter({ actionData }: Route.ComponentProps) {
  const [openConfirmationModal, setOpenConfirmationModal] = useState<ActionType | null>(null)
  const submit = useSubmit()

  function avbrytBehandlingerFeiletMotPopp() {
    submit({ action: 'avbrytBehandlingerFeiletMotPOPP' }, { method: 'post', encType: 'application/json' })
    setOpenConfirmationModal(null)
  }

  function avbrytBehandlerFeiletIBeregnYtelse() {
    submit({ action: 'avbrytBehandlingerFeiletIBeregnYtelse' }, { method: 'post', encType: 'application/json' })
    setOpenConfirmationModal(null)
  }

  return (
    <VStack gap="5">
      {actionData?.success && (
        <Alert variant="success" inline>
          Behandlinger avbrutt mot {actionData.action === 'avbrytBehandlingerFeiletMotPOPP' ? 'POPP' : 'Beregn Ytelse'}
        </Alert>
      )}
      <HStack gap="5">
        <Button onClick={() => setOpenConfirmationModal('avbrytBehandlingerFeiletMotPOPP')}>
          Avbryt behandlinger feilet mot POPP
        </Button>
        <Button onClick={() => setOpenConfirmationModal('avbrytBehandlingerFeiletIBeregnYtelse')}>
          Avbryt behandlinger feilet i Beregn Ytelse
        </Button>
        <ConfirmationModal
          text="Er du sikker på at du vil avbryte behandlinger som har feilet mot POPP? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt."
          showModal={openConfirmationModal === 'avbrytBehandlingerFeiletMotPOPP'}
          onOk={() => {
            avbrytBehandlingerFeiletMotPopp()
          }}
          onCancel={() => setOpenConfirmationModal(null)}
        />
        <ConfirmationModal
          text="Er du sikker på at du vil avbryte behandlinger som har feilet i Beregn Ytelse? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt."
          showModal={openConfirmationModal === 'avbrytBehandlingerFeiletIBeregnYtelse'}
          onOk={() => {
            avbrytBehandlerFeiletIBeregnYtelse()
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

type ActionType = 'avbrytBehandlingerFeiletMotPOPP' | 'avbrytBehandlingerFeiletIBeregnYtelse' | null
