import http from './http'
export type Details = Record<string, string | number | null>
export type Draft = {
  id: string
  kind: 'acknowledgment' | 'clarification' | 'quotation'
  to: string
  subject: string
  body: string
  status: 'draft' | 'sending' | 'sent' | 'unknown' | 'cancelled'
  createdAt: string
  sentAt?: string
  error?: string
  providerDraftId?: string
  approvedAt?: string
}
export type Dashboard = {
  revision: number
  stage: string
  state: string
  enteredAt: string
  terminalAt?: string
  trackingStartedAt: string
  details: Details
  editedFields: string[]
  conflicts: string[]
  verifiedAt?: string
  quotationText: string
  pricingApprovedAt?: string
  outcome?: string
  reason?: string
  processing?: { startedAt: string }
  drafts: Draft[]
  events: { at: string; actor: string; action: string; note: string }[]
  messages: {
    messageId?: string
    from: string
    subject: string
    text: string
    receivedAt: string
    attachment?: { name: string; text: string }
  }[]
}
export type Employee = { _id: string; username: string; email: string }
export type Quotation = {
  _id: string
  quoteName: string
  reference?: string
  poNumber?: string
  source: string
  sourceMailbox?: string
  client: { name?: string; companyName?: string; email: string }
  assignedTo?: string
  assignedEmployee?: Employee
  receivedEmail: { subject: string; text: string; from: string; receivedAt: string }
  analysis?: { summary?: string; isQuotationRequest?: boolean; [key: string]: unknown }
  workflowSteps: { key: string; label: string; status: string; note?: string }[]
  dashboard: Dashboard
  missingFields: string[]
  serverNow: string
  errorMessage?: string
  connection?: { accountEmail: string; status: string }
  timers: { totalMs: number; activeMs: number; waitingMs: number; stageMs: number }
}
export type QuotationRow = {
  sourcing?: { status: string; valid?: boolean; decision?: string }
  _id: string
  quoteName: string
  reference?: string
  poNumber?: string
  subject: string
  client: Quotation['client']
  sourceMailbox?: string
  employee?: string
  receivedAt: string
  stage: string
  state: string
  terminalAt?: string
  enteredAt?: string
  missingFields: string[]
  conflicts?: string[]
  origin?: string
  destination?: string
  incoterm?: string
  shipmentType?: string
  details?: Details
  errorMessage?: string
}
export type QuotationList = {
  items: QuotationRow[]
  total: number
  page: number
  pageSize: number
  overdueHours: number
  serverNow: string
}
export type Attachment = { id: string; name: string; size: number; messageId: string }
const base = '/quotations'
export const listQuotations = async (params: Record<string, string | number | boolean>) =>
  (await http.get<{ data: QuotationList }>(base, { params })).data.data
export const getQuotation = async (id: string) =>
  (await http.get<{ data: Quotation }>(`${base}/${id}`)).data.data
export const getQuotationEmployees = async () =>
  (await http.get<{ data: Employee[] }>(`${base}/employees`)).data.data
export const actOnQuotation = async (id: string, payload: Record<string, unknown>) =>
  (await http.post(`${base}/${id}/actions`, payload)).data
export const retryQuotation = async (id: string, revision: number) =>
  http.post(`${base}/${id}/retry`, { revision })
export const getQuotationAttachments = async (id: string) =>
  (await http.get<{ data: Attachment[] }>(`${base}/${id}/attachments`)).data.data
export async function downloadQuotationAttachment(id: string, file: Attachment) {
  const response = await http.get(
    `${base}/${id}/attachments/${encodeURIComponent(file.messageId)}/${encodeURIComponent(file.id)}`,
    { responseType: 'blob' }
  )
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 10000)
}
