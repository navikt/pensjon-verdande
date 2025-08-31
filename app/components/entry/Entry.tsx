import React, { type ForwardedRef, forwardRef } from 'react'
import { HelpText, Label, type OverridableComponent } from '@navikt/ds-react'

interface Props extends React.HTMLAttributes<HTMLElement> {
  labelText?: string
  helpText?: string
  children: React.ReactNode
}

export const Entry: OverridableComponent<Props, HTMLElement> = forwardRef(
  (
    { labelText, helpText, children, as: Component = 'div', ...rest },
    ref: ForwardedRef<HTMLElement>,
  ) => {
    return (
      <div className={'entry'}>
        {labelText && <Label size={'small'}>{labelText}</Label>}
        {helpText && (
          <HelpText style={{ fontSize: '1.1em' }}>{helpText}</HelpText>
        )}
        <Component ref={ref} {...rest}>
          {children}
        </Component>
      </div>
    )
  },
)
