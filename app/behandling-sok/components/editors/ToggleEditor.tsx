import { ToggleGroup } from '@navikt/ds-react'

type Props = {
  label: string
  verdi: boolean
  onChange: (verdi: boolean) => void
}

export function ToggleEditor({ label, verdi, onChange }: Props) {
  return (
    <ToggleGroup size="small" label={label} value={verdi ? 'JA' : 'NEI'} onChange={(v) => onChange(v === 'JA')}>
      <ToggleGroup.Item value="JA">Ja</ToggleGroup.Item>
      <ToggleGroup.Item value="NEI">Nei</ToggleGroup.Item>
    </ToggleGroup>
  )
}
