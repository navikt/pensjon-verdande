import { Alert, BodyShort, Button, Heading, Radio, RadioGroup, Select, Textarea, VStack } from '@navikt/ds-react'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'
import type React from 'react'
import { useMemo, useState } from 'react'
import { Form, type LoaderFunctionArgs, useLoaderData, useSubmit } from 'react-router'
import { hentMuligeAldersoverganger } from '~/aldersovergang/behandling.aldersovergang.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'

type LoaderData = {
  behandlinger: BehandlingerPage
  maneder: string[]
  begrensetUtplukk: {
    erLovlig: boolean
    fnrListe: string[]
  }
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
  const defaultMonth = aldersoverganger.maneder.includes(currentMonth) ? currentMonth : aldersoverganger.maneder[0]

  return {
    behandlinger,
    maneder: aldersoverganger.maneder,
    begrensetUtplukk: aldersoverganger.begrensetUtplukk,
    kanOverstyreBehandlingsmaned: aldersoverganger.kanOverstyreBehandlingsmaned,
    defaultMonth,
  }
}

const FNR_REGEX = /^\d{11}$/

export default function BatchOpprett_index() {
  const { behandlinger, maneder, begrensetUtplukk, kanOverstyreBehandlingsmaned, defaultMonth } =
    useLoaderData<typeof loader>()

  const [selectedMonthStr, setSelectedMonthStr] = useState(defaultMonth)
  const selectedMonthDate = useMemo(() => parse(selectedMonthStr, 'yyyy-MM', new Date()), [selectedMonthStr])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const submit = useSubmit()

  const [begrensetUtplukkValg, setBegrensetUtplukkValg] = useState(false)
  const [fnrText, setFnrText] = useState<string>(() => (begrensetUtplukk?.fnrListe ?? []).join('\n'))

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    submit(e.currentTarget.form)
  }

  const minDate = kanOverstyreBehandlingsmaned ? undefined : startOfMonth(selectedMonthDate)
  const maxDate = kanOverstyreBehandlingsmaned ? undefined : endOfMonth(selectedMonthDate)

  const visBegrensetUtplukk = Boolean(selectedMonthDate && begrensetUtplukk?.erLovlig)

  const parsedFnrListe = useMemo(() => {
    const list = fnrText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [fnrText])

  const ugyldigeFnr = useMemo(() => parsedFnrListe.filter((fnr) => !FNR_REGEX.test(fnr)), [parsedFnrListe])

  const opprettDisabled = begrensetUtplukkValg && (parsedFnrListe.length === 0 || ugyldigeFnr.length > 0)

  return (
    <div>
      <Heading level="1" size="large" spacing>
        Aldersovergang
      </Heading>

      <BodyShort spacing>Velg behandlingsmåned og tidspunkt for kjøring.</BodyShort>

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
            <Select
              onChange={(e) => {
                setSelectedMonthStr(e.target.value)
                setSelectedDate(null)
              }}
              value={selectedMonthStr}
              size="small"
              label="Behandlingsmåned"
              style={{ width: '100%' }}
            >
              {maneder.map((mnd) => (
                <option key={mnd} value={mnd}>
                  {format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })}
                </option>
              ))}
            </Select>

            <div style={{ paddingTop: '7px' }}>
              <DateTimePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                minDate={minDate}
                maxDate={maxDate}
                label={`Kjøretidspunkt ${kanOverstyreBehandlingsmaned ? '(valgfritt)' : ''}`}
              />
            </div>
          </div>

          {selectedMonthDate && (
            <>
              {selectedDate && (
                <input type="hidden" name="kjoeretidspunkt" value={format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss")} />
              )}
              <input
                type="hidden"
                name="behandlingsmaned"
                value={selectedMonthDate.getFullYear() * 100 + (selectedMonthDate.getMonth() + 1)}
              />
            </>
          )}

          {visBegrensetUtplukk && (
            <div>
              <RadioGroup
                name="begrensetUtplukk"
                value={begrensetUtplukkValg ? 'true' : 'false'}
                onChange={(value) => setBegrensetUtplukkValg(value === 'true')}
                legend="Begrenset utplukk"
                size="small"
              >
                <Radio value="true">Ja</Radio>
                <Radio value="false">Nei</Radio>
              </RadioGroup>

              {begrensetUtplukkValg && (
                <div style={{ marginTop: '0.75rem' }}>
                  <Textarea
                    label="Personer som skal inngå i kjøringen."
                    description="Ett fødselsnummer per linje (11 siffer)."
                    value={fnrText}
                    onChange={(e) => setFnrText(e.target.value)}
                    minRows={8}
                  />

                  {ugyldigeFnr.length > 0 && (
                    <Alert variant="error" inline style={{ marginTop: '0.5rem' }}>
                      Ugyldig fødselsnummer (må være 11 siffer): {ugyldigeFnr.join(', ')}
                    </Alert>
                  )}

                  <input type="hidden" name="begrensetUtplukkFnrListe" value={JSON.stringify(parsedFnrListe)} />
                </div>
              )}
            </div>
          )}

          {selectedMonthDate && (kanOverstyreBehandlingsmaned || selectedDate) && (
            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" onClick={handleSubmit} variant="primary" disabled={opprettDisabled}>
                Opprett
              </Button>
            </div>
          )}
        </VStack>
      </Form>

      <div style={{ marginTop: '2rem' }}>
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
