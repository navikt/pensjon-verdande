import { Button, Heading, HStack, Page, Select, Table, Textarea, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, redirect, useLoaderData, useNavigation } from 'react-router'
import { opprettOpptjeningsendringArligUttrekk } from '~/opptjening/arlig/batch.opptjeningsendringArligUttrekk.server'
import {
  ekskluderSakerFraArligOmregning,
  fjernAlleEkskluderteSakerFraArligOmregning,
  fjernEkskluderteSakerFraArligOmregning,
  hentEkskluderSakerFraArligOmregning,
} from '~/opptjening/arlig/opptjening.arlig.ekskludersaker.server'
import { opprettOpptjeningsendringArligOmregning } from '~/opptjening/arlig/opptjening.arlig.omregning.server'
import type { EkskludertSak } from '~/opptjening/arlig/opptjening.types'
import { oppdaterSisteGyldigOpptjeningsaar } from '~/opptjening/arlig/siste.gyldig.opptjeningsaar.server'
import { oppdaterSisteOmsorgGodskrivingsaar } from '~/opptjening/arlig/siste.omsorg.godskrivingsaar.server'
import { requireAccessToken } from '~/services/auth.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const ekskluderteSaker = await hentEkskluderSakerFraArligOmregning(accessToken)

  const innevaerendeAar = new Date().getFullYear()
  const defaultOpptjeningsaar = new Date().getFullYear() - 1
  const aarListe: number[] = [defaultOpptjeningsaar + 1, defaultOpptjeningsaar, defaultOpptjeningsaar - 1]

  const defaultOmsorgGodskrivingsaar = innevaerendeAar - 1

  return {
    ekskluderteSaker,
    innevaerendeAar,
    aarListe,
    defaultOpptjeningsaar,
    defaultOmsorgGodskrivingsaar,
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const fromEntries = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  if (fromEntries.action === Action.ekskluderSaker) {
    const ekskluderteSakIderText = fromEntries.ekskluderteSakIderText as string
    const sakIder = konverterTilListe(ekskluderteSakIderText)

    await ekskluderSakerFraArligOmregning(accessToken, sakIder, fromEntries.kommentar as string | undefined)
    return redirect(request.url)
  } else if (fromEntries.action === Action.fjernEkskluderSaker) {
    const ekskluderteSakIderText = fromEntries.ekskluderteSakIderText as string
    const sakIder = konverterTilListe(ekskluderteSakIderText)

    await fjernEkskluderteSakerFraArligOmregning(accessToken, sakIder)
    return redirect(request.url)
  } else if (fromEntries.action === Action.fjernAlleEkskluderSaker) {
    await fjernAlleEkskluderteSakerFraArligOmregning(accessToken)
    return redirect(request.url)
  } else if (fromEntries.action === Action.kjoerUttrekk) {
    const response = await opprettOpptjeningsendringArligUttrekk(accessToken)
    return redirect(`/behandling/${response.behandlingId}`)
  } else if (fromEntries.action === Action.kjoerOmregning) {
    const response = await opprettOpptjeningsendringArligOmregning(accessToken, +fromEntries.opptjeningsar)
    return redirect(`/behandling/${response.behandlingId}`)
  } else if (fromEntries.action === Action.oppdaterSisteGyldigeOpptjeningsaar) {
    await oppdaterSisteGyldigOpptjeningsaar(accessToken, +fromEntries.oppdaterOpptjeningsaar)
  } else if (fromEntries.action === Action.oppdaterSisteOmsorgGodskrivingsaar) {
    await oppdaterSisteOmsorgGodskrivingsaar(accessToken, +fromEntries.oppdaterOmsorgGodskrivingsaar)
  }
}

function konverterTilListe(ekskluderteSakIderText: string): string[] {
  return ekskluderteSakIderText
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

export default function EndretOpptjeningArligUttrekk() {
  const { ekskluderteSaker, innevaerendeAar, aarListe, defaultOpptjeningsaar } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  const [selectedOpptjeningsaar, setSelectedOpptjeningsaar] = useState(defaultOpptjeningsaar)

  const isSubmitting = navigation.state === 'submitting'

  const [ekskluderteSakIderText, setEkskluderteSakIderText] = useState<string>('')
  const [kommentar, setKommentar] = useState<string>('')

  return (
    <Page>
      <VStack gap="8">
        <Heading size={'medium'}>Årlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</Heading>
        <Form method="post">
          <Button type="submit" name="action" value={Action.kjoerUttrekk} disabled={isSubmitting}>
            Opprett uttrekk for {innevaerendeAar}
          </Button>
        </Form>

        <Heading size="medium">Oppdater siste gyldige opptjeningsår</Heading>
        <Form method="post">
          <HStack gap="4" align="end">
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
        </Form>

        <Heading size="medium">Oppdater siste omsorg godskrivingsår</Heading>
        <Form method="post">
          <HStack gap="4" align="end">
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
        </Form>

        <Heading size="medium">Kjør årlig omregningsendring</Heading>
        <Form method="post">
          <VStack gap="4" width="20em">
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

            <Button type="submit" name="action" value={Action.kjoerOmregning} disabled={isSubmitting}>
              Start årlig opptjeningsendring
            </Button>
          </VStack>
        </Form>

        <Heading size={'medium'}>Ekskluderte saker fra årlig omregning</Heading>
        {ekskluderteSaker.length > 0 ? (
          <EkskluderingerMedKommentarTable ekskluderteSaker={ekskluderteSaker} />
        ) : (
          <p>Ingen saker er ekskludert fra årlig omregning.</p>
        )}
        <Form method="post">
          <VStack gap="4">
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
            <HStack gap="4">
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
