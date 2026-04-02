import React from 'react'
import styled, { css } from 'styled-components'
import { raisedBox, sunkenBox } from '../styles/mixins'

type Win95CardProps = {
  title?: string
  children: React.ReactNode
  className?: string
  padded?: boolean
  inset?: boolean
}

const CardWrapper = styled.section<{ $padded: boolean; $inset: boolean }>`
  background: ${({ theme }) => theme.colors.face};
  color: ${({ theme }) => theme.colors.text};
  ${({ $inset }) => ($inset ? sunkenBox : raisedBox)};
  ${({ $padded }) =>
    $padded &&
    css`
      padding: 10px;
    `};

  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CardHeader = styled.div`
  font-weight: bold;
  padding-bottom: 4px;
`

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

function Win95Card({
  title,
  children,
  className,
  padded = true,
  inset = false
}: Win95CardProps): React.JSX.Element {
  return (
    <CardWrapper className={className} $padded={padded} $inset={inset}>
      {title && <CardHeader>{title}</CardHeader>}
      <CardBody>{children}</CardBody>
    </CardWrapper>
  )
}

export default Win95Card
