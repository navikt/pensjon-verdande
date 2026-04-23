import { BodyShort } from '@navikt/ds-react'

/**
 * For kriterier uten parametre — bare informasjon om at filteret er aktivt.
 * (HAR_AAPEN_MANUELL_BEHANDLING, HAR_AAPEN_BREVBESTILLING, KONTROLLPUNKT_ER_KRITISK)
 */
export function CheckboxEditor({ beskrivelse }: { beskrivelse: string }) {
  return <BodyShort size="small">{beskrivelse}</BodyShort>
}
