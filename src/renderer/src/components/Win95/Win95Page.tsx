import React from 'react'
import styled, { css } from 'styled-components'
import {
  Window,
  TitleBar,
  Title,
  TitleButtons,
  TitleButton,
  WindowBody,
  TitleButtonIcon
} from './Win95Window'

const WIN95_PAGE_SIZE = {
  width: '1650px',
  maxWidth: '96vw',
  height: '800px',
  maxHeight: '90vh'
} as const

type Win95PageProps = {
  title: string
  children: React.ReactNode
  width?: string
  maxWidth?: string
  height?: string
  maxHeight?: string
  className?: string
  showWindowControls?: boolean
  stretchOnSmallScreens?: boolean
}

const Desktop = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.desktop};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(8px, 2vw, 24px);

  @media (max-width: 900px) {
    padding: 8px;
  }
`

const PageWindow = styled(Window)<{
  $width: string
  $maxWidth: string
  $height: string
  $maxHeight: string
  $stretchOnSmallScreens: boolean
}>`
  width: ${({ $width }) => $width};
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: ${({ $height }) => $height};
  max-height: ${({ $maxHeight }) => $maxHeight};
  min-height: 0;

  ${({ $stretchOnSmallScreens }) =>
    $stretchOnSmallScreens &&
    css`
      @media (max-width: 900px) {
        width: 100%;
        height: calc(100vh - 16px);
        max-height: calc(100vh - 16px);
      }
    `}
`

function Win95Page({
  title,
  children,
  width = WIN95_PAGE_SIZE.width,
  maxWidth = WIN95_PAGE_SIZE.maxWidth,
  height = WIN95_PAGE_SIZE.height,
  maxHeight = WIN95_PAGE_SIZE.maxHeight,
  className,
  showWindowControls = true,
  stretchOnSmallScreens = true
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
      <PageWindow
        $width={width}
        $maxWidth={maxWidth}
        $height={height}
        $maxHeight={maxHeight}
        $stretchOnSmallScreens={stretchOnSmallScreens}
      >
        <TitleBar>
          <Title>{title}</Title>

          {showWindowControls && (
            <TitleButtons>
              <TitleButton type="button" aria-label="Minimize window" onClick={handleMinimize}>
                <TitleButtonIcon $variant="min">_</TitleButtonIcon>
              </TitleButton>

              <TitleButton type="button" aria-label="Maximize window" onClick={handleMaximize}>
                <TitleButtonIcon $variant="max">□</TitleButtonIcon>
              </TitleButton>

              <TitleButton type="button" aria-label="Close window" onClick={handleClose}>
                <TitleButtonIcon $variant="close">×</TitleButtonIcon>
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
