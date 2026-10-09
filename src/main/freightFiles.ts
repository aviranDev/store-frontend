import { BrowserWindow, dialog, ipcMain } from 'electron'
import { open } from 'fs/promises'
import { basename, extname, join } from 'path'
import { pathToFileURL } from 'url'
import { is } from '@electron-toolkit/utils'
export function registerFreightFilePicker(): void {
  ipcMain.handle('freight:pick-files', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win || event.senderFrame !== event.sender.mainFrame)
      throw new Error('Invalid file picker source.')
    const actual = new URL(event.senderFrame.url)
    const expected = new URL(
      is.dev && process.env.ELECTRON_RENDERER_URL
        ? process.env.ELECTRON_RENDERER_URL
        : pathToFileURL(join(__dirname, '../renderer/index.html')).href
    )
    if (
      actual.protocol !== expected.protocol ||
      actual.host !== expected.host ||
      (expected.protocol === 'file:' && actual.pathname !== expected.pathname)
    )
      throw new Error('File picker is only available to the application.')
    const result = await dialog.showOpenDialog(win, {
      title: 'Import agents or tariffs',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Excel and CSV', extensions: ['xlsx', 'xls', 'csv'] }]
    })
    if (result.canceled) return []
    if (result.filePaths.length > 5) throw new Error('Choose up to five files at a time.')
    const files: { name: string; bytes: Uint8Array }[] = []
    for (const filePath of result.filePaths) {
      if (!['.xlsx', '.xls', '.csv'].includes(extname(filePath).toLowerCase()))
        throw new Error('Choose Excel or CSV files.')
      const handle = await open(filePath, 'r')
      try {
        const stat = await handle.stat()
        if (!stat.isFile() || stat.size > 5 * 1024 * 1024 || stat.size === 0)
          throw new Error('Each file must be between 1 byte and 5 MB.')
        const bytes = await handle.readFile()
        if (bytes.length > 5 * 1024 * 1024) throw new Error('File grew beyond the 5 MB limit.')
        files.push({ name: basename(filePath), bytes: new Uint8Array(bytes) })
      } finally {
        await handle.close()
      }
    }
    return files
  })
}
