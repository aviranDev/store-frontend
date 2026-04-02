import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api?: {
      windowControls?: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
    }
  }
}
