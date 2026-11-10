import { Select } from '@navikt/ds-react'

interface OmregningSelectorProps {
  label: string
  navn: string
  value: string
  setSelectedValue: (value: string) => void
  optionsmap: { value: string; label: string }[]
  readOnly?: boolean
  size?: 'small' | 'medium'
}

export default function OmregningSelector(props: OmregningSelectorProps) {
  return (
    <Select
      label={props.label}
      name={props.navn}
      value={props.value}
      onChange={(event) => props.setSelectedValue(event.target.value)}
      size={props.size}
      readOnly={props.readOnly}
    >
      {props.optionsmap.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
