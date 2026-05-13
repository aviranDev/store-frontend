import httpService from './http'

export type LoadPlanCalculationMode = 'standard' | 'closing'

export type SaveLoadPlanPayload = PreviewLoadPlanPayload & {
  name: string
  customer?: string
  shipmentType?: ShipmentType
  notes?: string
  createdBy?: string
  calculationMode?: LoadPlanCalculationMode
}

export type UpdateLoadPlanPayload = {
  name?: string
  customer?: string
  shipmentType?: ShipmentType
  selectedContainerCode?: string
  cargoItems?: PreviewCargoItem[]
  notes?: string
  calculationMode?: LoadPlanCalculationMode
}

export type PreviewCargoRestriction = {
  mustStayVertical: boolean
  stackable: boolean
  rotatable: boolean
  tiltAllowed: boolean
  topLoadOnly: boolean

  fragile?: boolean
  canBePlacedOnPallet?: boolean
  canBeStackedOnSameItem?: boolean

  maxStackCount?: number
  loadingPriority?: number
  maxSupportedWeightKg?: number
  minSupportCoveragePercent?: number
  allowBridging?: boolean
  maxOverhangCm?: number
}

export type PreviewCargoItem = {
  poNumber?: string
  color?: string
  description: string
  quantity: number
  shape: 'box' | 'cylinder' | 'pallet' | 'crate' | 'machine'
  dimensions: {
    lengthCm?: number
    widthCm?: number
    heightCm?: number
    diameterCm?: number
  }
  unitWeightKg: number
  restrictions: PreviewCargoRestriction
  notes?: string
}

export type PreviewSupportAllocation = {
  supportType: 'floor' | 'carton' | 'pallet'
  cargoDescription?: string
  unitIndex?: number
  sharePercent: number
  allocatedWeightKg: number
}

export type PreviewPlacedCargoBaseRules = {
  stackable: boolean
  topLoadOnly: boolean
  fragile?: boolean
  canBePlacedOnPallet?: boolean
  canBeStackedOnSameItem?: boolean
  maxStackCount?: number
  maxSupportedWeightKg?: number
  minSupportCoveragePercent?: number
  allowBridging?: boolean
  maxOverhangCm?: number
}

export type PreviewPlacedCargoItem = {
  cargoItemRef?: string
  poNumber?: string
  cargoDescription: string
  unitIndex: number
  shape: 'box' | 'pallet' | 'crate' | 'cylinder' | 'machine'

  xCm: number
  yCm: number
  zCm: number

  placedLengthCm: number
  placedWidthCm: number
  placedHeightCm: number
  rotationDeg: 0 | 90 | 180 | 270

  color?: string

  placementMode?: 'floor' | 'stacked_on_carton' | 'stacked_on_pallet' | 'top_load'
  stackedOnUnitIndex?: number | null
  stackedOnCargoDescription?: string | null

  placedWeightKg: number
  supportCoveragePercent?: number
  supportedBy?: PreviewSupportAllocation[]

  baseRules?: PreviewPlacedCargoBaseRules
}

export type PreviewWeightBalanceSummary = {
  totalWeightKg: number

  centerOfGravityXCm: number
  centerOfGravityYCm: number
  centerOfGravityXPercent: number
  centerOfGravityYPercent: number

  frontWeightKg: number
  rearWeightKg: number
  leftWeightKg: number
  rightWeightKg: number

  frontRearImbalancePercent: number
  leftRightImbalancePercent: number

  status: 'not_calculated' | 'balanced' | 'acceptable' | 'needs_review'
  conclusion: string
  scoringApplied: boolean

  warnings: string[]
}

export type PreviewCalculationSummary = {
  fitPossible: boolean

  totalCargoUnits: number
  totalWeightKg: number
  totalVolumeM3: number

  usedFloorAreaCm2: number
  containerFloorAreaCm2: number
  utilizationByFloorPercent: number
  utilizationByWeightPercent: number

  requestedCargoUnits?: number
  requestedWeightKg?: number
  requestedVolumeM3?: number

  placedCargoUnits?: number
  placedWeightKg?: number
  placedVolumeM3?: number

  unplacedCargoUnits?: number
  unplacedWeightKg?: number
  unplacedVolumeM3?: number

  weightBalance?: PreviewWeightBalanceSummary

  calculationWarnings: string[]
  calculationErrors: string[]
}

