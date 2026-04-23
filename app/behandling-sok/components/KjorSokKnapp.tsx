import { Button } from '@navikt/ds-react'

type Props = {
  invalid: boolean
  onClick: () => void
}

export function KjorSokKnapp({ invalid, onClick }: Props) {
  return (
    <Button variant="primary" size="small" onClick={onClick}>
      {invalid ? 'Vis valideringsfeil' : 'Kjør søk'}
    </Button>
  )
}
