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

const GROUP_COLORS = [
  '#b07a3f',
  '#6fa85b',
  '#5b7db1',
  '#c78f52',
  '#8f6fb8',
  '#c95f5f',
  '#5fa8a1',
  '#9a9a3f'
]

const getGroupKey = (item: PlacedCargoItem): string => {
  const normalizedShape = item.shape === 'box' ? 'carton' : item.shape

  return [
    normalizedShape,
    item.placedLengthCm,
    item.placedWidthCm,
    item.placedHeightCm,
    item.cargoDescription
  ].join('|')
}

const ContainerPlanPreview2D = ({
  formData,
  previewData
}: Pick<ContainerPlanPreviewProps, 'formData' | 'previewData'>): React.JSX.Element => {
  const canvasWidth = 550
  const canvasHeight = 320

  const containerLength = previewData?.containerType.dimensions.internalLengthCm ?? 1
  const containerWidth = previewData?.containerType.dimensions.internalWidthCm ?? 1

  const scale = Math.min(canvasWidth / containerLength, canvasHeight / containerWidth)

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

  const groupColorMap = useMemo(() => {
    const map = new Map<string, string>()

    sortedItems.forEach((item) => {
      const key = getGroupKey(item)

      if (!map.has(key)) {
        map.set(key, GROUP_COLORS[map.size % GROUP_COLORS.length])
      }
    })

    return map
  }, [sortedItems])

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
              const normalizedShape = item.shape === 'box' ? 'carton' : item.shape
              const isPallet = normalizedShape === 'pallet'
              const color = groupColorMap.get(getGroupKey(item)) ?? '#6fa85b'

              return (
                <div key={`${item.cargoDescription}-${item.unitIndex}-${index}`}>
                  <PlanBlock
                    $left={left}
                    $top={top}
                    $width={width}
                    $height={height}
                    $isStacked={isStacked}
                    $isPallet={isPallet}
                    $color={color}
                    title={`${item.cargoDescription} #${item.unitIndex} | Shape: ${normalizedShape} | X:${item.xCm} Y:${item.yCm} Z:${item.zCm} | ${item.placedLengthCm}x${item.placedWidthCm}x${item.placedHeightCm}`}
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
