import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AxiosError } from 'axios'

import Win95Page from '../../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../../components/Win95/Win95Tabs'
import WinButton from '../../components/Button/WinButton'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { WinForm, MessageArea } from '../../components/Win95/Win95Form.style'
import deleteIcon from '../../assets/msg_error-1.png'
import {
  previewLoadPlan,
  PreviewCargoItem,
  PreviewLoadPlanData,
  PreviewLoadPlanPayload
} from '../../Services/loadPlan'

const ContainerFrame = styled.div<{
  $left: number
  $top: number
  $width: number
  $height: number
}>`
  position: absolute;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  width: ${({ $width }) => `${$width}px`};
  height: ${({ $height }) => `${$height}px`};
  border: 2px solid #000;
  background: #fff;
  box-sizing: border-box;
`

const CONTROL_HEIGHT = '28px'

const DeleteIcon = styled.img`
  width: 14px;
  height: 14px;
  image-rendering: pixelated;
  pointer-events: none;
`

const DeleteButton = styled(WinButton)`
  width: 28px;
  min-width: 28px;
  height: ${CONTROL_HEIGHT};
  min-height: ${CONTROL_HEIGHT};
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const TabContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
  height: 100%;
`

const TabFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: auto;
`

const FormPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CargoTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TableGrid = `
  92px
  48px
  52px
  12px
  52px
  12px
  52px
  62px
  58px
  62px
  28px
`

const CargoHeader = styled.div`
  display: grid;
  grid-template-columns: ${TableGrid};
  column-gap: 6px;
  align-items: end;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
`

const HeaderCell = styled.div`
  min-width: 0;
`

const DimensionsHeader = styled.div`
  grid-column: 3 / span 5;
  text-align: center;
  min-width: 0;
`

const CargoRow = styled.div`
  display: grid;
  grid-template-columns: ${TableGrid};
  column-gap: 6px;
  align-items: center;

  > * {
    min-width: 0;
    margin: 0;
  }
`

const DimSeparator = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: ${CONTROL_HEIGHT};
  font-size: 14px;
  line-height: 1;
`

const NativeSelect = styled.select`
  width: 100%;
  min-width: 0;
  height: ${CONTROL_HEIGHT};
  min-height: ${CONTROL_HEIGHT};
  box-sizing: border-box;
  margin: 0;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  outline: none;
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 14px;
  padding: 0 4px;

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }
`

const CargoInput = styled.input`
  width: 100%;
  min-width: 0;
  height: ${CONTROL_HEIGHT};
  min-height: ${CONTROL_HEIGHT};
  box-sizing: border-box;
  margin: 0;
  padding: 0 6px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  outline: none;
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 14px;
  line-height: 1;

  &::placeholder {
    color: ${({ theme }) => theme.colors.shadow};
  }

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }
`

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto 180px auto auto;
  align-items: center;
  gap: 10px;
  width: fit-content;
`

const SectionLabel = styled.label`
  font-size: 14px;
  white-space: nowrap;
`

const PreviewWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
`

const PreviewTop = styled.div`
  flex: 1;
  min-height: 0;
`

const PreviewBottom = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PreviewViewport = styled.div`
  min-height: 220px;
  height: 100%;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
`

const PlaceholderText = styled.div`
  text-align: center;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
`

const SummaryGrid = styled.div`
  display: grid;
  gap: 8px;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
`

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const MessageItem = styled.div<{ $type: 'error' | 'warning' | 'normal' }>`
  font-size: 12px;
  line-height: 1.35;
  color: ${({ $type, theme }) =>
    $type === 'error'
      ? theme.colors.error || theme.colors.text
      : $type === 'warning'
        ? theme.colors.text
        : theme.colors.text};
`

const PlanCanvasWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
`

const PlanCanvas = styled.div`
  position: relative;
  width: 360px;
  height: 220px;
  background: #c0c0c0;
  border: 1px solid ${({ theme }) => theme.colors.text};
  overflow: hidden;
  margin: 0 auto;
