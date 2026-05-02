import httpService from './http'
import { PreviewLoadPlanData, PreviewLoadPlanPayload } from './loadPlan'

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

export type AskLoadPlanAgentResult =
  | {
      action: 'answer'
      answer: string
    }
  | {
      action: 'ask_clarification'
      answer: string
      questions: string[]
      missingFields: string[]
      draftRequest?: PreviewLoadPlanPayload
      assumptions: string[]
      warnings: string[]
    }
  | {
      action: 'build_request'
      answer: string
      request: PreviewLoadPlanPayload
      assumptions: string[]
      warnings: string[]
    }

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
  currentRequest
}: {
  question: string
  loadPlanResult?: PreviewLoadPlanData | null
  currentRequest?: PreviewLoadPlanPayload | null
}): Promise<AskLoadPlanAgentResult> => {
  const body: {
    question: string
    loadPlanResult?: PreviewLoadPlanData
    currentRequest?: PreviewLoadPlanPayload
  } = {
    question
  }

  if (loadPlanResult) {
    body.loadPlanResult = loadPlanResult
  }

  if (currentRequest) {
    body.currentRequest = currentRequest
  }

  const response = await httpService.post<AskLoadPlanAgentResponse>('/load-plan-agent/ask', body)

  return response.data.data
}
