import { Box, Heading, Tabs } from '@navikt/ds-react'
import Card from '~/components/card/Card'
import { ClockDashedIcon, KeyHorizontalIcon } from '@navikt/aksel-icons'
import BrukersTilganger from '~/brukere/BrukersTilganger'
import { BrukersTilgangsLogg } from '~/brukere/BrukersTilgangsLogg'
import { BrukerResponse, Tilgangsmeta } from '~/brukere/brukere'

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

      <Box.New
        background={"sunken"}
        style={{ padding: '6px' }}
        borderRadius="medium"
        shadow="dialog"
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
      </Box.New>
    </>

  )
}
