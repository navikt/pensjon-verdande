import { ActionFunctionArgs, Form, useLoaderData, useSubmit } from 'react-router'
import React, { useEffect, useRef, useState } from 'react'
import { MonthPicker, Select } from '@navikt/ds-react'
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
    behandlinger: behandlinger,
  }
}

export default function BatchOpprett_index() {
  const { behandlinger } = useLoaderData<typeof loader>()

  const now = new Date()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<Date>(now)
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e: any) => {
    submit(e.target.form)
    setIsClicked(true)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.width = `${inputRef.current.value.length + 1}ch`
    }
  }

  useEffect(() => {
    handleInput()
  })

  return (
    <div>
      <h1>Start aldersovergang</h1>
      <Form action="bpen005" method="POST">
        <br />
        <label><b>Behandlingsmåned</b></label>
        <br />
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
        <input
          type="hidden"
          name="behandlingsmaned"
          defaultValue={now.getFullYear() * 100 + now.getMonth() + 1}
          value={selectedMonth.getFullYear() * 100 + now.getMonth() + 1}
        />

        <br />
        <label><b>Kjøretidspunkt</b></label>
        <DateTimePicker
          selectedDate={selectedDate}
          setSelectedDate={(date: Date | null) => setSelectedDate(date)}
          labelText={''}
        />
        <input
          type="hidden"
          name="kjoeretidspunkt"
          value={selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss") : ''}
        />

        <label><b>Begrenset utplukk</b></label>
        <br />
        <Select style={{width: '200px'}}
          label=''
          size={'small'}
          name={'begrensetUtplukk'}
          defaultValue={'false'}
        >
          <option value="true">Ja</option>
          <option value="false">Nei</option>
        </Select>

        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>
      <div id="behandlinger">
        <BehandlingerTable visStatusSoek={true} visBehandlingTypeSoek={false} behandlingerResponse={behandlinger as BehandlingerPage} />
      </div>
    </div>
  )
}
