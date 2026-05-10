import { useMemo } from 'react'
import { ContainerPlanPreviewProps } from '../../types/loadPlanPage.types'
import {
  PreviewViewport,
  PlaceholderText,
  PlanCanvasWrap,
  PlanCanvas,
  ContainerFrame,
  PlanBlock
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

type PreviewData = NonNullable<ContainerPlanPreviewProps['previewData']>
type PlacedCargoItem = PreviewData['placedCargoItems'][number]
type CargoVisualShape = 'carton' | 'crate' | 'pallet'

const DEFAULT_SHAPE_COLORS: Record<CargoVisualShape, string> = {
  carton: '#c79252',
  crate: '#c58a42',
  pallet: '#b9803d'
}

const normalizeShape = (shape: PlacedCargoItem['shape']): CargoVisualShape => {
  if (shape === 'box') return 'carton'
  if (shape === 'pallet') return 'pallet'

  return 'crate'
}

const ContainerPlanPreview2D = ({
  formData,
  previewData
}: Pick<ContainerPlanPreviewProps, 'formData' | 'previewData'>): React.JSX.Element => {
  const canvasWidth = 620
  const canvasHeight = 260

  const safePaddingX = 34
  const safePaddingY = 26

  const usableWidth = canvasWidth - safePaddingX * 2
  const usableHeight = canvasHeight - safePaddingY * 2

  const containerLength = previewData?.containerType.dimensions.internalLengthCm ?? 1
  const containerWidth = previewData?.containerType.dimensions.internalWidthCm ?? 1

  const scale = Math.min(usableWidth / containerLength, usableHeight / containerWidth)

  const scaledContainerWidth = containerLength * scale
  const scaledContainerHeight = containerWidth * scale

  const offsetX = (canvasWidth - scaledContainerWidth) / 2
  const offsetY = (canvasHeight - scaledContainerHeight) / 2

  const sortedItems = useMemo(
    () =>
      [...(previewData?.placedCargoItems ?? [])].sort((a, b) => {
        if (a.zCm !== b.zCm) return a.zCm - b.zCm
        if (a.yCm !== b.yCm) return a.yCm - b.yCm
        return a.xCm - b.xCm
      }),
    [previewData]
  )

  return (
    <PreviewViewport>
      {previewData ? (
        <PlanCanvasWrap>
          <PlanCanvas $width={canvasWidth} $height={canvasHeight}>
            <ContainerFrame
              $left={offsetX}
              $top={offsetY}
              $width={scaledContainerWidth}
              $height={scaledContainerHeight}
            />

            {sortedItems.map((item, index) => {
              const left = offsetX + item.xCm * scale
              const top = offsetY + item.yCm * scale
              const width = item.placedLengthCm * scale
              const height = item.placedWidthCm * scale

              const isStacked = item.zCm > 0
              const shape = normalizeShape(item.shape)
              const color = item.color || DEFAULT_SHAPE_COLORS[shape]

              const titleParts = [
                item.poNumber ? `PO: ${item.poNumber}` : null,
                `${item.cargoDescription} #${item.unitIndex}`,
                `Shape: ${shape}`,
                `X:${item.xCm}`,
                `Y:${item.yCm}`,
                `Z:${item.zCm}`,
                `${item.placedLengthCm}x${item.placedWidthCm}x${item.placedHeightCm}`
              ].filter(Boolean)

              return (
                <PlanBlock
                  key={`${item.cargoDescription}-${item.unitIndex}-${index}`}
                  $left={left}
                  $top={top}
                  $width={width}
                  $height={height}
                  $isStacked={isStacked}
                  $isPallet={shape === 'pallet'}
                  $shape={shape}
                  $color={color}
                  title={titleParts.join(' | ')}
                >
                  <span>{width >= 18 && height >= 12 ? item.poNumber || item.unitIndex : ''}</span>
                </PlanBlock>
              )
            })}
          </PlanCanvas>
        </PlanCanvasWrap>
      ) : (
        <PlaceholderText>
          2D container plan area
          <br />
          Here you will render the container and cargo layout
          <br />
          Container: {formData.containerType}
        </PlaceholderText>
      )}
    </PreviewViewport>
  )
}

export default ContainerPlanPreview2D
