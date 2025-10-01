import type { ActionFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import { Alert, Button, Heading, HStack, Modal, Textarea, VStack } from '@navikt/ds-react'
import { useEffect, useRef, useState } from 'react'
import { useActionData, useFetcher, useLoaderData } from 'react-router'
import { hentEksluderteSaker, leggTilEkskluderteSaker } from '~/regulering/regulering.server'

type OpenEkskluderingInputBoxType = 'leggTilEkskluderteBox' | 'fjernEkskluderteBox'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName === 'saksnummerListe') {
      return fileUpload.text()
    }
  }

  const formData = await parseFormData(request, uploadHandler)

  const saksnummerListe = formData.get('saksnummerListe') as string
  const ekskluderteSaker = saksnummerListe
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)

  return await leggTilEkskluderteSaker(accessToken, ekskluderteSaker)
}

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentEksluderteSaker(accessToken)
}

export function EkskluderingInputBox(props: {
  text: string
  showModal: boolean
  onOk: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  if (props.showModal) {
    ref.current?.showModal()
  } else {
    ref.current?.close()
  }

  return (
    <div>
      <Modal
        ref={ref}
        header={{ heading: 'Modifiser ekskluderingsliste', closeButton: false }}
        onClose={props.onCancel}
      >
        <Modal.Body>
          <VStack gap={'5'}>
            {props.text}
            <Textarea
              label="Saksnummer"
              name="saksnummerListe"
              // value={saksnummerToAddListe}
              // onChange={(e) => setSaksnummerToAddListe(e.target.value)}
              minRows={30}
              style={{ width: '30em' }}
              resize
            />
            <Textarea
              label="Kommentar"
              name="kommentar"
              // value={saksnummerToAddListe}
              // onChange={(e) => setSaksnummerToAddListe(e.target.value)}
              style={{ width: '30em' }}
              resize
            />
          </VStack>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={props.onOk} size="small">
            Fortsett
          </Button>
          <Button type="button" variant="secondary" onClick={props.onCancel} size="small">
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default function EkskluderteSaker() {
  const { ekskluderteSaker } = useLoaderData<typeof loader>()

  const response = useActionData() as OppdaterEksluderteSakerResponse | undefined

  const [saksnummerToAddListe, setSaksnummerToAddListe] = useState('')
  const [saksnummerToRemoveListe] = useState('')

  useEffect(() => {
    setSaksnummerToAddListe(ekskluderteSaker.join('\n'))
  }, [ekskluderteSaker])

  const [openEkskluderingInputBox, setOpenEkskluderingInputBox] = useState<OpenEkskluderingInputBoxType | null>(null)

  const antallSaker = saksnummerToAddListe
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number).length

  const fetcherAddEkskluderte = useFetcher()
  const fetcherRemoveEkskluderte = useFetcher()

  function addEkskluderte() {
    setOpenEkskluderingInputBox(null)
    //antall saker to blob
    const blob = new Blob([saksnummerToAddListe], { type: 'text/plain' })
    //til fil
    const file = new File([blob], 'saksnummerListe.txt', { type: 'text/plain' })
    //append til formdata
    const formData = new FormData()
    formData.append('saksnummerListe', file)

    //submit
    fetcherAddEkskluderte.submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data',
    })
  }

  function removeEkskluderte() {
    setOpenEkskluderingInputBox(null)
    //antall saker to blob
    const blob = new Blob([saksnummerToRemoveListe], { type: 'text/plain' })
    //til fil
    const file = new File([blob], 'saksnummerListe.txt', { type: 'text/plain' })
    //append til formdata
    const formData = new FormData()
    formData.append('saksnummerListe', file)

    //submit
    fetcherRemoveEkskluderte.submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data',
    })
  }

  return (
    <VStack gap="5">
      <Heading size="medium">Oppgi saksnummer for ekskludering</Heading>
      {response?.erOppdatert && (
        <Alert variant="success" inline>
          Liste oppdatert{' '}
        </Alert>
      )}
      <VStack gap="5">
        <Textarea
          label="Saksnummer"
          name="saksnummerListe"
          description="Liste av saker som skal ekskluderes fra reguleringen. Oppgis med linjeskift."
          value={saksnummerToAddListe}
          onChange={(e) => setSaksnummerToAddListe(e.target.value)}
          minRows={30}
          style={{ width: '30em' }}
          resize
        />
        <VStack>
          <Alert variant="info" inline>
            Antall saker i listen: {antallSaker}
          </Alert>
        </VStack>

        <HStack gap="5">
          <div>
            <Button
              type="submit"
              loading={fetcherAddEkskluderte.state === 'submitting'}
              onClick={() => setOpenEkskluderingInputBox('leggTilEkskluderteBox')}
            >
              Legg til ekskluderte saker
            </Button>
          </div>
          <div>
            <Button
              type="submit"
              loading={fetcherRemoveEkskluderte.state === 'submitting'}
              onClick={() => setOpenEkskluderingInputBox('fjernEkskluderteBox')}
            >
              Fjern ekskluderte saker
            </Button>
          </div>
        </HStack>
        <EkskluderingInputBox
          text="Legg til følgende saker i ekskluderingsliste"
          showModal={openEkskluderingInputBox === 'leggTilEkskluderteBox'}
          onOk={() => {
            addEkskluderte()
          }}
          onCancel={() => setOpenEkskluderingInputBox(null)}
        />
        <EkskluderingInputBox
          text="Fjern følgende saker fra ekskluderingsliste"
          showModal={openEkskluderingInputBox === 'fjernEkskluderteBox'}
          onOk={() => {
            removeEkskluderte()
          }}
          onCancel={() => setOpenEkskluderingInputBox(null)}
        />
      </VStack>
    </VStack>
  )
}

type OppdaterEksluderteSakerResponse = {
  erOppdatert: boolean
}
