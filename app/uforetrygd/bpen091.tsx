import { BodyLong, BodyShort, Box, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { Form, redirect, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen091 } from '~/uforetrygd/batch.bpen091.server'
import type { Route } from './+types/bpen091'

export const loader = () => {
  return {
    lastYear: new Date().getFullYear() - 1,
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const begrensUtplukkStr = String(formData.get('begrensUtplukk') ?? 'false')
  const dryRunStr = String(formData.get('dryRun') ?? 'true')

  const begrensUtplukk = begrensUtplukkStr === 'true'
  const dryRun = dryRunStr === 'true'

  const accessToken = await requireAccessToken(request)
  const response = await opprettBpen091(accessToken, +updates.behandlingsAr, begrensUtplukk, dryRun)

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function FastsettForventetInntekt({ loaderData }: Route.ComponentProps) {
  const { lastYear } = loaderData
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Fastsett forventet inntekt (BPEN091)
        </Heading>
        <BodyLong>Fastsette neste års forventet inntekt for uføretrygd</BodyLong>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
          <TextField
            label={'Behandlingsår'}
            description={<BodyShort as="div">Året nye inntekter skal gjelde</BodyShort>}
            defaultValue={lastYear}
            aria-label="År"
            name="behandlingsAr"
            type="number"
            placeholder="År"
          />
          <Select
            label="Begrens utplukk"
            description={
              <BodyShort as="div">
                Krever oppføringer i <code>T_BATCH_PERSON_FILTER</code> med <code>PERSON_ID</code> for de personene som
                skal kjøres.
              </BodyShort>
            }
            size="small"
            name="begrensUtplukk"
            defaultValue="false"
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Select
            label="Prøvekjøring (dry run)"
            description={<BodyShort as="div">Kjører uten å sende videre til ForventetInntektUTBehandling.</BodyShort>}
            size="small"
            name="dryRun"
            defaultValue="true"
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
