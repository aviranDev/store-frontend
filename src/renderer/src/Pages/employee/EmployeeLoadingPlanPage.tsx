import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Win95Page from '../../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../../components/Win95/Win95Tabs'
import WinButton from '../../components/Button/WinButton'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { WinForm, MessageArea } from '../../components/Win95/Win95Form.style'
import deleteIcon from '../../assets/msg_error-1.png'

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
`

const PreviewViewport = styled.div`
  min-height: 220px;
  height: 100%;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
`

const PlaceholderText = styled.div`
  text-align: center;
  line-height: 1.4;
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

const createCargoItem = (id: number): CargoItem => ({
  id: String(id),
  shape: 'pallet',
  quantity: '',
  length: '',
  width: '',
  height: '',
  dimensionUnit: 'cm',
  weight: '',
  weightUnit: 'kg'
})

const initialForm: LoadingPlanFormState = {
  items: [createCargoItem(1)],
  containerType: '40HC'
}

type ContainerPlanPreviewProps = {
  formData: LoadingPlanFormState
}

function ContainerPlanPreview({ formData }: ContainerPlanPreviewProps): React.JSX.Element {
  const totalItems = formData.items.length
  const totalQuantity = formData.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return (
    <PreviewWrap>
      <PreviewTop>
        <Win95GroupBox legend="3D Container Plan">
          <PreviewViewport>
            <PlaceholderText>
              3D container plan area
              <br />
              Here you will render the container and cargo layout
            </PlaceholderText>
          </PreviewViewport>
        </Win95GroupBox>
      </PreviewTop>

      <PreviewBottom>
        <Win95GroupBox legend="Plan Summary">
          <SummaryGrid>
            <SummaryRow>
              <span>Lines</span>
              <strong>{totalItems}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Total Quantity</span>
              <strong>{totalQuantity || '-'}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Container</span>
              <strong>{formData.containerType || '-'}</strong>
            </SummaryRow>
          </SummaryGrid>
        </Win95GroupBox>
      </PreviewBottom>
    </PreviewWrap>
  )
}

const EmployeeLoadingPlanPage = (): React.JSX.Element => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState<LoadingPlanFormState>(initialForm)
  const [message, setMessage] = useState('')

  const handleContainerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      containerType: event.target.value
    }))
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
      setMessage('')
    }

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createCargoItem(prev.items.length + 1)]
    }))
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
    setMessage('')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('Loading plan data prepared successfully.')
  }

  const handleReset = () => {
    setFormData(initialForm)
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
                <option value="40FR">40FR</option>
              </NativeSelect>

              <WinButton type="submit">Calculate</WinButton>

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
        sidebar={activeTab === 'general' ? <ContainerPlanPreview formData={formData} /> : undefined}
        sidebarWidth="460px"
      />
    </Win95Page>
  )
}

export default EmployeeLoadingPlanPage
