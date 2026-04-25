import { PreviewCargoItem, PreviewLoadPlanPayload } from '../Services/loadPlan'
import {
  CargoItem,
  DimensionUnit,
  LoadingPlanFormState,
  ShapeType,
  WeightUnit
} from '../types/loadPlanPage.types'

export const createCargoItem = (id: number): CargoItem => ({
  id: String(id),
  poNumber: '',
  color: '',
  shape: 'pallet',
  quantity: '1',
  length: '',
  width: '',
  height: '',
  dimensionUnit: 'cm',
  weight: '0',
  weightUnit: 'kg',
  mustStayVertical: false,
  unstackable: false,
  rotatable: true,
  tiltAllowed: false,
  topLoadOnly: false,
  fragile: false,
  canBePlacedOnPallet: false,
  maxSupportedWeightKg: ''
})

export const createInitialForm = (): LoadingPlanFormState => ({
  items: [createCargoItem(1)],
  containerType: '40HC'
})

export const toCentimeters = (value: number, unit: DimensionUnit): number => {
  return unit === 'in' ? value * 2.54 : value
}

export const toKilograms = (value: number, unit: WeightUnit): number => {
  return unit === 'lb' ? value * 0.45359237 : value
}

export const mapShapeToApi = (shape: ShapeType): PreviewCargoItem['shape'] => {
  if (shape === 'carton') return 'box'
  if (shape === 'crate') return 'crate'
  return 'pallet'
}

const parseOptionalPositiveNumber = (value: string): number | undefined => {
  if (value.trim() === '') {
    return undefined
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}

export const buildPreviewPayload = (formData: LoadingPlanFormState): PreviewLoadPlanPayload => {
  const cargoItems: PreviewCargoItem[] = formData.items.map((item, index) => {
    const quantity = Number(item.quantity)
    const length = Number(item.length)
    const width = Number(item.width)
    const height = Number(item.height)
    const weight = Number(item.weight)

    if (!quantity || quantity < 1) {
      throw new Error(`Row ${index + 1}: quantity must be at least 1`)
    }

    if (!length || !width || !height) {
      throw new Error(`Row ${index + 1}: length, width, and height are required`)
    }

    const maxSupportedWeightKg = parseOptionalPositiveNumber(item.maxSupportedWeightKg)
    const poNumber = item.poNumber.trim()
    const color = item.color.trim()

    return {
      ...(poNumber ? { poNumber } : {}),
      ...(color ? { color } : {}),

      description: item.shape === 'carton' ? 'Carton' : item.shape === 'crate' ? 'Crate' : 'Pallet',
      quantity,
      shape: mapShapeToApi(item.shape),
      dimensions: {
        lengthCm: Number(toCentimeters(length, item.dimensionUnit).toFixed(2)),
        widthCm: Number(toCentimeters(width, item.dimensionUnit).toFixed(2)),
        heightCm: Number(toCentimeters(height, item.dimensionUnit).toFixed(2))
      },
      unitWeightKg: Number(toKilograms(weight || 0, item.weightUnit).toFixed(2)),
      restrictions: {
        mustStayVertical: item.mustStayVertical,
        stackable: !item.unstackable,
        rotatable: item.rotatable,
        tiltAllowed: item.tiltAllowed,
        topLoadOnly: item.topLoadOnly,

        ...(maxSupportedWeightKg !== undefined
          ? {
              maxSupportedWeightKg
            }
          : {}),

        ...(item.shape !== 'pallet'
          ? {
              fragile: item.fragile,
              canBePlacedOnPallet: item.canBePlacedOnPallet
            }
          : {})
      }
    }
  })

  return {
    selectedContainerCode: formData.containerType,
    cargoItems
  }
}
