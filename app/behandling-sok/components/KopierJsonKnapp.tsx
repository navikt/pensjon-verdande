import { CopyButton, HStack } from '@navikt/ds-react'
import type { Kriterium } from '../lib/kriterier'
import type { Aggregering, Tidsdimensjon, Visning } from '../lib/url-state'

type Snapshot = {
  schemaVersion: '1'
  behandlingType: string | null
  visning: Visning
  aggregering: Aggregering
  tidsdimensjon: Tidsdimensjon
  kriterier: Kriterium[]
}

export function KopierJsonKnapp({ snapshot }: { snapshot: Snapshot }) {
  // CopyButton kopierer activeText. Vi serialiserer til klargjort JSON.
  const text = JSON.stringify(snapshot, null, 2)
  return (
    <HStack gap="space-8" align="center">
      <CopyButton size="small" copyText={text} text="Kopiér som JSON" activeText="Kopiert!" variant="action" />
    </HStack>
  )
}
