import { Alert, Button, Heading, HStack, Modal, Select, VStack } from '@navikt/ds-react'
import { format, parse } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { opprettKontrollereAfpStatEtter65Behandling } from '~/kontroll-afp-stat-etter-65/kontroll-afp-stat-etter-65.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import type { Route } from './+types/kontroll-afp-stat-etter-65._index'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const fomMaaned = updates.fomMaaned as string
  const antallMaaneder = parseInt(updates.antallMaaneder as string, 10)

  const response = await opprettKontrollereAfpStatEtter65Behandling(
    {
      fomMaaned,
      antallMaaneder,
    },
    request,
  )

  const behandlingIds = response?.behandlingIds ?? []

  if (behandlingIds.length === 0) {
    return { error: 'Ingen behandlinger ble opprettet.' }
  }

  if (behandlingIds.length === 1) {
    return redirect(`/behandling/${behandlingIds[0]}`)
  }

  return { success: true, antallOpprettet: behandlingIds.length }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const accessToken = await requireAccessToken(request)
  const { searchParams } = new URL(request.url)

  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'AFPStat65Kontroll',
    status: searchParams.get('status'),
    page: +(searchParams.get('page') ?? 0),
    size: +(searchParams.get('size') ?? 5),
    sort: searchParams.get('sort'),
  })

  return { behandlinger: behandlinger as BehandlingerPage }
}

const KJOEREDAG = 6 // matcher dagen som behandlingen kjører hver maned

const genererManedsalternativer = () => {
  const now = new Date()
  const offset = now.getDate() < KJOEREDAG ? 0 : 1
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + offset, 1)
    return format(d, 'yyyy-MM')
  })
}

export default function OpprettKontrollAfpStatEtter65Route() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const modalRef = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [selectedFomMaaned, setSelectedFomMaaned] = useState('')
  const [antallMaaneder, setAntallMaaneder] = useState('1')

  const maneder = useMemo(genererManedsalternativer, [])

  const kanOpprette = selectedFomMaaned !== '' && !isSubmitting

  const formatYearMonth = (mnd: string) => format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })

  const feilmelding = actionData && 'error' in actionData ? actionData.error : null
  const suksessmelding =
    actionData && 'success' in actionData ? `${actionData.antallOpprettet} behandlinger ble opprettet.` : null

  // Lukk modal ved oppretting av flere behandlinger samtidig
  useEffect(() => {
    if (suksessmelding) {
      modalRef.current?.close()
    }
  }, [suksessmelding])

  return (
    <div>
      <Heading level="1" size="large">
        Kontroll AFP Stat etter 65 år
      </Heading>

      <Form id="skjema" method="post">
        <VStack gap="4">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '250px 200px',
              columnGap: '1rem',
              rowGap: '0.75rem',
              paddingTop: '0.5rem',
            }}
          >
            <Select
              label="Fra og med måned"
              size="small"
              value={selectedFomMaaned}
              onChange={(e) => setSelectedFomMaaned(e.target.value)}
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
            <input hidden name="fomMaaned" readOnly value={selectedFomMaaned} />

            <Select
              label="Antall måneder å opprette"
              size="small"
              value={antallMaaneder}
              onChange={(e) => setAntallMaaneder(e.target.value)}
              name="antallMaaneder"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>

          <Alert variant="info" size="small" style={{ visibility: kanOpprette ? 'hidden' : 'visible' }}>
            Fra og med måned må velges før behandlingen opprettes.
          </Alert>

          {feilmelding && (
            <Alert variant="error" size="small">
              {feilmelding}
            </Alert>
          )}

          <HStack gap="4">
            <Button type="button" onClick={() => modalRef.current?.showModal()} disabled={!kanOpprette}>
              Opprett kontroll
            </Button>
          </HStack>
        </VStack>
      </Form>

      {suksessmelding && (
        <Alert variant="success" size="small" style={{ marginTop: '1rem' }}>
          {suksessmelding}
        </Alert>
      )}

      {/* Sikrer at knappen ikke flytter seg */}
      <div style={{ marginTop: '2rem' }}>
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

      <Modal ref={modalRef} header={{ heading: 'Start AFP Stat 65 års Kontroll' }} size="small">
        <Modal.Body>
          <VStack gap="4">
            <div>
              <b>Fra og med måned:</b> {selectedFomMaaned ? formatYearMonth(selectedFomMaaned) : '-'}
            </div>
            <div>
              <b>Antall måneder å opprette:</b> {antallMaaneder}
            </div>
            {selectedFomMaaned && (
              <div>
                <b>Måneder som opprettes:</b>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {Array.from({ length: parseInt(antallMaaneder, 10) }, (_, i) => {
                    const startDate = parse(selectedFomMaaned, 'yyyy-MM', new Date())
                    const d = new Date(startDate)
                    d.setMonth(d.getMonth() + i)
                    return <li key={i}>{format(d, 'MMMM yyyy', { locale: nb })}</li>
                  })}
                </ul>
              </div>
            )}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button form="skjema" type="submit" disabled={!kanOpprette || isSubmitting} loading={isSubmitting}>
            Start behandling{parseInt(antallMaaneder, 10) > 1 ? 'er' : ''}
          </Button>
          <Button type="button" variant="secondary" onClick={() => modalRef.current?.close()}>
            Tilbake
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
