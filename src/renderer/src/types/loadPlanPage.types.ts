import { PreviewLoadPlanData } from '../Services/loadPlan'

export type ShapeType = 'pallet' | 'carton' | 'crate'
export type DimensionUnit = 'cm' | 'in'
export type WeightUnit = 'kg' | 'lb'
export type PreviewMode = '2d' | '3d'

export type CargoItem = {
  id: string
  poNumber: string
  color: string
  shape: ShapeType
  quantity: string
  length: string
  width: string
  height: string
  dimensionUnit: DimensionUnit
  weight: string
  weightUnit: WeightUnit
  mustStayVertical: boolean
  unstackable: boolean
  rotatable: boolean
  tiltAllowed: boolean
  topLoadOnly: boolean
  fragile: boolean
  canBePlacedOnPallet: boolean

  /**
   * Max weight this cargo item can support on top of itself.
   * Empty string means no specific limit was provided.
   */
  maxSupportedWeightKg: string
}

export type LoadingPlanFormState = {
  items: CargoItem[]
  containerType: string
}

export type ContainerPlanPreviewProps = {
  formData: LoadingPlanFormState
  previewData: PreviewLoadPlanData | null
  previewMode: PreviewMode
  onPreviewModeChange: (mode: PreviewMode) => void
}
