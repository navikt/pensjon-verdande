import { uniqueFilter } from '~/common/utils'
import { Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { useFetcher } from 'react-router'
import { useState } from 'react'
import { type BrukerResponse, decodeOmfang, type Tilgangsmeta, tilgangsmetaSort } from '~/brukere/brukere'

export interface Props {
  bruker: BrukerResponse,
  readonly: boolean,
  tilgangskontrollmeta: Tilgangsmeta[],
}

export default function BrukersTilganger(props: Props) {
  const fetcher = useFetcher()

  const [gitteTilganger, setTilganger] = useState<string[]>(props.bruker.tilganger || []);

  function toggleTilgang(oppgave: Tilgangsmeta) {
    const eksisterendeTilgang = gitteTilganger.includes(oppgave.operasjonNavn)

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
          <CheckboxGroup key={`omfang-${omfangNavn}`} legend={decodeOmfang(props.tilgangskontrollmeta, omfangNavn)} value={gitteTilganger} readOnly={props.readonly}>
            {
              props.tilgangskontrollmeta.filter(it => it.omfangNavn == omfangNavn).sort(tilgangsmetaSort).map((oppgave) => {
                return (<Checkbox key={`${omfangNavn}:${oppgave.operasjonNavn}`} value={oppgave.operasjonNavn} onChange={() => toggleTilgang(oppgave)}>
                  {oppgave.operasjonBeskrivelse}
                </Checkbox>)
              })
            }
          </CheckboxGroup>
      )
    })
  );
}