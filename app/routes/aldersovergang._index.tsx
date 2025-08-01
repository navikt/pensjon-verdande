import {
  LoaderFunctionArgs,
  useLoaderData,
  useSubmit,
  Form,
} from 'react-router'
import React, { useMemo, useState } from 'react'
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Label,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@navikt/ds-react'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { BehandlingerPage } from '~/types'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'
import { hentMuligeAldersoverganger } from '~/services/behandling.aldersovergang.server'

type LoaderData = {
  behandlinger: BehandlingerPage
  maneder: string[]
  erBegrensUtplukkLovlig: boolean
  kanOverstyreBehandlingsmaned: boolean
  defaultMonth: string
}
export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)

  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'AldersovergangIdentifiserBruker',
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    page: page ? +page : 0,
    size: size ? +size : 5,
    sort: searchParams.get('sort'),
  })

  const aldersoverganger = await hentMuligeAldersoverganger(accessToken)

  const currentMonth = format(new Date(), 'yyyy-MM')
  const defaultMonth = aldersoverganger.maneder.includes(currentMonth)
    ? currentMonth
    : aldersoverganger.maneder[0]

  return {
    behandlinger,
    maneder: aldersoverganger.maneder,
    erBegrensUtplukkLovlig: aldersoverganger.erBegrensUtplukkLovlig,
    kanOverstyreBehandlingsmaned: aldersoverganger.kanOverstyreBehandlingsmaned,
    defaultMonth,
  }
}

export default function BatchOpprett_index() {
  const {
    behandlinger,
    maneder,
    erBegrensUtplukkLovlig,
    kanOverstyreBehandlingsmaned,
    defaultMonth,
  } = useLoaderData<typeof loader>()

  const [selectedMonthStr, setSelectedMonthStr] = useState(defaultMonth)
  const selectedMonthDate = useMemo(
    () => parse(selectedMonthStr, 'yyyy-MM', new Date()),
    [selectedMonthStr]
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const submit = useSubmit()

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    submit(e.currentTarget.form)
  }

  const minDate = kanOverstyreBehandlingsmaned ? undefined : startOfMonth(selectedMonthDate)
  const maxDate = kanOverstyreBehandlingsmaned ? undefined : endOfMonth(selectedMonthDate)

  return (
    <div>
      <Heading level="1" size="large" spacing>
        Aldersovergang
      </Heading>

      <BodyShort spacing>
        Velg behandlingsmåned og tidspunkt for kjøring.
      </BodyShort>

      {!kanOverstyreBehandlingsmaned && (
        <Alert variant="info" inline style={{ marginBottom: '1rem' }}>
          Hvis en behandlingsmåned ikke er tilgjengelig, betyr det at det allerede er opprettet en behandling for den
          aktuelle måneden.
        </Alert>
      )}

      <Form action="opprett" method="POST" style={{ width: '100%', maxWidth: 800 }}>
        <VStack gap="4" style={{ marginBottom: '2rem' }}>
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
                id="behandlingsmaned"
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
          </div>

          {selectedMonthDate && (
            <>
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
            </>
          )}

          {selectedMonthDate && erBegrensUtplukkLovlig && (
            <div>
              <Label>Begrenset utplukk</Label>
              <BodyShort size="small" style={{ marginBottom: '0.5rem' }}>
                Behandler kun personer som ligger i utplukkstabellen.
              </BodyShort>
              <RadioGroup
                name="begrensetUtplukk"
                defaultValue="false"
                legend=""
                size="small"
              >
                <Radio value="true">Ja</Radio>
                <Radio value="false">Nei</Radio>
              </RadioGroup>
            </div>
          )}

          {selectedMonthDate && (kanOverstyreBehandlingsmaned || selectedDate) && (
            <div style={{ marginTop: '1rem' }}>
              <Button
                type="submit"
                onClick={handleSubmit}
                variant="primary"
              >
                Opprett
              </Button>
            </div>
          )}
        </VStack>
      </Form>

      <div id="behandlinger" style={{ marginTop: '2rem' }}>
        <Heading level="2" size="medium" spacing>
          Aldersoverganger
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlinger as BehandlingerPage}
        />
      </div>
    </div>
  )
}