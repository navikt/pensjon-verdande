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
        paddingInline: '1rem',
        display: 'grid',
        placeContent: 'center',
        textAlign: 'center',
      }}
    >
      <img
        src="/heimdal-403.png"
        alt="403 ikke tilgang til operasjon"
        width={400}
        height={400}
        style={{ maxWidth: '100%', height: 'auto', marginLeft: 'auto', marginRight: 'auto' }}
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
