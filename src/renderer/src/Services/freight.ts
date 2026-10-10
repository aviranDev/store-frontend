import http from './http'
export type Agent = {
  company: string
  contact: string
  email: string
  countries: string[]
  modes: string[]
  directions: string[]
  services: string[]
  preferred: boolean
  notes: string
  sourceBatch?: string
  sourceRow?: number
}
export type Offer = {
  id: string
  tariff: string
  supplier: string
  sourceBatch: string
  validTo: string
  lines: {
    charge: string
    service: string
    currency: string
    unit: string
    rate: number
    quantity: number
    minimum: number
    amount: number
    sourceRow?: number
  }[]
  totals: Record<string, number>
  missingServices: string[]
  warnings: string[]
  complete: boolean
}
export type RFQ = {
  id: string
  agent: Agent
  subject: string
  body: string
  version: number
  editedAt?: string
  editedBy?: string
}
export type Sourcing = {
  runId: string
  status: 'running' | 'complete' | 'error' | 'stale'
  startedAt: string
  completedAt?: string
  error?: string
  steps: {
    key: string
    label: string
    status: 'running' | 'complete' | 'error'
    at: string
    note?: string
  }[]
  result?: {
    decision: string
    valid: boolean
    incoterm: { code: string; status: string; reasons: string[] }
    blockers: string[]
    missingInformation?: string[]
    rfqBlockers?: string[]
    agentDiagnostics?: {
      totalActive: number
      countryMatches: number
      modeMatches: number
      directionMatches: number
      serviceMatches: number
    }
    reviewRequired?: string[]
    warnings: string[]
    offers: Offer[]
    agents: Agent[]
    rfqs: RFQ[]
  }
}
export type Batch = {
  _id: string
  kind: 'agents' | 'tariffs'
  filename: string
  status: string
  active: boolean
  revision: number
  count: number
  error?: string
  errors: { row: number; message: string }[]
  createdAt: string
  events: { at: string; actor: string; note: string }[]
  sheets?: { name: string; rows: number }[]
  headers?: string[]
  sample?: (string | number | null)[][]
  fields?: string[]
  suggestion?: Record<string, number>
  mapping?: Record<string, number>
  sheet?: number
  headerRow?: number
}
const base = '/freight-catalog'
export async function uploadCatalog(file: File, kind: string, progress: (n: number) => void) {
  const body = new FormData()
  body.append('file', file)
  body.append('kind', kind)
  return (
    await http.post<{ data: { _id: string; status: string } }>(base + '/imports', body, {
      onUploadProgress: (e) => progress(e.total ? Math.round((e.loaded / e.total) * 100) : 0)
    })
  ).data.data
}
export const catalogBatches = async () =>
  (await http.get<{ data: Batch[] }>(base + '/imports')).data.data
export const catalogBatch = async (id: string, sheet: number, headerRow: number) =>
  (await http.get<{ data: Batch }>(`${base}/imports/${id}`, { params: { sheet, headerRow } })).data
    .data
export const importCatalog = async (id: string, payload: Record<string, unknown>) =>
  (await http.post(`${base}/imports/${id}/commit`, payload)).data
export const activateCatalog = async (id: string, revision: number, active: boolean) =>
  http.post(`${base}/imports/${id}/active`, { revision, active })
export const retryCatalog = async (id: string, revision: number) =>
  http.post(`${base}/imports/${id}/retry`, { revision })
export const aiMapping = async (id: string, sheet: number, headerRow: number) =>
  (
    await http.post<{ data: Record<string, number> }>(`${base}/imports/${id}/suggest`, {
      sheet,
      headerRow
    })
  ).data.data
export const catalogEntries = async (kind: string, page: number) =>
  (
    await http.get<{
      data: {
        items: { _id: string; batch: string; row: number; value: Record<string, unknown> }[]
        total: number
      }
    }>(base + '/entries', { params: { kind, page } })
  ).data.data
export const getSourcing = async (id: string, includeHistory = false) =>
  (
    await http.get<{ data: { sourcing?: Sourcing; history?: Sourcing[]; revision: number } }>(
      `/quotations/${id}/sourcing`,
      { params: { includeHistory } }
    )
  ).data.data
export const runSourcing = async (id: string) => http.post(`/quotations/${id}/sourcing`)
export const applyTariff = async (id: string, runId: string, offerId: string, revision: number) =>
  http.post(`/quotations/${id}/sourcing/apply`, { runId, offerId, revision })
export const saveRfq = async (id: string, runId: string, draft: RFQ) =>
  http.post(`/quotations/${id}/sourcing/rfq`, {
    runId,
    draftId: draft.id,
    version: draft.version,
    subject: draft.subject,
    body: draft.body
  })
export async function downloadCatalog(id: string, name: string) {
  const response = await http.get(`${base}/imports/${id}/file`, { responseType: 'blob' })
  downloadBlob(response.data, name)
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 10000)
}