`

const PlanBlock = styled.div<{
  $left: number
  $top: number
  $width: number
  $height: number
}>`
  position: absolute;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  width: ${({ $width }) => `${Math.max($width, 18)}px`};
  height: ${({ $height }) => `${Math.max($height, 18)}px`};
  border: 1px solid #000;
  background: #c0c0c0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  text-align: center;
  padding: 2px;
  box-sizing: border-box;
  overflow: hidden;
`

const PlanLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const PlanLegendItem = styled.div`
  font-size: 12px;
  line-height: 1.35;
`

type ShapeType = 'pallet' | 'carton' | 'crate'
type DimensionUnit = 'cm' | 'in'
type WeightUnit = 'kg' | 'lb'

type CargoItem = {
  id: string
  shape: ShapeType
  quantity: string
  length: string
  width: string
  height: string
  dimensionUnit: DimensionUnit
  weight: string
  weightUnit: WeightUnit
}

type LoadingPlanFormState = {
  items: CargoItem[]
  containerType: string
}

type ContainerPlanPreviewProps = {
  formData: LoadingPlanFormState
  previewData: PreviewLoadPlanData | null
}

const createCargoItem = (id: number): CargoItem => ({
  id: String(id),
  shape: 'pallet',
  quantity: '1',
  length: '',
  width: '',
  height: '',
  dimensionUnit: 'cm',
  weight: '0',
  weightUnit: 'kg'
})

const createInitialForm = (): LoadingPlanFormState => ({
  items: [createCargoItem(1)],
  containerType: '40HC'
})

const toCentimeters = (value: number, unit: DimensionUnit): number => {
  return unit === 'in' ? value * 2.54 : value
}

const toKilograms = (value: number, unit: WeightUnit): number => {
  return unit === 'lb' ? value * 0.45359237 : value
}

const mapShapeToApi = (shape: ShapeType): PreviewCargoItem['shape'] => {
  if (shape === 'carton') return 'box'
  if (shape === 'crate') return 'crate'
  return 'pallet'
}

function ContainerPlanPreview({
  formData,
  previewData
}: ContainerPlanPreviewProps): React.JSX.Element {
  const warnings = previewData?.calculationSummary.calculationWarnings ?? []
  const errors = previewData?.calculationSummary.calculationErrors ?? []

  const canvasWidth = 360
  const canvasHeight = 220

  const containerLength = previewData?.containerType.dimensions.internalLengthCm ?? 1
  const containerWidth = previewData?.containerType.dimensions.internalWidthCm ?? 1

  const scale = Math.min(canvasWidth / containerLength, canvasHeight / containerWidth)

  const scaledContainerWidth = containerLength * scale
  const scaledContainerHeight = containerWidth * scale

  const offsetX = (canvasWidth - scaledContainerWidth) / 2
  const offsetY = (canvasHeight - scaledContainerHeight) / 2

  return (
    <PreviewWrap>
      <PreviewTop>
        <Win95GroupBox legend="3D Container Plan">
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

                  {previewData.placedCargoItems.map((item, index) => {
                    const left = offsetX + item.xCm * scale
                    const top = offsetY + item.yCm * scale
                    const width = item.placedLengthCm * scale
                    const height = item.placedWidthCm * scale

                    return (
                      <PlanBlock
                        key={`${item.cargoDescription}-${item.unitIndex}-${index}`}
                        $left={left}
                        $top={top}
                        $width={width}
                        $height={height}
                        title={`${item.cargoDescription} #${item.unitIndex} | X:${item.xCm} Y:${item.yCm} | ${item.placedLengthCm}x${item.placedWidthCm}x${item.placedHeightCm}`}
                      >
                        {item.unitIndex}
                      </PlanBlock>
                    )
                  })}
                </PlanCanvas>

                <PlanLegend>
                  {previewData.placedCargoItems.length === 0 ? (
                    <PlanLegendItem>No placed cargo items.</PlanLegendItem>
                  ) : (
                    previewData.placedCargoItems.map((item, index) => (
                      <PlanLegendItem key={`legend-${index}`}>
                        #{item.unitIndex} {item.cargoDescription} — X:{item.xCm}, Y:{item.yCm}, Z:
                        {item.zCm}, Size: {item.placedLengthCm} × {item.placedWidthCm} ×{' '}
                        {item.placedHeightCm}, Rotation: {item.rotationDeg}°
                      </PlanLegendItem>
                    ))
                  )}
                </PlanLegend>
              </PlanCanvasWrap>
            ) : (
              <PlaceholderText>
                3D container plan area
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

        <Win95GroupBox legend="Messages">
          <MessagesList>
            {!previewData && <MessageItem $type="normal">No preview calculated yet.</MessageItem>}

            {previewData && errors.length === 0 && warnings.length === 0 && (
              <MessageItem $type="normal">No warnings or errors.</MessageItem>
            )}

            {errors.map((error, index) => (
              <MessageItem key={`error-${index}`} $type="error">
                Error: {error}
              </MessageItem>
            ))}

            {warnings.map((warning, index) => (
              <MessageItem key={`warning-${index}`} $type="warning">
                Warning: {warning}
              </MessageItem>
            ))}
          </MessagesList>
        </Win95GroupBox>
      </PreviewBottom>
    </PreviewWrap>
  )
}

