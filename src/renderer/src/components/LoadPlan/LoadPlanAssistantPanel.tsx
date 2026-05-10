import { useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, JSX } from 'react'
import { AxiosError } from 'axios'

import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import WinButton from '../../components/Button/WinButton'
import {
  TabContentLayout,
  TabFooter,
  AssistantTop,
  AgentMessages,
  AgentMessageBubble,
  AgentInputRow,
  AgentInput
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

import { PreviewLoadPlanData, PreviewLoadPlanPayload } from '../../Services/loadPlan'
import { askLoadPlanAgent, uploadPackingListFile } from '../../Services/loadPlanAgent'
import type { AskLoadPlanAgentResult } from '../../Services/loadPlanAgent'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

type RequestAgentResult =
  | Extract<AskLoadPlanAgentResult, { action: 'build_request' }>
  | Extract<AskLoadPlanAgentResult, { action: 'modify_request' }>

type Props = {
  message: string
  previewData: PreviewLoadPlanData | null
  previewDataExists: boolean
  selectedContainerCode: string
  warnings: string[]
  errors: string[]
  onBack: () => void
  onApplyGeneratedPayload: (payload: PreviewLoadPlanPayload) => Promise<void>
}

const createId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

const appendListSection = (lines: string[], title: string, values?: string[]): void => {
  if (!values || values.length === 0) return

  lines.push('')
  lines.push(`${title}:`)

  values.forEach((value) => {
    lines.push(`- ${value}`)
  })
}

const formatAgentResult = (result: AskLoadPlanAgentResult): string => {
  const lines: string[] = [result.answer]

  if (result.source) {
    lines.push('')
    lines.push('Uploaded file:')
    lines.push(`- File: ${result.source.fileName}`)
    lines.push(`- Total rows: ${result.source.totalRows}`)
    lines.push(`- Parsed cargo rows: ${result.source.parsedRows}`)
  }

  if (result.skippedRows && result.skippedRows.length > 0) {
    lines.push('')
    lines.push('Skipped rows:')
    result.skippedRows.slice(0, 8).forEach((row) => {
      lines.push(`- Row ${row.rowNumber}: ${row.reason}`)
    })

    if (result.skippedRows.length > 8) {
      lines.push(`- ${result.skippedRows.length - 8} more skipped rows...`)
    }
  }

  if ('questions' in result) {
    appendListSection(lines, 'Questions', result.questions)
  }

  if ('assumptions' in result) {
    appendListSection(lines, 'Assumptions', result.assumptions)
  }

  if ('warnings' in result) {
    appendListSection(lines, 'Warnings', result.warnings)
  }

  return lines.join('\n')
}

const formatBuildRequestMessage = (result: RequestAgentResult): string => {
  const lines: string[] = [
    result.answer,
    '',
    `Container: ${result.request.selectedContainerCode}`,
    `Cargo lines: ${result.request.cargoItems.length}`
  ]

  if (result.source) {
    lines.push('')
    lines.push('Uploaded file:')
    lines.push(`- File: ${result.source.fileName}`)
    lines.push(`- Total rows: ${result.source.totalRows}`)
    lines.push(`- Parsed cargo rows: ${result.source.parsedRows}`)
  }

  if (result.skippedRows && result.skippedRows.length > 0) {
    lines.push('')
    lines.push('Skipped rows:')
    result.skippedRows.slice(0, 8).forEach((row) => {
      lines.push(`- Row ${row.rowNumber}: ${row.reason}`)
    })

    if (result.skippedRows.length > 8) {
      lines.push(`- ${result.skippedRows.length - 8} more skipped rows...`)
    }
  }

  lines.push('')
  lines.push('Calculating the preview now...')

  appendListSection(lines, 'Assumptions', result.assumptions)
  appendListSection(lines, 'Warnings', result.warnings)

  return lines.join('\n')
}

const isAllowedPackingListFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase()

  return fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')
}

