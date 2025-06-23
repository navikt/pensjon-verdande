import React, { forwardRef } from 'react'
import cl from 'clsx'
import { OverridableComponent } from '@navikt/ds-react'
import styles from './Card.module.css'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level
   * @default "1"
   */
  level?: '1' | '2' | '3' | '4' | '5' | '6'
  /**
   * Changes text-sizing
   */
  size?: 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall'
  /**
   * Heading text
   */
  children: React.ReactNode
  /**
   * Adds margin-bottom
   * @default false
   */
  spacing?: boolean
  centerCaret?: boolean
}

export type CardHeadingType = OverridableComponent<
  HeadingProps,
  HTMLHeadingElement
>

export const CardHeading: CardHeadingType = forwardRef(
  (
    {
      level = '1',
      size = 'small',
      spacing = false,
      centerCaret = false,
      className,
      as,
      ...rest
    },
    ref,
  ) => {
    const HeadingTag = as ?? (`h${level}` as React.ElementType)
    const inputs = {
      'navds-typo--spacing': spacing,
      [styles.cardHeadingCaret]: centerCaret,
    }

    return (
      <HeadingTag
        {...rest}
        ref={ref}
        className={cl(
          className,
          'aksel-heading',
          styles.cardHeading,
          `aksel-heading--${size}`,
          inputs,
        )}
      />
    )
  },
)
