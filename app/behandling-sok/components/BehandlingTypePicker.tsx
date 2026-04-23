import { UNSAFE_Combobox } from '@navikt/ds-react'

type Props = {
  typer: string[]
  valgt: string | null
  onChange: (type: string | null) => void
}

export function BehandlingTypePicker({ typer, valgt, onChange }: Props) {
  return (
    <UNSAFE_Combobox
      label="Behandlingstype"
      size="small"
      options={typer.map((t) => ({ label: t, value: t }))}
      selectedOptions={valgt ? [valgt] : []}
      shouldAutocomplete
      onToggleSelected={(option, isSelected) => {
        if (isSelected) onChange(option)
        else onChange(null)
      }}
    />
  )
}
