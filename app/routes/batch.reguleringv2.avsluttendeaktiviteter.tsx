import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { Alert, Button, HStack, VStack } from '@navikt/ds-react'
import { getReguleringDetaljer } from '~/routes/batch.reguleringv2'
import React, { useState } from 'react'
import { ConfirmationModal } from '~/routes/batch.reguleringv2.administrerbehandlinger'
import { Simulate } from 'react-dom/test-utils'
import submit = Simulate.submit
import { useSubmit } from '@remix-run/react'
import { env } from '~/services/env.server'
import { useActionData } from 'react-router'
import { serverOnly$ } from 'vite-env-only/macros'


export const loader = async ({ request }: ActionFunctionArgs) => {
  return {}
}

export const action = serverOnly$(async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json() as FormType


  let urlPostfix = ''
  switch (data.action) {
    case 'avbrytBehandlingerFeiletMotPOPP':
      urlPostfix = '/avbryt/oppdaterpopp'
      break
    case 'avbrytBehandlingerFeiletIBeregnYtelse':
      urlPostfix = '/avbryt/beregnytelser'
      break
  }

  const res = await fetch(
    `${env.penUrl}/api/vedtak/regulering${urlPostfix}`,
    {
    method: 'POST',
    body: JSON.stringify({}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })


  if(res.status !== 200) {
    throw new Error(await res.text())
  }

  return {success: true, action: data.action}
})


export default function Avsluttendeaktiviteter() {
  const [openConfirmationModal, setOpenConfirmationModal] = useState<ActionType | null>(null)
  const submit = useSubmit();
  const actionData = useActionData() as ActionData | undefined


  function avbrytBehandlingerFeiletMotPopp() {
    submit({action: "avbrytBehandlingerFeiletMotPOPP"}, {method: "post", encType: "application/json"})
    setOpenConfirmationModal(null)
  }

  function avbrytBehandlerFeiletIBeregnYtelse() {
    submit({action: "avbrytBehandlingerFeiletIBeregnYtelse"}, {method: "post", encType: "application/json"})
    setOpenConfirmationModal(null)
  }

  return (
    <VStack gap="5">
      {actionData?.success && <Alert variant="success" inline>
        Behandlinger avbrutt mot {actionData.action === "avbrytBehandlingerFeiletMotPOPP" ? "POPP" : "Beregn Ytelse"}
      </Alert>}
    <HStack gap="5">
      <Button onClick={() => setOpenConfirmationModal("avbrytBehandlingerFeiletMotPOPP")}>
        Avbryt behandlinger feilet mot POPP
      </Button>
      <Button onClick={() => setOpenConfirmationModal("avbrytBehandlingerFeiletIBeregnYtelse")}>
        Avbryt behandlinger feilet i Beregn Ytelse
      </Button>
      <ConfirmationModal text="Er du sikker på at du vil avbryte behandlinger som har feilet mot POPP? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt." showModal={openConfirmationModal === "avbrytBehandlingerFeiletMotPOPP"} onOk={() => {avbrytBehandlingerFeiletMotPopp()}} onCancel={() => setOpenConfirmationModal(null)} />
      <ConfirmationModal text="Er du sikker på at du vil avbryte behandlinger som har feilet i Beregn Ytelse? Dette vil sette det nye vedtaket til avbrutt og opprette oppgave til saksbehandler om at saken må reguleres manuelt." showModal={openConfirmationModal === "avbrytBehandlingerFeiletIBeregnYtelse"} onOk={() => {avbrytBehandlerFeiletIBeregnYtelse()}} onCancel={() => setOpenConfirmationModal(null)} />
    </HStack>
    </VStack>
  )
}


type FormType = {
  action: ActionType
}

type ActionData = {
  success: boolean,
  action: ActionType
}
type ActionType = "avbrytBehandlingerFeiletMotPOPP" | "avbrytBehandlingerFeiletIBeregnYtelse" | null
