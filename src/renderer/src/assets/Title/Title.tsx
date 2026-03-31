import { JSX } from 'react'
import styled from 'styled-components'

interface TitleProps {
  $level?: 1 | 2 | 3 | 4 | 5 | 6
  color?: string
  children: React.ReactNode
  className?: string
}

const TitleStyles = styled.h1<TitleProps>`
  font-size: ${({ $level }): string => {
    switch ($level) {
      case 1:
        return 'clamp(2rem, 4vw, 2.5rem)'
      case 2:
        return 'clamp(1.75rem, 3.5vw, 2rem)'
      case 3:
        return 'clamp(1.5rem, 3vw, 1.75rem)'
      default:
        return 'clamp(2rem, 4vw, 2.5rem)'
    }
  }};
  margin-bottom: 0.5em;
  color: ${({ color }): string => color ?? 'var(--primary-color)'};
  text-align: center; /* Add this to center the title */
`

const Title: React.FC<TitleProps> = ({ $level = 1, children, className, color }) => {
  const Tag = `h${$level}` as keyof JSX.IntrinsicElements
  return (
    <TitleStyles as={Tag} $level={$level} className={className} color={color}>
      {children}
    </TitleStyles>
  )
}

export default Title
