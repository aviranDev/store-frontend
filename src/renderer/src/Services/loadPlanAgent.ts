import httpService from './http'
import { LoadPlanCalculationMode, PreviewLoadPlanData, PreviewLoadPlanPayload } from './loadPlan'

type BuildLoadPlanRequestResponse = {
  success: boolean
  message: string
  data: PreviewLoadPlanPayload
}

type ExplainLoadPlanResponse = {
  success: boolean
  message: string
  data: {
    answer: string
  }
}

type AgentFileSource = {
  fileName: string
  mimeType?: string
  totalRows: number
  parsedRows: number
}

type AgentSkippedRow = {
  rowNumber: number
  reason: string
}

export type LoadPlanAgentPendingContext = {
  version: 1
  intent: 'cargo_request'
  requestAction: 'build_request' | 'modify_request'
  originalQuestion: string
  missingFields: string[]
}

type AgentResultMeta = {
  source?: AgentFileSource
  skippedRows?: AgentSkippedRow[]
  calculationMode?: LoadPlanCalculationMode
  previewResult?: PreviewLoadPlanData
  pendingContext?: LoadPlanAgentPendingContext | null
}

export type AskLoadPlanAgentResult =
  | ({
      action: 'answer'
      answer: string
    } & AgentResultMeta)
  | ({
      action: 'ask_clarification'
      answer: string
      questions: string[]
      missingFields: string[]
      draftRequest?: PreviewLoadPlanPayload
      assumptions: string[]
      warnings: string[]
    } & AgentResultMeta)
  | ({
      action: 'build_request'
      answer: string
      request: PreviewLoadPlanPayload
      assumptions: string[]
      warnings: string[]
    } & AgentResultMeta)
  | ({
      action: 'modify_request'
      answer: string
      request: PreviewLoadPlanPayload
      assumptions: string[]
      warnings: string[]
    } & AgentResultMeta)

type AskLoadPlanAgentResponse = {
  success: boolean
  message: string
  data: AskLoadPlanAgentResult
}

export const buildLoadPlanRequestFromText = async (
  text: string
): Promise<PreviewLoadPlanPayload> => {
  const response = await httpService.post<BuildLoadPlanRequestResponse>(
    '/load-plan-agent/build-request',
    { text }
  )

  return response.data.data
}

export const explainLoadPlan = async ({
  question,
  loadPlanResult
}: {
  question: string
  loadPlanResult: PreviewLoadPlanData
}): Promise<string> => {
  const response = await httpService.post<ExplainLoadPlanResponse>('/load-plan-agent/explain', {
    question,
    loadPlanResult
  })

  return response.data.data.answer
}

export const askLoadPlanAgent = async ({
  question,
  loadPlanResult,
  currentRequest,
  pendingContext
}: {
  question: string
  loadPlanResult?: PreviewLoadPlanData | null
  currentRequest?: PreviewLoadPlanPayload | null
  pendingContext?: LoadPlanAgentPendingContext | null
}): Promise<AskLoadPlanAgentResult> => {
  const body: {
    question: string
    loadPlanResult?: PreviewLoadPlanData
    currentRequest?: PreviewLoadPlanPayload
    pendingContext?: LoadPlanAgentPendingContext
  } = {
    question
  }

  if (loadPlanResult) {
    body.loadPlanResult = loadPlanResult
  }

  if (currentRequest) {
    body.currentRequest = currentRequest
  }

  if (pendingContext) {
    body.pendingContext = pendingContext
  }

  const response = await httpService.post<AskLoadPlanAgentResponse>('/load-plan-agent/ask', body)

  return response.data.data
}

export const uploadPackingListFile = async ({
  file,
  selectedContainerCode,
  text,
  currentRequest
}: {
  file: File
  selectedContainerCode?: string
  text?: string
  currentRequest?: PreviewLoadPlanPayload | null
}): Promise<AskLoadPlanAgentResult> => {
  const formData = new FormData()

  formData.append('file', file)

  if (selectedContainerCode) {
    formData.append('selectedContainerCode', selectedContainerCode)
  }

  if (text?.trim()) {
    formData.append('text', text.trim())
  }

  if (currentRequest) {
    formData.append('currentRequest', JSON.stringify(currentRequest))
  }

  const response = await httpService.post<AskLoadPlanAgentResponse>(
    '/load-plan-agent/upload-packing-list',
    formData
  )

  return response.data.data
}
