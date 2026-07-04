// styles/theme.ts
import loadingPlanBackground from '../assets/background/loading-plan-theme1.png'

export const win95Theme = {
  colors: {
    desktop: '#008080',
    windowBg: '#c0c0c0',
    face: '#c0c0c0',
    light: '#ffffff',
    lightSoft: '#dfdfdf',
    shadow: '#808080',
    dark: '#404040',
    black: '#000000',
    titleBar: '#000080',
    titleBarInactive: '#7f7f7f',
    titleText: '#ffffff',
    text: '#000000',
    buttonFace: '#c0c0c0',
    inputBg: '#ffffff'
  },

  images: {
    desktopBackground: loadingPlanBackground
  }
}

export type AppTheme = typeof win95Theme