export type PreviewContainerType = {
  _id: string
  code: string
  name: string
  dimensions: {
    internalLengthCm: number
    internalWidthCm: number
    internalHeightCm: number
    doorWidthCm?: number
    doorHeightCm?: number
  }
  maxPayloadKg: number
  cubicCapacityM3?: number
}

export type PreviewLoadPlanPayload = {
  selectedContainerCode: string
  cargoItems: PreviewCargoItem[]
}

export type ShipmentType = 'import' | 'export' | 'cross-trade' | 'other'

export type PreviewLoadPlanData = {
  selectedContainerCode: string
  calculationMode?: LoadPlanCalculationMode
  containerType: PreviewContainerType
  cargoItems: PreviewCargoItem[]
  placedCargoItems: PreviewPlacedCargoItem[]
  calculationSummary: PreviewCalculationSummary
}

type PreviewLoadPlanResponse = {
  success: boolean
  message: string
  data: PreviewLoadPlanData
}

export type SavedLoadPlanData = {
  _id?: string
  name: string
  calculationMode?: LoadPlanCalculationMode
  customer?: string
  shipmentType: ShipmentType
  selectedContainerCode: string
  cargoItems: PreviewCargoItem[]
  placedCargoItems: PreviewPlacedCargoItem[]
  calculationSummary: PreviewCalculationSummary
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type LoadPlansListData = {
  items: SavedLoadPlanData[]
  total: number
  page: number
  limit: number
  totalPages: number
  count: number
}

type LoadPlansListResponse = {
  success: boolean
  total: number
  page: number
  limit: number
  totalPages: number
  count: number
  data: SavedLoadPlanData[]
}

export const getMyLoadPlans = async (
  page: number = 1,
  limit: number = 20
): Promise<LoadPlansListData> => {
  const response = await httpService.get<LoadPlansListResponse>('/load-plans/my', {
    params: {
      page,
      limit
    }
  })

  return {
    items: response.data.data,
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
    count: response.data.count
  }
}

export type LoadPlanDetailsData = SavedLoadPlanData & {
  containerType: PreviewContainerType
  containerTypeId?: PreviewContainerType | string
}

type LoadPlanDetailsResponse = {
  success: boolean
  data: LoadPlanDetailsData
}

export const getLoadPlanById = async (id: string): Promise<LoadPlanDetailsData> => {
  const response = await httpService.get<LoadPlanDetailsResponse>(`/load-plans/${id}`)

  return response.data.data
}

type SaveLoadPlanResponse = {
  success: boolean
  message: string
  data: SavedLoadPlanData
}

export const previewLoadPlan = async (
  payload: PreviewLoadPlanPayload
): Promise<PreviewLoadPlanData> => {
  const response = await httpService.post<PreviewLoadPlanResponse>('/load-plans/preview', payload)

  return response.data.data
}

export const previewClosingLoadPlan = async (
  payload: PreviewLoadPlanPayload
): Promise<PreviewLoadPlanData> => {
  const response = await httpService.post<PreviewLoadPlanResponse>(
    '/load-plans/preview/closing',
    payload
  )

  return response.data.data
}

export const saveLoadPlan = async (payload: SaveLoadPlanPayload): Promise<SavedLoadPlanData> => {
  const response = await httpService.post<SaveLoadPlanResponse>('/load-plans', payload)

  return response.data.data
}

export const updateLoadPlan = async (
  id: string,
  payload: UpdateLoadPlanPayload
): Promise<SavedLoadPlanData> => {
  const response = await httpService.patch<SaveLoadPlanResponse>(`/load-plans/${id}`, payload)

  return response.data.data
}

type DeleteLoadPlanResponse = {
  success: boolean
  message: string
  data?: {
    deletedId?: string
  }
}

export const deleteLoadPlan = async (id: string): Promise<DeleteLoadPlanResponse> => {
  const response = await httpService.delete<DeleteLoadPlanResponse>(`/load-plans/${id}`)

  return response.data
}

export type SendLoadPlanPdfEmailPayload = {
  to: string
  subject: string
  message?: string
  fileName: string
  pdfBase64: string
}

type SendLoadPlanPdfEmailResponse = {
  success: boolean
  message: string
}

export const sendLoadPlanPdfEmail = async (
  payload: SendLoadPlanPdfEmailPayload
): Promise<SendLoadPlanPdfEmailResponse> => {
  const response = await httpService.post<SendLoadPlanPdfEmailResponse>(
    '/load-plans/pdf/email',
    payload
  )

  return response.data
}
