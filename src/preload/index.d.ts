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
      debug?: {
        openDevTools: () => void
      }
      loadPlanPdf?: {
        save: (fileName: string) => Promise<{
          canceled: boolean
          filePath: string | null
        }>
        createBase64: () => Promise<string>
      }
    }
  }
}
