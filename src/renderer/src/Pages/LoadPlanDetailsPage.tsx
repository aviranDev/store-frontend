import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import styled from 'styled-components'

import Win95Page from '../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../components/Win95/Win95Tabs'
import Win95GroupBox from '../components/Win95/Win95GroupBox'
import WinButton from '../components/Button/WinButton'
import ContainerPlanPreview from '../components/LoadPlan/ContainerPlanPreview'

import {
  getLoadPlanById,
  LoadPlanDetailsData,
  PreviewCargoItem,
  PreviewLoadPlanData
} from '../Services/loadPlan'

import { CargoItem, LoadingPlanFormState } from '../types/loadPlanPage.types'
import {
  CargoHeader,
  HeaderCell,
  DimensionsHeader,
  TabContentLayout,
  TabFooter
} from '../styles/LoadPlanStyle/LoadPlanStyle'

const LOADING_PLAN_ROUTE = '/EmployeeLoadingPlan'

const DetailsPanel = styled.div`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
`

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 8px 10px;
  margin-bottom: 12px;
  font-size: 13px;
`

const MetaLabel = styled.strong`
  font-weight: bold;
`

const MetaValue = styled.div`
  min-height: 26px;
  padding: 4px 6px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const CargoScroll = styled.div`
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
`

const ReadOnlyTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ReadOnlyCargoRow = styled.div`
  display: grid;
  grid-template-columns:
    92px
    48px
    52px
    12px
    52px
    12px
    52px
    62px
    58px
    62px;
  column-gap: 6px;
  align-items: center;
  min-width: 0;

  @media (max-width: 1500px) {
    grid-template-columns:
      72px
      38px
      46px
      8px
      46px
      8px
      46px
      52px
      44px
      44px;
    column-gap: 4px;
  }
`

const ReadOnlyValue = styled.div`
  min-height: 28px;
  padding: 5px 6px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Separator = styled.div`
  text-align: center;
`

const RestrictionBox = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 6px 10px;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.windowBg};
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-size: 12px;
`

const CargoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const MessageBox = styled.div`
  padding: 14px;
  text-align: center;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const WiderLoadingPlanPage = styled(Win95Page)`
  padding-left: 4px;
  padding-right: 4px;
