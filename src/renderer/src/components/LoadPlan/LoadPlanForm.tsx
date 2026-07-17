import styled from 'styled-components'

import WinButton from '../../components/Button/WinButton'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { WinForm, MessageArea } from '../../components/Win95/Win95Form.style'
import { CargoItem, LoadingPlanFormState } from '../../types/loadPlanPage.types'
import CargoItemRow from './CargoItemRow'
import {
  TabContentLayout,
  TabFooter,
  FormPanel,
  CargoRowsScroll,
  CargoTable,
  CargoHeader,
  HeaderCell,
  DimensionsHeader,
  ControlsGrid,
  SectionLabel,
  NativeSelect
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

const FixedTabContentLayout = styled(TabContentLayout)`
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`

const LoadingDetailsGroupBox = styled(Win95GroupBox)`
  height: auto;
  min-height: 0;
  overflow: hidden;

  > div {
    min-height: 0;
    overflow: hidden;
  }
`

const FixedWinForm = styled(WinForm)`
  height: 100%;
  min-height: 0;
  overflow: hidden;
`

const FixedFormPanel = styled(FormPanel)`
  height: 100%;
  min-height: 0;
  overflow: hidden;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
`

const FixedCargoRowsScroll = styled(CargoRowsScroll)`
  width: 100%;
  min-height: 0;
  max-height: none;
  margin-right: 0;
  padding-right: 6px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  box-sizing: border-box;
`

const FixedControlsGrid = styled(ControlsGrid)`
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  padding-top: 2px;
  background: ${({ theme }) => theme.colors.windowBg};
`

const FixedMessageArea = styled(MessageArea)`
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.windowBg};
`

const FixedTabFooter = styled(TabFooter)`
  position: relative;
  z-index: 3;
  flex-shrink: 0;
  margin-top: 0;
  background: ${({ theme }) => theme.colors.windowBg};
`

type Props = {
  formData: LoadingPlanFormState
  message: string
  isCalculating: boolean
  isSaving: boolean
  isPdfBusy: boolean
  canSavePreview: boolean
  canCreatePdf: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClosingPreview: () => void
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
      | 'canBeStackedOnSameItem'
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveRow: (id: string) => void
  onOpenSavePlan: () => void
  onDownloadPdf: () => void
  onOpenSendPdfEmail: () => void
  saveButtonLabel?: string
  saveButtonTitle?: string
}

const LoadPlanForm = ({
  formData,
  message,
  isCalculating,
  isSaving,
  isPdfBusy,
  canSavePreview,
  canCreatePdf,
  onSubmit,
  onClosingPreview,
  onAddRow,
  onReset,
  onBack,
  onContainerChange,
  onItemChange,
  onCheckboxChange,
  onRemoveRow,
  onOpenSavePlan,
  onDownloadPdf,
  onOpenSendPdfEmail,
  saveButtonLabel = 'Save Plan',
  saveButtonTitle
}: Props): React.JSX.Element => {
  return (
    <FixedTabContentLayout>
      <LoadingDetailsGroupBox legend="Loading Details">
        <FixedWinForm onSubmit={onSubmit}>
          <FixedFormPanel>
            <CargoHeader>
              <HeaderCell>Shape</HeaderCell>
              <HeaderCell>Qty</HeaderCell>
              <DimensionsHeader>Dimensions</DimensionsHeader>
              <HeaderCell>Dim Unit</HeaderCell>
              <HeaderCell>Weight</HeaderCell>
              <HeaderCell>W Unit</HeaderCell>
              <HeaderCell />
            </CargoHeader>

            <FixedCargoRowsScroll>
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
            </FixedCargoRowsScroll>

            <FixedControlsGrid>
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

              <WinButton type="button" onClick={onClosingPreview} disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Closing Plan'}
              </WinButton>

              <WinButton type="button" onClick={onReset}>
                Reset
              </WinButton>
            </FixedControlsGrid>

            <FixedMessageArea $visible={!!message}>{message}</FixedMessageArea>
          </FixedFormPanel>
        </FixedWinForm>
      </LoadingDetailsGroupBox>

      <FixedTabFooter>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <WinButton type="button" onClick={onBack}>
            Back
          </WinButton>

          <WinButton
            type="button"
            onClick={onOpenSavePlan}
            disabled={!canSavePreview || isSaving}
            title={
              saveButtonTitle ??
              (canSavePreview ? 'Save this load plan' : 'Calculate a valid preview before saving')
            }
          >
            {isSaving ? 'Saving...' : saveButtonLabel}
          </WinButton>

          <WinButton
            type="button"
            onClick={onDownloadPdf}
            disabled={!canCreatePdf || isPdfBusy}
            title={
              canCreatePdf
                ? 'Download this loading plan as PDF'
                : 'Calculate a preview before creating a PDF'
            }
          >
            {isPdfBusy ? 'Creating PDF...' : 'Download PDF'}
          </WinButton>

          <WinButton
            type="button"
            onClick={onOpenSendPdfEmail}
            disabled={!canCreatePdf || isPdfBusy}
            title={
              canCreatePdf
                ? 'Send this loading plan PDF by email'
                : 'Calculate a preview before sending a PDF'
            }
          >
            Send PDF Email
          </WinButton>
        </div>
      </FixedTabFooter>
    </FixedTabContentLayout>
  )
}

export default LoadPlanForm
