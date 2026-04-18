import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { ContainerPlanPreviewProps } from '../../types/loadPlanPage.types'
import {
  ContainerFrame,
  PreviewWrap,
  PreviewTop,
  PreviewBottom,
  PreviewViewport,
  PlaceholderText,
  SummaryGrid,
  SummaryRow,
  PlanCanvasWrap,
  PlanCanvas,
  PlanBlock
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

const ContainerPlanPreview = ({
  formData,
  previewData
}: ContainerPlanPreviewProps): React.JSX.Element => {
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
    <PreviewWrap>
      <PreviewTop>
        <Win95GroupBox legend="2D Container Plan">
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
                    const isPallet = item.shape === 'pallet'

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
        </Win95GroupBox>
      </PreviewTop>

      <PreviewBottom>
        <Win95GroupBox legend="Plan Summary">
          <SummaryGrid>
            <SummaryRow>
              <span>Lines</span>
              <strong>{previewData?.cargoItems.length ?? formData.items.length}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Total Quantity</span>
              <strong>{previewData?.calculationSummary.totalCargoUnits ?? '-'}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Container</span>
              <strong>{previewData?.containerType.code ?? formData.containerType}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Container Name</span>
              <strong>{previewData?.containerType.name ?? '-'}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Total Weight</span>
              <strong>{previewData?.calculationSummary.totalWeightKg ?? '-'}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Total Volume</span>
              <strong>{previewData?.calculationSummary.totalVolumeM3 ?? '-'}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Floor Use %</span>
              <strong>{previewData?.calculationSummary.utilizationByFloorPercent ?? '-'}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Weight Use %</span>
              <strong>{previewData?.calculationSummary.utilizationByWeightPercent ?? '-'}</strong>
            </SummaryRow>

            <SummaryRow>
              <span>Fit Possible</span>
              <strong>
                {previewData ? (previewData.calculationSummary.fitPossible ? 'Yes' : 'No') : '-'}
              </strong>
            </SummaryRow>
          </SummaryGrid>
        </Win95GroupBox>
      </PreviewBottom>
    </PreviewWrap>
  )
}

export default ContainerPlanPreview
