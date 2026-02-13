import {
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  HStack,
  Modal,
  Table,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useFetcher, useSearchParams } from 'react-router'
import { apiGet, apiPut } from '~/services/api.server'
import type { Route } from './+types/vedlikehold-barn'

export type PersonDetaljForVedlikehold = {
  personDetaljId: string
  persongrunnlagId: string
  fnr: string
  annenForelder: string
  rolleFom: string
  rolleTom?: string
  vurdertTilBarnetillegg: boolean
  kilde: string
  bruk: boolean
}

// GET
export function meta(): Route.MetaDescriptors {
  return [{ title: 'Vedlikehold barn | Verdande' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const sakId = url.searchParams.get('sakId')

  if (!sakId) {
    return null
  }

  return await apiGet<PersonDetaljForVedlikehold[]>(`/api/behandling/barngrunnlag/${sakId}`, request)
}

// PUT
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const personDetalj = JSON.parse(formData.get('personDetalj') as string) as PersonDetaljForVedlikehold[]

  await apiPut('/api/behandling/barngrunnlag', personDetalj, request)
}

export default function VedlikeholdBarnPage() {
  const [personer, setPersoner] = useState<PersonDetaljForVedlikehold[] | undefined | null>(undefined)
  const putFetcher = useFetcher()
  const [åpen, setÅpen] = useState(false)

  const endreBruk = (person: PersonDetaljForVedlikehold, bruk: boolean) => {
    const oppdatertPerson = { ...person, bruk }

    if (personer) {
      if (personer.find((p) => p.personDetaljId === oppdatertPerson.personDetaljId)) {
        setPersoner((allePersoner) =>
          allePersoner?.map((p) => (p.personDetaljId === oppdatertPerson.personDetaljId ? oppdatertPerson : p)),
        )
      } else {
        setPersoner((personer) => personer && [...personer, oppdatertPerson])
      }
    }
  }

  const lagreOgSendInn = () => {
    setÅpen(false)

    putFetcher.submit({ personDetalj: JSON.stringify(personer) }, { method: 'PUT' })
  }

  return (
    <VStack gap="space-20" style={{ maxWidth: '75em', margin: '2em' }}>
      <Heading size="large">Oppdater bruk på persongrunnlag for barn</Heading>
      <HentPersonDetaljer onLoad={setPersoner} />
      {personer && (
        <>
          <BodyLong>Tabellen viser alle barn på åpne krav. Her kan du velge om barnet skal være i bruk.</BodyLong>
          <Table>
            <BodyShort as="caption" visuallyHidden>
              Barn på åpne krav
            </BodyShort>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Persondetalj ID</Table.HeaderCell>
                <Table.HeaderCell>Persongrunnlag ID</Table.HeaderCell>
                <Table.HeaderCell>Barn FNR</Table.HeaderCell>
                <Table.HeaderCell>Rolle FOM</Table.HeaderCell>
                <Table.HeaderCell>Rolle TOM</Table.HeaderCell>
                <Table.HeaderCell>Annen forelder FNR</Table.HeaderCell>
                <Table.HeaderCell>Barnetillegg</Table.HeaderCell>
                <Table.HeaderCell>Kilde</Table.HeaderCell>
                <Table.HeaderCell>I bruk</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {personer.map((person) => (
                <Table.Row key={person.personDetaljId}>
                  <Table.DataCell>{person.personDetaljId}</Table.DataCell>
                  <Table.DataCell>{person.persongrunnlagId}</Table.DataCell>
                  <Table.DataCell>{person.fnr}</Table.DataCell>
                  <Table.DataCell>{person.rolleFom}</Table.DataCell>
                  <Table.DataCell>{person.rolleTom}</Table.DataCell>
                  <Table.DataCell>{person.annenForelder}</Table.DataCell>
                  <Table.DataCell>{person.vurdertTilBarnetillegg ? 'Ja' : 'Nei'}</Table.DataCell>
                  <Table.DataCell>{person.kilde}</Table.DataCell>
                  <Table.DataCell>
                    <Checkbox checked={person.bruk} onChange={(e) => endreBruk(person, e.target.checked)}>
                      {''}
                    </Checkbox>
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <LagreOgSendInnModal lagre={lagreOgSendInn} avbryt={() => setÅpen(false)} åpen={åpen} />
          <Button
            onClick={() => setÅpen(true)}
            style={{ alignSelf: 'start' }}
            loading={putFetcher.state === 'submitting'}
          >
            Lagre
          </Button>
        </>
      )}
    </VStack>
  )
}

function HentPersonDetaljer({
  onLoad,
}: {
  onLoad: (personDetaljer: PersonDetaljForVedlikehold[] | null | undefined) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sakIdParam = searchParams.get('sakId')
  const [sakId, setSakId] = useState<string>(sakIdParam ?? '')
  const fetcher = useFetcher()
  const { data: fetcherData, state: fetcherState, load: fetcherLoad } = fetcher

  useEffect(() => {
    if (sakIdParam !== null && fetcherData === undefined && fetcherState === 'idle') {
      setSearchParams({ sakId: sakId })
      fetcherLoad(`?sakId=${sakId}`)
    }
  }, [fetcherData, fetcherState, sakIdParam, sakId, setSearchParams, fetcherLoad])

  useEffect(() => {
    onLoad(fetcherData as PersonDetaljForVedlikehold[] | null | undefined)
  }, [fetcherData, onLoad])

  function hentPersonGrunnlag() {
    setSearchParams({ sakId: sakId })
    fetcherLoad(`?sakId=${sakId}`)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <HStack gap="space-8" align="start">
        <TextField
          error={fetcherData === null ? 'Fant ingen barn' : undefined}
          label="Sak ID"
          value={sakId}
          onChange={(e) => setSakId(e.target.value)}
        />
        <Button onClick={hentPersonGrunnlag} style={{ marginTop: '32px' }} loading={fetcherState === 'loading'}>
          Hent barn
        </Button>
      </HStack>
    </form>
  )
}

interface LagreOgSendInnModalProps {
  lagre: () => void
  avbryt: () => void
  åpen: boolean
}

function LagreOgSendInnModal({ lagre, avbryt, åpen }: LagreOgSendInnModalProps) {
  return (
    <Modal open={åpen} onClose={avbryt} header={{ heading: 'Er du sikker?', closeButton: false }}>
      <Modal.Body>
        <BodyLong>Endringer kan påvirke brukers ytelse eller gi inkonsistent datagrunnlag.</BodyLong>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={lagre}>
          Lagre
        </Button>
        <Button type="button" variant="secondary" onClick={avbryt}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
