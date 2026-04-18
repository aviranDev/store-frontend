import { PreviewLoadPlanData } from '../Services/loadPlan'

export type ShapeType = 'pallet' | 'carton' | 'crate'
export type DimensionUnit = 'cm' | 'in'
export type WeightUnit = 'kg' | 'lb'

export type CargoItem = {
  id: string
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
}

export type LoadingPlanFormState = {
  items: CargoItem[]
  containerType: string
}

export type ContainerPlanPreviewProps = {
  formData: LoadingPlanFormState
  previewData: PreviewLoadPlanData | null
}
