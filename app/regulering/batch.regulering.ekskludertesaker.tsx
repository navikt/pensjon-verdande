import 'chart.js/auto'
import {
  BodyShort,
  Button,
  Dialog,
  Heading,
  HStack,
  InlineMessage,
  Loader,
  Table,
  Tabs,
  Textarea,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import type { Ekskluderinger, EkskluderingMedKommentar } from '~/regulering/regulering.types'

type OpenEkskluderingInputBoxType = 'leggTilEkskluderteBox' | 'fjernEkskluderteBox'

export default function EkskluderteSaker() {
  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.data === undefined && fetcher.state === 'idle') {
      fetcher.load(`hentEkskluderteSaker`)
    }
  }, [fetcher])

  const ekskluderteSakerMedKommentar = (fetcher.data as Ekskluderinger | undefined)?.ekskluderteSaker

  const [openEkskluderingInputBox, setOpenEkskluderingInputBox] = useState<OpenEkskluderingInputBoxType | null>(null)

  const antallSaker = ekskluderteSakerMedKommentar?.length

  const fetcherAddEkskluderte = useFetcher()
  const fetcherRemoveEkskluderte = useFetcher()

  return (
    <VStack gap="space-20">
      <Heading size="small">Saker som skal ekskluderes fra reguleringen</Heading>
      <HStack>
        <VStack gap="space-20">
          <Tabs defaultValue="ekskludertePanel">
            <Tabs.Panel value="ekskludertePanel" style={{ paddingTop: '2em' }}>
              {ekskluderteSakerMedKommentar !== undefined ? (
                <EkskluderingerMedKommentarTable ekskluderingerMedKommentar={ekskluderteSakerMedKommentar} />
              ) : (
                <Loader title="Laster ekskluderte saker…" />
              )}
            </Tabs.Panel>
          </Tabs>
          <VStack>
            <InlineMessage status="info">Antall saker i listen: {antallSaker}</InlineMessage>
          </VStack>

          <HStack gap="space-20">
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
            open={openEkskluderingInputBox === 'leggTilEkskluderteBox'}
            onCancel={() => setOpenEkskluderingInputBox(null)}
          />
          <EkskluderingFjernInputBox
            text="Fjern følgende saker fra ekskluderingsliste"
            open={openEkskluderingInputBox === 'fjernEkskluderteBox'}
            onCancel={() => setOpenEkskluderingInputBox(null)}
          />
        </VStack>
      </HStack>
    </VStack>
  )
}

export function EkskluderingLeggTilInputBox(props: { text: string; open: boolean; onCancel: () => void }) {
  const fetcher = useFetcher()
  const [saksnummerToAddListe, setSaksnummerToAddListe] = useState('')
  const [kommentarToAdd, setKommentarToAdd] = useState('')
  const response = fetcher.data as OppdaterEksluderteSakerResponse | undefined
  const [harLagtTilSaker, setHarLagtTilSaker] = useState(false)

  function leggTilEkskluderteIPen() {
    const sakIder = saksnummerToAddListe
      .split('\n')
      .map((t: string) => t.trim())
      .filter((t: string) => t !== '')
      .map(Number)

    const kommentar = kommentarToAdd

    fetcher.submit(
      {
        sakIder,
        kommentar,
      },
      {
        action: 'leggTilEkskluderteSaker',
        method: 'POST',
        encType: 'application/json',
      },
    )

    // ref.current?.close()
    if (response?.erOppdatert) {
      response.erOppdatert = false
    }
    setSaksnummerToAddListe('')
    setKommentarToAdd('')
  }

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onCancel()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Modifiser ekskluderingsliste</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap={'space-20'}>
            {props.text}
            {(!harLagtTilSaker || response?.erOppdatert) && (
              <InlineMessage status="success">Ekskluderingsliste oppdatert</InlineMessage>
            )}
            {harLagtTilSaker && !response?.erOppdatert && <Loader title="Oppdaterer liste…" />}
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
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            type="button"
            onClick={() => {
              leggTilEkskluderteIPen()
              setHarLagtTilSaker(true)
            }}
            size="small"
          >
            Legg til
          </Button>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary" size="small">
              Lukk
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}

export function EkskluderingFjernInputBox(props: { text: string; open: boolean; onCancel: () => void }) {
  const fetcher = useFetcher()
  const [saksnummerToRemoveListe, setSaksnummerToRemoveListe] = useState('')
  const response = fetcher.data as OppdaterEksluderteSakerResponse | undefined
  const [harFjernetSaker, setHarFjernetSaker] = useState(false)

  function fjernEkskluderteFraPen() {
    const sakIder = saksnummerToRemoveListe
      .split('\n')
      .map((t: string) => t.trim())
      .filter((t: string) => t !== '')
      .map(Number)

    fetcher.submit(
      {
        sakIder,
      },
      {
        action: 'fjernEkskluderteSaker',
        method: 'POST',
        encType: 'application/json',
      },
    )

    setSaksnummerToRemoveListe('')
  }

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onCancel()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Modifiser ekskluderingsliste</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap={'space-20'}>
            {props.text}
            {(!harFjernetSaker || response?.erOppdatert) && (
              <InlineMessage status="success">Ekskluderingsliste oppdatert</InlineMessage>
            )}
            {harFjernetSaker && !response?.erOppdatert && <Loader title="Oppdaterer liste…" />}
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
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            type="button"
            onClick={() => {
              fjernEkskluderteFraPen()
              setHarFjernetSaker(true)
            }}
            size="small"
          >
            Fjern
          </Button>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary" size="small">
              Lukk
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}

type OppdaterEksluderteSakerResponse = {
  erOppdatert: boolean
}

function EkskluderingerMedKommentarTable({
  ekskluderingerMedKommentar,
}: {
  ekskluderingerMedKommentar: EkskluderingMedKommentar[]
}) {
  return (
    <Table zebraStripes>
      <BodyShort as="caption" visuallyHidden>
        Ekskluderte saker
      </BodyShort>
      <Table.Row>
        <Table.HeaderCell>SakId</Table.HeaderCell>
        <Table.HeaderCell align="right">Kommentar</Table.HeaderCell>
      </Table.Row>
      {ekskluderingerMedKommentar.map((f) => (
        <Table.Row key={f.sakId}>
          <Table.DataCell>{f.sakId}</Table.DataCell>
          <Table.DataCell align="right">{f.kommentar}</Table.DataCell>
        </Table.Row>
      ))}
    </Table>
  )
}
