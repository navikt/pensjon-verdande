import { BodyShort, Box, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, redirect, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen096 } from '~/uforetrygd/batch.bpen096.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettBpen096(accessToken, +updates.maksAntallSekvensnummer, +updates.sekvensnummerPerBehandling, updates.dryRun === 'true', updates.debug === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function HentOpplysningerFraSkatt() {
  const navigation = useNavigation()

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
            disabled={isSubmitting || dryRun === '' || debug === ''}
          >
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
