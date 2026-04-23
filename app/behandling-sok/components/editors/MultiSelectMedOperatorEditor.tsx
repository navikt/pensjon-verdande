import { ToggleGroup } from '@navikt/ds-react'
import type { Operator } from '../../lib/kriterier'
import { MultiSelectEditor } from './MultiSelectEditor'

type Props = {
  label: string
  alternativer: string[]
  historiske?: string[]
  valgte: string[]
  operator: Operator
  onChange: (nye: { valgte: string[]; operator: Operator }) => void
  feil?: string
}

/**
 * Multi-select med AND/OR-toggle for kriterier som må kunne uttrykke begge.
 * OR = "minst én av", AND = "alle disse" (per spec).
 */
export function MultiSelectMedOperatorEditor({
  label,
  alternativer,
  historiske,
  valgte,
  operator,
  onChange,
  feil,
}: Props) {
  return (
    <div style={{ display: 'flex', gap: 'var(--ax-space-12)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <MultiSelectEditor
          label={label}
          alternativer={alternativer}
          historiske={historiske}
          valgte={valgte}
          onChange={(nye) => onChange({ valgte: nye, operator })}
          feil={feil}
        />
      </div>
      <ToggleGroup
        size="small"
        label="Kombinasjon"
        value={operator}
        onChange={(v) => onChange({ valgte, operator: v as Operator })}
      >
        <ToggleGroup.Item value="OR">Minst én</ToggleGroup.Item>
        <ToggleGroup.Item value="AND">Alle</ToggleGroup.Item>
      </ToggleGroup>
    </div>
  )
}