const EmployeeLoadingPlanPage = (): React.JSX.Element => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState<LoadingPlanFormState>(createInitialForm())
  const [message, setMessage] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewLoadPlanData | null>(null)

  const handleContainerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      containerType: event.target.value
    }))
    setPreviewData(null)
    setMessage('')
  }

  const handleItemChange =
    (id: string, field: keyof Omit<CargoItem, 'id'>) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, [field]: event.target.value } : item
        )
      }))
      setPreviewData(null)
      setMessage('')
    }

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createCargoItem(prev.items.length + 1)]
    }))
    setPreviewData(null)
    setMessage('')
  }

  const handleRemoveRow = (id: string) => {
    setFormData((prev) => {
      if (prev.items.length === 1) return prev

      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id)
      }
    })
    setPreviewData(null)
    setMessage('')
  }

  const buildPreviewPayload = (): PreviewLoadPlanPayload => {
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

      return {
        description:
          item.shape === 'carton' ? 'Carton' : item.shape === 'crate' ? 'Crate' : 'Pallet',
        quantity,
        shape: mapShapeToApi(item.shape),
        dimensions: {
          lengthCm: Number(toCentimeters(length, item.dimensionUnit).toFixed(2)),
          widthCm: Number(toCentimeters(width, item.dimensionUnit).toFixed(2)),
          heightCm: Number(toCentimeters(height, item.dimensionUnit).toFixed(2))
        },
        unitWeightKg: Number(toKilograms(weight || 0, item.weightUnit).toFixed(2)),
        restrictions: {
          mustStayVertical: false,
          stackable: false,
          rotatable: true,
          tiltAllowed: false,
          topLoadOnly: false
        }
      }
    })

    return {
      selectedContainerCode: formData.containerType,
      cargoItems
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsCalculating(true)
      setMessage('')

      const payload = buildPreviewPayload()
      const data = await previewLoadPlan(payload)
      console.log(data.containerType)

      setPreviewData(data)

      if (data.calculationSummary.calculationErrors.length > 0) {
        setMessage('Preview calculated with errors.')
      } else if (data.calculationSummary.calculationWarnings.length > 0) {
        setMessage('Preview calculated with warnings.')
      } else {
        setMessage('Load plan preview calculated successfully.')
      }
    } catch (error) {
      setPreviewData(null)

      if (error instanceof Error) {
        setMessage(error.message)
      } else if ((error as AxiosError)?.response?.data) {
        const axiosError = error as AxiosError<{ message?: string }>
        setMessage(axiosError.response?.data?.message || 'Failed to calculate preview.')
      } else {
        setMessage('Failed to calculate preview.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setFormData(createInitialForm())
    setPreviewData(null)
    setMessage('Form reset.')
  }

  const generalTabContent = (
    <TabContentLayout>
      <Win95GroupBox legend="Loading Details">
        <WinForm onSubmit={handleSubmit}>
          <FormPanel>
            <CargoHeader>
              <HeaderCell>Shape</HeaderCell>
              <HeaderCell>Qty</HeaderCell>
              <DimensionsHeader>Dimensions</DimensionsHeader>
              <HeaderCell>Dim Unit</HeaderCell>
              <HeaderCell>Weight</HeaderCell>
              <HeaderCell>W Unit</HeaderCell>
              <HeaderCell />
            </CargoHeader>

            <CargoTable>
              {formData.items.map((item) => (
                <CargoRow key={item.id}>
                  <NativeSelect value={item.shape} onChange={handleItemChange(item.id, 'shape')}>
                    <option value="pallet">Pallet</option>
                    <option value="carton">Carton</option>
                    <option value="crate">Crate</option>
                  </NativeSelect>

                  <CargoInput
                    type="text"
                    value={item.quantity}
                    onChange={handleItemChange(item.id, 'quantity')}
                    placeholder="1"
                  />

                  <CargoInput
                    type="text"
                    value={item.length}
                    onChange={handleItemChange(item.id, 'length')}
                    placeholder="L"
                  />

                  <DimSeparator>x</DimSeparator>

                  <CargoInput
                    type="text"
                    value={item.width}
                    onChange={handleItemChange(item.id, 'width')}
                    placeholder="W"
                  />

                  <DimSeparator>x</DimSeparator>

                  <CargoInput
                    type="text"
                    value={item.height}
                    onChange={handleItemChange(item.id, 'height')}
                    placeholder="H"
                  />

                  <NativeSelect
                    value={item.dimensionUnit}
                    onChange={handleItemChange(item.id, 'dimensionUnit')}
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </NativeSelect>

                  <CargoInput
                    type="text"
                    value={item.weight}
                    onChange={handleItemChange(item.id, 'weight')}
                    placeholder="0"
                  />

                  <NativeSelect
                    value={item.weightUnit}
                    onChange={handleItemChange(item.id, 'weightUnit')}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </NativeSelect>

                  <DeleteButton
                    type="button"
                    onClick={() => handleRemoveRow(item.id)}
                    disabled={formData.items.length === 1}
                    aria-label="Delete row"
                    title="Delete row"
                  >
                    <DeleteIcon src={deleteIcon} alt="" />
                  </DeleteButton>
                </CargoRow>
              ))}
            </CargoTable>

            <ControlsGrid>
              <WinButton type="button" onClick={handleAddRow}>
                Add Line
              </WinButton>

              <SectionLabel htmlFor="containerType">Container</SectionLabel>

              <NativeSelect
                id="containerType"
                value={formData.containerType}
                onChange={handleContainerChange}
              >
                <option value="20GP">20GP</option>
                <option value="40GP">40GP</option>
                <option value="40HC">40HC</option>
                <option value="45HC">45HC</option>
                <option value="20OT">20OT</option>
                <option value="40OT">40OT</option>
                <option value="20FR">20FR</option>
                <option value="40FR">40FR</option>
              </NativeSelect>

              <WinButton type="submit" disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </WinButton>

              <WinButton type="button" onClick={handleReset}>
                Reset
              </WinButton>
            </ControlsGrid>

            <MessageArea $visible={!!message}>{message}</MessageArea>
          </FormPanel>
        </WinForm>
      </Win95GroupBox>

      <TabFooter>
        <WinButton type="button" onClick={() => navigate('/employee')}>
          Back
        </WinButton>
      </TabFooter>
    </TabContentLayout>
  )

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'general',
        label: 'General',
        content: generalTabContent
      }
    ],
    [generalTabContent]
  )

  return (
    <Win95Page title="Loading Plan" width="1160px" maxWidth="96vw" height="620px">
      <Win95Tabs
        items={tabs}
        defaultTabId="general"
        activeTab={activeTab}
        onChange={setActiveTab}
        sidebar={
          activeTab === 'general' ? (
            <ContainerPlanPreview formData={formData} previewData={previewData} />
          ) : undefined
        }
        sidebarWidth="460px"
      />
    </Win95Page>
  )
}

export default EmployeeLoadingPlanPage
