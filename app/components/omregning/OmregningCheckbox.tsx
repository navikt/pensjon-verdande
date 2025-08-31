import { Checkbox } from '@navikt/ds-react'
import type React from 'react'

interface OmregningCheckboxProps {
  defaultChecked: boolean,
  name: string,
  value: boolean,
  onChange: React.Dispatch<React.SetStateAction<boolean>>,
  children: React.ReactNode
}

export default function OmregningCheckbox(props: OmregningCheckboxProps)  {
  return (
    <Checkbox
      defaultChecked={props.defaultChecked}
      name={props.name}
      value={props.value}
      onChange={(event) => props.onChange(event.target.checked)}
    >
      {props.children}
    </Checkbox>
  )
}