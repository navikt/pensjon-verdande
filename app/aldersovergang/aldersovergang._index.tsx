import {
  BodyShort,
  Box,
  Button,
  Heading,
  InlineMessage,
  Label,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@navikt/ds-react'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'
import type React from 'react'
import { useMemo, useState } from 'react'
import { Form, useSubmit } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { apiGet } from '~/services/api.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import type { Route } from './+types/aldersovergang._index'

type MuligeAldersovergangerResponse = {
  maneder: string[]
  erBegrensUtplukkLovlig: boolean
  kanOverstyreBehandlingsmaned: boolean
}

type LoaderData = {
  behandlinger: BehandlingerPage
  maneder: string[]
  erBegrensUtplukkLovlig: boolean
  kanOverstyreBehandlingsmaned: boolean
  defaultMonth: string
}
export function meta(): Route.MetaDescriptors {
  return [{ title: 'Aldersovergang | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs): Promise<LoaderData> => {
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

  const aldersoverganger = await apiGet<MuligeAldersovergangerResponse>(
    '/api/aldersovergang/muligeAldersoverganger',
    request,
  )

  const currentMonth = format(new Date(), 'yyyy-MM')
  const defaultMonth = aldersoverganger.maneder.includes(currentMonth) ? currentMonth : aldersoverganger.maneder[0]

  return {
    behandlinger,
    maneder: aldersoverganger.maneder,
    erBegrensUtplukkLovlig: aldersoverganger.erBegrensUtplukkLovlig,
    kanOverstyreBehandlingsmaned: aldersoverganger.kanOverstyreBehandlingsmaned,
    defaultMonth,
  }
}

export default function BatchOpprett_index({ loaderData }: Route.ComponentProps) {
  const { behandlinger, maneder, erBegrensUtplukkLovlig, kanOverstyreBehandlingsmaned, defaultMonth } = loaderData

  const [selectedMonthStr, setSelectedMonthStr] = useState(defaultMonth)
  const selectedMonthDate = useMemo(() => parse(selectedMonthStr, 'yyyy-MM', new Date()), [selectedMonthStr])
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
      <BodyShort spacing>Velg behandlingsmåned og tidspunkt for kjøring.</BodyShort>
      {!kanOverstyreBehandlingsmaned && (
        <Box marginBlock="space-0 space-16">
          <InlineMessage status="info">
            Hvis en behandlingsmåned ikke er tilgjengelig, betyr det at det allerede er opprettet en behandling for den
            aktuelle måneden.
          </InlineMessage>
        </Box>
      )}
      <Form action="opprett" method="POST" style={{ width: '100%', maxWidth: 800 }}>
        <VStack gap="space-16" marginBlock="space-0 space-32">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 200px',
              columnGap: '1rem',
              rowGap: '0.25rem',
            }}
          >
            <Box marginBlock="space-0 space-4">
              <Label htmlFor="behandlingsmaned">Behandlingsmåned</Label>
            </Box>
            <Box marginBlock="space-0 space-4">
              <Label htmlFor="kjoeretidspunkt">
                Kjøretidspunkt {kanOverstyreBehandlingsmaned ? '(valgfritt)' : ''}
              </Label>
            </Box>

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
            <Box paddingBlock="space-8 space-0">
              <DateTimePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                minDate={minDate}
                maxDate={maxDate}
                label=""
              />
            </Box>
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
              <Box marginBlock="space-0 space-8">
                <BodyShort size="small">Behandler kun personer som ligger i utplukkstabellen.</BodyShort>
              </Box>
              <RadioGroup name="begrensetUtplukk" defaultValue="false" legend="" size="small">
                <Radio value="true">Ja</Radio>
                <Radio value="false">Nei</Radio>
              </RadioGroup>
            </div>
          )}

          {selectedMonthDate && (kanOverstyreBehandlingsmaned || selectedDate) && (
            <Box marginBlock="space-16 space-0">
              <Button type="submit" onClick={handleSubmit} variant="primary">
                Opprett
              </Button>
            </Box>
          )}
        </VStack>
      </Form>
      <Box marginBlock="space-32 space-0">
        <Heading level="2" size="medium" spacing>
          Aldersoverganger
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          behandlingerResponse={behandlinger as BehandlingerPage}
        />
      </Box>
    </div>
  )
}
