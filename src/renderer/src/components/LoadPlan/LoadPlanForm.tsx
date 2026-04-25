import WinButton from '../../components/Button/WinButton'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { WinForm, MessageArea } from '../../components/Win95/Win95Form.style'
import { CargoItem, LoadingPlanFormState } from '../../types/loadPlanPage.types'
import CargoItemRow from './CargoItemRow'
import {
  TabContentLayout,
  TabFooter,
  FormPanel,
  CargoTable,
  CargoHeader,
  HeaderCell,
  DimensionsHeader,
  ControlsGrid,
  SectionLabel,
  NativeSelect
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

type Props = {
  formData: LoadingPlanFormState
  message: string
  isCalculating: boolean
  isSaving: boolean
  canSavePreview: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onAddRow: () => void
  onReset: () => void
  onBack: () => void
  onContainerChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onItemChange: (
    id: string,
    field: keyof Omit<CargoItem, 'id'>
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onCheckboxChange: (
    id: string,
    field:
      | 'mustStayVertical'
      | 'unstackable'
      | 'rotatable'
      | 'tiltAllowed'
      | 'topLoadOnly'
      | 'fragile'
      | 'canBePlacedOnPallet'
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveRow: (id: string) => void
  onOpenSavePlan: () => void
}

const LoadPlanForm = ({
  formData,
  message,
  isCalculating,
  isSaving,
  canSavePreview,
  onSubmit,
  onAddRow,
  onReset,
  onBack,
  onContainerChange,
  onItemChange,
  onCheckboxChange,
  onRemoveRow,
  onOpenSavePlan
}: Props): React.JSX.Element => {
  return (
    <TabContentLayout>
      <Win95GroupBox legend="Loading Details">
        <WinForm onSubmit={onSubmit}>
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
                <CargoItemRow
                  key={item.id}
                  item={item}
                  itemsLength={formData.items.length}
                  onItemChange={onItemChange}
                  onCheckboxChange={onCheckboxChange}
                  onRemoveRow={onRemoveRow}
                />
              ))}
            </CargoTable>

            <ControlsGrid>
              <WinButton type="button" onClick={onAddRow}>
                Add Line
              </WinButton>

              <SectionLabel htmlFor="containerType">Container</SectionLabel>

              <NativeSelect
                id="containerType"
                value={formData.containerType}
                onChange={onContainerChange}
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

              <WinButton type="button" onClick={onReset}>
                Reset
              </WinButton>
            </ControlsGrid>

            <MessageArea $visible={!!message}>{message}</MessageArea>
          </FormPanel>
        </WinForm>
      </Win95GroupBox>

      <TabFooter>
        <div style={{ display: 'flex', gap: 8 }}>
          <WinButton type="button" onClick={onBack}>
            Back
          </WinButton>

          <WinButton
            type="button"
            onClick={onOpenSavePlan}
            disabled={!canSavePreview || isSaving}
            title={
              canSavePreview ? 'Save this load plan' : 'Calculate a valid preview before saving'
            }
          >
            {isSaving ? 'Saving...' : 'Save Plan'}
          </WinButton>
        </div>
      </TabFooter>
    </TabContentLayout>
  )
}

export default LoadPlanForm
