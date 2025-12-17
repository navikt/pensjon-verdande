import { type ActionFunctionArgs, type LoaderFunctionArgs, useFetcher, useSearchParams } from 'react-router'
import {
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  HStack,
  Loader,
  Table,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { hentPersonDetaljer, oppdaterPersonDetalj, type PersonDetalj } from '~/uforetrygd/vedlikehold-barn.server'
import { requireAccessToken } from '~/services/auth.server'

// GET
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const sakId = url.searchParams.get('sakId')
  const accessToken = await requireAccessToken(request)

  if (!sakId) {
    return null
  }

  return await hentPersonDetaljer(accessToken, sakId)
}

// PUT
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const personDetalj = JSON.parse(formData.get('personDetalj') as string) as PersonDetalj
  const accessToken = await requireAccessToken(request)

  await oppdaterPersonDetalj(accessToken, personDetalj)
}


export default function VedlikeholdBarnPage() {
  const [personer, setPersoner] = useState<PersonDetalj[] | undefined | null>(undefined)
  const putFetcher = useFetcher()

  const endreBruk = (person: PersonDetalj, bruk: boolean) => {
    const oppdatertPerson = { ...person, bruk }

    putFetcher.submit(
      { personDetalj: JSON.stringify(oppdatertPerson) },
      { method: 'PUT' },
    )
  }

  return (
    <VStack gap="5" style={{ maxWidth: '50em', margin: '2em' }}>
      <Heading size="large">Oppdater bruk på persongrunnlag for barn</Heading>

      <HentPersonGrunnlag onLoad={setPersoner} />
      {personer && (
        <>
          <BodyLong>Tabellen viser alle barn på åpne krav. Her kan du velge om barnet skal være i bruk.</BodyLong>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Barn FNR</Table.HeaderCell>
                <Table.HeaderCell>Rolle FOM</Table.HeaderCell>
                <Table.HeaderCell>Rolle TOM</Table.HeaderCell>
                <Table.HeaderCell>Annen forelder FNR</Table.HeaderCell>
                <Table.HeaderCell>Kilde</Table.HeaderCell>
                <Table.HeaderCell>I bruk</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {personer.map((person) => (
                  <Table.Row key={person.personDetaljId}>
                    <Table.DataCell>{person.fnr}</Table.DataCell>
                    <Table.DataCell>{person.rolleFom}</Table.DataCell>
                    <Table.DataCell>{person.rolleTom}</Table.DataCell>
                    <Table.DataCell>{person.annenForelder}</Table.DataCell>
                    <Table.DataCell>{person.kilde}</Table.DataCell>
                    <Table.DataCell>
                      <Checkbox
                        checked={person.bruk}
                        onChange={(e) => endreBruk(person, e.target.checked)}>{''}
                      </Checkbox>
                    </Table.DataCell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </>
      )}
    </VStack>
  )
}


function HentPersonGrunnlag({ onLoad }: { onLoad: (personDetaljer: PersonDetalj[] | null | undefined) => void }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sakIdParam = searchParams.get('sakId')
  const [sakId, setSakId] = useState<string>(sakIdParam ?? '')
  const fetcher = useFetcher()

  useEffect(() => {
    if (sakIdParam !== null && fetcher.data === undefined && fetcher.state === 'idle') {
      setSearchParams({ sakId: sakId })
      fetcher.load(`?sakId=${sakId}`)
    }
  }, [fetcher.data, fetcher.state, sakIdParam, sakId, setSearchParams])

  useEffect(() => {
    onLoad(fetcher.data as PersonDetalj[] | null | undefined)
  }, [fetcher.data, onLoad])

  function hentPersonGrunnlag() {
    setSearchParams({ sakId: sakId })
    fetcher.load(`?sakId=${sakId}`)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <HStack gap="2" align="start">
        <TextField
          error={fetcher.data === null ? 'Fant ingen barn' : undefined}
          label="Sak ID"
          value={sakId}
          onChange={(e) => setSakId(e.target.value)}
        />
        <Button onClick={hentPersonGrunnlag} style={{ marginTop: '32px' }}>
          Hent barn
        </Button>
        {fetcher.state === 'loading' &&
          <HStack gap="2" align="center" style={{ marginTop: '40px', marginLeft: '24px' }}><Loader
            size="large" /><BodyShort>Oppdaterer...</BodyShort></HStack>}
      </HStack>
    </form>
  )
}