const LoadPlanAssistantPanel = ({
  message,
  previewData,
  previewDataExists,
  selectedContainerCode,
  warnings,
  errors,
  onBack,
  onApplyGeneratedPayload
}: Props): JSX.Element => {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  /**
   * Important:
   * This keeps the draft request returned by the backend.
   *
   * Example:
   * User: "please use container 20GP"
   * Backend returns draftRequest: { selectedContainerCode: '20GP', cargoItems: [] }
   * Frontend stores it here.
   *
   * Next user message:
   * "3 cartons 120x115x100..."
   *
   * Frontend sends currentRequest back to backend,
   * so backend keeps 20GP instead of falling back to 40HC.
   */
  const [currentAgentRequest, setCurrentAgentRequest] = useState<PreviewLoadPlanPayload | null>(
    null
  )

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: 'assistant',
      text: 'Hello. I can build a load plan from text, upload a packing list file, ask for missing cargo details, explain fit results, warnings, stacking rules, cargo placement, and weight balance.'
    }
  ])

  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const resizeInput = (element: HTMLTextAreaElement): void => {
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 260)}px`
  }

  const scrollToBottom = (): void => {
    const scroll = (): void => {
      const node = messagesRef.current

      if (!node) return

      node.scrollTop = node.scrollHeight
    }

    window.requestAnimationFrame(scroll)
    window.setTimeout(scroll, 50)
    window.setTimeout(scroll, 150)
  }

  const addMessage = (role: 'user' | 'assistant', text: string): void => {
    setMessages((prev) => [...prev, { id: createId(), role, text }])
  }

  const clearInput = (): void => {
    setInput('')

    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        resizeInput(inputRef.current)
      }
    })
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(event.target.value)
    resizeInput(event.target)
  }

  const handleAgentResult = async (result: AskLoadPlanAgentResult): Promise<void> => {
    if (result.action === 'answer') {
      addMessage('assistant', formatAgentResult(result))
      return
    }

    if (result.action === 'ask_clarification') {
      if (result.draftRequest) {
        setCurrentAgentRequest(result.draftRequest)
      }

      addMessage('assistant', formatAgentResult(result))
      return
    }

    setCurrentAgentRequest(result.request)

    addMessage('assistant', formatBuildRequestMessage(result))

    await onApplyGeneratedPayload(result.request)

    addMessage(
      'assistant',
      'The preview is ready. You can see the container plan on the right side. You can also ask me why the cargo was placed this way, what the warnings mean, or how the weight balance looks.'
    )
  }

  const handleAsk = async (): Promise<void> => {
    const question = input.trim()

    if (!question) return

    try {
      setIsSending(true)
      clearInput()
      addMessage('user', question)

      const shouldSendPreviewData =
        /\bwhy\b/i.test(question) ||
        /\bfit\b/i.test(question) ||
        /\bnot fit\b/i.test(question) ||
        /\bunplaced\b/i.test(question) ||
        /\bwarning\b/i.test(question) ||
        /\berror\b/i.test(question) ||
        /\bweight balance\b/i.test(question) ||
        /\bbalance\b/i.test(question) ||
        /\bwhere\b/i.test(question) ||
        /\bplaced\b/i.test(question) ||
        /\bposition\b/i.test(question)

      const result = await askLoadPlanAgent({
        question,
        loadPlanResult: shouldSendPreviewData ? previewData : null,
        currentRequest: currentAgentRequest ?? undefined
      })

      await handleAgentResult(result)
    } catch (error) {
      addMessage('assistant', getErrorMessage(error, 'Failed to get AI agent response.'))
    } finally {
      setIsSending(false)
    }
  }

  const handleBuildForm = async (): Promise<void> => {
    const text = input.trim()

    if (!text) return

    try {
      setIsSending(true)
      clearInput()
      addMessage('user', text)

      const result = await askLoadPlanAgent({
        question: text,
        currentRequest: currentAgentRequest ?? undefined
      })

      await handleAgentResult(result)
    } catch (error) {
      addMessage('assistant', getErrorMessage(error, 'Failed to build load plan from text.'))
    } finally {
      setIsSending(false)
    }
  }

  const handleOpenFilePicker = (): void => {
    fileInputRef.current?.click()
  }

  const handlePackingListFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    if (!isAllowedPackingListFile(file)) {
      addMessage('assistant', 'Please upload only .xlsx, .xls, or .csv packing list files.')
      return
    }

    const textInstruction = input.trim()
    const uploadMessage = textInstruction
      ? `Upload packing list: ${file.name}\n${textInstruction}`
      : `Upload packing list: ${file.name}`

    try {
      setIsSending(true)
      clearInput()
      addMessage('user', uploadMessage)

      const result = await uploadPackingListFile({
        file,
        selectedContainerCode:
          currentAgentRequest?.selectedContainerCode || selectedContainerCode || undefined,
        text:
          textInstruction ||
          `Please build a load plan from this packing list using container ${selectedContainerCode}.`,
        currentRequest: currentAgentRequest ?? undefined
      })

      await handleAgentResult(result)
    } catch (error) {
      addMessage('assistant', getErrorMessage(error, 'Failed to upload packing list file.'))
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    await handleAsk()
  }

  useLayoutEffect(() => {
    if (inputRef.current) {
      resizeInput(inputRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [messages, message, previewDataExists, warnings.length, errors.length, isSending])

  return (
    <TabContentLayout>
      <AssistantTop>
        <Win95GroupBox legend="AI Agent">
          <AgentMessages
            ref={messagesRef}
            style={{
              flex: 1,
              minHeight: 0,
              maxHeight: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: 6,
              scrollBehavior: 'auto'
            }}
          >
            {message ? (
              <AgentMessageBubble $role="assistant">
                <span style={{ whiteSpace: 'pre-wrap' }}>Current system message: {message}</span>
              </AgentMessageBubble>
            ) : null}

            {previewDataExists && warnings.length > 0 ? (
              <AgentMessageBubble $role="assistant">
                This preview has {warnings.length} warning{warnings.length === 1 ? '' : 's'}.
              </AgentMessageBubble>
            ) : null}

            {previewDataExists && errors.length > 0 ? (
              <AgentMessageBubble $role="assistant">
                This preview has {errors.length} error{errors.length === 1 ? '' : 's'}.
              </AgentMessageBubble>
            ) : null}

            {messages.map((item) => (
              <AgentMessageBubble key={item.id} $role={item.role}>
                <span style={{ whiteSpace: 'pre-wrap' }}>{item.text}</span>
              </AgentMessageBubble>
            ))}

            {isSending ? (
              <AgentMessageBubble $role="assistant">
                {previewData ? 'Thinking...' : 'Working...'}
              </AgentMessageBubble>
            ) : null}

            <div ref={messagesEndRef} />
          </AgentMessages>

          <form onSubmit={handleSubmit}>
            <AgentInputRow>
              <AgentInput
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Example: Create a 40HC plan for 10 cartons 300 x 115 x 120 cm, 150 kg each..."
                rows={1}
                disabled={isSending}
              />

              <div
                style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handlePackingListFileChange}
                  style={{ display: 'none' }}
                />

                <WinButton type="button" onClick={handleOpenFilePicker} disabled={isSending}>
                  Upload File
                </WinButton>

                <WinButton
                  type="button"
                  onClick={handleBuildForm}
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? 'Working...' : 'Build Form'}
                </WinButton>

                <WinButton type="submit" disabled={isSending || !input.trim()}>
                  {isSending ? 'Thinking...' : 'Ask'}
                </WinButton>
              </div>
            </AgentInputRow>
          </form>
        </Win95GroupBox>
      </AssistantTop>

      <TabFooter>
        <WinButton type="button" onClick={onBack}>
          Back
        </WinButton>
      </TabFooter>
    </TabContentLayout>
  )
}

export default LoadPlanAssistantPanel
