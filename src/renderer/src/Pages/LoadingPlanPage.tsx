import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import styled from 'styled-components'
import LoadPlansCardsPanel from '../components/LoadPlan/LoadPlansCardsPanel'
import ClientLoadPlanPdf from '../components/LoadPlan/ClientLoadPlanPdf'
import Win95Page from '../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../components/Win95/Win95Tabs'
import WinButton from '../components/Button/WinButton'
import {
  previewLoadPlan,
  previewClosingLoadPlan,
  LoadPlanCalculationMode,
  LoadPlanDetailsData,
  PreviewCargoItem,
  PreviewLoadPlanData,
  PreviewLoadPlanPayload,
  saveLoadPlan,
  ShipmentType,
  updateLoadPlan,
  sendLoadPlanPdfEmail
} from '../Services/loadPlan'

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

type LoadingPlanTabId = 'loading-details' | 'ai-agent' | 'saved-load-plans'

type ErrorPopupState = {
  message: string
  errors: string[]
}

type SavePlanFormState = {
  name: string
  customer: string
  shipmentType: ShipmentType
  notes: string
}

type PdfEmailFormState = {
  to: string
  subject: string
  message: string
}

type LoadingPlanRouteState = {
  activeTab?: LoadingPlanTabId
  editLoadPlan?: LoadPlanDetailsData
}

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

const sanitizePdfFileName = (value: string): string => {
  const cleanValue = value.trim() || 'load-plan'

  return cleanValue.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
}

const toUiShape = (shape: PreviewCargoItem['shape']): CargoItem['shape'] => {
  if (shape === 'pallet') return 'pallet'
  if (shape === 'box') return 'carton'

  return 'crate'
}

const payloadToFormState = (payload: PreviewLoadPlanPayload): LoadingPlanFormState => {
  return {
    containerType: payload.selectedContainerCode,
    items: payload.cargoItems.map((item, index) => ({
      id: `${index + 1}`,
      poNumber: item.poNumber ?? '',
      color: item.color ?? '',
      shape: toUiShape(item.shape),
      quantity: String(item.quantity ?? 1),
      length: String(item.dimensions.lengthCm ?? item.dimensions.diameterCm ?? ''),
      width: String(item.dimensions.widthCm ?? item.dimensions.diameterCm ?? ''),
      height: String(item.dimensions.heightCm ?? ''),
      dimensionUnit: 'cm',
      weight: String(item.unitWeightKg ?? 0),
      weightUnit: 'kg',
      mustStayVertical: item.restrictions.mustStayVertical,
      unstackable: !item.restrictions.stackable,
      rotatable: item.restrictions.rotatable,
      tiltAllowed: item.restrictions.tiltAllowed,
      topLoadOnly: item.restrictions.topLoadOnly,
      fragile: item.restrictions.fragile ?? false,
      canBePlacedOnPallet: item.restrictions.canBePlacedOnPallet ?? false,
      canBeStackedOnSameItem: item.restrictions.canBeStackedOnSameItem ?? false,
      maxSupportedWeightKg:
        item.restrictions.maxSupportedWeightKg === undefined
          ? ''
          : String(item.restrictions.maxSupportedWeightKg)
    }))
  }
}

const createDefaultSaveForm = (formData: LoadingPlanFormState): SavePlanFormState => {
  const firstPoNumber = formData.items.map((item) => item.poNumber.trim()).find(Boolean)
  const today = new Date().toISOString().slice(0, 10)

  return {
    name: firstPoNumber
      ? `${firstPoNumber} - ${formData.containerType} load plan`
      : `${formData.containerType} load plan - ${today}`,
    customer: '',
    shipmentType: 'other',
    notes: ''
  }
}

const loadPlanToFormState = (plan: LoadPlanDetailsData): LoadingPlanFormState =>
  payloadToFormState({
    selectedContainerCode: plan.selectedContainerCode,
    cargoItems: plan.cargoItems
  })

const loadPlanToPreviewData = (plan: LoadPlanDetailsData): PreviewLoadPlanData => ({
  selectedContainerCode: plan.selectedContainerCode,
  calculationMode: plan.calculationMode,
  containerType: plan.containerType,
  cargoItems: plan.cargoItems,
  placedCargoItems: plan.placedCargoItems,
  calculationSummary: plan.calculationSummary
})

