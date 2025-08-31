import {
  BodyShort,
  Box,
  Button,
  ErrorMessage,
  Heading,
  HStack,
  Label, Link,
  Select,
  Tag,
  VStack,
} from '@navikt/ds-react'
import React, { useState } from 'react'
import { type ActionFunctionArgs, Form, NavLink, redirect, useLoaderData } from 'react-router'
import { apiGet } from '~/services/api.server'
import type { AfpEtteroppgjorResponse, HentAlleResponse } from '~/afp-etteroppgjor/types'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Behandlingstatus } from '~/types'
import { BugIcon, CheckmarkCircleIcon, ClockIcon, HourglassIcon, StopIcon } from '@navikt/aksel-icons'
import { requireAccessToken } from '~/services/auth.server'
import { startAfpEtteroppgjor } from '~/afp-etteroppgjor/afp-etteroppgjor.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const behandlinger = await apiGet<HentAlleResponse>(
    `/api/afpoffentlig/etteroppgjor/behandling`,
    request,
  )

  const etteroppgjor: AfpEtteroppgjorResponse[] = behandlinger.etteroppgjor

  return {
    etteroppgjor: etteroppgjor,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  let formData = Object.fromEntries(await request.formData())

  let response = await startAfpEtteroppgjor(accessToken, {
    kjøreår: +(formData.kjorear as string),
  })

  return redirect(`/behandling/${response.behandlingId}`)
}

function formaterTidspunkt(isoTid?: string): string {
  return isoTid ? format(new Date(isoTid), 'dd.MM.yyyy HH:mm', { locale: nb }) : '–'
}

function statusTag(status: Behandlingstatus) {
  switch (status) {
    case 'OPPRETTET':
      return <Tag variant="info" icon={<ClockIcon aria-hidden />}>Opprettet</Tag>
    case 'UNDER_BEHANDLING':
      return <Tag variant="warning" icon={<HourglassIcon aria-hidden />}>Under behandling</Tag>
    case 'FULLFORT':
      return <Tag variant="success" icon={<CheckmarkCircleIcon aria-hidden />}>Fullført</Tag>
    case 'STOPPET':
      return <Tag variant="error" icon={<StopIcon aria-hidden />}>Stoppet</Tag>
    case 'DEBUG':
      return <Tag variant="neutral" icon={<BugIcon aria-hidden />}>Debug</Tag>
    default:
      return <Tag variant="neutral">{status}</Tag>
  }
}

function EtteroppgjorRad({ item }: { item: AfpEtteroppgjorResponse }) {
  return (
    <Box className={'etteroppgjor-box'}
         padding={'4'}
    >
      <VStack gap="2">
        <HStack justify="space-between" align="center">
          <Heading size="small">
            <Link as={NavLink} to={`/behandling/${item.behandlingId}`}>
              {item.kjorear}
            </Link>
          </Heading>
          {statusTag(item.status)}
        </HStack>

        <HStack gap="6" wrap>
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

function Tidspunkt({ label, verdi }: { label: string, verdi?: string }) {
  return (
    <VStack gap="1" style={{ minWidth: '10rem' }}>
      <Label>{label}</Label>
      <BodyShort>{formaterTidspunkt(verdi)}</BodyShort>
    </VStack>
  )
}


export default function EtteroppgjorOversikt() {
  const { etteroppgjor } = useLoaderData<typeof loader>()

  const [kjøreår, setKjøreår] = useState<number | undefined>(undefined)

  const forrigeÅr = new Date().getFullYear() - 1
  const muligeKjøreår = Array.from({ length: 5 }, (_, i) => forrigeÅr - i)

  const alleredeKjørtEtteroppgjør = etteroppgjor.find(it => it.kjorear === kjøreår) !== undefined

  const submitDisabled = kjøreår === undefined || alleredeKjørtEtteroppgjør

  return (
    <div>
      <Heading size="large">AFP Etteroppgjør</Heading>
      <p>Velkommen til AFP Etteroppgjør!</p>

      <div style={{ maxWidth: '20em' }}>
        <Form method="post">
          <VStack gap="4">

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

            <Button type="submit" disabled={submitDisabled}>Start etteroppgjør</Button>
            {
              alleredeKjørtEtteroppgjør &&   <ErrorMessage>Allerede startet etteroppgjør for {kjøreår}</ErrorMessage> || <BodyShort>&nbsp;</BodyShort>
            }
          </VStack>
        </Form>
      </div>

      <div style={{ padding: '2rem' }}></div>

      <Heading size="medium">Eksisterende etteroppgjør</Heading>

      <VStack gap="4">
        <VStack>
          {etteroppgjor.length > 0
            ? etteroppgjor.map((item) => (
            <EtteroppgjorRad key={item.behandlingId} item={item} />
          ))
            : <BodyShort>Ingen etteroppgjør funnet.</BodyShort>
          }
        </VStack>
      </VStack>
    </div>
  )
}