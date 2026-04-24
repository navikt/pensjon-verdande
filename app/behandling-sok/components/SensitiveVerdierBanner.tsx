import { Alert } from '@navikt/ds-react'

export function SensitiveVerdierBanner() {
  return (
    <Alert variant="warning" size="small">
      Søket inneholder sensitive verdier (NAV-identer eller behandlingsserie-UUID) som ikke lagres i URL. Bruk «Kopiér
      som JSON» for å arkivere eller dele søket sikkert.
    </Alert>
  )
}
