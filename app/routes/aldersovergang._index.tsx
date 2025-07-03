import {
  ActionFunctionArgs,
  Form,
  useLoaderData,
  useSubmit,
} from 'react-router'
import React, { useEffect, useState } from 'react'
import {
  BodyShort,
  Button,
  Heading,
  HStack,
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
import { format, parse } from 'date-fns'
import { nb } from 'date-fns/locale'

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
  const [valg, setValg] = useState<string>('')
  const [maneder, setManeder] = useState<string[]>([])
  const [begrensetUtplukkEnabled, setBegrensetUtplukkEnabled] = useState<boolean>(false)

  const submit = useSubmit()

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    submit(e.currentTarget.form)
    setIsClicked(true)
  }

  useEffect(() => {
    const fetchMulige = async () => {
      if ((valg === 'skeduler' && selectedDate) || valg === 'kjorNaa') {
        try {
          const res = await fetch('/aldersovergang-mulige', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kjoeretidspunkt: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss") : null,
            }),
          })

          if (!res.ok) throw new Error('Feil fra backend')

          const data = await res.json()
          setManeder(data.maneder)
          setBegrensetUtplukkEnabled(data.erBegrensUtplukkLovlig)

          if (data.maneder.length > 0) {
            const parsed = parse(data.maneder[0], 'yyyy-MM', new Date())
            setSelectedMonth(parsed)
          }
        } catch (err) {
          console.error('Feil ved henting av mulige aldersoverganger', err)
        }
      }
    }

    fetchMulige()
  }, [valg, selectedDate])

  useEffect(() => {
    setSelectedDate(null)
    setSelectedMonth(now)
    setManeder([])
    setBegrensetUtplukkEnabled(true)
  }, [valg])

  const formattedMonth = selectedMonth ? format(selectedMonth, 'MMMM yyyy') : ''

  return (
    <div>
      <Heading level="1" size="large" spacing>
        Aldersovergang
      </Heading>
      <Form action="bpen005" method="POST" style={{ width: '100%', maxWidth: 800 }}>
        <VStack gap="4" style={{ marginBottom: '2rem' }}>
          <Label>Hva ønsker du å kjøre?</Label>
          <RadioGroup
            legend=""
            value={valg}
            onChange={(val) => setValg(val)}
            name="behandlingValg"
          >
            <Radio value="skeduler">Skedulere fremtidig aldersovergang</Radio>
            <Radio value="kjorNaa">Kjøre en aldersovergang med en gang</Radio>
          </RadioGroup>
          <input type="hidden" name="behandlingValg" value={valg} />
        </VStack>

        {valg && (
          <HStack gap="8" align="start" wrap={false} style={{ marginBottom: '2rem' }}>
            {valg === 'kjorNaa' && (
              <VStack gap="2" style={{ flex: 1.2 }}>
                <div>
                  <Label>Behandlingsmåned</Label>
                  <BodyShort size="small">
                    Velg hvilken måned som skal behandles. Vanligvis inneværende måned.
                  </BodyShort>
                </div>
                <div style={{ padding: '0.5rem 0.75rem' }}>
                  <Select
                    label=''
                    name="behandlingsmaned"
                    onChange={(e) => {
                      const date = parse(e.target.value, 'yyyy-MM', new Date())
                      setSelectedMonth(date)
                    }}
                    value={format(selectedMonth, 'yyyy-MM')}
                  >
                    {maneder.map((mnd) => (
                      <option key={mnd} value={mnd}>
                        {format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })}
                      </option>
                    ))}
                  </Select>
                </div>
                <input
                  type="hidden"
                  name="behandlingsmaned"
                  value={selectedMonth.getFullYear() * 100 + (selectedMonth.getMonth() + 1)}
                />
              </VStack>
            )}

            <VStack gap="6" style={{ flex: 1 }}>
              {valg === 'skeduler' && (
                <VStack gap="2">
                  <Label>Kjøretidspunkt</Label>
                  <BodyShort size="small">
                    Velg tidspunkt for når behandlingen skal kjøres. Vanligvis etter arbeidstid.
                  </BodyShort>
                  <DateTimePicker
                    selectedDate={selectedDate}
                    setSelectedDate={(date: Date | null) => setSelectedDate(date)}
                    labelText=""
                  />
                  <input
                    type="hidden"
                    name="kjoeretidspunkt"
                    value={selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss") : ''}
                  />
                  {selectedDate && (
                    <BodyShort size="small">
                      Behandlingsmåned for dette kjøretidspunktet blir{' '}
                      <strong>{format(selectedMonth, 'MMMM yyyy', { locale: nb })}</strong>
                    </BodyShort>
                  )}
                </VStack>
              )}

              {begrensetUtplukkEnabled && (
                <VStack gap="2">
                  <Label>Begrenset utplukk</Label>
                  <BodyShort size="small">
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
                </VStack>
              )}
            </VStack>
          </HStack>
        )}

        {valg && (
          <Button
            type="submit"
            disabled={isClicked}
            onClick={handleSubmit}
            variant="primary"
          >
            Opprett
          </Button>
        )}
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