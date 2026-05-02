import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import styled from 'styled-components'

import WinButton from '../Button/WinButton'
import Win95Card from '../Win95/Win95Card'
import Win95GroupBox from '../Win95/Win95GroupBox'
import { getMyLoadPlans, SavedLoadPlanData } from '../../Services/loadPlan'
import { TabContentLayout, TabFooter } from '../../styles/LoadPlanStyle/LoadPlanStyle'

type LoadPlansState = {
  items: SavedLoadPlanData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type Props = {
  onBack: () => void
  onOpenPlan?: (planId: string) => void
}

const CardsTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`

const CardsTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const CardsHeading = styled.strong`
  font-size: 15px;
`

const CardsSubText = styled.span`
  font-size: 12px;
`

const CardsScroll = styled.div`
  min-height: 0;
  overflow: auto;
  padding-right: 6px;
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 10px;
`

const PlanCard = styled(Win95Card)`
  min-height: 220px;
`

const PlanCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
`

const PlanName = styled.div`
  font-weight: bold;
  font-size: 14px;
  line-height: 1.25;
`

const Badge = styled.span<{ $danger?: boolean; $warning?: boolean }>`
  padding: 2px 6px;
  font-size: 12px;
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
`

const InfoGrid = styled.div`
  display: grid;
  gap: 6px;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;

  strong {
    text-align: right;
  }
`

const NotesBox = styled.div`
  min-height: 40px;
  max-height: 58px;
  overflow: hidden;
  padding: 6px;
  font-size: 12px;
  line-height: 1.35;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
`

const MessageBox = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 13px;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const FooterActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const formatDate = (value?: string): string => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

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

const LoadPlansCardsPanel = ({ onBack, onOpenPlan }: Props): React.JSX.Element => {
  const [data, setData] = useState<LoadPlansState>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchLoadPlans = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const result = await getMyLoadPlans(page, 20)

      setData({
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load saved load plans.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLoadPlans(1)
  }, [fetchLoadPlans])

  const handlePrevious = () => {
    if (data.page <= 1) return
    fetchLoadPlans(data.page - 1)
  }

  const handleNext = () => {
    if (data.page >= data.totalPages) return
    fetchLoadPlans(data.page + 1)
  }

  return (
    <TabContentLayout>
      <Win95GroupBox legend="Saved Load Plans">
        <CardsTop>
          <CardsTitle>
            <CardsHeading>My Load Plans</CardsHeading>
            <CardsSubText>
              {data.total} saved plan{data.total === 1 ? '' : 's'}
            </CardsSubText>
          </CardsTitle>

          <WinButton type="button" onClick={() => fetchLoadPlans(data.page)} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </WinButton>
        </CardsTop>

        <CardsScroll>
          {isLoading && data.items.length === 0 ? (
            <MessageBox>Loading saved load plans...</MessageBox>
          ) : errorMessage ? (
            <MessageBox>{errorMessage}</MessageBox>
          ) : data.items.length === 0 ? (
            <MessageBox>No saved load plans yet.</MessageBox>
          ) : (
            <CardsGrid>
              {data.items.map((plan) => {
                const summary = plan.calculationSummary
                const hasErrors = !summary.fitPossible
                const hasWarnings = summary.calculationWarnings.length > 0

                return (
                  <PlanCard key={plan._id ?? plan.name}>
                    <PlanCardTop>
                      <PlanName>{plan.name}</PlanName>

                      <Badge $danger={hasErrors} $warning={hasWarnings}>
                        {hasErrors ? 'Not Fit' : hasWarnings ? 'Warnings' : 'Fit'}
                      </Badge>
                    </PlanCardTop>

                    <InfoGrid>
                      <InfoRow>
                        <span>Customer</span>
                        <strong>{plan.customer || '-'}</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Shipment</span>
                        <strong>{plan.shipmentType}</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Container</span>
                        <strong>{plan.selectedContainerCode}</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Cargo Units</span>
                        <strong>{summary.totalCargoUnits}</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Total Weight</span>
                        <strong>{summary.totalWeightKg} kg</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Total Volume</span>
                        <strong>{summary.totalVolumeM3} m³</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Floor Use</span>
                        <strong>{summary.utilizationByFloorPercent}%</strong>
                      </InfoRow>

                      <InfoRow>
                        <span>Created</span>
                        <strong>{formatDate(plan.createdAt)}</strong>
                      </InfoRow>
                    </InfoGrid>

                    <NotesBox>{plan.notes?.trim() || 'No notes.'}</NotesBox>

                    <CardActions>
                      <WinButton
                        type="button"
                        disabled={!plan._id || !onOpenPlan}
                        onClick={() => {
                          if (plan._id) onOpenPlan?.(plan._id)
                        }}
                      >
                        Open
                      </WinButton>
                    </CardActions>
                  </PlanCard>
                )
              })}
            </CardsGrid>
          )}
        </CardsScroll>
      </Win95GroupBox>

      <TabFooter>
        <FooterActions>
          <WinButton type="button" onClick={onBack}>
            Back
          </WinButton>

          <span>
            Page {data.page} of {data.totalPages}
          </span>

          <WinButton type="button" onClick={handlePrevious} disabled={isLoading || data.page <= 1}>
            Previous
          </WinButton>

          <WinButton
            type="button"
            onClick={handleNext}
            disabled={isLoading || data.page >= data.totalPages}
          >
            Next
          </WinButton>
        </FooterActions>
      </TabFooter>
    </TabContentLayout>
  )
}

export default LoadPlansCardsPanel
