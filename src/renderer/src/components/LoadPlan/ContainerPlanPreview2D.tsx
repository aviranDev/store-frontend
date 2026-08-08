import { CSSProperties, useMemo } from 'react'
import { ContainerPlanPreviewProps } from '../../types/loadPlanPage.types'
import { getPreviewSecurementToolPlacements } from '../../utils/loadPlanPage.utils'
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
type SecurementToolPlacement = NonNullable<
  PreviewData['securementSummary']
>['toolPlacements'][number]
type CargoVisualShape = 'carton' | 'crate' | 'pallet' | 'drum'

const DEFAULT_SHAPE_COLORS: Record<CargoVisualShape, string> = {
  carton: '#c79252',
  crate: '#c58a42',
  pallet: '#b9803d',
  drum: '#7d95a8'
}

const normalizeShape = (shape: PlacedCargoItem['shape']): CargoVisualShape => {
  if (shape === 'box') return 'carton'
  if (shape === 'pallet') return 'pallet'
  if (shape === 'drum') return 'drum'

  return 'crate'
}

const CM_PER_FOOT = 30.48

const formatDimension = (valueCm: number): string => {
  const feet = valueCm / CM_PER_FOOT
  const roundedCm = Number.isInteger(valueCm) ? `${valueCm}` : valueCm.toFixed(1)

  return `${feet.toFixed(2)} ft (${roundedCm} cm)`
}

const measureLabelStyle: CSSProperties = {
  position: 'absolute',
  padding: '2px 6px',
  background: 'rgba(248, 248, 248, 0.96)',
  color: '#111111',
  border: '1px solid #5d5d5d',
  fontSize: 11,
  fontWeight: 'bold',
  lineHeight: '14px',
  whiteSpace: 'nowrap',
  boxShadow: '1px 1px 0 rgba(255, 255, 255, 0.85)'
}

const rulerStyle: CSSProperties = {
  position: 'absolute',
  background: '#111111'
}

const tickStyle: CSSProperties = {
  position: 'absolute',
  background: '#111111'
}

