import { Alert } from '@navikt/ds-react'

export function EndringerIkkeKjortBanner() {
  return (
    <Alert variant="info" size="small" inline>
      Du har ulagrede endringer i kriteriene. Trykk «Kjør søk» for å oppdatere resultatene.
    </Alert>
  )
}
