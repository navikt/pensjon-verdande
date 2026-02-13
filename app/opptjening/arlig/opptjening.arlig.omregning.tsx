import { Button, Heading, HStack, Page, Select, Table, Textarea, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form, redirect, useNavigation } from 'react-router'
import type { EkskluderteSakerResponse, EkskludertSak, StartBatchResponse } from '~/opptjening/arlig/opptjening.types'
import { apiGet, apiPost } from '~/services/api.server'
import type { Route } from './+types/opptjening.arlig.omregning'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Årlig opptjening | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const result = await apiGet<EkskluderteSakerResponse>('/api/opptjening/eksludertesaker', request)
  const ekskluderteSaker = result.ekskluderteSaker

  const innevaerendeAar = new Date().getFullYear()
  const defaultOpptjeningsaar = innevaerendeAar - 1
  const aarListe: number[] = [defaultOpptjeningsaar + 1, defaultOpptjeningsaar, defaultOpptjeningsaar - 1]

  return {
    ekskluderteSaker,
    innevaerendeAar,
    aarListe,
    defaultOpptjeningsaar,
  }
}

enum Action {
  ekskluderSaker = 'EKSKLUDER_SAKER',
  fjernAlleEkskluderSaker = 'FJERN_ALLE_EKSKLUDERTE_SAKER',
  fjernEkskluderSaker = 'FJERN_EKSKLUDERTE_SAKER',
  kjoerUttrekk = 'KJOER_UTTREKK',
  kjoerOmregning = 'KJOER_OMREGNING',
  oppdaterSisteGyldigeOpptjeningsaar = 'OPPDATER_SISTE_GYLDIGE_OPPTJENINGSAAR',
  oppdaterSisteOmsorgGodskrivingsaar = 'OPPDATER_GODSKRIVINGSAAR',
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const fromEntries = Object.fromEntries(formData)

  if (fromEntries.action === Action.ekskluderSaker) {
    const sakIder = konverterTilListe(fromEntries.ekskluderteSakIderText as string)
    await apiPost('/api/opptjening/eksludertesaker/leggTil', { sakIder, kommentar: fromEntries.kommentar }, request)
    return redirect(request.url)
  } else if (fromEntries.action === Action.fjernEkskluderSaker) {
    const sakIder = konverterTilListe(fromEntries.ekskluderteSakIderText as string)
    await apiPost('/api/opptjening/eksludertesaker/fjern', { sakIder }, request)
    return redirect(request.url)
  } else if (fromEntries.action === Action.fjernAlleEkskluderSaker) {
    await apiPost('/api/opptjening/eksludertesaker/fjernAlle', {}, request)
    return redirect(request.url)
  } else if (fromEntries.action === Action.kjoerUttrekk) {
    const response = await apiPost<StartBatchResponse>('/api/opptjening/arliguttrekk/opprett', {}, request)
    if (!response) {
      throw new Error('Opprettelse av årlig uttrekk returnerte ingen respons')
    }
    return redirect(`/behandling/${response.behandlingId}`)
  } else if (fromEntries.action === Action.kjoerOmregning) {
    const response = await apiPost<StartBatchResponse>(
      '/api/opptjening/arligendring/opprett',
      {
        opptjeningsar: +fromEntries.opptjeningsar,
        bolkstorrelse: +fromEntries.bolkstorrelse,
      },
      request,
    )
    if (!response) {
      throw new Error('Opprettelse av årlig omregning returnerte ingen respons')
    }
    return redirect(`/behandling/${response.behandlingId}`)
  } else if (fromEntries.action === Action.oppdaterSisteGyldigeOpptjeningsaar) {
    await apiPost(
      `/api/opptjening/opptjeningsaar/oppdater?opptjeningsar=${fromEntries.oppdaterOpptjeningsaar}`,
      {},
      request,
    )
    return JSON.stringify({
      melding: `✅ Siste gyldige opptjeningsår er oppdatert til ${fromEntries.oppdaterOpptjeningsaar}`,
      action: Action.oppdaterSisteGyldigeOpptjeningsaar,
    })
  } else if (fromEntries.action === Action.oppdaterSisteOmsorgGodskrivingsaar) {
    await apiPost(
      `/api/opptjening/omsorggodskrivingsaar/oppdater?godskrivingsaar=${fromEntries.oppdaterOmsorgGodskrivingsaar}`,
      {},
      request,
    )
    return JSON.stringify({
      melding: `✅ Siste godskrivingsår for omsorg er oppdatert til ${fromEntries.oppdaterOmsorgGodskrivingsaar}`,
      action: Action.oppdaterSisteOmsorgGodskrivingsaar,
    })
  }
}

