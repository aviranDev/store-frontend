import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const sanitizeFileName = (value: string): string => {
  const cleanValue = value.trim() || 'load-plan'

  return cleanValue.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
}

const getCurrentWindow = (): BrowserWindow => {
  const focusedWindow = BrowserWindow.getFocusedWindow()

  if (focusedWindow) {
    return focusedWindow
  }

  const firstWindow = BrowserWindow.getAllWindows()[0]

  if (!firstWindow) {
    throw new Error('No active Electron window found.')
  }

  return firstWindow
}

const createLoadPlanPdfBuffer = async (): Promise<Buffer> => {
  const win = getCurrentWindow()

  const pdfBuffer = await win.webContents.printToPDF({
    landscape: true,
    printBackground: true,
    pageSize: 'A4',
    preferCSSPageSize: true,
    margins: {
      marginType: 'none'
    }
  })

  return pdfBuffer
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // temporary debug for packaged production
    if (!is.dev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('debug:open-devtools', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.webContents.openDevTools({ mode: 'detach' })
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    const win = BrowserWindow.getFocusedWindow()
    win?.close()
  })

  ipcMain.handle('load-plan-pdf:save', async (_event, fileName: string) => {
    const win = getCurrentWindow()
    const safeFileName = sanitizeFileName(fileName)
    const defaultFileName = safeFileName.toLowerCase().endsWith('.pdf')
      ? safeFileName
      : `${safeFileName}.pdf`

    const result = await dialog.showSaveDialog(win, {
      title: 'Save Load Plan PDF',
      defaultPath: defaultFileName,
      filters: [
        {
          name: 'PDF Files',
          extensions: ['pdf']
        }
      ]
    })

    if (result.canceled || !result.filePath) {
      return {
        canceled: true,
        filePath: null
      }
    }

    const pdfBuffer = await createLoadPlanPdfBuffer()

    await writeFile(result.filePath, pdfBuffer)

    return {
      canceled: false,
      filePath: result.filePath
    }
  })

  ipcMain.handle('load-plan-pdf:create-base64', async () => {
    const pdfBuffer = await createLoadPlanPdfBuffer()

    return pdfBuffer.toString('base64')
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
