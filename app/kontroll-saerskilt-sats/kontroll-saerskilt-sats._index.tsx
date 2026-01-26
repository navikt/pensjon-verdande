import {Alert, Button, Heading, HStack, Modal, Select, TextField, VStack} from '@navikt/ds-react'
import { useMemo, useRef, useState } from 'react'
import { endOfMonth, format, parse, startOfDay, startOfMonth } from 'date-fns'
import { nb } from 'date-fns/locale'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Form, redirect, useLoaderData, useNavigation } from 'react-router'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import { opprettKontrollereSaerskiltSatsBehandling } from '~/kontroll-saerskilt-sats/kontroll-saerskilt-sats.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const response = await opprettKontrollereSaerskiltSatsBehandling({
    kjoereMaaned: updates.kjoereMaaned as string,
    kontrollAar: updates.kontrollAar as string,
    oensketVirkMaaned: updates.oensketVirkMaaned ? (updates.oensketVirkMaaned as string) : undefined,
    kjoeretidspunkt: updates.kjoeretidspunkt ? (updates.kjoeretidspunkt as string) : undefined,
  }, request)

  return redirect(`/behandling/${response.behandlingId}`)
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const { searchParams } = new URL(request.url)

  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'KontrollerSaerskiltSats_Utplukk',
    status: searchParams.get('status'),
    page: +(searchParams.get('page') ?? 0),
    size: +(searchParams.get('size') ?? 5),
    sort: searchParams.get('sort'),
  })

  return { behandlinger: behandlinger as BehandlingerPage }
}

const genererManedsalternativer = () => {
  const now = new Date()
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return format(d, 'yyyy-MM')
  })
}

export default function OpprettKontrollSaerskiltSatsRoute() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const modalRef = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [selectedKjoereMaaned, setSelectedKjoereMaaned] = useState('')
  const [selectedKjoeretidspunkt, setSelectedKjoeretidspunkt] = useState<Date | null>(null)
  const [selectedOensketVirkMaaned, setSelectedOensketVirkMaaned] = useState('')

  const maneder = useMemo(genererManedsalternativer, [])
  const today = useMemo(() => startOfDay(new Date()), [])

  const kjoereMaanedYearMonth = selectedKjoereMaaned ? parse(selectedKjoereMaaned, 'yyyy-MM', new Date()) : null
  const kontrollAar = kjoereMaanedYearMonth ? (kjoereMaanedYearMonth.getFullYear() - 1).toString() : ''

  const kjoretidspunktMinDate = useMemo(() => {
    if (!kjoereMaanedYearMonth) return today
    const monthStart = startOfMonth(kjoereMaanedYearMonth)
    return monthStart > today ? monthStart : today
  }, [kjoereMaanedYearMonth, today])

  const kjoretidspunktMaxDate = kjoereMaanedYearMonth ? endOfMonth(kjoereMaanedYearMonth) : undefined

  const kanOpprette = selectedKjoereMaaned !== '' && !isSubmitting


  const formatYearMonth = (mnd: string) => format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })

  return (
    <div>
      <Heading level="1" size="large">
        Kontrollere særskilt sats
      </Heading>

      <Form id="skjema" method="post">
        <VStack gap="space-4">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '250px 140px 250px 250px',
                columnGap: '1rem',
                rowGap: '0.75rem',
                paddingTop: '0.5rem',
              }}
            >
              <Select
                label="Kjøremåned"
                size="small"
                value={selectedKjoereMaaned}
                onChange={(e) => {
                  setSelectedKjoereMaaned(e.target.value)
                  setSelectedKjoeretidspunkt(null)
                }}
              >
                <option value="" disabled>
                  Velg måned
                </option>
                {maneder.map((m) => (
                  <option key={m} value={m}>
                    {formatYearMonth(m)}
                  </option>
                ))}
              </Select>
              <input hidden name="kjoereMaaned" readOnly value={selectedKjoereMaaned} />

              <TextField label="Kontrollår" size="small" value={kontrollAar} readOnly />
              <input hidden name="kontrollAar" readOnly value={kontrollAar} />

              <Select
                label="Ønsket virkningmåned (valgfritt)"
                size="small"
                value={selectedOensketVirkMaaned}
                onChange={(e) => setSelectedOensketVirkMaaned(e.target.value)}
              >
                <option value="">Ikke sett</option>
                {maneder.map((m) => (
                  <option key={m} value={m}>
                    {formatYearMonth(m)}
                  </option>
                ))}
              </Select>
              <input hidden name="oensketVirkMaaned" readOnly value={selectedOensketVirkMaaned} />

              <DateTimePicker
                selectedDate={selectedKjoeretidspunkt}
                setSelectedDate={setSelectedKjoeretidspunkt}
                minDate={kjoretidspunktMinDate}
                maxDate={kjoretidspunktMaxDate}
                label="Kjøretidspunkt (valgfritt)"
              />
              <input
                type="hidden"
                name="kjoeretidspunkt"
                value={selectedKjoeretidspunkt ? format(selectedKjoeretidspunkt, "yyyy-MM-dd'T'HH:mm:ss") : ''}
              />
            </div>

          <Alert variant="info" size="small" style={{ visibility: kanOpprette ? 'hidden' : 'visible' }}>
            Kjøremåned må velges før behandlingen opprettes.
          </Alert>

          <HStack gap="space-4">
            <Button type="button" onClick={() => modalRef.current?.showModal()} disabled={!kanOpprette}>
              Opprett kontroll
            </Button>
          </HStack>
        </VStack>
      </Form>

      <div style={{ marginTop: '2rem' }}> {/* Sikrer at knappen ikke flytter seg */}
        <Heading level="2" size="medium" spacing>
          Eksisterende behandlinger
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          visAnsvarligTeamSoek={false}
          behandlingerResponse={behandlinger}
        />
      </div>

      <Modal ref={modalRef} header={{ heading: 'Start kontroll: særskilt sats' }} size="small">
        <Modal.Body>
          <VStack gap="space-4">
            <div>
              <b>Kjøremåned:</b> {kjoereMaanedYearMonth ? formatYearMonth(selectedKjoereMaaned) : '-'}
            </div>
            <div>
              <b>Kontrollår:</b> {kontrollAar || '-'}
            </div>
            <div>
              <b>Kjøretidspunkt:</b>{' '}
              {selectedKjoeretidspunkt ? format(selectedKjoeretidspunkt, "dd.MM.yyyy 'kl.' HH:mm:ss") : 'nå'}
            </div>
            <div>
              <b>Ønsket virkningmåned:</b> {selectedOensketVirkMaaned ? formatYearMonth(selectedOensketVirkMaaned) : 'ikke satt'}
            </div>
            <Alert variant="warning" size="small">
              Etter start kan du ikke angre denne handlingen.
            </Alert>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button form="skjema" type="submit" disabled={!kanOpprette || isSubmitting} loading={isSubmitting}>
            Start behandling
          </Button>
          <Button type="button" variant="secondary" onClick={() => modalRef.current?.close()}>
            Tilbake
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
