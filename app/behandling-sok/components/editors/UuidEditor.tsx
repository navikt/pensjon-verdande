import { TextField } from '@navikt/ds-react'

type Props = {
  label: string
  uuid: string
  onChange: (uuid: string) => void
  feil?: string
}

export function UuidEditor({ label, uuid, onChange, feil }: Props) {
  return (
    <TextField
      label={label}
      size="small"
      description="Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      value={uuid}
      onChange={(e) => onChange(e.target.value)}
      error={feil}
      style={{ maxWidth: 360 }}
    />
  )
}
