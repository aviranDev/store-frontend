import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import { ContainerPlanPreviewProps, PreviewMode } from '../../types/loadPlanPage.types'
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
  PreviewModeButtons,
  PreviewModeButton
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

const ContainerPlanPreview = ({
  formData,
  previewData,
  previewMode,
  onPreviewModeChange
}: ContainerPlanPreviewProps): React.JSX.Element => {
  const handleModeChange = (mode: PreviewMode) => () => {
    onPreviewModeChange(mode)
  }

  return (
    <PreviewWrap>
      <PreviewTop>
        <Win95GroupBox legend="Container Plan">
          <PreviewHeaderRow>
            <PreviewHeaderTitle>
              {previewMode === '2d' ? '2D Container Plan' : '3D Container Plan'}
            </PreviewHeaderTitle>

            <PreviewModeButtons>
              <PreviewModeButton
                type="button"
                onClick={handleModeChange('2d')}
                $active={previewMode === '2d'}
              >
                2D
              </PreviewModeButton>

              <PreviewModeButton
                type="button"
                onClick={handleModeChange('3d')}
                $active={previewMode === '3d'}
              >
                3D
              </PreviewModeButton>
            </PreviewModeButtons>
          </PreviewHeaderRow>

          {previewMode === '2d' ? (
            <ContainerPlanPreview2D formData={formData} previewData={previewData} />
          ) : (
            <ContainerPlanPreview3D formData={formData} previewData={previewData} />
          )}
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
