import { Box, Heading, Tabs, VStack } from '@navikt/ds-react'
import Card from '~/components/card/Card'
import { BrukerResponse, Tilgangsmeta } from '~/types/brukere'
import { ClockDashedIcon, KeyHorizontalIcon } from '@navikt/aksel-icons'
import BrukersTilganger from '~/routes/brukere.$brukernavn/BrukersTilganger'
import { BrukersTilgangsLogg } from '~/routes/brukere.$brukernavn/BrukersTilgangsLogg'

export interface Props {
  tilgangskontrollmeta: Tilgangsmeta[],
  bruker: BrukerResponse,
  readOnly: boolean,
}

export default function Bruker(props: Props) {
  return (
    <>
      <Heading level="1" size="xlarge">
        {props.bruker.brukernavn} - {props.bruker.fornavn} {props.bruker.etternavn}
      </Heading>

      <div style={{ margin: '12px' }}></div>

      <Box
        background={'surface-default'}
        style={{ padding: '6px' }}
        borderRadius="medium"
        shadow="medium"
      >
        <Card>
          <Tabs defaultValue="tilganger">
            <Tabs.List>
              <Tabs.Tab
                value="tilganger"
                label="Tilganger"
                icon={<KeyHorizontalIcon aria-hidden />}
              />
              <Tabs.Tab
                value="historikk"
                label="Historikk"
                icon={<ClockDashedIcon aria-hidden />}
              />
            </Tabs.List>
            <Tabs.Panel value="tilganger" style={{ paddingTop: '12px' }}>
              <BrukersTilganger
                bruker={props.bruker}
                readonly={props.readOnly}
                tilgangskontrollmeta={props.tilgangskontrollmeta}
              ></BrukersTilganger>
            </Tabs.Panel>
            <Tabs.Panel value="historikk" style={{ paddingTop: '12px' }}>
              <BrukersTilgangsLogg
                bruker={props.bruker}
                tilgangskontrollmeta={props.tilgangskontrollmeta}
              ></BrukersTilgangsLogg>
            </Tabs.Panel>
          </Tabs>

        </Card>
      </Box>
    </>

  )
}
