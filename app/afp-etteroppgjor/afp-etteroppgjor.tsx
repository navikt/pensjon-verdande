import { BugIcon, CheckmarkCircleIcon, ClockIcon, HourglassIcon, StopIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  Button,
  ErrorMessage,
  Heading,
  HStack,
  Label,
  Link,
  Select,
  Tag,
  VStack,
} from '@navikt/ds-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useState } from 'react'
import { Form, NavLink, redirect } from 'react-router'
import type { AfpEtteroppgjorResponse, HentAlleResponse } from '~/afp-etteroppgjor/types'
import { apiGet, apiPost } from '~/services/api.server'
import type { Behandlingstatus } from '~/types'
import type { Route } from './+types/afp-etteroppgjor'
import styles from './afp-etteroppgjor.module.css'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'AFP etteroppgjør | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const behandlinger = await apiGet<HentAlleResponse>(`/api/afpoffentlig/etteroppgjor/behandling`, request)

  const etteroppgjor: AfpEtteroppgjorResponse[] = behandlinger.etteroppgjor

  return {
    etteroppgjor: etteroppgjor,
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = Object.fromEntries(await request.formData())

  const response = await apiPost<{ behandlingId: number }>(
    '/api/afpoffentlig/etteroppgjor/behandling/start',
    { kjorear: +(formData.kjorear as string) },
    request,
  )

  return redirect(`/behandling/${response?.behandlingId}`)
}

function formaterTidspunkt(isoTid?: string): string {
  return isoTid ? format(new Date(isoTid), 'dd.MM.yyyy HH:mm', { locale: nb }) : '–'
}

function statusTag(status: Behandlingstatus) {
  switch (status) {
    case 'OPPRETTET':
      return (
        <Tag data-color="info" variant="outline" icon={<ClockIcon aria-hidden />}>
          Opprettet
        </Tag>
      )
    case 'UNDER_BEHANDLING':
      return (
        <Tag data-color="warning" variant="outline" icon={<HourglassIcon aria-hidden />}>
          Under behandling
        </Tag>
      )
    case 'FULLFORT':
      return (
        <Tag data-color="success" variant="outline" icon={<CheckmarkCircleIcon aria-hidden />}>
          Fullført
        </Tag>
      )
    case 'STOPPET':
      return (
        <Tag data-color="danger" variant="outline" icon={<StopIcon aria-hidden />}>
          Stoppet
        </Tag>
      )
    case 'DEBUG':
      return (
        <Tag data-color="neutral" variant="outline" icon={<BugIcon aria-hidden />}>
          Debug
        </Tag>
      )
    default:
      return (
        <Tag data-color="neutral" variant="outline">
          {status}
        </Tag>
      )
  }
}

function EtteroppgjorRad({ item }: { item: AfpEtteroppgjorResponse }) {
  return (
    <Box className={styles.etteroppgjorBox} padding={'space-16'}>
      <VStack gap="space-8">
        <HStack justify="space-between" align="center">
          <Heading size="small">
            <Link as={NavLink} to={`/behandling/${item.behandlingId}`}>
              {item.kjorear}
            </Link>
          </Heading>
          {statusTag(item.status)}
        </HStack>

        <HStack gap="space-24" wrap>
          <Tidspunkt label="Opprettet" verdi={item.opprettet} />
          <Tidspunkt label="Siste kjøring" verdi={item.sisteKjoring} />
          <Tidspunkt label="Planlagt startet" verdi={item.planlagtStartet} />
          <Tidspunkt label="Utsatt til" verdi={item.utsattTil} />
          <Tidspunkt label="Stoppet" verdi={item.stoppet} />
          <Tidspunkt label="Ferdig" verdi={item.ferdig} />
        </HStack>
      </VStack>
    </Box>
  )
}

function Tidspunkt({ label, verdi }: { label: string; verdi?: string }) {
  return (
    <VStack gap="space-4" style={{ minWidth: '10rem' }}>
      <Label>{label}</Label>
      <BodyShort>{formaterTidspunkt(verdi)}</BodyShort>
    </VStack>
  )
}

export default function EtteroppgjorOversikt({ loaderData }: Route.ComponentProps) {
  const { etteroppgjor } = loaderData

  const [kjøreår, setKjøreår] = useState<number | undefined>(undefined)

  const forrigeÅr = new Date().getFullYear() - 1
  const muligeKjøreår = Array.from({ length: 5 }, (_, i) => forrigeÅr - i)

  const alleredeKjørtEtteroppgjør = etteroppgjor.find((it) => it.kjorear === kjøreår) !== undefined

  const submitDisabled = kjøreår === undefined || alleredeKjørtEtteroppgjør

  return (
    <div>
      <Heading size="large">AFP Etteroppgjør</Heading>
      <p>Velkommen til AFP Etteroppgjør!</p>
      <div style={{ maxWidth: '20em' }}>
        <Form method="post">
          <VStack gap="space-16">
            <Select
              name="kjorear"
              label="Velg kjøreår"
              onChange={(e) => setKjøreår(Number(e.target.value))}
              value={kjøreår ?? ''}
            >
              <option value="" disabled>
                Velg år
              </option>
              {muligeKjøreår.map((årstall) => (
                <option key={årstall} value={årstall}>
                  {årstall}
                </option>
              ))}
            </Select>

            <Button type="submit" disabled={submitDisabled}>
              Start etteroppgjør
            </Button>
            {(alleredeKjørtEtteroppgjør && (
              <ErrorMessage>Allerede startet etteroppgjør for {kjøreår}</ErrorMessage>
            )) || <BodyShort>&nbsp;</BodyShort>}
          </VStack>
        </Form>
      </div>
      <div style={{ padding: '2rem' }}></div>
      <Heading size="medium">Eksisterende etteroppgjør</Heading>
      <VStack gap="space-16">
        <VStack>
          {etteroppgjor.length > 0 ? (
            etteroppgjor
              .sort((a, b) => b.kjorear - a.kjorear)
              .map((item) => <EtteroppgjorRad key={item.behandlingId} item={item} />)
          ) : (
            <BodyShort>Ingen etteroppgjør funnet.</BodyShort>
          )}
        </VStack>
      </VStack>
    </div>
  )
}
