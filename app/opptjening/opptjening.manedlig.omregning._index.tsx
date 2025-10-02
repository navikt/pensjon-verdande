import { Alert, BodyShort, Button, Heading, Label, Select, VStack } from '@navikt/ds-react'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { Form, type LoaderFunctionArgs, useLoaderData, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { hentMuligeManedligeKjoringer } from '~/opptjening/opptjening.manedlig.omregning.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'

type LoaderData = {
  behandlinger: BehandlingerPage
  kanOverstyreBehandlingsmaned: boolean
  maneder: string[]
  defaultMonth: string
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

  const muligeManedligeKjoringer = await hentMuligeManedligeKjoringer(accessToken)

  const currentMonth = format(new Date(), 'yyyy-MM')
  const defaultMonth = muligeManedligeKjoringer.maneder.includes(currentMonth)
    ? currentMonth
    : muligeManedligeKjoringer.maneder[0]

  return {
    behandlinger,
    kanOverstyreBehandlingsmaned: muligeManedligeKjoringer.kanOverstyreBehandlingsmaned,
    maneder: muligeManedligeKjoringer.maneder,
    defaultMonth,
  }
}

export default function OpprettEndretOpptjeningRoute() {
  const { behandlinger, maneder, kanOverstyreBehandlingsmaned, defaultMonth } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [selectedMonthStr, setSelectedMonthStr] = useState(defaultMonth)
  const selectedMonthDate = useMemo(() => parse(selectedMonthStr, 'yyyy-MM', new Date()), [selectedMonthStr])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const minDate = kanOverstyreBehandlingsmaned ? undefined : startOfMonth(selectedMonthDate)
  const maxDate = kanOverstyreBehandlingsmaned ? undefined : endOfMonth(selectedMonthDate)

  return (
    <div>
      <Heading level="1" size="large">
        Månedlig omregning av ytelse ved oppdaterte opptjeningsopplysninger
      </Heading>

      <BodyShort spacing>Velg behandlingsmåned og tidspunkt for kjøring.</BodyShort>

      {!kanOverstyreBehandlingsmaned && (
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
              gridTemplateColumns: '200px 200px',
              columnGap: '1rem',
              rowGap: '0.25rem',
            }}
          >
            <div>
              <Label htmlFor="behandlingsmaned" style={{ marginBottom: '0.25rem' }}>
                Behandlingsmåned
              </Label>
            </div>
            <div>
              <Label htmlFor="kjoeretidspunkt" style={{ marginBottom: '0.25rem' }}>
                Kjøretidspunkt {kanOverstyreBehandlingsmaned ? '(valgfritt)' : ''}
              </Label>
            </div>

            <div>
              <Select
                onChange={(e) => {
                  setSelectedMonthStr(e.target.value)
                  setSelectedDate(null)
                }}
                value={selectedMonthStr}
                size="small"
                label=""
                style={{ width: '100%' }}
              >
                {maneder.map((mnd) => (
                  <option key={mnd} value={mnd}>
                    {format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ paddingTop: '7px' }}>
              <DateTimePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                minDate={minDate}
                maxDate={maxDate}
                labelText=""
              />
            </div>

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
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Button type="submit" disabled={isSubmitting} variant="primary">
              Opprett
            </Button>
          </div>
        </VStack>
      </Form>

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
