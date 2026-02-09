import { Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { useRef, useState } from 'react'
import { redirect, useFetcher } from 'react-router'
import { ConfirmationModal } from '~/components/confirmation-modal/ConfirmationModal'
import { parseSakIds, SakIdTextArea } from '~/uforetrygd/components/input/SakIdTextArea'
import {
  opprettHvilendeRettOpphorBehandlinger,
  opprettHvilendeRettVarselbrevBehandlinger,
} from '~/uforetrygd/hvilende-rett.server'
import type { Route } from './+types/hvilende-rett'

type Action = {
  type: string
  beskrivelse: string
}

export type HvilendeRettBehandlingResponse = {
  behandlingId: number
}

const hvilendeRettOpphorAction: Action = {
  type: 'HVILENDE_RETT_OPPHOR',
  beskrivelse:
    'Dette vil opprette behandlinger for opphør av saker med 10 år hvilende rett. Er du sikker på at du vil fortsette?',
}
const hvilendeRettVarselAction: Action = {
  type: 'HVILENDE_RETT_VARSEL',
  beskrivelse:
    'Dette vil opprette behandlinger for varselbrev for saker med hvilende rett. Er du sikker på at du vil fortsette?',
}

export async function action({ request }: Route.ActionArgs) {
  const formData = Object.fromEntries(await request.formData())
  let response: HvilendeRettBehandlingResponse | undefined

  if (formData.action === hvilendeRettVarselAction.type) {
    response = await opprettHvilendeRettVarselbrevBehandlinger(
      Number(formData.senesteHvilendeAr),
      parseSakIds(formData.sakIds),
      formData.dryRun === 'true',
      request,
    )
  } else if (formData.action === hvilendeRettOpphorAction.type) {
    response = await opprettHvilendeRettOpphorBehandlinger(
      Number(formData.senesteHvilendeAr),
      parseSakIds(formData.sakIds),
      formData.dryRun === 'true',
      request,
    )
  }
  if (response) {
    return redirect(`/behandling/${response.behandlingId}`)
  } else {
    throw new Error('Kall for opprettelse av behandling mislyktes')
  }
}

export default function HvilendeRettPage() {
  return (
    <VStack gap="20" style={{ maxWidth: '50em', margin: '2em' }}>
      {hvilendeRettVarselForm()}
      {hvilendeRettOpphorForm()}
    </VStack>
  )
}

function hvilendeRettVarselForm() {
  const fetcher = useFetcher()
  const varselFormRef = useRef<HTMLFormElement | null>(null)
  const [visModal, setVisModal] = useState<boolean>(false)

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    setVisModal(true)
  }

  const sendTilVarsel = () => {
    setVisModal(false)
    if (!varselFormRef.current) return

    const newFormData = new FormData(varselFormRef.current)
    newFormData.set('action', hvilendeRettVarselAction.type)

    fetcher.submit(newFormData, { method: 'post' }).catch(console.error)
  }

  return (
    <VStack gap="5">
      <Heading size="medium">Opprett behandlinger for varselbrev for hvilende rett av Uføretrygd</Heading>
      <fetcher.Form method="post" ref={varselFormRef} onSubmit={onFormSubmit} style={{ width: '40em' }}>
        <VStack gap={'4'}>
          <Select label="Dry Run" size={'medium'} name={'dryRun'} defaultValue={'true'} style={{ width: '10em' }}>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <TextField
            style={{ width: '10em' }}
            label="Seneste hvilende år:"
            aria-label="senesteHvilendeAr"
            name="senesteHvilendeAr"
            type="text"
            inputMode="numeric"
          />
          <SakIdTextArea fieldName="sakIds" />
          <Button type="submit" style={{ width: '10em' }} disabled={fetcher.state === 'submitting'}>
            Opprett
          </Button>
        </VStack>
      </fetcher.Form>
      <ConfirmationModal
        onOk={sendTilVarsel}
        onCancel={() => setVisModal(false)}
        showModal={visModal}
        text={hvilendeRettVarselAction.beskrivelse}
      />
    </VStack>
  )
}

function hvilendeRettOpphorForm() {
  const fetcher = useFetcher()
  const opphorFormRef = useRef<HTMLFormElement | null>(null)
  const [visModal, setVisModal] = useState<boolean>(false)

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    setVisModal(true)
  }

  const sendTilOpphor = () => {
    setVisModal(false)
    if (!opphorFormRef.current) return

    const newFormData = new FormData(opphorFormRef.current)
    newFormData.set('action', hvilendeRettOpphorAction.type)

    fetcher.submit(newFormData, { method: 'post' }).catch(console.error)
  }

  return (
    <VStack gap="5">
      <Heading size="medium">Opprett behandlinger for opphør av hvilende rett av Uføretrygd</Heading>
      <fetcher.Form method="post" ref={opphorFormRef} onSubmit={onFormSubmit} style={{ width: '40em' }}>
        <VStack gap={'4'}>
          <Select label="Dry Run" size={'medium'} name={'dryRun'} defaultValue={'true'} style={{ width: '10em' }}>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <TextField
            style={{ width: '10em' }}
            label="Seneste hvilende år:"
            aria-label="senesteHvilendeAr"
            name="senesteHvilendeAr"
            type="text"
            inputMode="numeric"
          />
          <SakIdTextArea fieldName="sakIds" />
          <Button type="submit" style={{ width: '10em' }} disabled={fetcher.state === 'submitting'}>
            Opprett
          </Button>
        </VStack>
      </fetcher.Form>
      <ConfirmationModal
        onOk={sendTilOpphor}
        onCancel={() => setVisModal(false)}
        showModal={visModal}
        text={hvilendeRettOpphorAction.beskrivelse}
      />
    </VStack>
  )
}
