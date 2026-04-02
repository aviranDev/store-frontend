import React from 'react'
import styled from 'styled-components'
import { Window, TitleBar, Title, TitleButtons, TitleButton, WindowBody } from './Win95Window'

type Win95PageProps = {
  title: string
  children: React.ReactNode
  width?: string
  maxWidth?: string
  height?: string
  maxHeight?: string
  className?: string
  showWindowControls?: boolean
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

const PageWindow = styled(Window)<{
  $width: string
  $maxWidth: string
  $height: string
  $maxHeight: string
}>`
  width: ${({ $width }) => $width};
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: ${({ $height }) => $height};
  max-height: ${({ $maxHeight }) => $maxHeight};
`

function Win95Page({
  title,
  children,
  width = '420px',
  maxWidth = '95vw',
  height = 'auto',
  maxHeight = '90vh',
  className,
  showWindowControls = true
}: Win95PageProps): React.JSX.Element {
  const handleMinimize = (): void => {
    window.api?.windowControls?.minimize()
  }

  const handleMaximize = (): void => {
    window.api?.windowControls?.maximize()
  }

  const handleClose = (): void => {
    window.api?.windowControls?.close()
  }

  return (
    <Desktop className={className}>
      <PageWindow $width={width} $maxWidth={maxWidth} $height={height} $maxHeight={maxHeight}>
        <TitleBar>
          <Title>{title}</Title>

          {showWindowControls && (
            <TitleButtons>
              <TitleButton type="button" aria-label="Minimize window" onClick={handleMinimize}>
                _
              </TitleButton>

              <TitleButton type="button" aria-label="Maximize window" onClick={handleMaximize}>
                □
              </TitleButton>

              <TitleButton type="button" aria-label="Close window" onClick={handleClose}>
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
