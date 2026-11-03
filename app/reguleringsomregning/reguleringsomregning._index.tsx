import { PlayIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  Button,
  CheckboxGroup,
  CopyButton,
  HGrid,
  Loader,
  Modal,
  MonthPicker,
  Pagination,
  Table,
  Tabs,
  Textarea,
  useMonthpicker,
  VStack,
} from '@navikt/ds-react'
import type React from 'react'
import { useRef, useState } from 'react'
import type { HTMLFormMethod } from 'react-router'
import { Form, useFetcher, useNavigation, useSearchParams, useSubmit } from 'react-router'
import ReguleringsomregningCheckbox from '~/components/reguleringsomregning/ReguleringsomregningCheckbox'
import { ReguleringsomregningOppsummering } from '~/components/reguleringsomregning/ReguleringsomregningOppsummering'
import ReguleringsomregningSelector from '~/components/reguleringsomregning/ReguleringsomregningSelector'
import { apiGet } from '~/services/api.server'
import type { OmregningSakerPage } from '~/types'
import type { Route } from './+types/reguleringsomregning._index'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Reguleringsomregning | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '0'
  const size = searchParams.get('size') ?? '10'

  const omregningSakerPage = await apiGet<OmregningSakerPage>(
    `/api/behandling/omregning/input?page=${page}&size=${size}`,
    request,
  )

  return { omregningSakerPage }
}

export default function BatchOpprett_index({ loaderData }: Route.ComponentProps) {
  const { omregningSakerPage } = loaderData
  const now = new Date()
  const [isClicked, setIsClicked] = useState(false)
  const ref = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()

  const [reguleringsdato, setReguleringsdato] = useState('')

  const [fullstendigUttrekk, setFullstendigUttrekk] = useState(true)

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
        method: ($form.getAttribute('method') as HTMLFormMethod) ?? $form.method,
        action: $form.getAttribute('action') ?? $form.action,
      })
      setIsClicked(true)
    }
  }

  const optionPrioritet = [
    { value: 'ONLINE_BATCH', label: 'ONLINE_BATCH - online-kø med lav prioritet' },
    { value: 'BATCH', label: 'BATCH - egen batch-kø med HPEN' },
  ]

  function setMonthSelected(date: Date | undefined): Date | undefined {
    if (!date) {
      return undefined
    }
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const behandlingsmaned = year * 100 + month
    setReguleringsdato(behandlingsmaned.toString())
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

  const [prioritet, setPrioritet] = useState(optionPrioritet[1].value)

  const [searchParams, setSearchParams] = useSearchParams()
  const omregningsaker = omregningSakerPage as OmregningSakerPage

  const onPageChange = (page: number) => {
    searchParams.set('page', (page - 1).toString())
    searchParams.set('size', omregningsaker?.size ? omregningsaker.size.toString() : '10')
    setSearchParams(searchParams)
  }

  function oppdaterOmregningInput() {
    fetcher.submit({
      method: 'POST',
      action: '/omregningsaker',
    })
  }

  function sakerTilOmregningTabell() {
    if (omregningsaker?.content) {
      return (
        <div>
          <Table size="medium" zebraStripes>
            <BodyShort as="caption" visuallyHidden>
              Omregninger
            </BodyShort>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">SakId</Table.HeaderCell>
                <Table.HeaderCell scope="col">SakType</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {omregningsaker?.content?.map((sak) => {
                return (
                  <Table.Row key={sak.sakId}>
                    <Table.DataCell scope="row">{sak.sakId}</Table.DataCell>
                    <Table.DataCell scope="row">{sak.sakType}</Table.DataCell>
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
      return <Loader size="2xlarge" title="Laster data..." />
    }
  }

  return (
    <div>
      <h1>Reguleringsomregning</h1>
      <Box>
        Behandling for regulering av ytelser.
        <br />
      </Box>
      <Tabs defaultValue="ReguleringsomregningUttrekk">
        <Tabs.List>
          <Tabs.Tab value="ReguleringsomregningUttrekk" label="Reguleringsomregning Uttrekk" />
          <Tabs.Tab value="Saker til Omregning" label="Saker til Regulering" />
        </Tabs.List>

        <Tabs.Panel value="ReguleringsomregningUttrekk">
          <br />
          <Form id={'skjema'} action="reguleringsomregning" method="POST" onSubmit={handleSubmit}>
            <VStack gap="space-24">
              <HGrid columns={3} gap="space-48">
                <Box>
                  <MonthPicker {...monthpickerProps}>
                    <MonthPicker.Input
                      {...inputProps}
                      value={reguleringsdato}
                      label="Reguleringsdato"
                      error={hasError && 'Du må velge måned'}
                    />
                  </MonthPicker>
                  <input hidden type="text" name="reguleringsdato" value={reguleringsdato} readOnly />

                  <br />
                  <CheckboxGroup size={'medium'} legend={'Parametere'}>
                    <ReguleringsomregningSelector
                      label={'Iverksetting - Prioritet'}
                      navn={'prioritet'}
                      value={prioritet}
                      setSelectedValue={setPrioritet}
                      optionsmap={optionPrioritet}
                      size={'small'}
                    />
                    <ReguleringsomregningCheckbox
                      defaultChecked={fullstendigUttrekk}
                      name={'fullstendigUttrekk'}
                      value={fullstendigUttrekk}
                      onChange={setFullstendigUttrekk}
                    >
                      Fullstendig uttrekk
                    </ReguleringsomregningCheckbox>
                  </CheckboxGroup>
                  <br />
                </Box>
              </HGrid>
            </VStack>
          </Form>

          <Box>
            <br />
            <Button icon={<PlayIcon aria-hidden />} onClick={() => ref.current?.showModal()}>
              Start reguleringsomregning uttrekk
            </Button>

            <Modal
              ref={ref}
              header={{ heading: 'Start Reguleringsomregning Uttrekk' }}
              size={'medium'}
              style={{
                minWidth: '1024px',
              }}
            >
              <Modal.Body>
                <ReguleringsomregningOppsummering
                  reguleringsdato={reguleringsdato}
                  prioritet={prioritet}
                  fullstendigUttrekk={fullstendigUttrekk}
                />
                Du kan ikke angre denne handlingen.
              </Modal.Body>
              <Modal.Footer>
                <Button form={'skjema'} type="submit" disabled={isClicked}>
                  Start Reguleringsomregning Uttrekk
                </Button>
                <Button type="button" variant="secondary" onClick={() => ref.current?.close()}>
                  Tilbake
                </Button>
                <CopyButton copyText={getHumanReadableParameterText()} text="Kopier parameterliste" />
              </Modal.Footer>
            </Modal>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="Saker til Omregning">
          <div>
            <h2>Legg til saker</h2>
            <fetcher.Form method="post" action="omregningsaker">
              <Textarea
                label="Legg til saker. Oppgis med linjeskift."
                resize
                size="small"
                name="saksnummerListe"
                style={{ width: '30em' }}
              />
              <br />
              <Button variant="primary" loading={navigation.state === 'submitting'} onClick={oppdaterOmregningInput}>
                Legg til
              </Button>
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
      `reguleringsdato: ${reguleringsdato}`,
      `prioritet: ${prioritet}`,
      `fullstendigUttrekk: ${fullstendigUttrekk}`,
    ].join('\n')
  }
}
