import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api?: {
      outlook?: {
        openSignIn: (url: string) => Promise<void>
      }
      windowControls?: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
      debug?: {
        openDevTools: () => void
      }
      loadPlanPdf?: {
        save: (
          fileName: string,
          pdfBytes: ArrayBuffer
        ) => Promise<{
          canceled: boolean
          filePath: string | null
        }>
      }
    }
  }
}

