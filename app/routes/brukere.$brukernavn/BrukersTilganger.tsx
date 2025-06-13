import { uniqueFilter } from '~/common/utils'
import Card from '~/components/card/Card'
import { Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { BrukerResponse, decodeOmfang, Tilgangsmeta, tilgangsmetaSort } from '~/types/brukere'
import { useFetcher } from 'react-router'
import { useState } from 'react'

export interface Props {
  bruker: BrukerResponse,
  readonly: boolean,
  tilgangskontrollmeta: Tilgangsmeta[],
}

export default function BrukersTilganger(props: Props) {
  const fetcher = useFetcher()

  const [gitteTilganger, setTilganger] = useState<string[]>(props.bruker.tilganger || []);

  function toggleTilgang(oppgave: Tilgangsmeta) {
    let eksisterendeTilgang = gitteTilganger.includes(oppgave.operasjonNavn)

    setTilganger((list) =>
      list.includes(oppgave.operasjonNavn)
        ? list.filter((id) => id !== oppgave.operasjonNavn)
        : [...list, oppgave.operasjonNavn],
    )

    fetcher.submit({
      operasjon: oppgave.operasjonNavn,
    }, {
      method: eksisterendeTilgang ? 'delete' : 'put',
      action: `/brukere/${encodeURI(props.bruker.brukernavn)}`,
    })
  }

  return (
    props.tilgangskontrollmeta.sort((a, b) => a.omfangBeskrivelse.localeCompare(b.omfangBeskrivelse, 'nb', { sensitivity: 'base' })).map(it => it.omfangNavn).filter(uniqueFilter).map(omfangNavn => {
      return (
        <Card.Body key={omfangNavn}>
          <CheckboxGroup legend={decodeOmfang(props.tilgangskontrollmeta, omfangNavn)} value={gitteTilganger} readOnly={props.readonly}>
            {
              props.tilgangskontrollmeta.filter(it => it.omfangNavn == omfangNavn).sort(tilgangsmetaSort).map((oppgave) => {
                return (<Checkbox key={oppgave.operasjonNavn} value={oppgave.operasjonNavn} onChange={() => toggleTilgang(oppgave)}>
                  {oppgave.operasjonBeskrivelse}
                </Checkbox>)
              })
            }
          </CheckboxGroup>
        </Card.Body>
      )
    })
  );
}