function konverterTilListe(ekskluderteSakIderText: string): string[] {
  return ekskluderteSakIderText
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

export default function EndretOpptjeningArligUttrekk({ loaderData, actionData }: Route.ComponentProps) {
  const data = actionData
  const { ekskluderteSaker, innevaerendeAar, aarListe, defaultOpptjeningsaar } = loaderData
  const navigation = useNavigation()

  const [selectedOpptjeningsaar, setSelectedOpptjeningsaar] = useState(defaultOpptjeningsaar)

  const isSubmitting = navigation.state === 'submitting'

  const [bolkstorrelse, setBolkstorrelse] = useState<number>(10000)
  const [ekskluderteSakIderText, setEkskluderteSakIderText] = useState<string>('')
  const [kommentar, setKommentar] = useState<string>('')

  return (
    <Page>
      <VStack gap="space-32">
        <Heading size={'medium'}>Årlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</Heading>
        <Form method="post">
          <Button type="submit" name="action" value={Action.kjoerUttrekk} disabled={isSubmitting}>
            Opprett uttrekk for {innevaerendeAar}
          </Button>
        </Form>

        <Heading size="medium">Oppdater siste gyldige opptjeningsår</Heading>
        <Form method="post">
          <HStack gap="space-16" align="end">
            <Select
              name="oppdaterOpptjeningsaar" // <- dette må matche action
              label="Velg opptjeningsår"
              onChange={(e) => setSelectedOpptjeningsaar(+e.target.value)}
              value={selectedOpptjeningsaar}
            >
              {aarListe.map((aar) => (
                <option key={aar} value={aar}>
                  {aar}
                </option>
              ))}
            </Select>

            <Button
              type="submit"
              name="action"
              value={Action.oppdaterSisteGyldigeOpptjeningsaar}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Oppdaterer...' : 'Oppdater siste gyldige opptjeningsår'}
            </Button>
          </HStack>
          {data && (JSON.parse(data) as meldingResponse)?.action === Action.oppdaterSisteGyldigeOpptjeningsaar && (
            <p>{(JSON.parse(data) as meldingResponse)?.melding}</p>
          )}
        </Form>

        <Heading size="medium">Oppdater siste omsorg godskrivingsår</Heading>
        <Form method="post">
          <HStack gap="space-16" align="end">
            <Select
              name="oppdaterOmsorgGodskrivingsaar" // <- dette må matche action
              label="Velg omsorg godskrivingsår"
              onChange={(e) => setSelectedOpptjeningsaar(+e.target.value)}
              value={selectedOpptjeningsaar}
            >
              {aarListe.map((aar) => (
                <option key={aar} value={aar}>
                  {aar}
                </option>
              ))}
            </Select>

            <Button
              type="submit"
              name="action"
              value={Action.oppdaterSisteOmsorgGodskrivingsaar}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Oppdaterer...' : 'Oppdater siste gyldige omsorg godskrivingsår'}
            </Button>
          </HStack>
          {data && (JSON.parse(data) as meldingResponse)?.action === Action.oppdaterSisteOmsorgGodskrivingsaar && (
            <p>{(JSON.parse(data) as meldingResponse)?.melding}</p>
          )}
        </Form>

        <Heading size="medium">Kjør årlig omregningsendring</Heading>

        <Form method="post">
          <VStack gap="space-16">
            <HStack gap="space-16">
              <Select
                name="opptjeningsar"
                label="Velg opptjeningsår"
                onChange={(e) => setSelectedOpptjeningsaar(+e.target.value)}
                value={selectedOpptjeningsaar}
              >
                {aarListe.map((aar) => (
                  <option key={aar} value={aar}>
                    {aar}
                  </option>
                ))}
              </Select>

              <TextField
                label="Bolkstørrelse"
                name="bolkstorrelse"
                value={bolkstorrelse}
                onChange={(e) => setBolkstorrelse(+e.target.value)}
              />
            </HStack>
            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" name="action" value={Action.kjoerOmregning} disabled={isSubmitting}>
                Start årlig opptjeningsendring
              </Button>
            </div>
          </VStack>
        </Form>

        <Heading size={'medium'}>Ekskluderte saker fra årlig omregning</Heading>
        {ekskluderteSaker.length > 0 ? (
          <EkskluderingerMedKommentarTable ekskluderteSaker={ekskluderteSaker} />
        ) : (
          <p>Ingen saker er ekskludert fra årlig omregning.</p>
        )}
        <Form method="post">
          <VStack gap="space-16">
            <Textarea
              label={'Saker som skal ekskluderes'}
              onChange={(e) => setEkskluderteSakIderText(e.target.value)}
              value={ekskluderteSakIderText}
              name="ekskluderteSakIderText"
            />
            <Textarea
              label={'Kommentar (valgfritt)'}
              onChange={(e) => setKommentar(e.target.value)}
              value={kommentar}
              name="kommentar"
            />
            <HStack gap="space-16">
              <Button type="submit" name="action" value={Action.ekskluderSaker} disabled={isSubmitting}>
                Ekskluder saker fra årlig omregning
              </Button>
              <Button
                type="submit"
                name="action"
                value={Action.fjernEkskluderSaker}
                disabled={isSubmitting}
                style={{ backgroundColor: '#CC0000', color: 'white' }}
              >
                Fjern ekskluderte saker fra årlig omregning
              </Button>
              <Button
                type="submit"
                name="action"
                value={Action.fjernAlleEkskluderSaker}
                disabled={isSubmitting}
                style={{ backgroundColor: '#CC0000', color: 'white' }}
              >
                Fjern ALLE ekskluderte saker fra årlig omregning
              </Button>
            </HStack>
          </VStack>
        </Form>
      </VStack>
    </Page>
  )
}

interface meldingResponse {
  melding: string
  action: Action
}

function EkskluderingerMedKommentarTable({ ekskluderteSaker }: { ekskluderteSaker: EkskludertSak[] }) {
  return (
    <Table zebraStripes>
      <Table.Row>
        <Table.HeaderCell>SakId</Table.HeaderCell>
        <Table.HeaderCell align="right">Kommentar</Table.HeaderCell>
      </Table.Row>
      {ekskluderteSaker.map((f) => (
        <Table.Row key={f.sakId}>
          <Table.DataCell>{f.sakId}</Table.DataCell>
          <Table.DataCell align="right">{f.kommentar}</Table.DataCell>
        </Table.Row>
      ))}
    </Table>
  )
}