const createSaveFormFromPlan = (plan: LoadPlanDetailsData): SavePlanFormState => ({
  name: plan.name,
  customer: plan.customer ?? '',
  shipmentType: plan.shipmentType ?? 'other',
  notes: plan.notes ?? ''
})

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

const SavePopupForm = styled.form`
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const SavePopupFields = styled.div`
  display: grid;
  gap: 10px;
  margin: 10px;
  padding: 10px;
  background: ${({ theme }) => theme.colors.face};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-sizing: border-box;
`

const SavePopupField = styled.label`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  font-size: 13px;
`

const SavePopupInput = styled.input`
  width: 100%;
  min-width: 0;
  height: 28px;
  box-sizing: border-box;
  padding: 0 6px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 13px;
`

const SavePopupSelect = styled.select`
  width: 100%;
  min-width: 0;
  height: 28px;
  box-sizing: border-box;
  padding: 0 4px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 13px;
`

const SavePopupTextArea = styled.textarea`
  width: 100%;
  min-width: 0;
  min-height: 72px;
  resize: vertical;
  box-sizing: border-box;
  padding: 6px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 13px;
`

const SavePopupError = styled.div`
  margin: 0 10px 10px;
  font-size: 12px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.text};
`

const EmployeeLoadingPlanPage = (): React.JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = location.state as LoadingPlanRouteState | null
  const editingPlan = locationState?.editLoadPlan ?? null

  const handleApplyGeneratedPayload = async (payload: PreviewLoadPlanPayload): Promise<void> => {
    try {
      setIsCalculating(true)
      setErrorPopup(null)
      setMessage('AI created the form. Running your loading algorithm...')

      const nextFormData = payloadToFormState(payload)

      setFormData(nextFormData)

      const finalPayload = buildPreviewPayload(nextFormData)

      const data = await previewLoadPlan(finalPayload)

      setPreviewData(data)

      if (data.calculationSummary.calculationErrors.length > 0) {
        const nextMessage = 'AI created the form and the loading algorithm returned errors.'

        setMessage(nextMessage)
        setErrorPopup({
          message: nextMessage,
          errors: data.calculationSummary.calculationErrors
        })

        return
      }

      if (data.calculationSummary.calculationWarnings.length > 0) {
        setMessage('AI created the form and the loading algorithm returned warnings.')
        setErrorPopup(null)
        return
      }

      setMessage(
        'AI created the form and the loading algorithm calculated the preview successfully.'
      )
      setErrorPopup(null)
    } catch (error) {
      setPreviewData(null)

      const nextMessage = getErrorMessage(
        error,
        'AI created the form, but the loading algorithm could not calculate the preview.'
      )

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: []
      })

      throw error
    } finally {
      setIsCalculating(false)
      setActiveTab('ai-agent')
    }
  }

  const [activeTab, setActiveTab] = useState<LoadingPlanTabId>(
    locationState?.activeTab ?? 'loading-details'
  )

  const [formData, setFormData] = useState<LoadingPlanFormState>(() =>
    editingPlan ? loadPlanToFormState(editingPlan) : createInitialForm()
  )

  const [message, setMessage] = useState(
    editingPlan
      ? 'Saved load plan opened for update. Edit the details, calculate again, then update.'
      : ''
  )

  const [isCalculating, setIsCalculating] = useState(false)

  const [previewData, setPreviewData] = useState<PreviewLoadPlanData | null>(() =>
    editingPlan ? loadPlanToPreviewData(editingPlan) : null
  )

  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d')
  const [errorPopup, setErrorPopup] = useState<ErrorPopupState | null>(null)
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false)
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfBusy, setIsPdfBusy] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isPdfLayoutVisible, setIsPdfLayoutVisible] = useState(false)

  const [saveForm, setSaveForm] = useState<SavePlanFormState>(() =>
    editingPlan ? createSaveFormFromPlan(editingPlan) : createDefaultSaveForm(createInitialForm())
  )

  const [pdfEmailForm, setPdfEmailForm] = useState<PdfEmailFormState>({
    to: '',
    subject: '',
    message: 'Please find attached the loading plan PDF.'
  })

  const [editLoadPlanId, setEditLoadPlanId] = useState<string | null>(
    () => editingPlan?._id ?? null
  )

  const [activeCalculationMode, setActiveCalculationMode] = useState<LoadPlanCalculationMode>(
    editingPlan?.calculationMode ?? 'standard'
  )

  const getPdfPlanName = (): string => {
    const fallback = createDefaultSaveForm(formData).name

    return saveForm.name.trim() || fallback
  }

  const getPdfFileName = (): string => {
    return `${sanitizePdfFileName(getPdfPlanName())}.pdf`
  }

  const getDefaultEmailSubject = (): string => {
    return `Load Plan - ${getPdfPlanName()}`
  }

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
      const nextValue = event.target.value

      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id !== id) {
            return item
          }

          if (field === 'shape') {
            return {
              ...item,
              shape: nextValue as CargoItem['shape'],
              canBeStackedOnSameItem: false
            }
          }

          return { ...item, [field]: nextValue }
        })
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
        | 'canBeStackedOnSameItem'
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
                  ? {
                      maxSupportedWeightKg: '',
                      canBeStackedOnSameItem: false
                    }
                  : {}),
                ...(field === 'canBeStackedOnSameItem' && event.target.checked
                  ? { unstackable: false }
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
      setActiveCalculationMode('standard')

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

      const nextMessage = getErrorMessage(error, 'Failed to calculate preview.')

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: []
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClosingPreview = async () => {
    try {
      setIsCalculating(true)
      setMessage('')
      setErrorPopup(null)

      const payload = buildPreviewPayload(formData)
      const data = await previewClosingLoadPlan(payload)

      setPreviewData(data)
      setActiveCalculationMode('closing')

      const calculationErrors = data.calculationSummary.calculationErrors

      if (calculationErrors.length > 0) {
        const nextMessage = 'Closing preview calculated with errors.'

        setMessage(nextMessage)
        setErrorPopup({
          message: nextMessage,
          errors: calculationErrors
        })
      } else if (data.calculationSummary.calculationWarnings.length > 0) {
        setMessage('Closing preview calculated with warnings.')
        setErrorPopup(null)
      } else {
        setMessage('Closing container preview calculated successfully.')
        setErrorPopup(null)
      }
    } catch (error) {
      setPreviewData(null)

      const nextMessage = getErrorMessage(error, 'Failed to calculate closing preview.')

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
    const initialForm = createInitialForm()

    setIsPdfLayoutVisible(false)
    setFormData(initialForm)
    setPreviewData(null)
    setMessage('Form reset.')
    setErrorPopup(null)
    setIsSavePopupOpen(false)
    setIsEmailPopupOpen(false)
    setSaveError('')
    setEmailError('')
    setActiveCalculationMode('standard')
    setEditLoadPlanId(null)
    setSaveForm(createDefaultSaveForm(initialForm))
    setPdfEmailForm({
      to: '',
      subject: '',
      message: 'Please find attached the loading plan PDF.'
    })
  }

  const canSavePreview = !!previewData?.calculationSummary.fitPossible
  const canCreatePdf = !!previewData

  const showPdfLayoutBeforePrint = async (): Promise<void> => {
    setIsPdfLayoutVisible(true)
    await wait(1200)
  }

  const hidePdfLayoutAfterPrint = (): void => {
    setIsPdfLayoutVisible(false)
  }

  const handleOpenSavePopup = () => {
    if (!previewData) {
      const nextMessage = 'Please calculate a preview before saving.'

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: []
      })
      return
    }

    if (!previewData.calculationSummary.fitPossible) {
      const nextMessage = 'This load plan cannot be saved because the preview is not fit possible.'

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: previewData.calculationSummary.calculationErrors
      })
      return
    }

    if (editLoadPlanId) {
      setSaveForm((prev) => {
        const fallback = createDefaultSaveForm(formData)

        return {
          ...prev,
          name: prev.name.trim() ? prev.name : fallback.name
        }
      })
    } else {
      setSaveForm(createDefaultSaveForm(formData))
    }

    setSaveError('')
    setIsSavePopupOpen(true)
  }

  const handleSaveFormChange =
    (field: keyof SavePlanFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value } = event.target

      setSaveForm((prev) => {
        if (field === 'name') return { ...prev, name: value }
        if (field === 'customer') return { ...prev, customer: value }
        if (field === 'shipmentType') return { ...prev, shipmentType: value as ShipmentType }

        return { ...prev, notes: value }
      })

      setSaveError('')
    }

  const handlePdfEmailFormChange =
    (field: keyof PdfEmailFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target

      setPdfEmailForm((prev) => ({
        ...prev,
        [field]: value
      }))

      setEmailError('')
    }

  const handleDownloadPdf = async (): Promise<void> => {
    if (!previewData) {
      const nextMessage = 'Please calculate a preview before creating a PDF.'

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: []
      })
      return
    }

    if (!window.api?.loadPlanPdf) {
      setMessage('PDF export is available only inside the Electron app.')
      return
    }

    try {
      setIsPdfBusy(true)
      setMessage('Creating PDF...')
      setErrorPopup(null)

      await showPdfLayoutBeforePrint()

      const result = await window.api.loadPlanPdf.save(getPdfFileName())

      if (result.canceled) {
        setMessage('PDF export canceled.')
        return
      }

      setMessage(`PDF saved successfully: ${result.filePath}`)
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to create PDF.'))
    } finally {
      hidePdfLayoutAfterPrint()
      setIsPdfBusy(false)
    }
  }

  const handleOpenSendPdfEmail = (): void => {
    if (!previewData) {
      const nextMessage = 'Please calculate a preview before sending a PDF.'

      setMessage(nextMessage)
      setErrorPopup({
        message: nextMessage,
        errors: []
      })
      return
    }

    setPdfEmailForm((prev) => ({
      ...prev,
      subject: prev.subject.trim() ? prev.subject : getDefaultEmailSubject()
    }))
    setEmailError('')
    setIsEmailPopupOpen(true)
  }

  const handleSendPdfEmail = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const to = pdfEmailForm.to.trim()
    const subject = pdfEmailForm.subject.trim() || getDefaultEmailSubject()
    const emailMessage = pdfEmailForm.message.trim()

    if (!to) {
      setEmailError('Email address is required.')
      return
    }

    if (!previewData) {
      setEmailError('Please calculate a preview before sending a PDF.')
      return
    }

    if (!window.api?.loadPlanPdf) {
      setEmailError('PDF export is available only inside the Electron app.')
      return
    }

    try {
      setIsPdfBusy(true)
      setEmailError('')
      setIsEmailPopupOpen(false)
      setMessage('Creating and sending PDF...')

      await showPdfLayoutBeforePrint()

      const pdfBase64 = await window.api.loadPlanPdf.createBase64()

      await sendLoadPlanPdfEmail({
        to,
        subject,
        message: emailMessage || 'Please find attached the loading plan PDF.',
        fileName: getPdfFileName(),
        pdfBase64
      })

      setMessage('PDF email sent successfully.')
    } catch (error) {
      setEmailError(getErrorMessage(error, 'Failed to send PDF email.'))
      setIsEmailPopupOpen(true)
      setMessage('Failed to send PDF email.')
    } finally {
      setIsPdfBusy(false)
      hidePdfLayoutAfterPrint()
    }
  }

  const handleSavePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!previewData?.calculationSummary.fitPossible) {
      setSaveError('Please calculate a valid preview before saving.')
      return
    }

    const name = saveForm.name.trim()

    if (!name) {
      setSaveError('Plan name is required.')
      return
    }

    try {
      setIsSaving(true)
      setSaveError('')

      const previewPayload = buildPreviewPayload(formData)

      const planPayload = {
        ...previewPayload,
        name,
        customer: saveForm.customer.trim(),
        shipmentType: saveForm.shipmentType,
        notes: saveForm.notes.trim(),
        calculationMode: activeCalculationMode
      }

      const savedPlan = editLoadPlanId
        ? await updateLoadPlan(editLoadPlanId, planPayload)
        : await saveLoadPlan(planPayload)

      setIsSavePopupOpen(false)
      setEditLoadPlanId(savedPlan._id ?? editLoadPlanId)
      setSaveForm({
        name: savedPlan.name ?? name,
        customer: savedPlan.customer ?? saveForm.customer.trim(),
        shipmentType: savedPlan.shipmentType ?? saveForm.shipmentType,
        notes: savedPlan.notes ?? saveForm.notes.trim()
      })
      setMessage(
        editLoadPlanId
          ? 'Load plan updated successfully.'
          : savedPlan._id
            ? `Load plan saved successfully. ID: ${savedPlan._id}`
            : 'Load plan saved successfully.'
      )
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Failed to save load plan.'))
    } finally {
      setIsSaving(false)
    }
  }

  const warnings = previewData?.calculationSummary.calculationWarnings ?? []
  const errors = previewData?.calculationSummary.calculationErrors ?? []

  const loadingDetailsTabContent = (
    <LoadPlanForm
      formData={formData}
      message={message}
      isCalculating={isCalculating}
      isSaving={isSaving}
      isPdfBusy={isPdfBusy}
      canSavePreview={canSavePreview}
      canCreatePdf={canCreatePdf}
      onSubmit={handleSubmit}
      onClosingPreview={handleClosingPreview}
      onAddRow={handleAddRow}
      onReset={handleReset}
      onBack={() => navigate('/employee')}
      onContainerChange={handleContainerChange}
      onItemChange={handleItemChange}
      onCheckboxChange={handleCheckboxChange}
      onRemoveRow={handleRemoveRow}
      onOpenSavePlan={handleOpenSavePopup}
      onDownloadPdf={handleDownloadPdf}
      onOpenSendPdfEmail={handleOpenSendPdfEmail}
      saveButtonLabel={editLoadPlanId ? 'Update Plan' : 'Save Plan'}
      saveButtonTitle={editLoadPlanId ? 'Update this saved load plan' : 'Save this load plan'}
    />
  )

  const aiAgentTabContent = (
    <LoadPlanAssistantPanel
      message={message}
      previewData={previewData}
      previewDataExists={!!previewData}
      selectedContainerCode={formData.containerType}
      warnings={warnings}
      errors={errors}
      onBack={() => navigate('/employee')}
      onApplyGeneratedPayload={handleApplyGeneratedPayload}
    />
  )

  const savedLoadPlansTabContent = (
    <LoadPlansCardsPanel
      onBack={() => navigate('/employee')}
      onOpenPlan={(planId) => navigate(`/employee/load-plans/${planId}`)}
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
      },
      {
        id: 'saved-load-plans',
        label: 'Saved Plans',
        content: savedLoadPlansTabContent
      }
    ],
    [loadingDetailsTabContent, aiAgentTabContent, savedLoadPlansTabContent]
  )

  const handleTabChange = (tabId: string): void => {
    if (tabId === 'loading-details' || tabId === 'ai-agent' || tabId === 'saved-load-plans') {
      setActiveTab(tabId)
    }
  }

  if (isPdfLayoutVisible && previewData) {
    return (
      <ClientLoadPlanPdf
        planName={getPdfPlanName()}
        customer={saveForm.customer}
        shipmentType={saveForm.shipmentType}
        notes={saveForm.notes}
        calculationMode={activeCalculationMode}
        formData={formData}
        previewData={previewData}
      />
    )
  }

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
        onChange={handleTabChange}
        sidebar={
          activeTab === 'saved-load-plans' ? undefined : (
            <ContainerPlanPreview
              formData={formData}
              previewData={previewData}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            />
          )
        }
        sidebarWidth="minmax(760px, 1fr)"
      />

      {isSavePopupOpen && (
        <MessagesPopupBackdrop onMouseDown={() => setIsSavePopupOpen(false)}>
          <MessagesPopupWindow
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-load-plan-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <SavePopupForm onSubmit={handleSavePlan}>
              <MessagesPopupTitleBar>
                <span id="save-load-plan-title">
                  {editLoadPlanId ? 'Update Load Plan' : 'Save Load Plan'}
                </span>

                <MessagesPopupCloseButton
                  type="button"
                  onClick={() => setIsSavePopupOpen(false)}
                  disabled={isSaving}
                >
                  ×
                </MessagesPopupCloseButton>
              </MessagesPopupTitleBar>

              <SavePopupFields>
                <SavePopupField>
                  Plan name
                  <SavePopupInput
                    type="text"
                    value={saveForm.name}
                    onChange={handleSaveFormChange('name')}
                    placeholder="Required"
                    autoFocus
                  />
                </SavePopupField>

                <SavePopupField>
                  Customer
                  <SavePopupInput
                    type="text"
                    value={saveForm.customer}
                    onChange={handleSaveFormChange('customer')}
                    placeholder="Optional"
                  />
                </SavePopupField>

                <SavePopupField>
                  Shipment type
                  <SavePopupSelect
                    value={saveForm.shipmentType}
                    onChange={handleSaveFormChange('shipmentType')}
                  >
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                    <option value="cross-trade">Cross-trade</option>
                    <option value="other">Other</option>
                  </SavePopupSelect>
                </SavePopupField>

                <SavePopupField style={{ alignItems: 'start' }}>
                  Notes
                  <SavePopupTextArea
                    value={saveForm.notes}
                    onChange={handleSaveFormChange('notes')}
                    placeholder="Optional notes"
                  />
                </SavePopupField>
              </SavePopupFields>

              {saveError && <SavePopupError>{saveError}</SavePopupError>}

              <MessagesPopupActions>
                <WinButton
                  type="button"
                  onClick={() => setIsSavePopupOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </WinButton>

                <WinButton type="submit" disabled={isSaving}>
                  {isSaving
                    ? editLoadPlanId
                      ? 'Updating...'
                      : 'Saving...'
                    : editLoadPlanId
                      ? 'Update'
                      : 'Save'}
                </WinButton>
              </MessagesPopupActions>
            </SavePopupForm>
          </MessagesPopupWindow>
        </MessagesPopupBackdrop>
      )}

      {isEmailPopupOpen && (
        <MessagesPopupBackdrop onMouseDown={() => setIsEmailPopupOpen(false)}>
          <MessagesPopupWindow
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-load-plan-pdf-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <SavePopupForm onSubmit={handleSendPdfEmail}>
              <MessagesPopupTitleBar>
                <span id="send-load-plan-pdf-title">Send Load Plan PDF</span>

                <MessagesPopupCloseButton
                  type="button"
                  onClick={() => setIsEmailPopupOpen(false)}
                  disabled={isPdfBusy}
                >
                  ×
                </MessagesPopupCloseButton>
              </MessagesPopupTitleBar>

              <SavePopupFields>
                <SavePopupField>
                  Email
                  <SavePopupInput
                    type="email"
                    value={pdfEmailForm.to}
                    onChange={handlePdfEmailFormChange('to')}
                    placeholder="client@example.com"
                    autoFocus
                  />
                </SavePopupField>

                <SavePopupField>
                  Subject
                  <SavePopupInput
                    type="text"
                    value={pdfEmailForm.subject}
                    onChange={handlePdfEmailFormChange('subject')}
                    placeholder={getDefaultEmailSubject()}
                  />
                </SavePopupField>

                <SavePopupField>
                  File name
                  <SavePopupInput type="text" value={getPdfFileName()} readOnly />
                </SavePopupField>

                <SavePopupField style={{ alignItems: 'start' }}>
                  Message
                  <SavePopupTextArea
                    value={pdfEmailForm.message}
                    onChange={handlePdfEmailFormChange('message')}
                    placeholder="Optional email message"
                  />
                </SavePopupField>
              </SavePopupFields>

              {emailError && <SavePopupError>{emailError}</SavePopupError>}

              <MessagesPopupActions>
                <WinButton
                  type="button"
                  onClick={() => setIsEmailPopupOpen(false)}
                  disabled={isPdfBusy}
                >
                  Cancel
                </WinButton>

                <WinButton type="submit" disabled={isPdfBusy}>
                  {isPdfBusy ? 'Sending...' : 'Send Email'}
                </WinButton>
              </MessagesPopupActions>
            </SavePopupForm>
          </MessagesPopupWindow>
        </MessagesPopupBackdrop>
      )}

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
