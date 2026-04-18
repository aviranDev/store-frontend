import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'

import Win95Page from '../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../components/Win95/Win95Tabs'
import { previewLoadPlan, PreviewLoadPlanData } from '../Services/loadPlan'

import LoadPlanForm from '../components/LoadPlan/LoadPlanForm'
import ContainerPlanPreview from '../components/LoadPlan/ContainerPlanPreview'
import { CargoItem, LoadingPlanFormState } from '../types/loadPlanPage.types'
import {
  buildPreviewPayload,
  createCargoItem,
  createInitialForm
} from '../utils/loadPlanPage.utils'
import LoadPlanAssistantPanel from '../components/LoadPlan/LoadPlanAssistantPanel'
import { RightPanelsLayout } from '../styles/LoadPlanStyle/LoadPlanStyle'

const EmployeeLoadingPlanPage = (): React.JSX.Element => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState<LoadingPlanFormState>(createInitialForm())
  const [message, setMessage] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewLoadPlanData | null>(null)

  const handleContainerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      containerType: event.target.value
    }))
    setPreviewData(null)
    setMessage('')
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
          item.id === id ? { ...item, [field]: event.target.checked } : item
        )
      }))
      setPreviewData(null)
      setMessage('')
    }

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createCargoItem(prev.items.length + 1)]
    }))
    setPreviewData(null)
    setMessage('')
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
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsCalculating(true)
      setMessage('')

      const payload = buildPreviewPayload(formData)
      const data = await previewLoadPlan(payload)

      setPreviewData(data)

      if (data.calculationSummary.calculationErrors.length > 0) {
        setMessage('Preview calculated with errors.')
      } else if (data.calculationSummary.calculationWarnings.length > 0) {
        setMessage('Preview calculated with warnings.')
      } else {
        setMessage('Load plan preview calculated successfully.')
      }
    } catch (error) {
      setPreviewData(null)

      if (error instanceof Error) {
        setMessage(error.message)
      } else if ((error as AxiosError)?.response?.data) {
        const axiosError = error as AxiosError<{ message?: string }>
        setMessage(axiosError.response?.data?.message || 'Failed to calculate preview.')
      } else {
        setMessage('Failed to calculate preview.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setFormData(createInitialForm())
    setPreviewData(null)
    setMessage('Form reset.')
  }

  const generalTabContent = (
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

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'general',
        label: 'General',
        content: generalTabContent
      }
    ],
    [generalTabContent]
  )

  const warnings = previewData?.calculationSummary.calculationWarnings ?? []
  const errors = previewData?.calculationSummary.calculationErrors ?? []

  return (
    <Win95Page title="Loading Plan">
      <Win95Tabs
        items={tabs}
        defaultTabId="general"
        activeTab={activeTab}
        onChange={setActiveTab}
        sidebar={
          activeTab === 'general' ? (
            <RightPanelsLayout>
              <ContainerPlanPreview formData={formData} previewData={previewData} />

              <LoadPlanAssistantPanel
                message={message}
                previewDataExists={!!previewData}
                warnings={warnings}
                errors={errors}
              />
            </RightPanelsLayout>
          ) : undefined
        }
        sidebarWidth="940px"
      />
    </Win95Page>
  )
}

export default EmployeeLoadingPlanPage
