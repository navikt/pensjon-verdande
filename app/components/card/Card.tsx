import React, { forwardRef, useState } from 'react'
import styles from './Card.module.css'
import cl from 'clsx'
import { CardGrid, CardGridType } from './CardGrid'
import { CardBody, CardBodyType } from './CardBody'
import { CardHeader, CardHeaderType } from './CardHeader'
import { CardHeading, CardHeadingType } from './CardHeading'
import { CardContext } from './CardContext'
import {
  BackgroundToken,
  BorderRadiiToken,
  ResponsiveProp,
  SpaceDelimitedAttribute,
} from '@navikt/ds-react/src/layout/utilities/types'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  spacingBottom?: string
  children: React.ReactNode
  background?: BackgroundToken
  borderRadius?: ResponsiveProp<SpaceDelimitedAttribute<BorderRadiiToken>>
}

export interface CardType
  extends React.ForwardRefExoticComponent<
    Props & React.RefAttributes<HTMLDivElement>
  > {
  Body: CardBodyType
  Grid: CardGridType
  Header: CardHeaderType
  Heading: CardHeadingType
}

export const Card = forwardRef(
  (
    {
      background,
      spacingBottom = '0',
      children,
      style: _style,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(true)

    const style: React.CSSProperties = {
      ..._style,
      backgroundColor: background ? `var(--a-${background})` : 'var(--ax-bg-sunken)',
    }

    return (
      <CardContext.Provider value={{ isOpen, setIsOpen }}>
        <div className={cl(styles.card)} ref={ref} style={style} {...rest}>
          {children}
        </div>
      </CardContext.Provider>
    )
  },
) as CardType

Card.Body = CardBody
Card.Grid = CardGrid
Card.Header = CardHeader
Card.Heading = CardHeading

export default Card
