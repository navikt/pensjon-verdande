import { DatoInput } from './DatoInput'

type Props = {
  label: string
  verdi: string | null | undefined
  onChange: (verdi: string | null) => void
  feil?: string
}

export function ValgfriDatoEditor({ label, verdi, onChange, feil }: Props) {
  return (
    <DatoInput
      label={label}
      description="Valgfritt — la stå tom for å ikke filtrere på dato"
      value={verdi ?? ''}
      onChange={(v) => onChange(v === '' ? null : v)}
      error={feil}
    />
  )
}
