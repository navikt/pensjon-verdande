import { Button } from '@navikt/ds-react'

type Props = {
  invalid: boolean
  harFeil: boolean
  onClick: () => void
}

export function KjorSokKnapp({ invalid, harFeil, onClick }: Props) {
  return (
    <Button variant="primary" size="small" onClick={onClick} disabled={invalid && !harFeil}>
      {harFeil ? 'Vis valideringsfeil' : 'Kjør søk'}
    </Button>
  )
}
