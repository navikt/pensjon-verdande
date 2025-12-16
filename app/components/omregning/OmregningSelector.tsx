import { Select } from '@navikt/ds-react'
import type React from 'react'

interface OmregningSelectorProps {
  label: string
  navn: string
  value: string
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>
  optionsmap: { value: string; label: string }[]
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
    >
      {props.optionsmap.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
