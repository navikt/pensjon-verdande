import type { HTMLFormMethod, LoaderFunctionArgs } from 'react-router'
import { Form, useFetcher, useLoaderData, useNavigation, useSearchParams, useSubmit } from 'react-router'
import type React from 'react'
import { useRef, useState } from 'react'
import {
  Box,
  Button,
  CheckboxGroup, CopyButton,
  HGrid,
  Link,
  Loader,
  Modal,
  MonthPicker,
  Pagination,
  Table,
  Tabs,
  Textarea,
  TextField,
  useMonthpicker,
  VStack,
} from '@navikt/ds-react'
import { PlayIcon } from '@navikt/aksel-icons'
import { requireAccessToken } from '~/services/auth.server'
import type { OmregningInit, OmregningSakerPage } from '~/types'
import type { ComboboxOption } from 'node_modules/@navikt/ds-react/esm/form/combobox/types'
import OmregningSelector from '~/components/omregning/OmregningSelector'
import OmregningCheckbox from '~/components/omregning/OmregningCheckbox'
import OmregningBrevCheckbox from '~/components/omregning/OmregningBrevCheckbox'
import { OmregningOppsummering } from '~/components/omregning/OmregningOppsummering'
import { hentOmregningInit, hentOmregningInput } from '~/omregning/batch.omregning.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accesstoken = await requireAccessToken(request)

  const omregningInit = await hentOmregningInit(
    accesstoken,
  ) as OmregningInit

  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '0'
  const size = searchParams.get('size') ?? '10'

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
  const [skalIverksettOnline, setSkalIverksettOnline] = useState(false)
  const [skalBestilleBrev, setSkalBestilleBrev] = useState("INGEN")

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
  const submit = useSubmit()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (hasError) {
      return
    } else {
      event.preventDefault()
      const $form = event.currentTarget
      const formData = new FormData($form)
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

  const optionBestilleBrev = [
    { value: 'INGEN', label: 'Ingen' },
    { value: 'ALLE', label: 'Alle' },
    { value: 'ALLE_MED_ENDRING_I_BELOP', label: 'Alle med endring i beløp' },
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
              {omregningsaker?.content?.map((sak, i) => {
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
      <Box.New>
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

      </Box.New>
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
                <Box.New>
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
                  <input hidden type='text' name='omregningstidspunkt'
                         value={omregningstidspunkt}
                         readOnly />

                  <br />
                  <br />

                  <OmregningSelector label={'Krav gjelder'} navn={'kravGjelder'} value={kravGjelder}
                                     setSelectedValue={setKravGjelder} optionsmap={optionsKravGjelder} />
                  <OmregningSelector label={'Kravårsak'} navn={'kravArsak'} value={kravArsak}
                                     setSelectedValue={setKravArsak} optionsmap={optionsKravArsak} />
                  <OmregningSelector label={'Toleransegrense-sett'} navn={'toleransegrenseSett'}
                                     value={toleransegrenseSett} setSelectedValue={setToleransegrenseSett}
                                     optionsmap={optionToleransegrenseSett} />
                  <OmregningSelector label={'Oppgave-sett'} navn={'oppgaveSett'} value={oppgaveSett}
                                     setSelectedValue={setOppgaveSett} optionsmap={optionOppgaveSett} />
                  <OmregningSelector label={'Oppgave-prefiks'} navn={'oppgavePrefiks'} value={oppgavePrefiks}
                                     setSelectedValue={setOppgavePrefiks} optionsmap={optionOppgavePrefiks} />

                  <br />
                </Box.New>
                <Box.New>
                  <VStack gap='2'>
                    <CheckboxGroup size={'medium'} legend={'Behandlingsparametere'} name={'behandlingsparametere'}>

                      <OmregningCheckbox defaultChecked={behandleApneKrav} name={'behandleApneKrav'}
                                         value={behandleApneKrav} onChange={setBehandleApneKrav}
                                         children={'Behandle åpne krav'} />
                      <OmregningCheckbox defaultChecked={brukFaktoromregning} name={'brukFaktoromregning'}
                                         value={brukFaktoromregning} onChange={setBrukFaktoromregning}
                                         children={'Bruk faktoromregning'} />
                      <OmregningCheckbox defaultChecked={opprettAlleOppgaver} name={'opprettAlleOppgaver'}
                                         value={opprettAlleOppgaver} onChange={setOpprettAlleOppgaver}
                                         children={'Opprett alle oppgaver'} />
                      <OmregningCheckbox defaultChecked={sjekkYtelseFraAvtaleland} name={'sjekkYtelseFraAvtaleland'}
                                         value={sjekkYtelseFraAvtaleland} onChange={setSjekkYtelseFraAvtaleland}
                                         children={'Sjekk ytelser fra avtaleland'} />
                      <OmregningCheckbox defaultChecked={omregneAFP} name={'omregneAFP'} value={omregneAFP}
                                         onChange={setOmregneAFP} children={'Omregne AFP'} />

                    </CheckboxGroup>
                    <CheckboxGroup size={'medium'} legend={'Iverksetting parametere'}>

                      <OmregningCheckbox defaultChecked={skalIverksettOnline} name={'skalIverksettOnline'}
                                         value={skalIverksettOnline} onChange={setSkalIverksettOnline}
                                         children={'Iverksett Online'} />
                      <OmregningCheckbox defaultChecked={skalSamordne} name={'skalSamordne'} value={skalSamordne}
                                         onChange={setSkalSamordne} children={'Skal samordne'} />
                      <OmregningCheckbox defaultChecked={skalSletteIverksettingsoppgaver}
                                         name={'skalSletteIverksettingsoppgaver'}
                                         value={skalSletteIverksettingsoppgaver}
                                         onChange={setSkalSletteIverksettingsoppgaver}
                                         children={'Skal slette iverksettingsoppgaver'} />
                      <OmregningCheckbox defaultChecked={skalDistribuereUforevedtak} name={'skalDistribuereUforevedtak'}
                                         value={skalDistribuereUforevedtak} onChange={setSkalDistribuereUforevedtak}
                                         children={'Skal distribuere uførevedtak'} />

                    </CheckboxGroup>
                  </VStack>
                </Box.New>
                <Box.New>
                  <CheckboxGroup legend={'Brevparametere'}>
                    Ved å <b>ikke</b> angi brev for berørte saker vil default brevkode bli brukt.
                    <HGrid columns={2} gap='12'>
                      <Box.New
                        padding='4'
                        background={'raised'}
                        borderColor={'neutral-subtle'}
                        borderWidth='4'
                      >
                        <OmregningSelector label={"Bestill brev for"} navn={"skalBestilleBrev"} value={skalBestilleBrev} setSelectedValue={setSkalBestilleBrev} optionsmap={optionBestilleBrev} />

                        <OmregningBrevCheckbox navn={'brevkodeSokerAlderGammeltRegelverk'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for Alder, gammelt regelverk'}
                                               selectedBrevKode={selectedBrevkodeSokerAlderGammeltRegelverk}
                                               setselectedBrevKode={setselectedBrevkodeSokerAlderGammeltRegelverk}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeSokerAlderNyttRegelverk'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for Alder, nytt regelverk'}
                                               selectedBrevKode={selectedBrevkodeSokerAlderNyttRegelverk}
                                               setselectedBrevKode={setselectedBrevkodeSokerAlderNyttRegelverk}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeSokerUforetrygd'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for Uføretrygd'}
                                               selectedBrevKode={selectedBrevkodeSokerUforetrygd}
                                               setselectedBrevKode={setselectedBrevkodeSokerUforetrygd}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeSokerBarnepensjon'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for Barnepensjon'}
                                               selectedBrevKode={selectedBrevkodeSokerBarnepensjon}
                                               setselectedBrevKode={setselectedBrevkodeSokerBarnepensjon}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeSokerAFP'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for AFP'} selectedBrevKode={selectedBrevkodeSokerAFP}
                                               setselectedBrevKode={setselectedBrevkodeSokerAFP}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeSokerGjenlevendepensjon'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for Gjenlevendepensjon'}
                                               selectedBrevKode={selectedBrevkodeSokerGjenlevendepensjon}
                                               setselectedBrevKode={setselectedBrevkodeSokerGjenlevendepensjon}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeSokerAFPPrivat'} skalVises={skalBestilleBrev !== 'INGEN'}
                                               tekst={'Velg brevkode for AFP Privat'}
                                               selectedBrevKode={selectedBrevkodeSokerAFPPrivat}
                                               setselectedBrevKode={setselectedBrevkodeSokerAFPPrivat}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />

                      </Box.New>
                      <Box.New
                        padding='4'
                        background={'sunken'}
                        borderColor={'neutral-subtleA'}
                        borderWidth='4'
                      >

                        <OmregningCheckbox defaultChecked={skalSendeBrevBerorteSaker} name={'sendBrevBerorteSaker'}
                                           value={skalSendeBrevBerorteSaker} onChange={setSkalSendeBrevBerorteSaker}
                                           children={'Bestille brev berørte saker'} />

                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerAlderGammeltRegelverk'}
                                               skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for Alder, gammelt regelverk'}
                                               selectedBrevKode={selectedBrevkoderBerorteSakerAlderGammeltRegelverk}
                                               setselectedBrevKode={setselectedBrevkoderBerorteSakerAlderGammeltRegelverk}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerAlderNyttRegelverk'}
                                               skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for Alder, nytt regelverk'}
                                               selectedBrevKode={selectedBrevkoderBerorteSakerAlderNyttRegelverk}
                                               setselectedBrevKode={setselectedBrevkoderBerorteSakerAlderNyttRegelverk}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerUforetrygd'} skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for Uføretrygd'}
                                               selectedBrevKode={selectedBrevkoderBerorteSakerUforetrygd}
                                               setselectedBrevKode={setselectedBrevkoderBerorteSakerUforetrygd}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerBarnepensjon'} skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for Barnepensjon'}
                                               selectedBrevKode={selectedBrevkoderBerorteSakerBarnepensjon}
                                               setselectedBrevKode={setselectedBrevkoderBerorteSakerBarnepensjon}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerAFP'} skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for AFP'}
                                               selectedBrevKode={selectedBrevkoderBerorteSakerAFP}
                                               setselectedBrevKode={setselectedBrevkoderBerorteSakerAFP}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerGjenlevendepensjon'}
                                               skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for Gjenlevendepensjon'}
                                               selectedBrevKode={selectedBrevkoderBerorteSakerGjenlevendepensjon}
                                               setselectedBrevKode={setselectedBrevkoderBerorteSakerGjenlevendepensjon}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />
                        <OmregningBrevCheckbox navn={'brevkodeBerorteSakerAFPPrivat'} skalVises={skalSendeBrevBerorteSaker}
                                               tekst={'Velg brevkode for AFP Privat'}
                                               selectedBrevKode={selectedBrevkodeBerorteSakerAFPPrivat}
                                               setselectedBrevKode={setselectedBrevkodeBerorteSakerAFPPrivat}
                                               optionBatchbrevtyper={optionBatchbrevtyper} />

                      </Box.New>
                    </HGrid>
                  </CheckboxGroup>
                </Box.New>

              </HGrid>
            </VStack>
          </Form>

          <Box.New>
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
                <OmregningOppsummering
                  skalBestilleBrev={skalBestilleBrev}
                  skalSendeBrevBerorteSaker={skalSendeBrevBerorteSaker}
                  selectedBrevkodeSokerAlderGammeltRegelverk={selectedBrevkodeSokerAlderGammeltRegelverk}
                  selectedBrevkodeSokerAlderNyttRegelverk={selectedBrevkodeSokerAlderNyttRegelverk}
                  selectedBrevkodeSokerUforetrygd={selectedBrevkodeSokerUforetrygd}
                  selectedBrevkodeSokerBarnepensjon={selectedBrevkodeSokerBarnepensjon}
                  selectedBrevkodeSokerAFP={selectedBrevkodeSokerAFP}
                  selectedBrevkodeSokerGjenlevendepensjon={selectedBrevkodeSokerGjenlevendepensjon}
                  selectedBrevkodeSokerAFPPrivat={selectedBrevkodeSokerAFPPrivat}

                  selectedBrevkoderBerorteSakerAlderGammeltRegelverk={selectedBrevkoderBerorteSakerAlderGammeltRegelverk}
                  selectedBrevkoderBerorteSakerAlderNyttRegelverk={selectedBrevkoderBerorteSakerAlderNyttRegelverk}
                  selectedBrevkoderBerorteSakerUforetrygd={selectedBrevkoderBerorteSakerUforetrygd}
                  selectedBrevkoderBerorteSakerBarnepensjon={selectedBrevkoderBerorteSakerBarnepensjon}
                  selectedBrevkoderBerorteSakerAFP={selectedBrevkoderBerorteSakerAFP}
                  selectedBrevkoderBerorteSakerGjenlevendepensjon={selectedBrevkoderBerorteSakerGjenlevendepensjon}
                  selectedBrevkodeBerorteSakerAFPPrivat={selectedBrevkodeBerorteSakerAFPPrivat}

                  omregningstidspunkt={omregningstidspunkt}
                  behandlingsnokkel={behandlingsnokkel}
                  kravGjelder={kravGjelder}
                  kravArsak={kravArsak}
                  toleransegrenseSett={toleransegrenseSett}
                  oppgaveSett={oppgaveSett}
                  oppgavePrefiks={oppgavePrefiks}

                  omregneAFP={omregneAFP}
                  skalIverksettOnline={skalIverksettOnline}
                  skalSamordne={skalSamordne}
                  skalSletteIverksettingsoppgaver={skalSletteIverksettingsoppgaver}
                  skalDistribuereUforevedtak={skalDistribuereUforevedtak}
                  behandleApneKrav={behandleApneKrav}
                  brukFaktoromregning={brukFaktoromregning}
                  opprettAlleOppgaver={opprettAlleOppgaver}
                  sjekkYtelseFraAvtaleland={sjekkYtelseFraAvtaleland}
                />
                Du kan ikke angre denne handlingen.
              </Modal.Body>
              <Modal.Footer>
                <Button form={'skjema'} type='submit' disabled={isClicked}>
                  Start Omregning
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => ref.current?.close()}
                >
                  Tilbake
                </Button>
                <CopyButton copyText={getHumanReadableParameterText()} text="Kopier parameterliste"/>
              </Modal.Footer>
            </Modal>
          </Box.New>
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

  function getHumanReadableParameterText() {
    return [
      `behandlingsnøkkel: ${behandlingsnokkel}`,
      `omregningstidspunkt: ${omregningstidspunkt}`,
      ``,
      `kravGjelder: ${kravGjelder}`,
      `kravÅrsak: ${kravArsak}`,
      `toleransegrenseSett: ${toleransegrenseSett}`,
      `oppgaveSett: ${oppgaveSett}`,
      `oppgavePrefiks: ${oppgavePrefiks}`,
      ``,
      `behandleApneKrav: ${behandleApneKrav}`,
      `brukFaktoromregning: ${brukFaktoromregning}`,
      `opprettAlleOppgaver: ${opprettAlleOppgaver}`,
      `sjekkYtelseFraAvtaleland: ${sjekkYtelseFraAvtaleland}`,
      `omregneAFP: ${omregneAFP}`,
      ``,
      `skalIverksettOnline: ${skalIverksettOnline}`,
      `skalSamordne: ${skalSamordne}`,
      `skalSletteIverksettingsoppgaver: ${skalSletteIverksettingsoppgaver}`,
      `skalDistribuereUførevedtak: ${skalDistribuereUforevedtak}`,
      ``,
      `skalBestilleBrevForSøker: ${skalBestilleBrev}`,
      `skalSendeBrevBerørteSaker: ${skalSendeBrevBerorteSaker}`,

    ].join('\n')
  }

}
