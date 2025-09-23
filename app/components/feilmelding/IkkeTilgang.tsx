import { BodyShort, Heading } from '@navikt/ds-react'
import type { ErrorResponse } from 'react-router'

export interface Props {
  error: ErrorResponse
}

export default function IkkeTilgang(props: Props) {
  return (
    <div
      style={{
        paddingBlock: '5rem',
        paddingInline: '0.25rem',
        display: 'grid',
        placeContent: 'center',
        textAlign: 'center',
      }}
    >
      <img
        src="/heimdal-403.png"
        alt="403 ikke tilgang til operasjon"
        width={420}
        height={510}
        style={{ marginLeft: '87' }}
      />
      <Heading level="1" size="large">
        403
      </Heading>
      <Heading level="1" size="large">
        Du har ikke tilgang til denne operasjonen
      </Heading>
      <BodyShort>{props.error.statusText}</BodyShort>
    </div>
  )
}
