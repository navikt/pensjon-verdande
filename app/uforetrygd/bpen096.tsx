import { Alert, BodyShort, Box, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, Link, redirect, useActionData, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import {
  hentAntallSkattehendelser,
  hentSkattehendelserManuelt,
  opprettBpen096,
} from '~/uforetrygd/batch.bpen096.server'

enum Action {
  HentSkattehendelser = "HENT_SKATTEHENDELSER",
  HentSkattehendelserManuelt = "HENT_SKATTEHENDELSER_MANUELT",
  HentAntallSkattehendelser = "HENT_ANTALL_SKATTEHENDELSER"
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData())
  const accessToken = await requireAccessToken(request)

  if (formData.action == Action.HentSkattehendelser) {
    const response = await opprettBpen096(
      accessToken,
      +formData.maksAntallSekvensnummer,
      +formData.sekvensnummerPerBehandling,
      formData.dryRun === 'true',
      formData.debug === 'true',
    )
    return redirect(`/behandling/${response.behandlingId}`)

  } else if (formData.action === Action.HentSkattehendelserManuelt) {
    const sekvensnr: number[] = formData.sekvensnr.toString()
      .split(',')
      .map(nr => nr.trim())
      .filter(nr => nr !== '')
      .map(nr => Number(nr))

    const inneholderUgyldigSekvensnr = sekvensnr.some(nr => isNaN(nr))
    if (inneholderUgyldigSekvensnr) {
      return { error: "Fant ugyldig sekvensnr." }
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
  const [dryRun, setDryRun] = useState<string | ''>('')
  const [debug, setDebug] = useState<string>('')

  return (
    <VStack gap={'4'} >
      <Box.New className={'aksel-pageblock--lg'}>
      <Heading size={'medium'} level={'1'}>Hent opplysninger fra Skatt (tidligere BPEN096)</Heading>
      <BodyShort>Batchkjøring for henting av opplysninger fra Skatteetaten for Uføretrygd Etteroppgjør</BodyShort>
      </Box.New>

      <Form method="post" style={{width: '20em'}}>
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
            label="Dry run"
            size={'medium'}
            name={'dryRun'}
            onChange={(e) => setDryRun(e.target.value)}
            value={dryRun ?? ''}
          >
            <option value="" disabled>Velg</option>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Select
            label="Debug"
            size={'medium'}
            name={'debug'}
            onChange={(e) => setDebug(e.target.value)}
            value={debug ?? ''}
          >
            <option value="" disabled>Velg</option>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Button
            type="submit"
            name="action"
            value={Action.HentSkattehendelser}
            disabled={isSubmitting || dryRun === '' || debug === ''}
          >
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>

        </VStack>
      </Form>

      <Heading size="medium">Kjør hendelser manuelt</Heading>
      <BodyShort>Angi sekvensnummer for å lagre inntektene på disse hendelsene manuelt.</BodyShort>
      <Form method="post">
        <VStack gap="4" width="20em">
          <TextField label="Kommaseparert liste med sekvensnr." name="sekvensnr" />
          <Button
            type="submit"
            name="action"
            value={Action.HentSkattehendelserManuelt}
            disabled={isSubmitting}
          >
            Kjør
          </Button>

          {actionData?.behandlingIder &&
            (<>
                Oppretta behandlinger
                {actionData?.behandlingIder.map((behandlingId: number) => <Link to={`/behandling/${behandlingId}`}>{behandlingId}</Link>)}
              </>)
          }
        </VStack>
      </Form>

      <Heading size="medium">Antall hendelser å hente</Heading>
      <BodyShort>Gjør et kall mot Sigrun for å se hvor mange hendelser en faktisk kjøring vil hente.</BodyShort>
      <Form method="post">
        <VStack gap="4" width="20em">
          <Button
            type="submit"
            name="action"
            value={Action.HentAntallSkattehendelser}
            disabled={isSubmitting}
          >
            Hent
          </Button>

          {actionData?.antall &&
            (<>
              Antall å hente: {actionData?.antall}
            </>)
          }
        </VStack>
      </Form>
      {actionData?.error &&
        <Alert inline variant="error">
          {actionData.error}
        </Alert>
      }
    </VStack>
  )
}
