import type { ForwardedRef} from 'react';
import React, { forwardRef } from 'react'
import type { OverridableComponent } from '@navikt/ds-react'
import cl from 'clsx'
import styles from './Card.module.css'

interface Props extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export type CardHeaderType = OverridableComponent<Props, HTMLElement>

export const CardHeader: CardHeaderType = forwardRef(
  (
    {
      background,
      children,
      className,
      as: Component = 'div',
      style: _style,
      ...rest
    },
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const style: React.CSSProperties = {
      ..._style,
      backgroundColor: background ? `var(--a-${background})` : 'var(--ax-bg-sunken)',
    }

    return (
      <Component
        className={cl(className, styles.cardHeader )}
        ref={ref}
        {...rest}
      >
        <div className={styles.cardHeaderContent}>{children}</div>
      </Component>
    )
  },
)