const ContainerPlanPreview2D = ({
  formData,
  previewData
}: Pick<ContainerPlanPreviewProps, 'formData' | 'previewData'>): React.JSX.Element => {
  const canvasWidth = 620
  const canvasHeight = 260

  const containerLengthCm = previewData?.containerType.dimensions.internalLengthCm ?? 1
  const containerWidthCm = previewData?.containerType.dimensions.internalWidthCm ?? 1
  const containerHeightCm = previewData?.containerType.dimensions.internalHeightCm ?? 1

  const leftGutter = 92
  const rightGutter = 112
  const topGutter = 24
  const bottomGutter = 58

  const usableWidth = canvasWidth - leftGutter - rightGutter
  const usableHeight = canvasHeight - topGutter - bottomGutter

  const planScale = Math.min(usableWidth / containerLengthCm, usableHeight / containerWidthCm)

  const scaledContainerLength = containerLengthCm * planScale
  const scaledContainerWidth = containerWidthCm * planScale
  const scaledContainerHeight = containerHeightCm * planScale

  const offsetX = leftGutter
  const offsetY = topGutter + (usableHeight - scaledContainerWidth) / 2

  const widthRulerX = offsetX - 20
  const widthRulerTop = offsetY
  const widthRulerHeight = scaledContainerWidth

  const heightRulerX = offsetX + scaledContainerLength + 22
  const heightRulerTop = offsetY + (scaledContainerWidth - scaledContainerHeight) / 2
  const heightRulerHeight = scaledContainerHeight

  const lengthRulerLeft = offsetX
  const lengthRulerTop = offsetY + scaledContainerWidth + 16

  const widthLabelLeft = widthRulerX - 13
  const widthLabelTop = widthRulerTop + widthRulerHeight / 2

  const heightLabelLeft = heightRulerX + 13
  const heightLabelTop = heightRulerTop + heightRulerHeight / 2

  const sortedItems = useMemo(
    () =>
      [...(previewData?.placedCargoItems ?? [])].sort((a, b) => {
        if (a.zCm !== b.zCm) return a.zCm - b.zCm
        if (a.yCm !== b.yCm) return a.yCm - b.yCm
        return a.xCm - b.xCm
      }),
    [previewData]
  )
  const securementTools: SecurementToolPlacement[] = getPreviewSecurementToolPlacements(previewData)

  return (
    <PreviewViewport>
      {previewData ? (
        <PlanCanvasWrap>
          <PlanCanvas $width={canvasWidth} $height={canvasHeight}>
            <ContainerFrame
              $left={offsetX}
              $top={offsetY}
              $width={scaledContainerLength}
              $height={scaledContainerWidth}
            />

            {securementTools.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  top: 8,
                  zIndex: 30,
                  padding: '3px 7px',
                  border: '1px solid #006b30',
                  background: '#e8fff1',
                  color: '#005c29',
                  fontSize: 10,
                  fontWeight: 'bold',
                  pointerEvents: 'none'
                }}
              >
                SECUREMENT · {securementTools.length}{' '}
                {securementTools.length === 1 ? 'TOOL' : 'TOOLS'}
              </div>
            )}

            <div
              style={{
                ...rulerStyle,
                left: lengthRulerLeft,
                top: lengthRulerTop,
                width: scaledContainerLength,
                height: 1
              }}
            />
            <div
              style={{
                ...tickStyle,
                left: lengthRulerLeft,
                top: lengthRulerTop - 5,
                width: 1,
                height: 11
              }}
            />
            <div
              style={{
                ...tickStyle,
                left: lengthRulerLeft + scaledContainerLength,
                top: lengthRulerTop - 5,
                width: 1,
                height: 11
              }}
            />
            <div
              style={{
                ...measureLabelStyle,
                left: offsetX + scaledContainerLength / 2,
                top: lengthRulerTop + 10,
                transform: 'translateX(-50%)'
              }}
            >
              Internal Length: {formatDimension(containerLengthCm)}
            </div>

            <div
              style={{
                ...rulerStyle,
                left: widthRulerX,
                top: widthRulerTop,
                width: 1,
                height: widthRulerHeight
              }}
            />
            <div
              style={{
                ...tickStyle,
                left: widthRulerX - 5,
                top: widthRulerTop,
                width: 11,
                height: 1
              }}
            />
            <div
              style={{
                ...tickStyle,
                left: widthRulerX - 5,
                top: widthRulerTop + widthRulerHeight,
                width: 11,
                height: 1
              }}
            />
            <div
              style={{
                ...measureLabelStyle,
                left: widthLabelLeft,
                top: widthLabelTop,
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                transformOrigin: 'center'
              }}
            >
              Internal Width: {formatDimension(containerWidthCm)}
            </div>

            <div
              style={{
                ...rulerStyle,
                left: heightRulerX,
                top: heightRulerTop,
                width: 1,
                height: heightRulerHeight
              }}
            />
            <div
              style={{
                ...tickStyle,
                left: heightRulerX - 5,
                top: heightRulerTop,
                width: 11,
                height: 1
              }}
            />
            <div
              style={{
                ...tickStyle,
                left: heightRulerX - 5,
                top: heightRulerTop + heightRulerHeight,
                width: 11,
                height: 1
              }}
            />
            <div
              style={{
                ...measureLabelStyle,
                left: heightLabelLeft,
                top: heightLabelTop,
                transform: 'translate(-50%, -50%) rotate(90deg)',
                transformOrigin: 'center'
              }}
            >
              Internal Height: {formatDimension(containerHeightCm)}
            </div>

            {sortedItems.map((item, index) => {
              const left = offsetX + item.xCm * planScale
              const top = offsetY + item.yCm * planScale
              const width = item.placedLengthCm * planScale
              const height = item.placedWidthCm * planScale

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

            <svg
              width={canvasWidth}
              height={canvasHeight}
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              aria-label="Securement tool overlay"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                pointerEvents: 'none',
                overflow: 'visible'
              }}
            >
              {securementTools.map((tool) => {
                const color = tool.verified ? '#008a3b' : '#ff7800'
                const dashArray = tool.verified ? undefined : '7 4'

                if (tool.pointsCm && tool.pointsCm.length >= 2) {
                  const points = tool.pointsCm
                    .map(
                      (point) =>
                        `${offsetX + point.xCm * planScale},${offsetY + point.yCm * planScale}`
                    )
                    .join(' ')
                  const labelPoint = tool.pointsCm[Math.floor(tool.pointsCm.length / 2)]

                  return (
                    <g key={tool.id}>
                      <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth={tool.verified ? 4 : 3}
                        strokeDasharray={dashArray}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <text
                        x={offsetX + labelPoint.xCm * planScale + 4}
                        y={offsetY + labelPoint.yCm * planScale - 5}
                        fill={color}
                        fontSize="10"
                        fontWeight="bold"
                        paintOrder="stroke"
                        stroke="#ffffff"
                        strokeWidth="3"
                      >
                        {tool.label}
                      </text>
                    </g>
                  )
                }

                if (!tool.centerCm || !tool.sizeCm) return null

                const width = Math.max(3, tool.sizeCm.lengthCm * planScale)
                const height = Math.max(3, tool.sizeCm.widthCm * planScale)
                const left = offsetX + tool.centerCm.xCm * planScale - width / 2
                const top = offsetY + tool.centerCm.yCm * planScale - height / 2

                return (
                  <g key={tool.id}>
                    <rect
                      x={left}
                      y={top}
                      width={width}
                      height={height}
                      fill={color}
                      fillOpacity={tool.verified ? 0.68 : 0.35}
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray={dashArray}
                    />
                    <text
                      x={left + width / 2}
                      y={top - 4}
                      textAnchor="middle"
                      fill={color}
                      fontSize="10"
                      fontWeight="bold"
                      paintOrder="stroke"
                      stroke="#ffffff"
                      strokeWidth="3"
                    >
                      {tool.label}
                    </text>
                  </g>
                )
              })}
            </svg>
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
