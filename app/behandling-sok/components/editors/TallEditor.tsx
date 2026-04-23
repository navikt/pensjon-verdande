import { TextField } from '@navikt/ds-react'

type Props = {
  label: string
  verdi: number
  onChange: (verdi: number) => void
  feil?: string
  min?: number
}

export function TallEditor({ label, verdi, onChange, feil, min = 0 }: Props) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={String(verdi)}
      min={min}
      onChange={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
      error={feil}
      style={{ maxWidth: 160 }}
    />
  )
}
