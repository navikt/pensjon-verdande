import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HelpText,
  HStack,
  Select,
  VStack,
} from '@navikt/ds-react'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { type ActionFunctionArgs, Form, type LoaderFunctionArgs, useLoaderData, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import {
  getSisteAvsjekk,
  hentMuligeManedligeKjoringer,
  opprettAvsjekk,
  type SisteAvsjekkResponse,
} from '~/opptjening/opptjening.manedlig.omregning.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'

type LoaderData = {
  behandlinger: BehandlingerPage
  kanOverstyre: boolean
  maneder: string[]
  defaultMonth: string
  sisteAvsjekk: SisteAvsjekkResponse | null
}

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)

  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'OpptjeningIdentifiserKategoriManedlig',
    status: searchParams.get('status'),
    page: page ? +page : 0,
    size: size ? +size : 12,
    sort: searchParams.get('sort'),
  })

  const sisteAvsjekk = await getSisteAvsjekk(accessToken)

  const muligeManedligeKjoringer = await hentMuligeManedligeKjoringer(accessToken)

  const currentMonth = format(new Date(), 'yyyy-MM')
  const defaultMonth = muligeManedligeKjoringer.maneder.includes(currentMonth)
    ? currentMonth
    : muligeManedligeKjoringer.maneder[0]

  return {
    behandlinger,
    kanOverstyre: muligeManedligeKjoringer.kanOverstyre,
    maneder: muligeManedligeKjoringer.maneder,
    defaultMonth,
    sisteAvsjekk,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  await opprettAvsjekk(accessToken)
  return null
}

export default function OpprettEndretOpptjeningRoute() {
  const { behandlinger, maneder, kanOverstyre, defaultMonth, sisteAvsjekk } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [selectedMonthStr, setSelectedMonthStr] = useState(defaultMonth)
  const selectedMonthDate = useMemo(() => parse(selectedMonthStr, 'yyyy-MM', new Date()), [selectedMonthStr])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [avsjekkForKjoring, setAvsjekkForKjoring] = useState(false)

  const minDate = kanOverstyre ? undefined : startOfMonth(selectedMonthDate)
  const maxDate = kanOverstyre ? undefined : endOfMonth(selectedMonthDate)

  return (
    <div>
      <Heading level="1" size="large">
        Månedlig omregning av ytelse ved oppdaterte opptjeningsopplysninger
      </Heading>

      <BodyShort spacing style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
        Velg behandlingsmåned og tidspunkt for kjøring.
      </BodyShort>

      {!kanOverstyre && (
        <Alert variant="info" inline style={{ marginBottom: '1rem' }}>
          Hvis en behandlingsmåned ikke er tilgjengelig, betyr det at det allerede er opprettet en behandling for den
          aktuelle måneden.
        </Alert>
      )}

      <Form action="opprett" method="post" style={{ width: '100%', maxWidth: 800 }}>
        <VStack gap={'4'}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '250px 250px 250px',
              columnGap: '1rem',
              rowGap: '0.25rem',
            }}
          >
            <Select
              onChange={(e) => {
                setSelectedMonthStr(e.target.value)
                setSelectedDate(null)
              }}
              value={selectedMonthStr}
              size="small"
              label="Behandlingsmåned"
            >
              {maneder.map((mnd) => (
                <option key={mnd} value={mnd}>
                  {format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })}
                </option>
              ))}
            </Select>

            <DateTimePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
              label="Kjøretidspunkt (valgfritt)"
            />

            {kanOverstyre && (
              <HStack>
                <CheckboxGroup legend="Avsjekk før kjøring" size={'small'}>
                  <Checkbox
                    value="true"
                    checked={avsjekkForKjoring}
                    onChange={(e) => setAvsjekkForKjoring(e.target.checked)}
                  >
                    Ja
                  </Checkbox>
                </CheckboxGroup>

                <HelpText title="beskrivelse for avhuking" placement="top">
                  Dersom denne hukes av vil en behandling for avskjekk av hendelser mellom PEN og POPP også starte med
                  behandlingen for omregning. For schedulering kan det være nyttig at denne hukes av da den vil gi oss
                  en feilende behandling dersom avsjekken viser differanse. Den vil dog IKKE være stoppende for
                  omregningsbehandlingen.
                </HelpText>
              </HStack>
            )}

            <input
              type="hidden"
              name="kjoeretidspunkt"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss") : ''}
            />
            <input
              type="hidden"
              name="behandlingsmaned"
              value={selectedMonthDate.getFullYear() * 100 + (selectedMonthDate.getMonth() + 1)}
            />
            <input type="hidden" name="avsjekkForKjoring" value={avsjekkForKjoring ? 'true' : 'false'} />
          </div>
          <HStack gap={'4'}>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              Opprett
            </Button>
            <Form method="POST" navigate={false}>
              <Button type="submit" disabled={isSubmitting} variant="secondary">
                Kjør avsjekk
              </Button>
            </Form>
          </HStack>
        </VStack>
      </Form>

      {sisteAvsjekk === null && (
        <Alert variant="info" inline style={{ marginBottom: '1rem', marginTop: '1rem' }}>
          Ingen avsjekk gjort
        </Alert>
      )}

      {sisteAvsjekk !== null && sisteAvsjekk?.avsjekkOk === false && (
        <Alert variant="error" inline style={{ marginBottom: '1rem', marginTop: '1rem' }}>
          Siste avsjekk {sisteAvsjekk.sisteAvsjekkTidspunkt} var ikke OK. PEN har mottatt{' '}
          {sisteAvsjekk.antallHendelserPen}, POPP har sendt {sisteAvsjekk.antallHendelserPopp}
        </Alert>
      )}

      {sisteAvsjekk !== null && sisteAvsjekk?.avsjekkOk === true && (
        <Alert variant="success" inline style={{ marginBottom: '1rem', marginTop: '1rem' }}>
          Siste avsjekk {format(sisteAvsjekk.sisteAvsjekkTidspunkt, "dd.MM.yyyy 'kl.' HH:mm:ss")} var OK. Vi har mottatt{' '}
          {sisteAvsjekk.antallHendelserPen} hendelser.
        </Alert>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Heading level="2" size="medium" spacing>
          Eksisterende behandlinger
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          visAnsvarligTeamSoek={false}
          behandlingerResponse={behandlinger as BehandlingerPage}
        />
      </div>
    </div>
  )
}
