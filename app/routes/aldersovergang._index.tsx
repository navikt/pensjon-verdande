import { ActionFunctionArgs, Form, useLoaderData, useSubmit } from 'react-router'
import React, { useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Heading, Label, Radio, RadioGroup, Select, VStack } from '@navikt/ds-react'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { BehandlingerPage } from '~/types'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'

export const loader = async ({ request }: ActionFunctionArgs) => {
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

  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandlinger }
}

export default function BatchOpprett_index() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>('')
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [maneder, setManeder] = useState<string[]>([])
  const [begrensetUtplukkEnabled, setBegrensetUtplukkEnabled] = useState(false)
  const [kanOverstyre, setKanOverstyre] = useState(false)

  const submit = useSubmit()

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    submit(e.currentTarget.form)
  }

  useEffect(() => {
    const fetchMulige = async () => {
      try {
        const res = await fetch('/aldersovergang-mulige')
        if (!res.ok) throw new Error('Feil fra backend')

        const data = await res.json()
        setManeder(data.maneder)
        setBegrensetUtplukkEnabled(data.erBegrensUtplukkLovlig)
        setKanOverstyre(data.kanOverstyreBehandlingsmaned)

        const currentMonth = format(new Date(), 'yyyy-MM')
        const defaultMonth = data.maneder.includes(currentMonth)
          ? currentMonth
          : data.maneder[0]

        setSelectedMonthStr(defaultMonth)
        setSelectedMonthDate(parse(defaultMonth, 'yyyy-MM', new Date()))
      } catch (err) {
        console.error('Feil ved henting av mulige aldersoverganger', err)
      }
    }

    fetchMulige()
  }, [])

  useEffect(() => {
    if (selectedMonthStr) {
      setSelectedMonthDate(parse(selectedMonthStr, 'yyyy-MM', new Date()))
    }
  }, [selectedMonthStr])

  const minDate = kanOverstyre ? undefined : selectedMonthDate ? startOfMonth(selectedMonthDate) : undefined
  const maxDate = kanOverstyre ? undefined : selectedMonthDate ? endOfMonth(selectedMonthDate) : undefined

  return (
    <div>
      <Heading level="1" size="large" spacing>
        Aldersovergang
      </Heading>

      <BodyShort spacing>
        Velg behandlingsmåned og tidspunkt for kjøring.
      </BodyShort>

      {!kanOverstyre && (
        <Alert variant="info" inline style={{ marginBottom: '1rem' }}>
          Hvis en behandlingsmåned ikke er tilgjengelig, betyr det at det allerede er opprettet en behandling for den
          aktuelle måneden.
        </Alert>
      )}

      <Form action="bpen005" method="POST" style={{ width: '100%', maxWidth: 800 }}>
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
                Kjøretidspunkt {kanOverstyre ? '(valgfritt)' : ''}
              </Label>
            </div>

            <div>
              <Select
                id="behandlingsmaned"
                onChange={(e) => setSelectedMonthStr(e.target.value)}
                value={selectedMonthStr}
                required
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
              {selectedMonthDate && (
                <DateTimePicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  labelText=""
                />
              )}
            </div>
          </div>

          {selectedMonthDate && (
            <>
              <input
                type="hidden"
                name="kjoeretidspunkt"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd\'T\'HH:mm:ss') : ''}
              />
              <input
                type="hidden"
                name="behandlingsmaned"
                value={selectedMonthDate.getFullYear() * 100 + (selectedMonthDate.getMonth() + 1)}
              />
            </>
          )}

          {selectedMonthDate && begrensetUtplukkEnabled && (
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

          {selectedMonthDate && (kanOverstyre || selectedDate) && (
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
          Tidligere aldersoverganger
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