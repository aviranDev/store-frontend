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

  /**
   * undefined = use default theme background image
   * string = use custom image
   * null = disable image and use solid desktop color
   */
  desktopBackgroundImage?: string | null
  desktopBackgroundSize?: string
  desktopBackgroundPosition?: string
  desktopBackgroundOverlay?: boolean
}

const Desktop = styled.div<{
  $desktopBackgroundImage?: string | null
  $desktopBackgroundSize: string
  $desktopBackgroundPosition: string
  $desktopBackgroundOverlay: boolean
}>`
  width: 100%;
  min-height: 100vh;

  background-color: ${({ theme }) => theme.colors.desktop};

  background-image: ${({ theme, $desktopBackgroundImage, $desktopBackgroundOverlay }) => {
    const backgroundImage =
      $desktopBackgroundImage === undefined
        ? theme.images.desktopBackground
        : $desktopBackgroundImage

    if (!backgroundImage) return 'none'

    if ($desktopBackgroundOverlay) {
      return `
        linear-gradient(
          rgba(0, 20, 25, 0.12),
          rgba(0, 20, 25, 0.18)
        ),
        url(${backgroundImage})
      `
    }

    return `url(${backgroundImage})`
  }};

  background-size: ${({ $desktopBackgroundSize }) => $desktopBackgroundSize};
  background-position: ${({ $desktopBackgroundPosition }) => $desktopBackgroundPosition};
  background-repeat: no-repeat;

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

const DraggableTitleBar = styled(TitleBar)`
  app-region: drag;
  -webkit-app-region: drag;
  user-select: none;
`

const WindowControlButtons = styled(TitleButtons)`
  app-region: no-drag;
  -webkit-app-region: no-drag;
`

const WindowControlButton = styled(TitleButton)`
  app-region: no-drag;
  -webkit-app-region: no-drag;
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
  stretchOnSmallScreens = true,

  desktopBackgroundImage,
  desktopBackgroundSize = 'cover',
  desktopBackgroundPosition = 'center',
  desktopBackgroundOverlay = true
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
    <Desktop
      className={className}
      $desktopBackgroundImage={desktopBackgroundImage}
      $desktopBackgroundSize={desktopBackgroundSize}
      $desktopBackgroundPosition={desktopBackgroundPosition}
      $desktopBackgroundOverlay={desktopBackgroundOverlay}
    >
      <PageWindow
        $width={width}
        $maxWidth={maxWidth}
        $height={height}
        $maxHeight={maxHeight}
        $stretchOnSmallScreens={stretchOnSmallScreens}
      >
        <DraggableTitleBar>
          <Title>{title}</Title>

          {showWindowControls && (
            <WindowControlButtons>
              <WindowControlButton
                type="button"
                aria-label="Minimize window"
                onClick={handleMinimize}
              >
                <TitleButtonIcon $variant="min">_</TitleButtonIcon>
              </WindowControlButton>

              <WindowControlButton
                type="button"
                aria-label="Maximize window"
                onClick={handleMaximize}
              >
                <TitleButtonIcon $variant="max">□</TitleButtonIcon>
              </WindowControlButton>

              <WindowControlButton type="button" aria-label="Close window" onClick={handleClose}>
                <TitleButtonIcon $variant="close">×</TitleButtonIcon>
              </WindowControlButton>
            </WindowControlButtons>
          )}
        </DraggableTitleBar>

        <WindowBody>{children}</WindowBody>
      </PageWindow>
    </Desktop>
  )
}

export default Win95Page
