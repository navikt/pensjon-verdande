import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  InlineMessage,
  List,
  Select,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { Form, Link, redirect, useNavigation } from 'react-router'
import { apiGet, apiPost } from '~/services/api.server'
import type { Route } from './+types/bpen096'

enum Action {
  HentSkattehendelser = 'HENT_SKATTEHENDELSER',
  HentSkattehendelserManuelt = 'HENT_SKATTEHENDELSER_MANUELT',
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'BPEN096 | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const { antall } = await apiGet<{ antall: number }>('/api/uforetrygd/etteroppgjor/skattehendelser/antall', request)
    return { antallHendelserAaHente: antall }
  } catch (e) {
    console.warn('Kunne ikke hente antall skattehendelser', e)
    return { antallHendelserAaHente: null }
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = Object.fromEntries(await request.formData())

  if (formData.action === Action.HentSkattehendelser) {
    const response = await apiPost<{ behandlingId: number }>(
      '/api/uforetrygd/etteroppgjor/skattehendelser',
      {
        maksAntallSekvensnummer: +formData.maksAntallSekvensnummer,
        debug: formData.debug === 'true',
      },
      request,
    )
    if (!response?.behandlingId) {
      throw new Error('Missing behandlingId')
    }
    return redirect(`/behandling/${response.behandlingId}`)
  } else if (formData.action === Action.HentSkattehendelserManuelt) {
    const sekvensnr: number[] = formData.sekvensnr
      .toString()
      .split(',')
      .map((nr) => nr.trim())
      .filter((nr) => nr !== '')
      .map((nr) => Number(nr))

    const inneholderUgyldigSekvensnr = sekvensnr.some((nr) => Number.isNaN(nr))
    if (inneholderUgyldigSekvensnr) {
      return {
        action: formData.action,
        error: 'Ugyldig sekvensnr',
      }
    }

    const response = await apiPost<{ behandlingIder: number[] }>(
      '/api/uforetrygd/etteroppgjor/skattehendelser/kjor-hendelser-manuelt',
      { sekvensnummer: sekvensnr },
      request,
    )
    if (!response?.behandlingIder || response.behandlingIder.length === 0) {
      return {
        action: formData.action,
        error: 'Mangler behandlingIder fra tjenesten',
      }
    }
    return { behandlingIder: response.behandlingIder }
  }
}

export default function HentOpplysningerFraSkatt({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation()

  const isSubmittingHent =
    navigation.state !== 'idle' && navigation.formData?.get('action') === Action.HentSkattehendelser
  const isSubmittingManuelt =
    navigation.state !== 'idle' && navigation.formData?.get('action') === Action.HentSkattehendelserManuelt

  return (
    <VStack gap="space-24" maxWidth="48rem" paddingInline="space-16">
      <VStack gap="space-4">
        <Heading size="medium" level="1">
          Hent opplysninger fra Skatt (tidligere BPEN096)
        </Heading>
        <BodyLong>Batchkjøring for henting av inntekter fra Skatteetaten for bruk i Uføretrygd Etteroppgjør</BodyLong>
      </VStack>

      <Box as="section" padding="space-24" borderRadius="8" borderColor="neutral-subtleA" borderWidth="1">
        <VStack gap="space-16">
          <VStack gap="space-4">
            <Heading size="small" level="2">
              Behandle nyeste hendelser
            </Heading>
            {loaderData.antallHendelserAaHente !== null ? (
              <BodyShort>
                Antall nye hendelser: <strong>{loaderData.antallHendelserAaHente}</strong>
              </BodyShort>
            ) : (
              <InlineMessage status="error">Henting av antall nye hendelser feilet</InlineMessage>
            )}
          </VStack>
          <Form method="post">
            <VStack gap="space-16" maxWidth="20em">
              <Select label="Debug" size="medium" name="debug" defaultValue="false">
                <option value="true">Ja</option>
                <option value="false">Nei</option>
              </Select>

              <TextField
                label="Maks antall hendelser"
                defaultValue="10000"
                name="maksAntallSekvensnummer"
                type="number"
              />

              <Button type="submit" name="action" value={Action.HentSkattehendelser} loading={isSubmittingHent}>
                Kjør
              </Button>
            </VStack>
          </Form>
        </VStack>
      </Box>

      <Box as="section" padding="space-24" borderRadius="8" borderColor="neutral-subtleA" borderWidth="1">
        <VStack gap="space-16">
          <VStack gap="space-4">
            <Heading size="small" level="2">
              Behandle utvalgte hendelser
            </Heading>
            <BodyShort>Behandle utvalgte hendelser ved å angi tilhørende sekvensnummer</BodyShort>
          </VStack>
          <Form method="post">
            <VStack gap="space-16" maxWidth="20em">
              <TextField label="Kommaseparert liste med sekvensnr." name="sekvensnr" error={actionData?.error} />
              <Button
                type="submit"
                name="action"
                value={Action.HentSkattehendelserManuelt}
                loading={isSubmittingManuelt}
              >
                Kjør
              </Button>
            </VStack>
          </Form>

          {actionData?.behandlingIder && (
            <InlineMessage status="success">
              <VStack gap="space-8">
                <BodyShort weight="semibold">Opprettet behandlinger:</BodyShort>
                <List size="small">
                  {actionData.behandlingIder.map((behandlingId: number) => (
                    <List.Item key={`behandling-link:${behandlingId}`}>
                      <Link to={`/behandling/${behandlingId}`}>{behandlingId}</Link>
                    </List.Item>
                  ))}
                </List>
              </VStack>
            </InlineMessage>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
