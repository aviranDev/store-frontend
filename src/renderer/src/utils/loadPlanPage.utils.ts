import {
  PreviewCargoItem,
  PreviewLoadPlanData,
  PreviewLoadPlanPayload,
  SecurementConfig,
  SecurementSummary,
  SecurementToolPlacement
} from '../Services/loadPlan'
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
  diameter: '',
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
  canBeStackedOnSameItem: false,
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
  if (shape === 'drum') return 'drum'
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
    const diameter = Number(item.diameter)
    const weight = Number(item.weight)

    if (!quantity || quantity < 1) {
      throw new Error(`Row ${index + 1}: quantity must be at least 1`)
    }

    if (item.shape === 'drum') {
      if (!diameter || !height) {
        throw new Error(`Row ${index + 1}: diameter and height are required`)
      }
    } else if (!length || !width || !height) {
      throw new Error(`Row ${index + 1}: length, width, and height are required`)
    }

    const maxSupportedWeightKg = parseOptionalPositiveNumber(item.maxSupportedWeightKg)
    const poNumber = item.poNumber.trim()
    const color = item.color.trim()

    return {
      ...(poNumber ? { poNumber } : {}),
      ...(color ? { color } : {}),

      description:
        item.shape === 'carton'
          ? 'Carton'
          : item.shape === 'crate'
            ? 'Crate'
            : item.shape === 'drum'
              ? 'Drum'
              : 'Pallet',
      quantity,
      shape: mapShapeToApi(item.shape),
      dimensions:
        item.shape === 'drum'
          ? {
              diameterCm: Number(toCentimeters(diameter, item.dimensionUnit).toFixed(2)),
              heightCm: Number(toCentimeters(height, item.dimensionUnit).toFixed(2))
            }
          : {
              lengthCm: Number(toCentimeters(length, item.dimensionUnit).toFixed(2)),
              widthCm: Number(toCentimeters(width, item.dimensionUnit).toFixed(2)),
              heightCm: Number(toCentimeters(height, item.dimensionUnit).toFixed(2))
            },
      unitWeightKg: Number(toKilograms(weight || 0, item.weightUnit).toFixed(2)),
      restrictions:
        item.shape === 'drum'
          ? {
              mustStayVertical: item.mustStayVertical,
              stackable: false,
              rotatable: item.rotatable,
              tiltAllowed: item.tiltAllowed,
              topLoadOnly: false,
              fragile: false,
              canBePlacedOnPallet: false,
              canBeStackedOnSameItem: false
            }
          : {
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

              ...(item.shape === 'pallet'
                ? {
                    canBeStackedOnSameItem: item.canBeStackedOnSameItem
                  }
                : {
                    fragile: item.fragile,
                    canBePlacedOnPallet: item.canBePlacedOnPallet
                  })
            }
    }
  })

  return {
    selectedContainerCode: formData.containerType,
    cargoItems
  }
}

type CargoBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

const getPlacedCargoKey = (item: PreviewLoadPlanData['placedCargoItems'][number]): string =>
  `${item.cargoDescription}::${item.unitIndex}`

const getCargoBounds = (items: PreviewLoadPlanData['placedCargoItems']): CargoBounds | null => {
  if (items.length === 0) return null

  return {
    minX: Math.min(...items.map((item) => item.xCm)),
    maxX: Math.max(...items.map((item) => item.xCm + item.placedLengthCm)),
    minY: Math.min(...items.map((item) => item.yCm)),
    maxY: Math.max(...items.map((item) => item.yCm + item.placedWidthCm)),
    minZ: Math.min(...items.map((item) => item.zCm)),
    maxZ: Math.max(...items.map((item) => item.zCm + item.placedHeightCm))
  }
}

/**
 * Compatibility fallback for servers that return the Phase 3 calculation but
 * do not yet include the toolPlacements field. The server remains the primary
 * source; this only creates conceptual preview geometry for declared devices.
 */
