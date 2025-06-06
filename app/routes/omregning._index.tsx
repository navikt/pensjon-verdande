import { Form, useFetcher, useLoaderData, useNavigation, useSearchParams, useSubmit } from '@remix-run/react'
import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormSummary,
  HGrid,
  Link,
  Loader,
  Modal,
  MonthPicker,
  Pagination,
  Select,
  Table,
  Tabs,
  Textarea,
  TextField,
  UNSAFE_Combobox,
  useMonthpicker,
  VStack,
} from '@navikt/ds-react'
import { PlayIcon } from '@navikt/aksel-icons'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { hentOmregningInit, hentOmregningInput } from '~/services/batch.omregning.bpen093'
import type { OmregningSakerPage } from '~/types'
import type { ComboboxOption } from 'node_modules/@navikt/ds-react/esm/form/combobox/types'
import type { HTMLFormMethod } from '@remix-run/router'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const accesstoken = await requireAccessToken(request)

  const omregningInit = await hentOmregningInit(
    accesstoken,
  )

  let { searchParams } = new URL(request.url)
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
  const ref = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()
  const defaultbatchbrevtypeOption: ComboboxOption = { value: 'not set', label: 'Ikke angitt' }

  const [omregningstidspunkt, setOmregningstidspunkt] = useState('')
  const [behandlingsnokkel, setBehandlingsnokkel] = useState('')
  const [omregneAFP, setOmregneAFP] = useState(true)
  const [skalSletteIverksettingsoppgaver, setSkalSletteIverksettingsoppgaver] = useState(true)
  const [skalDistribuereUforevedtak, setSkalDistribuereUforevedtak] = useState(true)
  const [skalBestilleBrev, setSkalBestilleBrev] = useState(false)
  const [skalIverksettOnline, setSkalIverksettOnline] = useState(false)

  const [selectedBrevkodeSokerAlderGammeltRegelverk, setselectedBrevkodeSokerAlderGammeltRegelverk] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeSokerAlderNyttRegelverk, setselectedBrevkodeSokerAlderNyttRegelverk] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeSokerUforetrygd, setselectedBrevkodeSokerUforetrygd] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeSokerBarnepensjon, setselectedBrevkodeSokerBarnepensjon] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeSokerAFP, setselectedBrevkodeSokerAFP] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeSokerGjenlevendepensjon, setselectedBrevkodeSokerGjenlevendepensjon] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeSokerAFPPrivat, setselectedBrevkodeSokerAFPPrivat] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)

  const [selectedBrevkoderBerorteSakerAlderGammeltRegelverk, setselectedBrevkoderBerorteSakerAlderGammeltRegelverk] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkoderBerorteSakerAlderNyttRegelverk, setselectedBrevkoderBerorteSakerAlderNyttRegelverk] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkoderBerorteSakerUforetrygd, setselectedBrevkoderBerorteSakerUforetrygd] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkoderBerorteSakerBarnepensjon, setselectedBrevkoderBerorteSakerBarnepensjon] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkoderBerorteSakerAFP, setselectedBrevkoderBerorteSakerAFP] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkoderBerorteSakerGjenlevendepensjon, setselectedBrevkoderBerorteSakerGjenlevendepensjon] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)
  const [selectedBrevkodeBerorteSakerAFPPrivat, setselectedBrevkodeBerorteSakerAFPPrivat] = useState<ComboboxOption | undefined>(defaultbatchbrevtypeOption)

  const [skalSamordne, setSkalSamordne] = useState(false)
  const [skalSendeBrevBerorteSaker, setSkalSendeBrevBerorteSaker] = useState(true)
  const [behandleApneKrav, setBehandleApneKrav] = useState(false)
  const [brukFaktoromregning, setBrukFaktoromregning] = useState(false)
  const [opprettAlleOppgaver, setOpprettAlleOppgaver] = useState(false)
  const [sjekkYtelseFraAvtaleland, setSjekkYtelseFraAvtaleland] = useState(false)

  const [hasError, setHasError] = useState(false)
  const fetcher = useFetcher()
  let submit = useSubmit()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (hasError) {
      return
    } else {
      event.preventDefault()
      let $form = event.currentTarget
      let formData = new FormData($form)
      submit(formData, {
        method: $form.getAttribute('method') as HTMLFormMethod ?? $form.method,
        action: $form.getAttribute('action') ?? $form.action,
      })
      setIsClicked(true)
    }
  }

  const optionsKravGjelder = [
    { value: 'REVURD', label: 'Revurdering' },
    { value: 'REGULERING', label: 'Regulering' },
  ]
  const optionsKravArsak = [
    { value: 'OMREGNING', label: 'Omregning' },
    { value: 'ANNEN_ARSAK', label: 'Annen årsak' },
    { value: 'REGULERING', label: 'Regulering' },
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

  const optionBatchbrevtyper: ComboboxOption[] = []
  optionBatchbrevtyper.push(defaultbatchbrevtypeOption)
  omregningInit.batchbrevtyper.forEach((value: string) => {
    optionBatchbrevtyper.push({ value: value, label: value })
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

  interface IProps {
    navn: string,
    skalVises: boolean,
    tekst: string,
    selectedBrevKode: ComboboxOption | undefined,
    setselectedBrevKode: React.Dispatch<React.SetStateAction<ComboboxOption | undefined>>
  }

  const BrevCheckbox: React.FC<IProps> = ({ navn, skalVises, tekst, selectedBrevKode, setselectedBrevKode }) => {
    return (
      <Box
        hidden={skalVises}
      >
        <UNSAFE_Combobox
          label={tekst}
          options={optionBatchbrevtyper}
          isMultiSelect={false}
          selectedOptions={selectedBrevKode ? [selectedBrevKode] : []}
          onToggleSelected={(option) => {
            const newOption = optionBatchbrevtyper.find(opt => opt.value === option)
            if (newOption === selectedBrevKode || newOption === undefined) {
              setselectedBrevKode(defaultbatchbrevtypeOption)
            } else {
              setselectedBrevKode(newOption)
            }
          }}
          name='brevkode'
          shouldAutocomplete={true}
          size={'small'}
        />
        <input hidden={true} name={navn} value={selectedBrevKode?.value} readOnly={true} />
      </Box>
    )
  }

  return (
    <div>
      <h1>Omregn ytelser</h1>
      <Box>
        Behandling for Omregning av ytelser (tidligere BPEN093).
        <br />
        Dokumentasjon kan finnes her:
        <ul>
          <li><Link href='https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlinger/Felles/Omregning.html'
                    target='_blank'>Dokumentasjon lokal pc</Link>
          </li>
          <li>
            <Link href='https://pensjon-dokumentasjon.intern.dev.nav.no/pen/Behandlinger/Felles/Omregning.html'
                  target='_blank'>Dokumentasjon driftimage</Link>
          </li>
        </ul>

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
          <Form id={'skjema'} action='omregning' method='POST' onSubmit={handleSubmit}>
            <VStack gap='6'>
              <HGrid columns={3} gap='12'>
                <Box>
                  <TextField
                    label={'Behandlingsnøkkel'}
                    name={'behandlingsnokkel'}
                    size='small'
                    value={behandlingsnokkel}
                    onChange={(event) => setBehandlingsnokkel(event.target.value)}
                    error={hasError}
                  />

                  <MonthPicker
                    {...monthpickerProps}
                  >
                    <MonthPicker.Input
                      {...inputProps}
                      value={omregningstidspunkt}
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
                    value={kravGjelder}
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
                    value={kravArsak}
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
                    value={toleransegrenseSett}
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
                    value={oppgaveSett}
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
                    value={oppgavePrefiks}
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
                  <VStack gap='2'>
                    <CheckboxGroup size={'medium'} legend={'Behandlingsparametere'} name={'behandlingsparametere'}>
                      <Checkbox
                        defaultChecked={behandleApneKrav}
                        name='behandleApneKrav'
                        value={behandleApneKrav}
                        onChange={(event) => setBehandleApneKrav(event.target.checked)}
                      >
                        Behandle åpne krav
                      </Checkbox>

                      <Checkbox
                        defaultChecked={brukFaktoromregning}
                        name='brukFaktoromregning'
                        value={brukFaktoromregning}
                        onChange={(event) => setBrukFaktoromregning(event.target.checked)}
                      >
                        Bruk faktoromregning
                      </Checkbox>

                      <Checkbox
                        defaultChecked={opprettAlleOppgaver}
                        name='opprettAlleOppgaver'
                        value={opprettAlleOppgaver}
                        onChange={(event) => setOpprettAlleOppgaver(event.target.checked)}
                      >
                        Opprett alle oppgaver
                      </Checkbox>

                      <Checkbox
                        defaultChecked={sjekkYtelseFraAvtaleland}
                        name='sjekkYtelseFraAvtaleland'
                        value={sjekkYtelseFraAvtaleland}
                        onChange={(event) => setSjekkYtelseFraAvtaleland(event.target.checked)}
                      >
                        Sjekk ytelser fra avtaleland
                      </Checkbox>

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

                    </CheckboxGroup>
                    <CheckboxGroup size={'medium'} legend={'Iverksetting parametere'}>
                      <Checkbox
                        defaultChecked={skalIverksettOnline}
                        name='skalIverksettOnline'
                        value={skalIverksettOnline}
                        onChange={(event) => setSkalIverksettOnline(event.target.checked)}
                      >
                        Iverksett Online
                      </Checkbox>

                      <Checkbox
                        defaultChecked={skalSamordne}
                        name='skalSamordne'
                        value={skalSamordne}
                        onChange={(event) => setSkalSamordne(event.target.checked)}>
                        Skal samordne
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
                  </VStack>
                </Box>
                <Box>
                  <CheckboxGroup legend={'Brevparametere'}>
                    Ved å <b>ikke</b> angi brev for berørte saker vil default brevkode bli brukt.
                    <HGrid columns={2} gap='12'>
                      <Box
                        padding='4'
                        background='surface-info-subtle'
                        borderColor='border-info'
                        borderWidth='4'
                      >
                        <Checkbox
                          defaultChecked={skalBestilleBrev}
                          name='skalBestilleBrev'
                          value={skalBestilleBrev}
                          onChange={(event) => setSkalBestilleBrev(event.target.checked)}>
                          Bestille brev
                        </Checkbox>

                        <BrevCheckbox navn={'brevkodeSokerAlderGammeltRegelverk'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for Alder, gammelt regelverk'}
                                      selectedBrevKode={selectedBrevkodeSokerAlderGammeltRegelverk}
                                      setselectedBrevKode={setselectedBrevkodeSokerAlderGammeltRegelverk} />
                        <BrevCheckbox navn={'brevkodeSokerAlderNyttRegelverk'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for Alder, nytt regelverk'}
                                      selectedBrevKode={selectedBrevkodeSokerAlderNyttRegelverk}
                                      setselectedBrevKode={setselectedBrevkodeSokerAlderNyttRegelverk} />
                        <BrevCheckbox navn={'brevkodeSokerUforetrygd'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for Uføretrygd'}
                                      selectedBrevKode={selectedBrevkodeSokerUforetrygd}
                                      setselectedBrevKode={setselectedBrevkodeSokerUforetrygd} />
                        <BrevCheckbox navn={'brevkodeSokerBarnepensjon'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for Barnepensjon'}
                                      selectedBrevKode={selectedBrevkodeSokerBarnepensjon}
                                      setselectedBrevKode={setselectedBrevkodeSokerBarnepensjon} />
                        <BrevCheckbox navn={'brevkodeSokerAFP'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for AFP'} selectedBrevKode={selectedBrevkodeSokerAFP}
                                      setselectedBrevKode={setselectedBrevkodeSokerAFP} />
                        <BrevCheckbox navn={'brevkodeSokerGjenlevendepensjon'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for Gjenlevendepensjon'}
                                      selectedBrevKode={selectedBrevkodeSokerGjenlevendepensjon}
                                      setselectedBrevKode={setselectedBrevkodeSokerGjenlevendepensjon} />
                        <BrevCheckbox navn={'brevkodeSokerAFPPrivat'} skalVises={!skalBestilleBrev}
                                      tekst={'Velg brevkode for AFP Privat'}
                                      selectedBrevKode={selectedBrevkodeSokerAFPPrivat}
                                      setselectedBrevKode={setselectedBrevkodeSokerAFPPrivat} />

                      </Box>
                      <Box
                        padding='4'
                        background='surface-info-subtle'
                        borderColor='border-info'
                        borderWidth='4'
                      >
                        <Checkbox
                          defaultChecked={skalSendeBrevBerorteSaker}
                          name='sendBrevBerorteSaker'
                          value={skalSendeBrevBerorteSaker}
                          onChange={(event) => {
                            setSkalSendeBrevBerorteSaker(event.target.checked)
                          }}
                        >
                          Bestille brev berørte saker
                        </Checkbox>

                        <BrevCheckbox navn={'brevkodeBerorteSakerAlderGammeltRegelverk'}
                                      skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for Alder, gammelt regelverk'}
                                      selectedBrevKode={selectedBrevkoderBerorteSakerAlderGammeltRegelverk}
                                      setselectedBrevKode={setselectedBrevkoderBerorteSakerAlderGammeltRegelverk} />
                        <BrevCheckbox navn={'brevkodeBerorteSakerAlderNyttRegelverk'}
                                      skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for Alder, nytt regelverk'}
                                      selectedBrevKode={selectedBrevkoderBerorteSakerAlderNyttRegelverk}
                                      setselectedBrevKode={setselectedBrevkoderBerorteSakerAlderNyttRegelverk} />
                        <BrevCheckbox navn={'brevkodeBerorteSakerUforetrygd'} skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for Uføretrygd'}
                                      selectedBrevKode={selectedBrevkoderBerorteSakerUforetrygd}
                                      setselectedBrevKode={setselectedBrevkoderBerorteSakerUforetrygd} />
                        <BrevCheckbox navn={'brevkodeBerorteSakerBarnepensjon'} skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for Barnepensjon'}
                                      selectedBrevKode={selectedBrevkoderBerorteSakerBarnepensjon}
                                      setselectedBrevKode={setselectedBrevkoderBerorteSakerBarnepensjon} />
                        <BrevCheckbox navn={'brevkodeBerorteSakerAFP'} skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for AFP'}
                                      selectedBrevKode={selectedBrevkoderBerorteSakerAFP}
                                      setselectedBrevKode={setselectedBrevkoderBerorteSakerAFP} />
                        <BrevCheckbox navn={'brevkodeBerorteSakerGjenlevendepensjon'}
                                      skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for Gjenlevendepensjon'}
                                      selectedBrevKode={selectedBrevkoderBerorteSakerGjenlevendepensjon}
                                      setselectedBrevKode={setselectedBrevkoderBerorteSakerGjenlevendepensjon} />
                        <BrevCheckbox navn={'brevkodeBerorteSakerAFPPrivat'} skalVises={!skalSendeBrevBerorteSaker}
                                      tekst={'Velg brevkode for AFP Privat'}
                                      selectedBrevKode={selectedBrevkodeBerorteSakerAFPPrivat}
                                      setselectedBrevKode={setselectedBrevkodeBerorteSakerAFPPrivat} />

                      </Box>
                    </HGrid>
                  </CheckboxGroup>
                </Box>

              </HGrid>
            </VStack>
          </Form>

          <Box>
            <br />
            <Button
              icon={<PlayIcon aria-hidden />}
              onClick={() => ref.current?.showModal()}>
              Start omregning
            </Button>

            <Modal
              ref={ref}
              header={{ heading: 'Start Omregning' }}
              size={'medium'}
              style={{
                minWidth: '1024px',
              }}
            >
              <Modal.Body>
                <FormSummary>
                  <FormSummary.Header> Du vil nå starte en behandling med følgende parametere</FormSummary.Header>

                  <FormSummary.Answers>
                    <FormSummary.Answer>
                      <FormSummary.Label>Behandlingsnøkkel</FormSummary.Label>
                      <FormSummary.Value>{behandlingsnokkel && <>{behandlingsnokkel}</>}</FormSummary.Value>
                    </FormSummary.Answer>

                    <FormSummary.Answer>
                      <FormSummary.Label>Omregningstidspunkt</FormSummary.Label>
                      <FormSummary.Value>{omregningstidspunkt && <>{omregningstidspunkt}</>}</FormSummary.Value>
                    </FormSummary.Answer>

                    <FormSummary.Answer>
                      <FormSummary.Label>Omregning</FormSummary.Label>
                      <HGrid columns={3} gap='10'>
                        <FormSummary.Value>
                          <FormSummary.Answers>
                            <FormSummary.Answer>
                              <FormSummary.Label>Krav gjelder</FormSummary.Label>
                              <FormSummary.Value>{kravGjelder}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Kravårsak</FormSummary.Label>
                              <FormSummary.Value>{kravArsak}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Toleransegrense-sett</FormSummary.Label>
                              <FormSummary.Value>{toleransegrenseSett}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Oppgave-sett</FormSummary.Label>
                              <FormSummary.Value>{oppgaveSett}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Oppgave-prefiks</FormSummary.Label>
                              <FormSummary.Value>{oppgavePrefiks}</FormSummary.Value>
                            </FormSummary.Answer>
                          </FormSummary.Answers>
                        </FormSummary.Value>

                        <FormSummary.Value>
                          <FormSummary.Answers>
                            <FormSummary.Answer>
                              <FormSummary.Label>Behandle åpne krav</FormSummary.Label>
                              <FormSummary.Value>{behandleApneKrav ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Bruk faktoromregning</FormSummary.Label>
                              <FormSummary.Value>{brukFaktoromregning ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Opprett alle oppgaver</FormSummary.Label>
                              <FormSummary.Value>{opprettAlleOppgaver ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Sjekk ytelser fra avtaleland</FormSummary.Label>
                              <FormSummary.Value>{sjekkYtelseFraAvtaleland ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Omregne AFP</FormSummary.Label>
                              <FormSummary.Value>{omregneAFP ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                          </FormSummary.Answers>
                        </FormSummary.Value>

                        <FormSummary.Value>
                          <FormSummary.Answers>
                            <FormSummary.Answer>
                              <FormSummary.Label>Skal Iverksett Online</FormSummary.Label>
                              <FormSummary.Value>{skalIverksettOnline ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Skal samordne</FormSummary.Label>
                              <FormSummary.Value>{skalSamordne ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Skal slette iverksettingsoppgaver</FormSummary.Label>
                              <FormSummary.Value>{skalSletteIverksettingsoppgaver ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            <FormSummary.Answer>
                              <FormSummary.Label>Skal distribuere uførevedtak</FormSummary.Label>
                              <FormSummary.Value>{skalDistribuereUforevedtak ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                          </FormSummary.Answers>
                        </FormSummary.Value>
                      </HGrid>
                    </FormSummary.Answer>

                    <FormSummary.Answer>
                      <FormSummary.Label>Omregning brev</FormSummary.Label>
                      <HGrid columns={2} gap='10'>
                        <FormSummary.Value>
                          <FormSummary.Answers>
                            <FormSummary.Answer>
                              <FormSummary.Label>Skal bestille brev for søker</FormSummary.Label>
                              <FormSummary.Value>{skalBestilleBrev ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            {skalBestilleBrev && selectedBrevkodeSokerAlderGammeltRegelverk && selectedBrevkodeSokerAlderGammeltRegelverk.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Alder gammelt regelverk</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerAlderGammeltRegelverk.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalBestilleBrev && selectedBrevkodeSokerAlderNyttRegelverk && selectedBrevkodeSokerAlderNyttRegelverk.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Alder nytt regelverk</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerAlderNyttRegelverk.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalBestilleBrev && selectedBrevkodeSokerUforetrygd && selectedBrevkodeSokerUforetrygd.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Uføretrygd</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerUforetrygd.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalBestilleBrev && selectedBrevkodeSokerBarnepensjon && selectedBrevkodeSokerBarnepensjon.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Barnepensjon</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerBarnepensjon.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalBestilleBrev && selectedBrevkodeSokerAFP && selectedBrevkodeSokerAFP.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for AFP</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerAFP.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalBestilleBrev && selectedBrevkodeSokerGjenlevendepensjon && selectedBrevkodeSokerGjenlevendepensjon.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Gjenlevendepensjon</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerGjenlevendepensjon.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalBestilleBrev && selectedBrevkodeSokerAFPPrivat && selectedBrevkodeSokerAFPPrivat.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for AFP Privat</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeSokerAFPPrivat.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                          </FormSummary.Answers>
                        </FormSummary.Value>
                        <FormSummary.Value>
                          <FormSummary.Answers>
                            <FormSummary.Answer>
                              <FormSummary.Label>Skal sende brev for berørte saker</FormSummary.Label>
                              <FormSummary.Value>{skalSendeBrevBerorteSaker ? 'Ja' : 'Nei'}</FormSummary.Value>
                            </FormSummary.Answer>
                            {skalSendeBrevBerorteSaker && selectedBrevkoderBerorteSakerAlderGammeltRegelverk && selectedBrevkoderBerorteSakerAlderGammeltRegelverk.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Alder gammelt regelverk</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkoderBerorteSakerAlderGammeltRegelverk.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalSendeBrevBerorteSaker && selectedBrevkoderBerorteSakerAlderNyttRegelverk && selectedBrevkoderBerorteSakerAlderNyttRegelverk.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Alder nytt regelverk</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkoderBerorteSakerAlderNyttRegelverk.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalSendeBrevBerorteSaker && selectedBrevkoderBerorteSakerUforetrygd && selectedBrevkoderBerorteSakerUforetrygd.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Uføretrygd</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkoderBerorteSakerUforetrygd.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalSendeBrevBerorteSaker && selectedBrevkoderBerorteSakerBarnepensjon && selectedBrevkoderBerorteSakerBarnepensjon.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Barnepensjon</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkoderBerorteSakerBarnepensjon.value
                                }</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalSendeBrevBerorteSaker && selectedBrevkoderBerorteSakerAFP && selectedBrevkoderBerorteSakerAFP.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for AFP</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkoderBerorteSakerAFP.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalSendeBrevBerorteSaker && selectedBrevkoderBerorteSakerGjenlevendepensjon && selectedBrevkoderBerorteSakerGjenlevendepensjon.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for Gjenlevendepensjon</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkoderBerorteSakerGjenlevendepensjon.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                            {skalSendeBrevBerorteSaker && selectedBrevkodeBerorteSakerAFPPrivat && selectedBrevkodeBerorteSakerAFPPrivat.value !== 'not set' &&
                              <FormSummary.Answer>
                                <FormSummary.Label>Batchbrev for AFP Privat</FormSummary.Label>
                                <FormSummary.Value>{selectedBrevkodeBerorteSakerAFPPrivat.value}</FormSummary.Value>
                              </FormSummary.Answer>
                            }
                          </FormSummary.Answers>
                        </FormSummary.Value>
                      </HGrid>
                    </FormSummary.Answer>
                  </FormSummary.Answers>
                </FormSummary>
                Du kan ikke angre denne handlingen.
              </Modal.Body>
              <Modal.Footer>
                <Button form={'skjema'} type='submit' disabled={isClicked}>
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
              <Textarea
                label='Legg til saker. Oppgis med linjeskift.'
                resize
                size='small'
                name='saksnummerListe'
                style={{ width: '30em' }}
              />
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
