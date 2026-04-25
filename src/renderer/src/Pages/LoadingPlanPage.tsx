import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import styled from 'styled-components'

import Win95Page from '../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../components/Win95/Win95Tabs'
import WinButton from '../components/Button/WinButton'
import { previewLoadPlan, PreviewLoadPlanData } from '../Services/loadPlan'

import LoadPlanForm from '../components/LoadPlan/LoadPlanForm'
import ContainerPlanPreview from '../components/LoadPlan/ContainerPlanPreview'
import LoadPlanAssistantPanel from '../components/LoadPlan/LoadPlanAssistantPanel'
import { CargoItem, LoadingPlanFormState } from '../types/loadPlanPage.types'
import {
  buildPreviewPayload,
  createCargoItem,
  createInitialForm
} from '../utils/loadPlanPage.utils'
import { MessageItem, MessagesList } from '../styles/LoadPlanStyle/LoadPlanStyle'

type ErrorPopupState = {
  message: string
  errors: string[]
}

const MessagesPopupBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.22);
  box-sizing: border-box;
`

const MessagesPopupWindow = styled.div`
  width: min(560px, calc(100vw - 32px));
  max-height: min(460px, calc(100vh - 48px));
  background: ${({ theme }) => theme.colors.face};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
  box-shadow: 2px 2px 0 ${({ theme }) => theme.colors.black};
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const MessagesPopupTitleBar = styled.div`
  height: 26px;
  background: ${({ theme }) => theme.colors.titleBar};
  color: ${({ theme }) => theme.colors.titleText};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px 0 8px;
  font-weight: bold;
  box-sizing: border-box;
`

const MessagesPopupCloseButton = styled(WinButton)`
  width: 22px;
  min-width: 22px;
  height: 20px;
  padding: 0;
  line-height: 1;
`

const MessagesPopupBody = styled.div`
  margin: 10px;
  padding: 10px;
  min-height: 130px;
  max-height: 320px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-sizing: border-box;
`

const MessagesPopupActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 10px 10px;
`

const EmployeeLoadingPlanPage = (): React.JSX.Element => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('loading-details')
  const [formData, setFormData] = useState<LoadingPlanFormState>(createInitialForm())
  const [message, setMessage] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewLoadPlanData | null>(null)
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d')
  const [errorPopup, setErrorPopup] = useState<ErrorPopupState | null>(null)

  const handleContainerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      containerType: event.target.value
    }))
    setPreviewData(null)
    setMessage('')
    setErrorPopup(null)
  }

  const handleItemChange =
    (id: string, field: keyof Omit<CargoItem, 'id'>) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, [field]: event.target.value } : item
        )
      }))
      setPreviewData(null)
      setMessage('')
      setErrorPopup(null)
    }

  const handleCheckboxChange =
    (
      id: string,
      field:
        | 'mustStayVertical'
        | 'unstackable'
        | 'rotatable'
        | 'tiltAllowed'
        | 'topLoadOnly'
        | 'fragile'
        | 'canBePlacedOnPallet'
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: event.target.checked,
                ...(field === 'unstackable' && event.target.checked
                  ? { maxSupportedWeightKg: '' }
                  : {})
              }
            : item
        )
      }))
      setPreviewData(null)
      setMessage('')
      setErrorPopup(null)
    }

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createCargoItem(prev.items.length + 1)]
    }))
    setPreviewData(null)
    setMessage('')
    setErrorPopup(null)
  }

  const handleRemoveRow = (id: string) => {
    setFormData((prev) => {
      if (prev.items.length === 1) return prev

      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id)
      }
    })
    setPreviewData(null)
    setMessage('')
    setErrorPopup(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsCalculating(true)
      setMessage('')
      setErrorPopup(null)

      const payload = buildPreviewPayload(formData)
      const data = await previewLoadPlan(payload)

      setPreviewData(data)

      const calculationErrors = data.calculationSummary.calculationErrors

      if (calculationErrors.length > 0) {
        const nextMessage = 'Preview calculated with errors.'

        setMessage(nextMessage)
        setErrorPopup({
          message: nextMessage,
          errors: calculationErrors
        })
      } else if (data.calculationSummary.calculationWarnings.length > 0) {
        setMessage('Preview calculated with warnings.')
        setErrorPopup(null)
      } else {
        setMessage('Load plan preview calculated successfully.')
        setErrorPopup(null)
      }
    } catch (error) {
      setPreviewData(null)

      let nextMessage = 'Failed to calculate preview.'

      if (error instanceof Error) {
        nextMessage = error.message
      } else if ((error as AxiosError)?.response?.data) {
        const axiosError = error as AxiosError<{ message?: string }>
        nextMessage = axiosError.response?.data?.message || 'Failed to calculate preview.'
      }

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: []
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setFormData(createInitialForm())
    setPreviewData(null)
    setMessage('Form reset.')
    setErrorPopup(null)
  }

  const warnings = previewData?.calculationSummary.calculationWarnings ?? []
  const errors = previewData?.calculationSummary.calculationErrors ?? []

  const loadingDetailsTabContent = (
    <LoadPlanForm
      formData={formData}
      message={message}
      isCalculating={isCalculating}
      onSubmit={handleSubmit}
      onAddRow={handleAddRow}
      onReset={handleReset}
      onBack={() => navigate('/employee')}
      onContainerChange={handleContainerChange}
      onItemChange={handleItemChange}
      onCheckboxChange={handleCheckboxChange}
      onRemoveRow={handleRemoveRow}
    />
  )

  const aiAgentTabContent = (
    <LoadPlanAssistantPanel
      message={message}
      previewDataExists={!!previewData}
      warnings={warnings}
      errors={errors}
      onBack={() => navigate('/employee')}
    />
  )

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'loading-details',
        label: 'Loading Details',
        content: loadingDetailsTabContent
      },
      {
        id: 'ai-agent',
        label: 'AI Agent',
        content: aiAgentTabContent
      }
    ],
    [loadingDetailsTabContent, aiAgentTabContent]
  )

  return (
    <Win95Page
      title="Loading Plan"
      width="calc(100vw - 20px)"
      maxWidth="none"
      height="calc(100vh - 20px)"
      maxHeight="none"
    >
      <Win95Tabs
        items={tabs}
        defaultTabId="loading-details"
        activeTab={activeTab}
        onChange={setActiveTab}
        sidebar={
          <ContainerPlanPreview
            formData={formData}
            previewData={previewData}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
          />
        }
        sidebarWidth="minmax(760px, 1fr)"
      />

      {errorPopup && (
        <MessagesPopupBackdrop onMouseDown={() => setErrorPopup(null)}>
          <MessagesPopupWindow
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="load-plan-messages-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <MessagesPopupTitleBar>
              <span id="load-plan-messages-title">Messages</span>

              <MessagesPopupCloseButton type="button" onClick={() => setErrorPopup(null)}>
                ×
              </MessagesPopupCloseButton>
            </MessagesPopupTitleBar>

            <MessagesPopupBody>
              <MessagesList>
                <MessageItem $type="error">{errorPopup.message}</MessageItem>

                {errorPopup.errors.map((error, index) => (
                  <MessageItem key={`popup-error-${index}`} $type="error">
                    Error: {error}
                  </MessageItem>
                ))}
              </MessagesList>
            </MessagesPopupBody>

            <MessagesPopupActions>
              <WinButton type="button" onClick={() => setErrorPopup(null)}>
                Close
              </WinButton>
            </MessagesPopupActions>
          </MessagesPopupWindow>
        </MessagesPopupBackdrop>
      )}
    </Win95Page>
  )
}

export default EmployeeLoadingPlanPage
