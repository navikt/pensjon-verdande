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
    {
      background,
      children,
      className,
      style: _style,
      as: Component = 'div',
      ...rest
    },
    ref: ForwardedRef<HTMLElement>,
  ) => {

    const style: React.CSSProperties = {
      ..._style,
      backgroundColor: background ? `var(--a-${background})` : 'var(--ax-bg-raised)',
    }

    return (
      <Component
        className={cl(className, styles.cardBody.toString())}
        style={style}
        ref={ref}
        {...rest}
      >
        {children}
      </Component>
    )
  },
)
