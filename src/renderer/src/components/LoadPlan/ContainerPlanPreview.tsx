import { useEffect, useState } from 'react'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { ContainerPlanPreviewProps, PreviewMode } from '../../types/loadPlanPage.types'
import { getPreviewSecurementToolPlacements } from '../../utils/loadPlanPage.utils'
import ContainerPlanPreview2D from './ContainerPlanPreview2D'
import ContainerPlanPreview3D from './ContainerPlanPreview3D'
import {
  PreviewWrap,
  PreviewTop,
  PreviewBottom,
  SummaryGrid,
  SummaryRow,
  PreviewHeaderRow,
  PreviewHeaderTitle,
  PreviewHeaderActions,
  PreviewModeButtons,
  PreviewModeButton,
  PreviewExpandButton,
  ExpandedPreviewOverlay
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

const ContainerPlanPreview = ({
  formData,
  previewData,
  previewMode,
  onPreviewModeChange
}: ContainerPlanPreviewProps): React.JSX.Element => {
  const [isFullViewOpen, setIsFullViewOpen] = useState(false)

  const handleModeChange = (mode: PreviewMode) => () => {
    onPreviewModeChange(mode)
  }

  useEffect(() => {
    if (!isFullViewOpen) return

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsFullViewOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullViewOpen])

  const fitStatus = !previewData
    ? 'Not calculated'
    : previewData.calculationSummary.fitPossible
      ? 'Passed'
      : 'Action required'

  const balanceStatus = (() => {
    const status = previewData?.calculationSummary.weightBalance?.status

    if (!status || status === 'not_calculated') return 'Not calculated'
    if (status === 'balanced' || status === 'acceptable') return 'Passed'
    return 'Action required'
  })()

  const securementStatus = (() => {
    const status = previewData?.securementSummary?.status

    if (!status || status === 'not_calculated') return 'Not calculated'
    if (status === 'passed') return 'Passed'
    return 'Action required'
  })()
  const securementTools = getPreviewSecurementToolPlacements(previewData)
  const securementToolCount = previewData?.securementSummary ? securementTools.length : undefined
  const securementStatusLabel =
    securementToolCount === undefined
      ? securementStatus
      : `${securementStatus} · ${securementToolCount} ${securementToolCount === 1 ? 'tool' : 'tools'}`

  const renderModeButtons = (): React.JSX.Element => (
    <PreviewModeButtons>
      <PreviewModeButton
        type="button"
        onClick={handleModeChange('2d')}
        $active={previewMode === '2d'}
        aria-pressed={previewMode === '2d'}
      >
        2D View
      </PreviewModeButton>

      <PreviewModeButton
        type="button"
        onClick={handleModeChange('3d')}
        $active={previewMode === '3d'}
        aria-pressed={previewMode === '3d'}
      >
        3D View
      </PreviewModeButton>
    </PreviewModeButtons>
  )

  const renderPreview = (isFullView = false): React.JSX.Element =>
    previewMode === '2d' ? (
      <ContainerPlanPreview2D formData={formData} previewData={previewData} />
    ) : (
      <ContainerPlanPreview3D
        formData={formData}
        previewData={previewData}
        isFullView={isFullView}
      />
    )

  return (
    <>
      <PreviewWrap>
        <PreviewTop>
          <Win95GroupBox legend="Container Plan">
            <PreviewHeaderRow>
              <PreviewHeaderTitle>
                {previewMode === '2d' ? '2D Container Plan' : '3D Container Plan'}
              </PreviewHeaderTitle>

              <PreviewHeaderActions>
                {renderModeButtons()}

                <PreviewExpandButton
                  type="button"
                  onClick={() => setIsFullViewOpen(true)}
                  disabled={!previewData}
                  title={
                    previewData
                      ? 'Open the container plan in the full workspace'
                      : 'Calculate a preview before opening Full View'
                  }
                >
                  Full View
                </PreviewExpandButton>
              </PreviewHeaderActions>
            </PreviewHeaderRow>

            {!isFullViewOpen && renderPreview()}
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
                <span>1. Fit</span>
                <strong>{fitStatus}</strong>
              </SummaryRow>

              <SummaryRow>
                <span>2. Balance</span>
                <strong>{balanceStatus}</strong>
              </SummaryRow>

              <SummaryRow>
                <span>3. Securement</span>
                <strong>{securementStatusLabel}</strong>
              </SummaryRow>
            </SummaryGrid>
          </Win95GroupBox>
        </PreviewBottom>
      </PreviewWrap>

      {isFullViewOpen && (
        <ExpandedPreviewOverlay role="dialog" aria-modal="true" aria-label="Container Full View">
          <Win95GroupBox legend="Container Plan — Full View">
            <PreviewHeaderRow>
              <PreviewHeaderTitle>
                {previewMode === '2d' ? '2D Container Plan' : '3D Container Plan'}
              </PreviewHeaderTitle>

              <PreviewHeaderActions>
                {renderModeButtons()}

                <PreviewExpandButton
                  type="button"
                  onClick={() => setIsFullViewOpen(false)}
                  title="Return to Loading Details (Esc)"
                >
                  Back to Details
                </PreviewExpandButton>
              </PreviewHeaderActions>
            </PreviewHeaderRow>

            {renderPreview(true)}
          </Win95GroupBox>
        </ExpandedPreviewOverlay>
      )}
    </>
  )
}

export default ContainerPlanPreview
