import { BodyShort, Box, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form, Link, redirect, useActionData, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import {
  hentAntallSkattehendelser,
  hentSkattehendelserManuelt,
  opprettBpen096,
} from '~/uforetrygd/batch.bpen096.server'
import type { Route } from './+types/bpen096'

enum Action {
  HentSkattehendelser = 'HENT_SKATTEHENDELSER',
  HentSkattehendelserManuelt = 'HENT_SKATTEHENDELSER_MANUELT',
  HentAntallSkattehendelser = 'HENT_ANTALL_SKATTEHENDELSER',
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = Object.fromEntries(await request.formData())
  const accessToken = await requireAccessToken(request)

  if (formData.action === Action.HentSkattehendelser) {
    const response = await opprettBpen096(
      accessToken,
      +formData.maksAntallSekvensnummer,
      +formData.sekvensnummerPerBehandling,
      formData.debug === 'true',
    )
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

    const response = await hentSkattehendelserManuelt(sekvensnr, accessToken)
    return { behandlingIder: response.behandlingIder }
  } else if (formData.action === Action.HentAntallSkattehendelser) {
    const response = await hentAntallSkattehendelser(accessToken)
    return { antall: response.antall }
  }
}

export default function HentOpplysningerFraSkatt() {
  const navigation = useNavigation()
  const actionData = useActionData()

  const isSubmitting = navigation.state === 'submitting'
  const [debug, setDebug] = useState<string>('')

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Hent opplysninger fra Skatt (tidligere BPEN096)
        </Heading>
        <BodyShort>Batchkjøring for henting av opplysninger fra Skatteetaten for Uføretrygd Etteroppgjør</BodyShort>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
          <TextField
            label={'Max antall sekvensnummer'}
            defaultValue="10000"
            aria-label="maxSekvensnummer"
            name="maksAntallSekvensnummer"
            type="number"
            placeholder="maxSekvensnummer"
          />

          <TextField
            label={'Antall sekvensnummer per behandling'}
            defaultValue="100"
            aria-label="sekvensnummerPerBehandling"
            name="sekvensnummerPerBehandling"
            type="number"
            placeholder="sekvensnummerPerBehandling"
          />

          <Select
            label="Debug"
            size={'medium'}
            name={'debug'}
            onChange={(e) => setDebug(e.target.value)}
            value={debug ?? ''}
          >
            <option value="" disabled>
              Velg
            </option>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Button
            type="submit"
            name="action"
            value={Action.HentSkattehendelser}
            disabled={isSubmitting || debug === ''}
          >
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>

      <Heading size="medium">Kjør hendelser manuelt</Heading>
      <BodyShort>Angi sekvensnummer for å lagre inntektene på disse hendelsene manuelt.</BodyShort>
      <Form method="post">
        <VStack gap="4" width="20em">
          <TextField
            label="Kommaseparert liste med sekvensnr."
            name="sekvensnr"
            error={actionData?.error && actionData.error}
          />
          <Button type="submit" name="action" value={Action.HentSkattehendelserManuelt} disabled={isSubmitting}>
            Kjør
          </Button>

          {actionData?.behandlingIder && (
            <>
              Oppretta behandlinger
              {actionData?.behandlingIder.map((behandlingId: number) => (
                <Link key={`behandling-link:${behandlingId}`} to={`/behandling/${behandlingId}`}>
                  {behandlingId}
                </Link>
              ))}
            </>
          )}
        </VStack>
      </Form>

      <Heading size="medium">Antall hendelser å hente</Heading>
      <BodyShort>Gjør et kall mot Sigrun for å se hvor mange hendelser en faktisk kjøring vil hente.</BodyShort>
      <Form method="post">
        <VStack gap="4" width="20em">
          <Button type="submit" name="action" value={Action.HentAntallSkattehendelser} disabled={isSubmitting}>
            Hent
          </Button>

          {actionData?.antall !== undefined && <>Antall å hente: {actionData?.antall}</>}
        </VStack>
      </Form>
    </VStack>
  )
}
