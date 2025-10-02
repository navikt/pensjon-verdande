import type { ActionFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { Alert, Button, Heading, HStack, Modal, Textarea, VStack } from '@navikt/ds-react'
import { useEffect, useRef, useState } from 'react'
import { useActionData, useFetcher, useLoaderData } from 'react-router'
import { hentEksluderteSaker } from '~/regulering/regulering.server'

type OpenEkskluderingInputBoxType = 'leggTilEkskluderteBox' | 'fjernEkskluderteBox'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentEksluderteSaker(accessToken)
}

export default function EkskluderteSaker() {
  const { ekskluderteSaker } = useLoaderData<typeof loader>()

  const response = useActionData() as OppdaterEksluderteSakerResponse | undefined

  const [saksnummerCurrentListe, setSaksnummerCurrentListe] = useState('')

  useEffect(() => {
    setSaksnummerCurrentListe(ekskluderteSaker.join('\n'))
  }, [ekskluderteSaker])

  const [openEkskluderingInputBox, setOpenEkskluderingInputBox] = useState<OpenEkskluderingInputBoxType | null>(null)

  const antallSaker = saksnummerCurrentListe
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number).length

  const fetcherAddEkskluderte = useFetcher()
  const fetcherRemoveEkskluderte = useFetcher()

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
          value={saksnummerCurrentListe}
          onChange={(e) => setSaksnummerCurrentListe(e.target.value)}
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
        <EkskluderingLeggTilInputBox
          text="Legg til følgende saker i ekskluderingsliste"
          showModal={openEkskluderingInputBox === 'leggTilEkskluderteBox'}
          onCancel={() => setOpenEkskluderingInputBox(null)}
        />
        <EkskluderingFjernInputBox
          text="Fjern følgende saker fra ekskluderingsliste"
          showModal={openEkskluderingInputBox === 'fjernEkskluderteBox'}
          onCancel={() => setOpenEkskluderingInputBox(null)}
        />
      </VStack>
    </VStack>
  )
}

export function EkskluderingLeggTilInputBox(props: { text: string; showModal: boolean; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const fetcher = useFetcher()
  const [saksnummerToAddListe, setSaksnummerToAddListe] = useState('')
  const [kommentarToAdd, setKommentarToAdd] = useState('')

  if (props.showModal) {
    ref.current?.showModal()
  } else {
    ref.current?.close()
  }

  function leggTilEkskluderteIPen() {
    const ekskluderteSaker = saksnummerToAddListe
      .split('\n')
      .map((t: string) => t.trim())
      .filter((t: string) => t !== '')
      .map(Number)

    const kommentar = kommentarToAdd

    fetcher.submit(
      {
        ekskluderteSaker,
        kommentar,
      },
      {
        action: 'leggTilEkskluderteSaker',
        method: 'POST',
        encType: 'application/json',
      },
    )

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
              value={saksnummerToAddListe}
              onChange={(e) => setSaksnummerToAddListe(e.target.value)}
              minRows={30}
              style={{ width: '30em' }}
              resize
            />
            <Textarea
              label="Kommentar"
              name="kommentar"
              value={kommentarToAdd}
              onChange={(e) => setKommentarToAdd(e.target.value)}
              style={{ width: '30em' }}
              resize
            />
          </VStack>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={() => leggTilEkskluderteIPen()} size="small">
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

export function EkskluderingFjernInputBox(props: { text: string; showModal: boolean; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const fetcher = useFetcher()
  const [saksnummerToRemoveListe, setSaksnummerToRemoveListe] = useState('')

  if (props.showModal) {
    ref.current?.showModal()
  } else {
    ref.current?.close()
  }

  function fjernEkskluderteFraPen() {
    const ekskluderteSaker = saksnummerToRemoveListe
      .split('\n')
      .map((t: string) => t.trim())
      .filter((t: string) => t !== '')
      .map(Number)

    fetcher.submit(
      {
        ekskluderteSaker,
      },
      {
        action: 'fjernEkskluderteSaker',
        method: 'POST',
        encType: 'application/json',
      },
    )

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
              value={saksnummerToRemoveListe}
              onChange={(e) => setSaksnummerToRemoveListe(e.target.value)}
              minRows={30}
              style={{ width: '30em' }}
              resize
            />
          </VStack>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={() => fjernEkskluderteFraPen()} size="small">
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

type OppdaterEksluderteSakerResponse = {
  erOppdatert: boolean
}
