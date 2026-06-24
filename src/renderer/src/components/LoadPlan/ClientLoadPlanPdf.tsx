import styled, { createGlobalStyle } from 'styled-components'

import ContainerPlanPreview3D from './ContainerPlanPreview3D'
import type {
  LoadPlanCalculationMode,
  PreviewLoadPlanData,
  ShipmentType
} from '../../Services/loadPlan'
import type { LoadingPlanFormState } from '../../types/loadPlanPage.types'

type Props = {
  planName: string
  customer: string
  shipmentType: ShipmentType
  notes: string
  calculationMode: LoadPlanCalculationMode
  formData: LoadingPlanFormState
  previewData: PreviewLoadPlanData
}

type CargoItem = PreviewLoadPlanData['cargoItems'][number]

const PdfGlobalStyle = createGlobalStyle`
 @page {
    size: 297mm 210mm;
    margin: 0;
  }

  @media print {
    html,
    body,
    #root {
      width: 297mm;
      height: 210mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #ffffff !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`

const PdfRoot = styled.main`
  width: 297mm;
  height: 210mm;
  max-height: 210mm;
  overflow: hidden;
  box-sizing: border-box;
  padding: 5mm;
  background: #ffffff;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9px;
`

const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  padding-bottom: 7px;
  border-bottom: 2px solid #111827;
`

const TitleBlock = styled.div`
  display: grid;
  gap: 4px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 23px;
  line-height: 1.05;
  letter-spacing: 0.3px;
`

const Subtitle = styled.div`
  color: #4b5563;
  font-size: 11px;
`

const HeaderMeta = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 3px 9px;
  font-size: 10px;
  white-space: nowrap;

  strong {
    text-align: right;
  }
`

const Section = styled.section`
  margin-top: 4px;
`

const SectionTitle = styled.h2`
  margin: 0 0 3px;
  font-size: 10px;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`

const VisualPanel = styled.div`
  height: 72mm;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #f8fafc;

  > div {
    height: 100%;
    min-height: 0;
  }

  canvas {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
  }
`

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr 1.2fr;
  gap: 4px;
`

const Card = styled.div`
  border: 1px solid #cbd5e1;
  background: #ffffff;
  min-width: 0;
`

const CardTitle = styled.div`
  padding: 3px 5px;
  font-weight: 700;
  border-bottom: 1px solid #cbd5e1;
  background: #f1f5f9;
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 0;
`

const InfoLabel = styled.div`
  padding: 2px 5px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
`

const InfoValue = styled.div`
  min-width: 0;
  padding: 2px 5px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 700;
  overflow-wrap: anywhere;
`

const NotesBox = styled.div`
  padding: 5px;
  min-height: 26px;
  line-height: 1.25;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`

const CargoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 1px solid #cbd5e1;
  font-size: 8.5px;

  thead {
    display: table-header-group;
  }

  th,
  td {
    padding: 2px 4px;
    border: 1px solid #d1d5db;
    vertical-align: top;
    text-align: left;
    overflow-wrap: anywhere;
    line-height: 1.2;
  }

  th {
    background: #f1f5f9;
    font-weight: 700;
  }

  tbody tr {
    break-inside: avoid;
  }
`

const StatusBadge = styled.span<{ $danger?: boolean; $warning?: boolean }>`
  display: inline-block;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid
    ${({ $danger, $warning }) => ($danger ? '#991b1b' : $warning ? '#92400e' : '#166534')};
  color: ${({ $danger, $warning }) => ($danger ? '#991b1b' : $warning ? '#92400e' : '#166534')};
  background: ${({ $danger, $warning }) =>
    $danger ? '#fee2e2' : $warning ? '#fef3c7' : '#dcfce7'};
  font-weight: 700;
`

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 7px;
  padding-top: 5px;
  border-top: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 9px;
