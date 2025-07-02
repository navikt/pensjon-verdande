import {
  ActionFunctionArgs,
  Form,
  useLoaderData,
  useSubmit,
} from 'react-router'
import React, { useState } from 'react'
import {
  BodyShort,
  Button,
  Heading,
  Label,
  MonthPicker,
  Select,
} from '@navikt/ds-react'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { BehandlingerPage } from '~/types'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { addYears, format, subYears } from 'date-fns'

export const loader = async ({ request }: ActionFunctionArgs) => {
  let { searchParams } = new URL(request.url)

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

  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandlinger,
  }
}

export default function BatchOpprett_index() {
  const { behandlinger } = useLoaderData<typeof loader>()

  const now = new Date()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<Date>(now)
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    submit(e.currentTarget.form)
    setIsClicked(true)
  }

  return (
    <div>
      <Form action="bpen005" method="POST" style={{ width: '100%', maxWidth: 800 }}>
        <Heading level="1" size="large" spacing>
          Start aldersovergang
        </Heading>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1.2 }}>
            <Label>Behandlingsmåned</Label>
            <BodyShort spacing size="small">
              Velg hvilken måned som skal behandles. Vanligvis inneværende måned.
            </BodyShort>
            <div style={{ padding: '0.5rem 0.75rem', marginTop: '0.5rem' }}>
              <MonthPicker.Standalone
                dropdownCaption
                defaultSelected={now}
                fromDate={subYears(now, 1)}
                toDate={addYears(now, 1)}
                onMonthSelect={(month: Date | undefined) => {
                  if (month !== undefined) {
                    setSelectedMonth(month)
                  }
                }}
              />
            </div>
            <input
              type="hidden"
              name="behandlingsmaned"
              value={selectedMonth.getFullYear() * 100 + (selectedMonth.getMonth() + 1)}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <Label>Kjøretidspunkt</Label>
              <BodyShort spacing size="small">
                Velg tidspunkt (valgfritt) for når behandlingen skal kjøres. Vanligvis etter arbeidstid.
              </BodyShort>
              <div style={{ marginTop: '0.5rem' }}>
                <DateTimePicker
                  selectedDate={selectedDate}
                  setSelectedDate={(date: Date | null) => setSelectedDate(date)}
                  labelText=""
                />
              </div>
              <input
                type="hidden"
                name="kjoeretidspunkt"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss") : ''}
              />
            </div>

            <div>
              <Label>Begrenset utplukk</Label>
              <BodyShort spacing size="small">
                Behandler kun personer som ligger i utplukkstabellen.
              </BodyShort>
              <Select
                label=""
                size="small"
                name="begrensetUtplukk"
                defaultValue="false"
                style={{ width: '100%' }}
              >
                <option value="true">Ja</option>
                <option value="false">Nei</option>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isClicked}
          onClick={handleSubmit}
          variant="primary"
        >
          Opprett
        </Button>
      </Form>

      <div id="behandlinger" style={{ marginTop: '2rem' }}>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlinger as BehandlingerPage}
        />
      </div>
    </div>
  )
}