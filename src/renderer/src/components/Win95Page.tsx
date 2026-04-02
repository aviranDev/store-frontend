import React from 'react'
import styled from 'styled-components'
import { Window, TitleBar, Title, TitleButtons, TitleButton, WindowBody } from './Win95Window'

type Win95PageProps = {
  title: string
  children: React.ReactNode
  width?: string
  maxWidth?: string
  className?: string
  showTitleButtons?: boolean
}

const Desktop = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.desktop};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

const PageWindow = styled(Window)<{ $width: string; $maxWidth: string }>`
  width: ${({ $width }) => $width};
  max-width: ${({ $maxWidth }) => $maxWidth};
`

function Win95Page({
  title,
  children,
  width = '720px',
  maxWidth = '95vw',
  className,
  showTitleButtons = true
}: Win95PageProps): React.JSX.Element {
  return (
    <Desktop className={className}>
      <PageWindow $width={width} $maxWidth={maxWidth}>
        <TitleBar>
          <Title>{title}</Title>

          {showTitleButtons && (
            <TitleButtons>
              <TitleButton type="button" aria-label="Minimize">
                _
              </TitleButton>
              <TitleButton type="button" aria-label="Maximize">
                □
              </TitleButton>
              <TitleButton type="button" aria-label="Close">
                ×
              </TitleButton>
            </TitleButtons>
          )}
        </TitleBar>

        <WindowBody>{children}</WindowBody>
      </PageWindow>
    </Desktop>
  )
}

export default Win95Page
