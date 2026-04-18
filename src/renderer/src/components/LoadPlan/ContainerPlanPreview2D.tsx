import { ContainerPlanPreviewProps } from '../../types/loadPlanPage.types'
import {
  PreviewViewport,
  PlaceholderText,
  PlanCanvasWrap,
  PlanCanvas,
  ContainerFrame,
  PlanBlock
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

const ContainerPlanPreview2D = ({
  formData,
  previewData
}: Pick<ContainerPlanPreviewProps, 'formData' | 'previewData'>): React.JSX.Element => {
  const canvasWidth = 550
  const canvasHeight = 280

  const containerLength = previewData?.containerType.dimensions.internalLengthCm ?? 1
  const containerWidth = previewData?.containerType.dimensions.internalWidthCm ?? 1

  const scale = Math.min(canvasWidth / containerLength, canvasHeight / containerWidth)

  const scaledContainerWidth = containerLength * scale
  const scaledContainerHeight = containerWidth * scale

  const offsetX = (canvasWidth - scaledContainerWidth) / 2
  const offsetY = (canvasHeight - scaledContainerHeight) / 2

  const sortedItems = [...(previewData?.placedCargoItems ?? [])].sort((a, b) => {
    if (a.zCm !== b.zCm) return a.zCm - b.zCm
    if (a.yCm !== b.yCm) return a.yCm - b.yCm
    return a.xCm - b.xCm
  })

  return (
    <PreviewViewport>
      {previewData ? (
        <PlanCanvasWrap>
          <PlanCanvas>
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
              const normalizedShape = item.shape === 'box' ? 'carton' : item.shape
              const isPallet = normalizedShape === 'pallet'

              return (
                <div key={`${item.cargoDescription}-${item.unitIndex}-${index}`}>
                  <PlanBlock
                    $left={left}
                    $top={top}
                    $width={width}
                    $height={height}
                    $isStacked={isStacked}
                    $isPallet={isPallet}
                    title={`${item.cargoDescription} #${item.unitIndex} | X:${item.xCm} Y:${item.yCm} Z:${item.zCm} | ${item.placedLengthCm}x${item.placedWidthCm}x${item.placedHeightCm}`}
                  >
                    {width >= 14 && height >= 12 ? item.unitIndex : ''}
                  </PlanBlock>
                </div>
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
