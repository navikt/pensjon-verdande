import { Checkbox } from '@navikt/ds-react'
import type React from 'react'

interface OmregningCheckboxProps {
  name: string
  value: boolean
  onChange: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
  readOnly?: boolean
}

export default function OmregningCheckbox(props: OmregningCheckboxProps) {
  return (
    <Checkbox
      checked={props.value}
      name={props.name}
      value={props.value}
      onChange={(event) => props.onChange(event.target.checked)}
      readOnly={props.readOnly}
    >
      {props.children}
    </Checkbox>
  )
}
