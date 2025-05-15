import type { ForwardedRef} from 'react';
import React, { forwardRef } from 'react'
import type { OverridableComponent } from '@navikt/ds-react'
import cl from 'clsx'
import styles from './Card.module.css'

interface Props extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export type CardBodyType = OverridableComponent<Props, HTMLElement>

export const CardBody: CardBodyType = forwardRef(
  (
    { children, className, as: Component = 'div', ...rest },
    ref: ForwardedRef<HTMLElement>,
  ) => {

    return (
      <Component
        className={cl(className, styles.cardBody.toString())}
        ref={ref}
        {...rest}
      >
        {children}
      </Component>
    )
  },
)
