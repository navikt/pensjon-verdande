import { useFetcher, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  HGrid,
  Link,
  List,
  Loader,
  Modal,
  MonthPicker,
  Pagination,
  Select,
  Table,
  Tabs,
  Textarea,
  TextField,
  useMonthpicker,
  VStack,
} from '@navikt/ds-react'
import { PlayIcon } from '@navikt/aksel-icons'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { hentOmregningInit, hentOmregningInput } from '~/services/batch.omregning.bpen093'
import type { OmregningSakerPage } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const accesstoken = await requireAccessToken(request)

  const omregningInit = await hentOmregningInit(
    accesstoken,
  )

  let { searchParams } = new URL(request.url)
  console.log('searchparam: ', searchParams)
  console.log('request: ', request.url)
  let page = searchParams.get('page') ?? '0'
  let size = searchParams.get('size') ?? '10'

  const omregningSakerPage = await hentOmregningInput(
    accesstoken,
    Number(page),
    Number(size),
  ) as OmregningSakerPage

  if (!omregningInit) {
    throw new Response('Not Found', { status: 404 })
  }

  return { omregningInit, omregningSakerPage }
}

export default function BatchOpprett_index() {
  const { omregningInit, omregningSakerPage } = useLoaderData<typeof loader>()
  const now = new Date()
  const [isClicked, setIsClicked] = useState(false)
  const [omregningstidspunkt, setOmregningstidspunkt] = useState('')
  const [behandlingsnokkel, setBehandlingsnokkel] = useState('')
  const ref = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()

  const [omregneAFP, setOmregneAFP] = useState(true)
  const [skalSletteIverksettingsoppgaver, setSkalSletteIverksettingsoppgaver] = useState(true)
  const [skalDistribuereUforevedtak, setSkalDistribuereUforevedtak] = useState(true)
  const [skalBestilleBrev, setSkalBestilleBrev] = useState(false)
  const [skalSamordne, setSkalSamordne] = useState(false)
  const [skalSendeBrevBerorteSaker, setSkalSendeBrevBerorteSaker] = useState(true)
  const [behandleApneKrav, setBehandleApneKrav] = useState(false)
  const [brukFaktoromregning, setBrukFaktoromregning] = useState(false)
  const [opprettAlleOppgaver, setOpprettAlleOppgaver] = useState(false)
  const [sjekkYtelseFraAvtaleland, setSjekkYtelseFraAvtaleland] = useState(false)

  const [hasError, setHasError] = useState(false)
  const fetcher = useFetcher()

  const handleSubmit = (e: any) => {
    if (hasError) {
      return
    } else {
      fetcher.submit(e.target.form)
      setIsClicked(true)
    }
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.width = `${inputRef.current.value.length + 1}ch`
    }
  }

  useEffect(() => {
    handleInput()
  })
  const optionsKravGjelder = [
    { value: 'REVURD', label: 'Revurdering' },
    { value: 'REGULERING', label: 'Regulering' },
  ]
  const optionsKravArsak = [
    { value: 'OMREGNING', label: 'Omregning' },
    { value: 'ANNEN_ARSAK', label: 'Annen årsak' },
  ]

  const optionToleransegrenseSett = []
  optionToleransegrenseSett.push({ value: 'not set', label: 'Ikke angitt' })
  omregningInit.toleransegrenser.forEach((value: string) => {
    optionToleransegrenseSett.push({ value: value, label: value })
  })

  const optionOppgaveSett: { value: string, label: string }[] = []
  omregningInit.oppgaveSett.forEach((value: string) => {
    optionOppgaveSett.push({ value: value, label: value })
  })

  const optionOppgavePrefiks = [
    { value: 'DEFAULT_PREFIKS', label: 'Default prefiks' },
    { value: 'REGELENDRING_PREFIKS', label: 'Regelendring prefiks' },
    { value: 'FEILRETTING_PREFIKS', label: 'Feilretting prefiks' },
  ]

  function setMonthSelected(date: Date | undefined): Date | undefined {
    if (!date) {
      return undefined
    }
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const behandlingsmaned = year * 100 + month
    setOmregningstidspunkt(behandlingsmaned.toString())
    return date
  }

  const { monthpickerProps, inputProps } = useMonthpicker({
    onMonthChange: setMonthSelected,
    fromDate: new Date(`1 Oct ${now.getFullYear() - 10}`),
    toDate: new Date(`1 Oct ${now.getFullYear() + 1}`),
    onValidate: (val) => {
      if (!val.isValidMonth && val.isEmpty) {
        setHasError(true)
      }
    },
    required: true,
  })

  const [kravGjelder, setKravGjelder] = useState(optionsKravGjelder[0].value)
  const [kravArsak, setKravArsak] = useState(optionsKravArsak[0].value)
  const [toleransegrenseSett, setToleransegrenseSett] = useState(optionToleransegrenseSett[0].value)
  const [oppgaveSett, setOppgaveSett] = useState(optionOppgaveSett[0].value)
  const [oppgavePrefiks, setOppgavePrefiks] = useState(optionOppgavePrefiks[0].value)

  const [searchParams, setSearchParams] = useSearchParams()
  const omregningsaker = omregningSakerPage as OmregningSakerPage

  const onPageChange = (page: number) => {
    searchParams.set('page', (page - 1).toString())
    searchParams.set('size', omregningsaker?.size ? omregningsaker.size.toString() : '10')
    setSearchParams(searchParams)

  }

  function oppdaterOmregningInput() {
    fetcher.submit(
      {
        method: 'POST',
        action: '/omregningsaker',
      },
    )
  }

  function sakerTilOmregningTabell() {
    if (omregningsaker?.content) {
      return (
        <div>
          <Table size='medium' zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope='col'>SakId</Table.HeaderCell>
                <Table.HeaderCell scope='col'>SakType</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {omregningsaker && omregningsaker.content?.map((sak, i) => {
                return (
                  <Table.Row key={sak.sakId + i}>
                    <Table.DataCell scope='row'>{sak.sakId}</Table.DataCell>
                    <Table.DataCell scope='row'>{sak.sakType}</Table.DataCell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
          <Pagination
            page={omregningsaker.number + 1}
            onPageChange={onPageChange}
            count={omregningsaker?.totalPages ? omregningsaker.totalPages : 1}
            boundaryCount={1}
            siblingCount={1}
          />
        </div>
      )
    } else {
      return (
        <Loader size='2xlarge' title='Laster data...' />
      )
    }
  }

  return (
    <div>
      <h1>Omregn ytelser</h1>
      <Box>
        <BodyShort>
          Behandling for Omregning av ytelser (tidligere BPEN093)
        </BodyShort>
        <Link href='https://pensjon-dokumentasjon.intern.dev.nav.no/pen/Behandlinger/Omregning.html'
              target='_blank'>Dokumentasjon</Link>
      </Box>
      <Tabs defaultValue='Omregning'>

        <Tabs.List>
          <Tabs.Tab
            value='Omregning'
            label='Omregning' />
          <Tabs.Tab
            value='Saker til Omregning'
            label='Saker til Omregning' />
        </Tabs.List>

        <Tabs.Panel value='Omregning'>
          <br />
          <fetcher.Form id={'skjema'} action='omregning' method='POST'>
            <VStack gap='6'>

              <HGrid columns={2} gap='12'>

                <Box>
                  <TextField
                    label={'Behandlingsnøkkel'}
                    name={'behandlingsnokkel'}
                    size='small'
                    onChange={(event) => setBehandlingsnokkel(event.target.value)}
                  />

              <MonthPicker
                {...monthpickerProps}
              >
                <MonthPicker.Input
                  {...inputProps}
                  label='Omregningstidspunkt (virkFom)'
                  error={hasError && 'Du må velge måned'}
                />
              </MonthPicker>
              <input hidden type='text' id='omregningstidspunkt' name='omregningstidspunkt'
                     value={omregningstidspunkt}
                     readOnly />

                  <br />
                  <br />

                  <Select
                    label='Krav gjelder'
                    name={'kravGjelder'}
                    onChange={(event) => setKravGjelder(event.target.value)}>
                    {optionsKravGjelder.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label={'Kravårsak'}
                    name={'kravArsak'}
                    onChange={(event) => setKravArsak(event.target.value)}>
                    {optionsKravArsak.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

              <Select
                label={'Toleransegrense-sett'}
                name={'toleransegrenseSett'}
                onChange={(event) => setToleransegrenseSett(event.target.value)}>
                {optionToleransegrenseSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label={'Oppgave-sett'}
                name={'oppgaveSett'}
                onChange={(event) => setOppgaveSett(event.target.value)}>
                {optionOppgaveSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label={'Oppgave-prefiks'}
                name={'oppgavePrefiks'}
                onChange={(event) => setOppgavePrefiks(event.target.value)}>
                {optionOppgavePrefiks.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <br />

                </Box>

                <Box>
                  <CheckboxGroup legend={'Behandlingsparametere'} name={'behandlingsparametere'} onChange={() => {
                    console.log('change')
                  }}>
                    <Checkbox
                      name='behandleApneKrav'
                      value={behandleApneKrav}
                      onChange={(event) => setBehandleApneKrav(event.target.checked)}
                    >
                      Behandle åpne krav
                    </Checkbox>

                    <Checkbox
                      name='brukFaktoromregning'
                      value={brukFaktoromregning}
                      onChange={(event) => setBrukFaktoromregning(event.target.checked)}
                    >
                      Bruk faktoromregning
                    </Checkbox>

                    <Checkbox
                      name='opprettAlleOppgaver'
                      value={opprettAlleOppgaver}
                      onChange={(event) => setOpprettAlleOppgaver(event.target.checked)}
                    >
                      Opprett alle oppgaver
                    </Checkbox>

                    <Checkbox
                      name='sjekkYtelseFraAvtaleland'
                      value={sjekkYtelseFraAvtaleland}
                      onChange={(event) => setSjekkYtelseFraAvtaleland(event.target.checked)}
                    >
                      Sjekk ytelser fra avtaleland
                    </Checkbox>

                    <Checkbox
                      defaultChecked={skalBestilleBrev}
                      name='skalBestilleBrev'
                      value={skalBestilleBrev}
                      onChange={(event) => setSkalBestilleBrev(event.target.checked)}>
                      Skal bestille brev
                    </Checkbox>

                    <Checkbox
                      defaultChecked={skalSamordne}
                      name='skalSamordne'
                      value={skalSamordne}
                      onChange={(event) => setSkalSamordne(event.target.checked)}>
                      Skal samordne
                    </Checkbox>

                    <h3>Følgende verdier er default satt:</h3>
                    <Checkbox
                      defaultChecked={omregneAFP}
                      name='omregneAFP'
                      value={omregneAFP}
                      onChange={(event) => {
                        setOmregneAFP(event.target.checked)
                      }}
                    >
                      Omregne AFP
                    </Checkbox>

                    <Checkbox
                      defaultChecked={skalSendeBrevBerorteSaker}
                      name='sendBrevBerorteSaker'
                      value={skalSendeBrevBerorteSaker}
                      onChange={(event) => {
                        setSkalSendeBrevBerorteSaker(event.target.checked)
                      }}
                    >
                      Send brev for berørte saker
                    </Checkbox>

                    <Checkbox
                      defaultChecked={skalSletteIverksettingsoppgaver}
                      name='skalSletteIverksettingsoppgaver'
                      value={skalSletteIverksettingsoppgaver}
                      onChange={(event) => setSkalSletteIverksettingsoppgaver(event.target.checked)}>
                      Skal slette iverksettingsoppgaver
                    </Checkbox>

                    <Checkbox
                      defaultChecked={skalDistribuereUforevedtak}
                      name='skalDistribuereUforevedtak'
                      value={skalDistribuereUforevedtak}
                      onChange={(event) => setSkalDistribuereUforevedtak(event.target.checked)}>
                      Skal distribuere uførevedtak
                    </Checkbox>

                  </CheckboxGroup>
                </Box>

              </HGrid>
            </VStack>
          </fetcher.Form>

          <Box>
            <br />
            <Button
              icon={<PlayIcon aria-hidden />}
              onClick={() => ref.current?.showModal()}>
              Start omregning
            </Button>

            <Modal ref={ref} header={{ heading: 'Start Omregning' }}>
              <Modal.Body>
                <BodyLong>
                  Du vil nå starte en behandling med følgende parametere:

                  {behandlingsnokkel && <p>Behandlingsnøkkel: {behandlingsnokkel}</p>}
                  {omregningstidspunkt && <p>Omregningstidspunkt: {omregningstidspunkt}</p>}
                  <List size={'small'}>
                    {omregneAFP && <List.Item>Omregne AFP: {omregneAFP ? 'Ja' : 'Nei'}</List.Item>}
                    {behandleApneKrav && <List.Item>Behandle åpne krav: {behandleApneKrav ? 'Ja' : 'Nei'}</List.Item>}
                    {brukFaktoromregning &&
                      <List.Item>Bruk faktoromregning: {brukFaktoromregning ? 'Ja' : 'Nei'}</List.Item>}
                    {opprettAlleOppgaver &&
                      <List.Item>Opprett alle oppgaver: {opprettAlleOppgaver ? 'Ja' : 'Nei'}</List.Item>}
                    {sjekkYtelseFraAvtaleland &&
                      <List.Item>Sjekk ytelser fra avtaleland: {sjekkYtelseFraAvtaleland ? 'Ja' : 'Nei'}</List.Item>}
                    {skalSletteIverksettingsoppgaver && <List.Item>Skal slette
                      Iverksettingsoppgaver: {skalSletteIverksettingsoppgaver ? 'Ja' : 'Nei'}</List.Item>}
                    {skalBestilleBrev && <List.Item>Skal bestille brev: {skalBestilleBrev ? 'Ja' : 'Nei'}</List.Item>}
                    {skalSamordne && <List.Item>Skal samordne: {skalSamordne ? 'Ja' : 'Nei'}</List.Item>}
                    {skalSendeBrevBerorteSaker &&
                      <List.Item>Send brev for berørte saker: {skalSendeBrevBerorteSaker ? 'Ja' : 'Nei'}</List.Item>}
                    {skalDistribuereUforevedtak &&
                      <List.Item>Skal distribuere uførevedtak: {skalDistribuereUforevedtak ? 'Ja' : 'Nei'}</List.Item>}

                    <List.Item>Krav gjelder: {kravGjelder}</List.Item>
                    <List.Item>Kravårsak: {kravArsak}</List.Item>
                    <List.Item>Toleransegrense sett: {toleransegrenseSett}</List.Item>
                    <List.Item>Oppgave sett: {oppgaveSett}</List.Item>
                    <List.Item>Oppgave prefiks: {oppgavePrefiks}</List.Item>

                  </List>
                  Du kan ikke angre denne handlingen.
                </BodyLong>
              </Modal.Body>
              <Modal.Footer>
                <Button form={'skjema'} type='submit' loading={fetcher.state === 'submitting'} disabled={isClicked}
                        onClick={(e: any) => {
                          handleSubmit(e.target.form)
                        }}>
                  Submit
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => ref.current?.close()}
                >
                  Tilbake
                </Button>
              </Modal.Footer>
            </Modal>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value='Saker til Omregning'>

          <div>
            <h2>Legg til saker</h2>
            <fetcher.Form method='post' action='omregningsaker'>
              <Textarea label='Legg til saker' resize size='small' name='saksnummerListe' />
              <br />
              <Button variant='primary' loading={navigation.state === 'submitting'} onClick={oppdaterOmregningInput}>Legg
                til</Button>
            </fetcher.Form>

            <h2>Saker til omregning</h2>
            {sakerTilOmregningTabell()}
          </div>

        </Tabs.Panel>

      </Tabs>

    </div>
  )
}