export const ensureSecurementToolPlacements = (
  summary: SecurementSummary,
  config: SecurementConfig,
  placedCargoItems: PreviewLoadPlanData['placedCargoItems'],
  containerType: PreviewLoadPlanData['containerType']
): SecurementSummary => {
  if (Array.isArray(summary.toolPlacements) && summary.toolPlacements.length > 0) {
    return summary
  }

  const devices = config.devices ?? []

  if (devices.length === 0 || placedCargoItems.length === 0) {
    return { ...summary, toolPlacements: [] }
  }

  const itemByKey = new Map(
    placedCargoItems.map((item) => [getPlacedCargoKey(item), item] as const)
  )
  const containerLength = containerType.dimensions.internalLengthCm
  const containerWidth = containerType.dimensions.internalWidthCm
  const containerHeight = containerType.dimensions.internalHeightCm
  const clamp = (value: number, minimum: number, maximum: number): number =>
    Math.min(maximum, Math.max(minimum, value))
  const round = (value: number): number => Number(value.toFixed(3))
  const point = (xCm: number, yCm: number, zCm: number) => ({
    xCm: round(clamp(xCm, 0, containerLength)),
    yCm: round(clamp(yCm, 0, containerWidth)),
    zCm: round(clamp(zCm, 0, containerHeight))
  })
  const placements: SecurementToolPlacement[] = []

  devices.forEach((device) => {
    const assignedItems = (device.cargoKeys ?? [])
      .map((key) => itemByKey.get(key))
      .filter((item): item is PreviewLoadPlanData['placedCargoItems'][number] => Boolean(item))
    const usesFallbackCargoScope = assignedItems.length === 0
    const targetItems = usesFallbackCargoScope ? placedCargoItems : assignedItems
    const bounds = getCargoBounds(targetItems)

    if (!bounds) return

    const cargoKeys = targetItems.map(getPlacedCargoKey)
    const cargoLength = Math.max(1, bounds.maxX - bounds.minX)
    const cargoWidth = Math.max(1, bounds.maxY - bounds.minY)
    const cargoHeight = Math.max(4, bounds.maxZ - bounds.minZ)
    const midX = (bounds.minX + bounds.maxX) / 2
    const midY = (bounds.minY + bounds.maxY) / 2
    const topZ = clamp(bounds.maxZ + 2, 0, containerHeight)
    const label = `${device.id} ${device.type.replace(/_/g, ' ')}`

    device.directions.forEach((direction) => {
      const base = {
        id: `${device.id}-${direction}`,
        deviceId: device.id,
        deviceType: device.type,
        label,
        verified: device.verified,
        conceptual: true as const,
        direction,
        cargoKeys,
        usesFallbackCargoScope,
        anchorPointIds: device.anchorPointIds
      }

      if (device.type === 'direct_lashing' || device.type === 'top_over_lashing') {
        const pointsCm =
          direction === 'front' || direction === 'rear'
            ? (() => {
                const inset = Math.min(8, Math.max(2, cargoLength * 0.04))
                const strapX = direction === 'front' ? bounds.minX + inset : bounds.maxX - inset

                return [
                  point(strapX, bounds.minY, 0),
                  point(strapX, bounds.minY, topZ),
                  point(strapX, bounds.maxY, topZ),
                  point(strapX, bounds.maxY, 0)
                ]
              })()
            : (() => {
                const inset = Math.min(8, Math.max(2, cargoWidth * 0.04))
                const strapY = direction === 'left' ? bounds.minY + inset : bounds.maxY - inset

                return [
                  point(bounds.minX, strapY, 0),
                  point(bounds.minX, strapY, topZ),
                  point(bounds.maxX, strapY, topZ),
                  point(bounds.maxX, strapY, 0)
                ]
              })()

        placements.push({ ...base, visualKind: 'strap', pointsCm })
        return
      }

      if (device.type === 'bracing') {
        const cargoPoint =
          direction === 'front'
            ? point(bounds.minX, midY, bounds.minZ + cargoHeight / 2)
            : direction === 'rear'
              ? point(bounds.maxX, midY, bounds.minZ + cargoHeight / 2)
              : direction === 'left'
                ? point(midX, bounds.minY, bounds.minZ + cargoHeight / 2)
                : point(midX, bounds.maxY, bounds.minZ + cargoHeight / 2)
        const wallPoint =
          direction === 'front'
            ? point(0, midY, 8)
            : direction === 'rear'
              ? point(containerLength, midY, 8)
              : direction === 'left'
                ? point(midX, 0, 8)
                : point(midX, containerWidth, 8)

        placements.push({ ...base, visualKind: 'brace', pointsCm: [cargoPoint, wallPoint] })
        return
      }

      const gap =
        direction === 'front'
          ? bounds.minX
          : direction === 'rear'
            ? containerLength - bounds.maxX
            : direction === 'left'
              ? bounds.minY
              : containerWidth - bounds.maxY
      const preferredThickness = device.type === 'dunnage_bag' ? 45 : 18
      const thickness = Math.max(4, Math.min(preferredThickness, Math.max(4, gap)))
      const isLongitudinal = direction === 'front' || direction === 'rear'
      const height =
        device.type === 'locking_device'
          ? Math.min(16, cargoHeight)
          : device.type === 'door_barrier'
            ? Math.min(Math.max(60, cargoHeight * 0.7), containerHeight)
            : Math.min(Math.max(24, cargoHeight * 0.55), containerHeight)
      const length = isLongitudinal
        ? thickness
        : Math.min(Math.max(18, cargoLength), containerLength)
      const width = isLongitudinal ? Math.min(Math.max(18, cargoWidth), containerWidth) : thickness
      const centerX =
        direction === 'front'
          ? bounds.minX - thickness / 2
          : direction === 'rear'
            ? bounds.maxX + thickness / 2
            : midX
      const centerY =
        direction === 'left'
          ? bounds.minY - thickness / 2
          : direction === 'right'
            ? bounds.maxY + thickness / 2
            : midY
      const visualKind: SecurementToolPlacement['visualKind'] =
        device.type === 'dunnage_bag'
          ? 'bag'
          : device.type === 'door_barrier'
            ? 'barrier'
            : device.type === 'locking_device'
              ? 'lock'
              : 'block'

      placements.push({
        ...base,
        visualKind,
        centerCm: point(centerX, centerY, height / 2),
        sizeCm: {
          lengthCm: round(length),
          widthCm: round(width),
          heightCm: round(height)
        }
      })
    })
  })

  return { ...summary, toolPlacements: placements }
}

/**
 * Resolve tool visuals at the rendering boundary as a final guard. This makes
 * the preview independent from whether an intermediate page-state merge or an
 * older API response omitted toolPlacements.
 */
export const getPreviewSecurementToolPlacements = (
  previewData: PreviewLoadPlanData | null | undefined
): SecurementToolPlacement[] => {
  if (!previewData?.securementSummary) return []

  return ensureSecurementToolPlacements(
    previewData.securementSummary,
    previewData.securementConfig ?? {},
    previewData.placedCargoItems,
    previewData.containerType
  ).toolPlacements
}
