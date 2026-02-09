import { Button, Checkbox, CheckboxGroup, Heading, Select, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form, redirect, useNavigation } from 'react-router'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { opprettBpen014 } from '~/inntektskontroll/batch.bpen014.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/batch.inntektskontroll._index'

export const FELTER = {
  aar: 'aar',
  eps2g: 'eps2g',
  gjenlevende: 'gjenlevende',
  opprettOppgave: 'opprettOppgave',
} as const

const checkboxTrueValue = 'true' as const

export const loader = async () => {
  const detteÅret = new Date().getFullYear()

  return {
    detteÅret,
  }
}
export const action = async ({ request }: Route.ActionArgs) => {
  const fd = await request.formData()
  const accessToken = await requireAccessToken(request)

  const detteÅret = new Date().getFullYear()
  const skjema = zfd.formData({
    [FELTER.aar]: zfd.numeric(
      z
        .number()
        .int('År må være et heltall')
        .min(2020, 'År kan ikke være før 2020')
        .max(detteÅret, 'År kan ikke være i fremtiden'),
    ),
    [FELTER.eps2g]: zfd.checkbox({ trueValue: checkboxTrueValue }),
    [FELTER.gjenlevende]: zfd.checkbox({ trueValue: checkboxTrueValue }),
    [FELTER.opprettOppgave]: zfd.checkbox({ trueValue: checkboxTrueValue }),
  })

  const {
    [FELTER.aar]: aar,
    [FELTER.eps2g]: eps2g,
    [FELTER.gjenlevende]: gjenlevende,
    [FELTER.opprettOppgave]: opprettoppgave,
  } = skjema.parse(fd)

  const response = await opprettBpen014(accessToken, aar, eps2g, gjenlevende, opprettoppgave)
  return redirect(`/behandling/${response.behandlingId}`)
}

export default function BatchOpprett_index({ loaderData }: Route.ComponentProps) {
  const { detteÅret } = loaderData
  const navigation = useNavigation()

  const [kjøreår, setKjøreår] = useState<number | ''>('')
  const muligeÅr = Array.from({ length: 5 }, (_, i) => detteÅret - i)

  const isSubmitting = navigation.state === 'submitting'

  return (
    <div>
      <Heading size="medium">Start inntektskontroll</Heading>

      <Form method="post" style={{ maxWidth: '25em' }}>
        <VStack gap="4">
          <Select
            name={FELTER.aar}
            label="Velg år"
            onChange={(e) => {
              const v = e.currentTarget.value
              setKjøreår(v === '' ? '' : Number(v))
            }}
            value={kjøreår}
            required
          >
            <option value="" disabled>
              Velg år
            </option>
            {muligeÅr.map((årstall) => (
              <option key={årstall} value={årstall}>
                {årstall}
              </option>
            ))}
          </Select>

          <CheckboxGroup legend="Behandlingsparametere" style={{ padding: 0 }}>
            <Checkbox name={FELTER.eps2g} value={checkboxTrueValue}>
              Inntektskontroll for ektefelle/samboer (2G)
            </Checkbox>
            <Checkbox name={FELTER.opprettOppgave} value={checkboxTrueValue}>
              Opprett oppgave for Eps2G
            </Checkbox>
            <Checkbox name={FELTER.gjenlevende} value={checkboxTrueValue}>
              Inntektskontroll for gjenlevende
            </Checkbox>
          </CheckboxGroup>

          <Button type="submit" disabled={kjøreår === '' || isSubmitting}>
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>
    </div>
  )
}