`

const formatDateTime = (value: Date): string => {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(value)
}

const formatNumber = (value?: number | null, fractionDigits = 2): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-'

  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: fractionDigits
  }).format(value)
}

const formatPercent = (value?: number | null): string => {
  const formatted = formatNumber(value, 2)
  return formatted === '-' ? '-' : `${formatted}%`
}

const formatShape = (shape: CargoItem['shape']): string => {
  if (shape === 'box') return 'Carton'
  if (shape === 'pallet') return 'Pallet'
  if (shape === 'cylinder') return 'Cylinder'
  return 'Crate'
}

const formatDimensions = (item: CargoItem): string => {
  const { dimensions } = item

  if (item.shape === 'cylinder') {
    return `Ø ${formatNumber(dimensions.diameterCm, 1)} x ${formatNumber(
      dimensions.heightCm,
      1
    )} cm`
  }

  return `${formatNumber(dimensions.lengthCm, 1)} x ${formatNumber(
    dimensions.widthCm,
    1
  )} x ${formatNumber(dimensions.heightCm, 1)} cm`
}

const formatRestrictions = (item: CargoItem): string => {
  const restrictions = [
    item.restrictions.mustStayVertical ? 'Must stay vertical' : '',
    !item.restrictions.stackable ? 'Unstackable' : '',
    !item.restrictions.rotatable ? 'No rotation' : '',
    item.restrictions.tiltAllowed ? 'Tilt allowed' : '',
    item.restrictions.topLoadOnly ? 'Top load only' : '',
    item.restrictions.fragile ? 'Fragile' : '',
    item.restrictions.canBePlacedOnPallet ? 'Can be placed on pallet' : '',
    item.restrictions.canBeStackedOnSameItem ? 'Self stackable' : '',
    item.restrictions.maxSupportedWeightKg
      ? `Max supported ${formatNumber(item.restrictions.maxSupportedWeightKg, 1)} kg`
      : ''
  ].filter(Boolean)

  return restrictions.length > 0 ? restrictions.join(', ') : '-'
}

const formatShipmentType = (value: ShipmentType): string => {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

const formatCalculationMode = (value: LoadPlanCalculationMode): string => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const ClientLoadPlanPdf = ({
  planName,
  customer,
  shipmentType,
  notes,
  calculationMode,
  formData,
  previewData
}: Props): React.JSX.Element => {
  const generatedAt = new Date()
  const summary = previewData.calculationSummary
  const container = previewData.containerType
  const hasErrors = summary.calculationErrors.length > 0 || !summary.fitPossible
  const hasWarnings = !hasErrors && summary.calculationWarnings.length > 0

  return (
    <>
      <PdfGlobalStyle />

      <PdfRoot>
        <Header>
          <TitleBlock>
            <Title>Container Loading Plan</Title>
            <Subtitle>Client review document for quotation and operational planning</Subtitle>
          </TitleBlock>

          <HeaderMeta>
            <span>Plan</span>
            <strong>{planName}</strong>

            <span>Generated</span>
            <strong>{formatDateTime(generatedAt)}</strong>

            <span>Status</span>
            <strong>
              <StatusBadge $danger={hasErrors} $warning={hasWarnings}>
                {hasErrors ? 'Not Fit' : hasWarnings ? 'Fit with warnings' : 'Fit'}
              </StatusBadge>
            </strong>
          </HeaderMeta>
        </Header>

        <Section>
          <SectionTitle>3D Loading Plan Preview</SectionTitle>

          <VisualPanel>
            <ContainerPlanPreview3D formData={formData} previewData={previewData} />
          </VisualPanel>
        </Section>

        <Section>
          <DetailsGrid>
            <Card>
              <CardTitle>Container Details</CardTitle>

              <InfoGrid>
                <InfoLabel>Container</InfoLabel>
                <InfoValue>{container.code}</InfoValue>

                <InfoLabel>Name</InfoLabel>
                <InfoValue>{container.name}</InfoValue>

                <InfoLabel>Internal L</InfoLabel>
                <InfoValue>{formatNumber(container.dimensions.internalLengthCm, 1)} cm</InfoValue>

                <InfoLabel>Internal W</InfoLabel>
                <InfoValue>{formatNumber(container.dimensions.internalWidthCm, 1)} cm</InfoValue>

                <InfoLabel>Internal H</InfoLabel>
                <InfoValue>{formatNumber(container.dimensions.internalHeightCm, 1)} cm</InfoValue>
              </InfoGrid>
            </Card>

            <Card>
              <CardTitle>Loading Summary</CardTitle>

              <InfoGrid>
                <InfoLabel>Mode</InfoLabel>
                <InfoValue>{formatCalculationMode(calculationMode)}</InfoValue>

                <InfoLabel>Cargo units</InfoLabel>
                <InfoValue>{summary.totalCargoUnits}</InfoValue>

                <InfoLabel>Total weight</InfoLabel>
                <InfoValue>{formatNumber(summary.totalWeightKg, 2)} kg</InfoValue>

                <InfoLabel>Total volume</InfoLabel>
                <InfoValue>{formatNumber(summary.totalVolumeM3, 3)} m³</InfoValue>

                <InfoLabel>Floor use</InfoLabel>
                <InfoValue>{formatPercent(summary.utilizationByFloorPercent)}</InfoValue>

                <InfoLabel>Weight use</InfoLabel>
                <InfoValue>{formatPercent(summary.utilizationByWeightPercent)}</InfoValue>
              </InfoGrid>
            </Card>

            <Card>
              <CardTitle>Client / Quotation Details</CardTitle>

              <InfoGrid>
                <InfoLabel>Customer</InfoLabel>
                <InfoValue>{customer.trim() || '-'}</InfoValue>

                <InfoLabel>Shipment</InfoLabel>
                <InfoValue>{formatShipmentType(shipmentType)}</InfoValue>

                <InfoLabel>Cargo lines</InfoLabel>
                <InfoValue>{previewData.cargoItems.length}</InfoValue>
              </InfoGrid>

              <NotesBox>{notes.trim() || 'Notes / quotation remarks: -'}</NotesBox>
            </Card>
          </DetailsGrid>
        </Section>

        <Section>
          <SectionTitle>Cargo Units Details</SectionTitle>

          <CargoTable>
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '72px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '42px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '58px' }} />
              <col />
              <col />
            </colgroup>

            <thead>
              <tr>
                <th>#</th>
                <th>PO / Ref</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Dimensions</th>
                <th>Unit W.</th>
                <th>Description</th>
                <th>Restrictions</th>
              </tr>
            </thead>

            <tbody>
              {previewData.cargoItems.map((item, index) => (
                <tr key={`${item.poNumber ?? 'cargo'}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{item.poNumber || '-'}</td>
                  <td>{formatShape(item.shape)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatDimensions(item)}</td>
                  <td>{formatNumber(item.unitWeightKg, 2)} kg</td>
                  <td>{item.description || '-'}</td>
                  <td>{formatRestrictions(item)}</td>
                </tr>
              ))}
            </tbody>
          </CargoTable>
        </Section>

        <Footer>
          <span>
            For client quotation review only. Final loading is subject to carrier, warehouse and
            cargo handling confirmation.
          </span>
          <span>{planName}</span>
        </Footer>
      </PdfRoot>
    </>
  )
}

export default ClientLoadPlanPdf
