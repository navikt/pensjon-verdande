import { Box, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { Form, useNavigation } from 'react-router'

export default function ManedligOmregningKategoriserBruker({
  denneBehandlingsmaneden,
}: {
  denneBehandlingsmaneden: number
}) {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <Box.New
      style={{ width: '35em' }}
      borderWidth={'1'}
      borderColor={'neutral-subtleA'}
      padding={'4'}
      borderRadius={'medium'}
    >
      <Heading level={'2'} size={'medium'}>
        Start omregning av ytelse ved oppdaterte opptjeningsopplysninger
      </Heading>
      <Form action="kategoriserBruker" method="post">
        <VStack gap={'4'}>
          <TextField
            label={'Behandlingsmåned'}
            defaultValue={denneBehandlingsmaneden}
            aria-label="Behandlingsmåned"
            name="behandlingsmaned"
            type="number"
            placeholder="Behandlingsmåned"
          />
          <Button type="submit" disabled={isSubmitting}>
            Opprett
          </Button>
        </VStack>
      </Form>
    </Box.New>
  )
}
