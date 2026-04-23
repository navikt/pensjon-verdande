import { UNSAFE_Combobox } from '@navikt/ds-react'

type Props = {
  label: string
  alternativer: string[]
  /** Verdier som finnes i `observed` men ikke `supported` — merkes "(historisk)". */
  historiske?: string[]
  valgte: string[]
  onChange: (nye: string[]) => void
  feil?: string
}

/**
 * Generisk multi-select av strings, fôret fra metadata (status, team, sakstyper, etc.).
 * Sammensetter `supported ∪ observed` og merker observed-only som "(historisk)".
 */
export function MultiSelectEditor({ label, alternativer, historiske = [], valgte, onChange, feil }: Props) {
  const historiskeSet = new Set(historiske)
  const alleAlternativer = Array.from(new Set([...alternativer, ...historiske])).sort()
  const options = alleAlternativer.map((v) => ({
    label: historiskeSet.has(v) ? `${v} (historisk)` : v,
    value: v,
  }))

  return (
    <UNSAFE_Combobox
      label={label}
      size="small"
      options={options}
      isMultiSelect
      selectedOptions={valgte}
      onToggleSelected={(option, isSelected) => {
        onChange(isSelected ? [...valgte, option] : valgte.filter((v) => v !== option))
      }}
      error={feil}
    />
  )
}
