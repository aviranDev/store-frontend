import httpService from './http'

export type PreviewCargoRestriction = {
  mustStayVertical: boolean
  stackable: boolean
  rotatable: boolean
  tiltAllowed: boolean
  topLoadOnly: boolean
  fragile?: boolean
  canBePlacedOnPallet?: boolean
}

export type PreviewCargoItem = {
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

export type PreviewPlacedCargoItem = {
  cargoDescription: string
  unitIndex: number
  shape: 'box' | 'pallet' | 'crate' | 'cylinder' | 'machine'
  xCm: number
  yCm: number
  zCm: number
  placedLengthCm: number
  placedWidthCm: number
  placedHeightCm: number
  rotationDeg: number
  placementMode: 'floor' | 'stacked_on_carton' | 'stacked_on_pallet' | 'top_load'
  stackedOnUnitIndex: number | null
  stackedOnCargoDescription: string | null
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

export type PreviewLoadPlanData = {
  selectedContainerCode: string
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

export const previewLoadPlan = async (
  payload: PreviewLoadPlanPayload
): Promise<PreviewLoadPlanData> => {
  const response = await httpService.post<PreviewLoadPlanResponse>('/load-plans/preview', payload)

  return response.data.data
}