`

const toUiShape = (shape: PreviewCargoItem['shape']): CargoItem['shape'] => {
  if (shape === 'box') return 'carton'
  if (shape === 'pallet') return 'pallet'
  if (shape === 'drum') return 'drum'
  return 'crate'
}

const toFormData = (plan: LoadPlanDetailsData | null): LoadingPlanFormState => {
  if (!plan) {
    return {
      containerType: '40HC',
      items: []
    }
  }

  return {
    containerType: plan.selectedContainerCode,
    items: plan.cargoItems.map((item, index) => ({
      id: `${index + 1}`,
      poNumber: item.poNumber ?? '',
      color: item.color ?? '',
      shape: toUiShape(item.shape),
      quantity: String(item.quantity),
      length: String(item.dimensions.lengthCm ?? ''),
      width: String(item.dimensions.widthCm ?? ''),
      height: String(item.dimensions.heightCm ?? ''),
      diameter: String(item.dimensions.diameterCm ?? ''),
      dimensionUnit: 'cm',
      weight: String(item.unitWeightKg ?? ''),
      weightUnit: 'kg',
      mustStayVertical: item.restrictions.mustStayVertical,
      unstackable: !item.restrictions.stackable,
      rotatable: item.restrictions.rotatable,
      tiltAllowed: item.restrictions.tiltAllowed,
      topLoadOnly: item.restrictions.topLoadOnly,
      fragile: item.restrictions.fragile ?? false,
      canBePlacedOnPallet: item.restrictions.canBePlacedOnPallet ?? false,
      canBeStackedOnSameItem: item.restrictions.canBeStackedOnSameItem ?? false,
      maxSupportedWeightKg:
        item.restrictions.maxSupportedWeightKg === undefined
          ? ''
          : String(item.restrictions.maxSupportedWeightKg)
    }))
  }
}

const toPreviewData = (plan: LoadPlanDetailsData): PreviewLoadPlanData => ({
  selectedContainerCode: plan.selectedContainerCode,
  calculationMode: plan.calculationMode,
  containerType: plan.containerType,
  cargoItems: plan.cargoItems,
  placedCargoItems: plan.placedCargoItems,
  calculationSummary: plan.calculationSummary
})

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

const formatShape = (shape: PreviewCargoItem['shape']): string => {
  if (shape === 'box') return 'Carton'
  if (shape === 'drum') return 'Drum'
  return shape.charAt(0).toUpperCase() + shape.slice(1)
}

const getDisplayDimensions = (
  item: PreviewCargoItem
): [string | number, string | number, string | number] => {
  if (item.shape === 'drum') {
    return [
      item.dimensions.diameterCm === undefined ? '-' : `Ø${item.dimensions.diameterCm}`,
      item.dimensions.heightCm ?? '-',
      '-'
    ]
  }

  return [
    item.dimensions.lengthCm ?? '-',
    item.dimensions.widthCm ?? '-',
    item.dimensions.heightCm ?? '-'
  ]
}

const formatRestrictions = (item: PreviewCargoItem): string[] => {
  if (item.shape === 'drum') {
    return ['Loose cargo (floor only)', 'Unstackable']
  }

  const restrictions: string[] = []

  if (item.restrictions.mustStayVertical) restrictions.push('Must stay vertical')
  if (!item.restrictions.stackable) restrictions.push('Unstackable')
  if (item.restrictions.rotatable) restrictions.push('Rotatable')
  if (item.restrictions.tiltAllowed) restrictions.push('Tilt allowed')
  if (item.restrictions.topLoadOnly) restrictions.push('Top load only')
  if (item.restrictions.fragile) restrictions.push('Fragile')
  if (item.restrictions.canBePlacedOnPallet) restrictions.push('Can be placed on pallet')
  if (item.restrictions.canBeStackedOnSameItem) restrictions.push('Self stackable')

  if (item.restrictions.maxSupportedWeightKg !== undefined) {
    restrictions.push(`Max support: ${item.restrictions.maxSupportedWeightKg} kg`)
  }

  return restrictions.length > 0 ? restrictions : ['No special restrictions']
}

const LoadPlanDetailsPage = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [plan, setPlan] = useState<LoadPlanDetailsData | null>(null)
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('3d')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!id) {
      setErrorMessage('Missing load plan id.')
      return
    }

    const loadPlan = async (): Promise<void> => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data = await getLoadPlanById(id)
        setPlan(data)
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Failed to load saved load plan.'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadPlan()
  }, [id])

  const formData = useMemo(() => toFormData(plan), [plan])
  const previewData = useMemo(() => (plan ? toPreviewData(plan) : null), [plan])

  const loadingDetailsContent = (
    <TabContentLayout>
      <Win95GroupBox legend="Loading Details">
        {isLoading ? (
          <MessageBox>Loading saved load plan...</MessageBox>
        ) : errorMessage ? (
          <MessageBox>{errorMessage}</MessageBox>
        ) : plan ? (
          <DetailsPanel>
            <div>
              <MetaGrid>
                <MetaLabel>Plan Name</MetaLabel>
                <MetaValue>{plan.name}</MetaValue>

                <MetaLabel>Customer</MetaLabel>
                <MetaValue>{plan.customer || '-'}</MetaValue>

                <MetaLabel>Shipment</MetaLabel>
                <MetaValue>{plan.shipmentType}</MetaValue>

                <MetaLabel>Container</MetaLabel>
                <MetaValue>{plan.selectedContainerCode}</MetaValue>

                <MetaLabel>Mode</MetaLabel>
                <MetaValue>{plan.calculationMode ?? 'standard'}</MetaValue>

                <MetaLabel>Notes</MetaLabel>
                <MetaValue>{plan.notes || '-'}</MetaValue>
              </MetaGrid>

              <CargoHeader>
                <HeaderCell>Shape</HeaderCell>
                <HeaderCell>Qty</HeaderCell>
                <DimensionsHeader>Dimensions</DimensionsHeader>
                <HeaderCell>Dim Unit</HeaderCell>
                <HeaderCell>Weight</HeaderCell>
                <HeaderCell>W Unit</HeaderCell>
              </CargoHeader>
            </div>

            <CargoScroll>
              <ReadOnlyTable>
                {plan.cargoItems.map((item, index) => {
                  const [dimension1, dimension2, dimension3] = getDisplayDimensions(item)

                  return (
                    <CargoCard key={`${item.description}-${index}`}>
                      <ReadOnlyCargoRow>
                        <ReadOnlyValue>{formatShape(item.shape)}</ReadOnlyValue>
                        <ReadOnlyValue>{item.quantity}</ReadOnlyValue>
                        <ReadOnlyValue>{dimension1}</ReadOnlyValue>
                        <Separator>x</Separator>
                        <ReadOnlyValue>{dimension2}</ReadOnlyValue>
                        <Separator>x</Separator>
                        <ReadOnlyValue>{dimension3}</ReadOnlyValue>
                        <ReadOnlyValue>cm</ReadOnlyValue>
                        <ReadOnlyValue>{item.unitWeightKg}</ReadOnlyValue>
                        <ReadOnlyValue>kg</ReadOnlyValue>
                      </ReadOnlyCargoRow>

                      <RestrictionBox>
                        <span>PO: {item.poNumber || '-'}</span>
                        <span>Description: {item.description}</span>
                        <span>Color: {item.color || 'Auto'}</span>

                        {formatRestrictions(item).map((restriction) => (
                          <span key={restriction}>{restriction}</span>
                        ))}
                      </RestrictionBox>
                    </CargoCard>
                  )
                })}
              </ReadOnlyTable>
            </CargoScroll>
          </DetailsPanel>
        ) : (
          <MessageBox>No load plan found.</MessageBox>
        )}
      </Win95GroupBox>

      <TabFooter>
        <div style={{ display: 'flex', gap: 8 }}>
          <WinButton
            type="button"
            onClick={() =>
              navigate(LOADING_PLAN_ROUTE, {
                state: { activeTab: 'saved-load-plans' }
              })
            }
          >
            Back
          </WinButton>

          <WinButton
            type="button"
            disabled={!plan}
            onClick={() => {
              if (!plan) return

              navigate(LOADING_PLAN_ROUTE, {
                state: {
                  activeTab: 'loading-details',
                  editLoadPlan: plan
                }
              })
            }}
          >
            Update Plan
          </WinButton>
        </div>
      </TabFooter>
    </TabContentLayout>
  )

  const tabs: TabItem[] = [
    {
      id: 'loading-details',
      label: 'Loading Details',
      content: loadingDetailsContent
    }
  ]

  return (
    <WiderLoadingPlanPage
      title={plan ? `Load Plan - ${plan.name}` : 'Load Plan'}
      width="calc(100vw - 8px)"
      maxWidth="none"
      height="calc(100vh - 8px)"
      maxHeight="none"
    >
      <Win95Tabs
        items={tabs}
        defaultTabId="loading-details"
        sidebar={
          <ContainerPlanPreview
            formData={formData}
            previewData={previewData}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
          />
        }
        sidebarWidth="minmax(760px, 1fr)"
      />
    </WiderLoadingPlanPage>
  )
}

export default LoadPlanDetailsPage
