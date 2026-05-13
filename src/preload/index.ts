import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  windowControls: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  },
  debug: {
    openDevTools: () => ipcRenderer.send('debug:open-devtools')
  },
  loadPlanPdf: {
    save: (fileName: string) => ipcRenderer.invoke('load-plan-pdf:save', fileName),
    createBase64: () => ipcRenderer.invoke('load-plan-pdf:create-base64')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
