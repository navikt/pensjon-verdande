import { Alert, Button, Heading, HStack, Modal, Select, VStack } from '@navikt/ds-react'
import { format, parse } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useMemo, useRef, useState } from 'react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import {
  opprettKontrollereAfpStatEtter65Behandling
} from '~/kontroll-afp-stat-etter-65/kontroll-afp-stat-etter-65.server'

export const action = async ({ request }: ActionFunctionArgs) => {
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

  if (behandlingIds.length === 1) {
    return redirect(`/behandling/${behandlingIds[0]}`)
  }

  return { behandlingIds }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

const genererManedsalternativer = () => {
  const now = new Date()
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return format(d, 'yyyy-MM')
  })
}

export default function OpprettKontrollAFPStat65KontrollRoute() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const modalRef = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [selectedKjoereMaaned, setSelectedKjoereMaaned] = useState('')
  const [antallMaaneder, setAntallMaaneder] = useState('1')

  const maneder = useMemo(genererManedsalternativer, [])

  const kanOpprette = selectedKjoereMaaned !== '' && !isSubmitting

  const formatYearMonth = (mnd: string) => format(parse(mnd, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: nb })

  const opprettedeBehandlinger = actionData && 'behandlingIds' in actionData ? actionData.behandlingIds : null

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
              value={selectedKjoereMaaned}
              onChange={(e) => setSelectedKjoereMaaned(e.target.value)}
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
            <input hidden name="fomMaaned" readOnly value={selectedKjoereMaaned} />

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
            Kjøremåned må velges før behandlingen opprettes.
          </Alert>

          {opprettedeBehandlinger && opprettedeBehandlinger.length > 1 && (
            <Alert variant="success" size="small">
              Opprettet {opprettedeBehandlinger.length} behandlinger:{' '}
              {opprettedeBehandlinger.map((id, index) => (
                <span key={id}>
                  <a href={`/behandling/${id}`}>{id}</a>
                  {index < opprettedeBehandlinger.length - 1 ? ', ' : ''}
                </span>
              ))}
            </Alert>
          )}

          <HStack gap="4">
            <Button
              type="button"
              onClick={() => modalRef.current?.showModal()}
              disabled={!kanOpprette}
            >
              Opprett kontroll
            </Button>
          </HStack>
        </VStack>
      </Form>

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

      <Modal
        ref={modalRef}
        header={{ heading: 'Start AFP Stat 65 års Kontroll' }}
        size="small"
      >
        <Modal.Body>
          <VStack gap="4">
            <div>
              <b>Fra og med måned:</b>{' '}
              {selectedKjoereMaaned ? formatYearMonth(selectedKjoereMaaned) : '-'}
            </div>
            <div>
              <b>Antall måneder å opprette:</b> {antallMaaneder}
            </div>
            {selectedKjoereMaaned && (
              <div>
                <b>Måneder som opprettes:</b>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {Array.from({ length: parseInt(antallMaaneder, 10) }, (_, i) => {
                    const startDate = parse(selectedKjoereMaaned, 'yyyy-MM', new Date())
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
          <Button
            form="skjema"
            type="submit"
            disabled={!kanOpprette || isSubmitting}
            loading={isSubmitting}
          >
            Start behandling{parseInt(antallMaaneder, 10) > 1 ? 'er' : ''}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => modalRef.current?.close()}
          >
            Tilbake
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
