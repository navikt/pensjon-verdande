import { Select } from '@navikt/ds-react'
import React from 'react'

interface OmregningSelectorProps {
  label: string,
  navn: string,
  value: string,
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>,
  optionsmap: { value: string, label: string }[]
}

export default function OmregningSelector (props: OmregningSelectorProps) {
  return (
    <Select
      label={props.label}
      name={props.navn}
      value={props.value}
      onChange={(event) => props.setSelectedValue(event.target.value)}>
      {props.optionsmap.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}